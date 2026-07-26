import { Request, Response } from 'express'

import * as Sentry from "@sentry/node";
import { prisma } from '../configs/prisma.js';

import { v2 as cloudinary } from 'cloudinary'

import fs from 'fs';
import path from 'path';
import axios from 'axios';
import ffmpegPath from 'ffmpeg-static';
import { exec } from 'child_process';

export const createProject = async (req: Request, res: Response) => {

    let tempProjectId: string;
    const { userId } = req.auth();
    let isCreditDeducted = false;

    const { name = 'New Project', aspectRatio, userPrompt, productName,
        productDescription, targetLength = 5 } = req.body;

    const images: any = req.files;

    if (!images || images.length < 2 || !productName) {
        return res.status(400).json({ message: 'Please upload at least 2 images' })
    }

    if (!name || name.trim() === '') {
        return res.status(400).json({ message: 'Project name cannot be empty' });
    }

    if (aspectRatio !== '9:16' && aspectRatio !== '16:9') {
        return res.status(400).json({ message: 'Invalid aspect ratio. Supported options are 9:16 or 16:9' });
    }

    if (userPrompt && userPrompt.length > 1000) {
        return res.status(400).json({ message: 'User prompt must be less than 1000 characters' });
    }

    if (productDescription && productDescription.length > 2000) {
        return res.status(400).json({ message: 'Product description must be less than 2000 characters' });
    }
    const user = await prisma.user.findUnique({
        where: { id: userId }

    })
    if (!user || user.credits < 5) {
        return res.status(401).json({ message: 'Insufficient credits' })
    } else {
        // deduct credits for image generation
        await prisma.user.update({
            where: { id: userId },
            data: { credits: { decrement: 5 } }
        }).then(() => { isCreditDeducted = true })
    }


    try {

        let uploadedImages = await Promise.all(
            images.map(async (item: any) => {
                let result = await cloudinary.uploader.upload(item.path,
                    { resource_type: 'image' });
                return result.secure_url
            })
        )

        const project = await prisma.project.create({
            data: {
                name,
                userId,
                productName,
                productDescription,
                userPrompt,
                aspectRatio,
                targetLength: parseInt(targetLength),
                uploadedImages,
                isGenerating: true
            }
        })

        tempProjectId = project.id;

        const promptText = `UGC style ad image of a person holding the product: ${productName}. ${productDescription}. Details: ${userPrompt}. Photo realistic, professional studio lighting, commercial photography, ecommerce product shot.`;

        let finalBuffer: Buffer;
        if (process.env.HUGGINGFACE_API_KEY) {
            console.log('Using Hugging Face API for image generation...');
            const hfResponse = await axios.post(
                "https://api-inference.huggingface.co/models/black-forest-labs/FLUX.1-schnell",
                { inputs: promptText },
                {
                    headers: { Authorization: `Bearer ${process.env.HUGGINGFACE_API_KEY}` },
                    responseType: 'arraybuffer',
                    timeout: 45000
                }
            );
            finalBuffer = Buffer.from(hfResponse.data);
        } else {
            console.log('Using Pollinations.ai free API for image generation...');
            let width = 1080;
            let height = 1080;
            if (aspectRatio === '9:16') {
                width = 1080;
                height = 1920;
            } else if (aspectRatio === '16:9') {
                width = 1920;
                height = 1080;
            }
            
            const pollUrl = `https://image.pollinations.ai/prompt/${encodeURIComponent(promptText)}?width=${width}&height=${height}&nologo=true&private=true`;
            const imageResponse = await axios.get(pollUrl, {
                headers: {
                    'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36'
                },
                responseType: 'arraybuffer',
                timeout: 30000
            });
            finalBuffer = Buffer.from(imageResponse.data);
        }

        const base64Image = `data:image/png;base64,${finalBuffer.toString('base64')}`;

        const uploadResult = await cloudinary.uploader.upload(base64Image, {
            resource_type: 'image'
        });

        await prisma.project.update({
            where: { id: project.id },
            data: {
                generatedImage: uploadResult.secure_url,
                isGenerating: false
            }
        });
        res.json({ projectId: project.id });

    } catch (error: any) {
        if (tempProjectId!) {
            // update project status and error message
            await prisma.project.update({
                where: { id: tempProjectId },
                data: { isGenerating: false, error: error.message }
            })
        }
        if (isCreditDeducted) {
            // add credits back
            await prisma.user.update({
                where: { id: userId },
                data: { credits: { increment: 5 } }
            })
        }
        Sentry.captureException(error);
        return res.status(500).json({ message: error.code || error.message });
    } finally {
        // Cleanup uploaded temp files to prevent disk leak
        if (images && images.length > 0) {
            for (const img of images) {
                try {
                    if (fs.existsSync(img.path)) {
                        fs.unlinkSync(img.path);
                    }
                } catch (cleanupError) {
                    console.error('Failed to cleanup temp file:', img.path, cleanupError);
                }
            }
        }
    }
}
export const createVideo = async (req: Request, res: Response) => {
    const { userId } = req.auth()
    const { projectId } = req.body;
    let isCreditDeducted = false;
    let localFilePath: string | null = null;
    let tempInputImagePath: string | null = null;

    const user = await prisma.user.findUnique({
        where: { id: userId }
    })
    if (!user || user.credits < 10) {
        return res.status(401).json({ message: 'Insufficient credits' });
    }
    // deduct credits for video generation
    await prisma.user.update({
        where: { id: userId },
        data: { credits: { decrement: 10 } }
    }).then(() => { isCreditDeducted = true });

    try {
        const project = await prisma.project.findFirst({
            where: { id: projectId, userId },
            include: { user: true }
        })

        if (!project || project.isGenerating) {
            return res.status(404).json({ message: 'Generation in progress or not found' });
        }

        if (project.generatedVideo) {
            return res.status(404).json({ message: 'Video already generated' });
        }
        await prisma.project.update({
            where: { id: projectId },
            data: { isGenerating: true }
        })

        if (!project.generatedImage) {
            throw new Error('Generated image not found');
        }

        // Download the generated image locally to feed into FFmpeg
        fs.mkdirSync('videos', { recursive: true });
        const tempImageName = `${userId}-${Date.now()}-input.png`;
        tempInputImagePath = path.join('videos', tempImageName);

        const imageResponse = await axios.get(project.generatedImage, {
            responseType: 'arraybuffer',
        });
        fs.writeFileSync(tempInputImagePath, Buffer.from(imageResponse.data));

        const filename = `${userId}-${Date.now()}.mp4`;
        const filePath = path.join('videos', filename);
        localFilePath = filePath;

        // Compile the 5-second MP4 video using local FFmpeg
        const textOverlay = `GET ${project.productName.toUpperCase()} NOW!`;
        // Cross-platform font selection for FFmpeg drawtext
        let fontfile = process.env.FFMPEG_FONT_PATH;
        if (!fontfile) {
            if (process.platform === 'win32') {
                fontfile = "C\\:\\\\Windows\\\\Fonts\\\\arial.ttf";
            } else if (process.platform === 'darwin') {
                fontfile = "/Library/Fonts/Arial.ttf";
            } else {
                // Default path for Linux (Debian/Ubuntu) environments
                fontfile = "/usr/share/fonts/truetype/dejavu/DejaVuSans.ttf";
            }
        } else {
            if (process.platform === 'win32') {
                fontfile = fontfile.replace(/\\/g, '\\\\').replace(/:/g, '\\:');
            }
        }
        
        let width = 1080;
        let height = 1920;
        let aspectSize = "1080x1920";
        if (project.aspectRatio === '16:9') {
            width = 1920;
            height = 1080;
            aspectSize = "1920x1080";
        }
        
        const filter = `scale=${width}:${height},zoompan=z='min(zoom+0.0015,1.5)':x='iw/2-(iw/zoom/2)':y='ih/2-(ih/zoom/2)':d=125:s=${aspectSize},drawtext=fontfile='${fontfile}':text='${textOverlay}':fontcolor=white:fontsize=48:x=(w-text_w)/2:y=h-200:box=1:boxcolor=black@0.6:boxborderw=15`;
        
        const cmd = `"${ffmpegPath}" -loop 1 -i "${tempInputImagePath}" -vf "${filter}" -c:v libx264 -t 5 -pix_fmt yuv420p -y "${filePath}"`;

        await new Promise<void>((resolve, reject) => {
            exec(cmd, (err, stdout, stderr) => {
                if (err) {
                    console.error('FFmpeg compilation error:', err);
                    console.error('FFmpeg stderr:', stderr);
                    reject(new Error('Failed to compile video. ' + err.message));
                } else {
                    resolve();
                }
            });
        });

        // Upload the generated MP4 video to Cloudinary
        const uploadResult = await cloudinary.uploader.upload(filePath, {
            resource_type: 'video'
        });

        await prisma.project.update({
            where: { id: project.id },
            data: {
                generatedVideo: uploadResult.secure_url,
                isGenerating: false
            }
        });

        res.json({
            message: 'Video generation completed',
            videoUrl: uploadResult.secure_url
        });

    } catch (error: any) {
        // update project status and error message
        await prisma.project.update({
            where: { id: projectId },
            data: { isGenerating: false, error: error.message }
        });
        if (isCreditDeducted) {
            // add credits back
            await prisma.user.update({
                where: { id: userId },
                data: { credits: { increment: 10 } }
            });
        }
        Sentry.captureException(error);
        return res.status(500).json({ message: error.code || error.message });
    } finally {
        // Cleanup local temporary files
        if (tempInputImagePath && fs.existsSync(tempInputImagePath)) {
            try {
                fs.unlinkSync(tempInputImagePath);
            } catch (err) {
                console.error('Failed to clean up temp input image:', err);
            }
        }
        if (localFilePath && fs.existsSync(localFilePath)) {
            try {
                fs.unlinkSync(localFilePath);
            } catch (err) {
                console.error('Failed to clean up local video file:', err);
            }
        }
    }
}
export const getAllPublishedProjects = async (req: Request, res: Response) => {
    try {
        const projects = await prisma.project.findMany({
            where: { isPublished: true }
        })
        res.json({ projects })

    } catch (error: any) {
        Sentry.captureException(error);
        return res.status(500).json({ message: error.code || error.message });
    }
}
export const deleteProject = async (req: Request, res: Response) => {
    try {
        const { userId } = (req as any).auth();

        if (!userId) {
            return res.status(401).json({ message: "Unauthorized" });
        }

        const projectId = Array.isArray(req.params.projectId)
            ? req.params.projectId[0]
            : req.params.projectId;

        const project = await prisma.project.findFirst({
            where: {
                id: projectId,
                userId,
            },
        });

        if (!project) {
            return res.status(404).json({ message: "Project not found" });
        }

        await prisma.project.delete({
            where: {
                id: projectId,
            },
        });

        return res.json({ message: "Project deleted" });
    } catch (error: any) {
        Sentry.captureException(error);
        return res.status(500).json({ message: error.code || error.message });
    }
};
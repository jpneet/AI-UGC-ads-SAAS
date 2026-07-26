import express from 'express';
import { protect } from '../middlewares/auth.js';
import { createProject, createVideo, deleteProject, getAllPublishedProjects } from '../controllers/projectController.js';
import upload from '../configs/multer.js'
import { rateLimiter } from '../middlewares/rateLimit.js';

const projectRouter = express.Router()

const generationRateLimit = rateLimiter({
  windowMs: 10 * 60 * 1000, // 10 minutes
  max: 30, // 30 generations per 10 minutes
  message: 'Too many generation requests, please try again in 10 minutes.'
});

projectRouter.post('/create', generationRateLimit, upload.array('images',2) ,protect, createProject)
projectRouter.post('/video', generationRateLimit, protect, createVideo)
projectRouter.get('/published', getAllPublishedProjects)
projectRouter. delete('/:projectId', protect, deleteProject)

export default projectRouter
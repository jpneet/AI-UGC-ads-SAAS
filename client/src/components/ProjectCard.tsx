import { useState } from "react";
import { useNavigate } from "react-router-dom";
import type { Project } from "../types";
import {
  EllipsisIcon,
  ImageIcon,
  PlaySquareIcon,
  Share2Icon,
  Trash2Icon,
} from "lucide-react";
import { GhostButton, PrimaryButton } from "./Buttons";

const ProjectCard = ({
  gen,
  forCommunity = false,
}: {
  gen: Project;
  forCommunity?: boolean;
}) => {
  const navigate = useNavigate();
  const [menuOpen, setMenuOpen] = useState(false);

  const handleDelete = async (id: string) => {
    const confirmDelete = window.confirm(
      "Are you sure you want to delete this project?"
    );

    if (!confirmDelete) return;

    console.log("Delete:", id);

    // TODO:
    // await axios.delete(`/api/projects/${id}`);
    // then refresh list
  };

  const togglePublish = async (id: string) => {
    console.log("Toggle publish:", id);

    // TODO:
    // await axios.patch(`/api/projects/${id}/publish`);
    // then refetch projects
  };

  const handleShare = async () => {
    const url = gen.generatedVideo || gen.generatedImage;

    if (!url) return;

    if (!navigator.share) {
      alert("Sharing is not supported on this device.");
      return;
    }

    try {
      await navigator.share({
        url,
        title: gen.productName,
        text: gen.productDescription,
      });
    } catch (err) {
      console.log("Share cancelled", err);
    }
  };

  return (
    <div className="mb-4 break-inside-avoid">
      <div className="bg-white/5 border border-white/10 rounded-xl overflow-hidden hover:border-white/20 transition group">
        {/* Preview */}
        <div
          className={`relative overflow-hidden ${
            gen.aspectRatio === "9:16" ? "aspect-[9/16]" : "aspect-video"
          }`}
        >
          {/* Image */}
          {gen.generatedImage && (
            <img
              src={gen.generatedImage}
              alt={gen.productName}
              className={`absolute inset-0 w-full h-full object-cover transition duration-500 ${
                gen.generatedVideo
                  ? "group-hover:opacity-0"
                  : "group-hover:scale-105"
              }`}
            />
          )}

          {/* Video */}
          {gen.generatedVideo && (
            <video
              src={gen.generatedVideo}
              muted
              loop
              playsInline
              className="absolute inset-0 w-full h-full object-cover opacity-0 group-hover:opacity-100 transition duration-500"
              onMouseEnter={(e) => e.currentTarget.play()}
              onMouseLeave={(e) => e.currentTarget.pause()}
            />
          )}

          {/* Badges */}
          <div className="absolute left-3 top-3 flex gap-2">
            {gen.isGenerating && (
              <span className="px-3 py-1 rounded-full bg-yellow-500/90 text-black text-[11px] font-semibold">
                ⚡ Generating
              </span>
            )}

            {gen.isPublished && (
              <span className="px-3 py-1 rounded-full bg-emerald-500/90 text-white text-[11px] font-semibold">
                🌍 Published
              </span>
            )}

            {!gen.generatedImage &&
              !gen.generatedVideo &&
              !gen.isGenerating && (
                <span className="px-3 py-1 rounded-full bg-yellow-500/90 text-black text-[11px] font-semibold animate-pulse">
                  ⚡ Generating
                </span>
              )}
          </div>

          {/* Menu */}
          {!forCommunity && (
            <div
              className="absolute right-3 top-3 sm:opacity-0 group-hover:opacity-100 transition"
              onMouseLeave={() => setMenuOpen(false)}
            >
              <EllipsisIcon
                className="bg-black/20 rounded-full p-1 size-7 cursor-pointer"
                onClick={() => setMenuOpen((prev) => !prev)}
              />

              {menuOpen && (
                <div className="absolute right-0 mt-2 w-44 bg-black/70 backdrop-blur border border-white/10 rounded-lg shadow-lg z-10">
                  <ul className="text-sm">
                    {gen.generatedImage && (
                      <li>
                        <a
                          href={gen.generatedImage}
                          download
                          className="flex items-center gap-2 px-4 py-2 hover:bg-white/10"
                        >
                          <ImageIcon size={16} />
                          Download Image
                        </a>
                      </li>
                    )}

                    {gen.generatedVideo && (
                      <li>
                        <a
                          href={gen.generatedVideo}
                          download
                          className="flex items-center gap-2 px-4 py-2 hover:bg-white/10"
                        >
                          <PlaySquareIcon size={16} />
                          Download Video
                        </a>
                      </li>
                    )}

                    {(gen.generatedImage || gen.generatedVideo) && (
                      <li>
                        <button
                          onClick={handleShare}
                          className="w-full flex items-center gap-2 px-4 py-2 hover:bg-white/10"
                        >
                          <Share2Icon size={16} />
                          Share
                        </button>
                      </li>
                    )}

                    <li>
                      <button
                        onClick={() => handleDelete(gen.id)}
                        className="w-full flex items-center gap-2 px-4 py-2 text-red-400 hover:bg-red-950/20"
                      >
                        <Trash2Icon size={16} />
                        Delete
                      </button>
                    </li>
                  </ul>
                </div>
              )}
            </div>
          )}

          {/* Uploaded Images */}
          <div className="absolute right-3 bottom-3 flex">
            {gen.uploadedImages?.[0] && (
              <img
                src={gen.uploadedImages[0]}
                alt="Product"
                className="w-16 h-16 rounded-full object-cover animate-float"
              />
            )}

            {gen.uploadedImages?.[1] && (
              <img
                src={gen.uploadedImages[1]}
                alt="Model"
                className="w-16 h-16 rounded-full object-cover -ml-8 animate-float"
                style={{ animationDelay: "3s" }}
              />
            )}
          </div>
        </div>

        {/* Details */}
        <div className="p-4">
          <div className="flex items-start justify-between gap-4">
            <h3 className="font-semibold text-lg">{gen.productName}</h3>

            <p className="text-xs text-gray-400">
              Created: {new Date(gen.createdAt).toLocaleString()}
            </p>
          </div>

          {gen.updatedAt && (
            <p className="text-xs text-gray-500 mt-1">
              Updated: {new Date(gen.updatedAt).toLocaleString()}
            </p>
          )}

          <div className="mt-2 text-right">
            <span className="text-xs bg-white/5 rounded-full px-2 py-1">
              Aspect: {gen.aspectRatio}
            </span>
          </div>

          {gen.productDescription && (
            <div className="mt-3">
              <p className="text-xs text-gray-400 mb-1">Description</p>

              <div className="bg-white/5 rounded-md p-2 text-sm text-gray-300 break-words">
                {gen.productDescription}
              </div>
            </div>
          )}

          {gen.userPrompt && (
            <div className="mt-3 text-xs text-gray-300">
              {gen.userPrompt}
            </div>
          )}

          {!forCommunity && (
            <div className="grid grid-cols-2 gap-3 mt-4">
              <GhostButton
                className="justify-center text-xs"
                onClick={() => {
                  navigate(`/result/${gen.id}`);
                  window.scrollTo(0, 0);
                }}
              >
                View Details
              </GhostButton>

              <PrimaryButton onClick={() => togglePublish(gen.id)}>
                {gen.isPublished ? "Unpublish" : "Publish"}
              </PrimaryButton>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default ProjectCard;
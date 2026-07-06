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
  setGenerations,
  forCommunity = false,
}: {
  gen: Project;
  setGenerations: React.Dispatch<React.SetStateAction<Project[]>>;
  forCommunity?: boolean;
}) => {
  const navigate = useNavigate();
  const [menuOpen, setMenuOpen] = useState(false);

  const handleDelete = async (id: string) => {
    const confirmDelete = window.confirm(
      "Are you sure you want to delete this project?"
    );

    if (!confirmDelete) return;

    // optimistic UI update
    setGenerations((prev) => prev.filter((p) => p.id !== id));

    console.log("deleted:", id);

    // TODO: API call to delete from backend
  };

  const togglePublish = async (id: string) => {
    console.log("toggle publish:", id);

    // TODO: API call + update state if needed
  };

  return (
    <div key={gen.id} className="mb-4 break-inside-avoid">
      <div className="bg-white/5 border border-white/10 rounded-xl overflow-hidden hover:border-white/20 transition group">
        
        {/* preview */}
        <div
          className={`relative overflow-hidden ${
            gen?.aspectRatio === "9:16" ? "aspect-[9/16]" : "aspect-video"
          }`}
        >
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

          {/* status badges */}
          <div className="absolute left-3 top-3 flex gap-2 items-center">
            {gen.isGenerating && (
              <span className="px-3 py-1 rounded-full bg-yellow-500/90 text-black text-[11px] font-semibold shadow-lg backdrop-blur">
                ⚡ Generating
              </span>
            )}

            {gen.isPublished && (
              <span className="px-3 py-1 rounded-full bg-emerald-500/90 text-white text-[11px] font-semibold shadow-lg backdrop-blur">
                🌍 Published
              </span>
            )}

            {!gen.generatedImage && !gen.generatedVideo && (
              <span className="px-3 py-1 rounded-full bg-yellow-500/90 text-black text-[11px] font-semibold shadow-lg backdrop-blur animate-pulse">
                ⚡ Generating
              </span>
            )}
          </div>

          {/* Action Menu */}
          {!forCommunity && (
            <div
              className="absolute right-3 top-3 sm:opacity-0 group-hover:opacity-100 transition flex items-center gap-2"
              onMouseLeave={() => setMenuOpen(false)}
            >
              <div className="absolute top-3 right-3">
                <EllipsisIcon
                  className="ml-auto bg-black/10 rounded-full p-1 size-7 cursor-pointer"
                  onClick={() => setMenuOpen((prev) => !prev)}
                />
              </div>

              <div className="flex flex-col items-end w-32 text-sm">
                <ul
                  className={`text-xs ${
                    menuOpen ? "block" : "hidden"
                  } overflow-hidden right-0 w-40 bg-black/50 backdrop-blur text-white border border-gray-500/50 rounded-lg shadow-md mt-2 py-1 z-10`}
                >
                  {gen.generatedImage && (
                    <a
                      href={gen.generatedImage}
                      download
                      className="flex gap-2 items-center px-4 py-2 hover:bg-black/10 cursor-pointer"
                    >
                      <ImageIcon size={14} />
                      Download Image
                    </a>
                  )}

                  {gen.generatedVideo && (
                    <a
                      href={gen.generatedVideo}
                      download
                      className="flex gap-2 items-center px-4 py-2 hover:bg-black/10 cursor-pointer"
                    >
                      <PlaySquareIcon size={14} />
                      Download Video
                    </a>
                  )}

                  {(gen.generatedVideo || gen.generatedImage) && (
                    <button
                      onClick={() =>
                        navigator.share({
                          url: gen.generatedVideo || gen.generatedImage,
                          title: gen.productName,
                          text: gen.productDescription,
                        })
                      }
                      className="w-full flex gap-2 items-center px-4 py-2 hover:bg-black/10 cursor-pointer"
                    >
                      <Share2Icon size={14} />
                      Share
                    </button>
                  )}

                  <button
                    onClick={() => handleDelete(gen.id)}
                    className="w-full flex gap-2 items-center px-4 py-2 hover:bg-red-950/10 text-red-400 cursor-pointer"
                  >
                    <Trash2Icon size={14} />
                    Delete
                  </button>
                </ul>
              </div>
            </div>
          )}

          {/* source images */}
          <div className="absolute right-3 bottom-3">
            <img
              src={gen.uploadedImages?.[0]}
              alt="product"
              className="w-16 h-16 object-cover rounded-full animate-float"
            />
            <img
              src={gen.uploadedImages?.[1]}
              alt="model"
              className="w-16 h-16 object-cover rounded-full animate-float -ml-8"
              style={{ animationDelay: "3s" }}
            />
          </div>
        </div>

        {/* details */}
        <div className="p-4">
          <div className="flex items-start justify-between gap-4">
            <h3 className="font-medium text-lg mb-1">{gen.productName}</h3>

            <p className="text-sm text-gray-400">
              Created:{" "}
              {new Date(gen.createdAt).toLocaleString([], {
                year: "numeric",
                month: "short",
                day: "numeric",
                hour: "2-digit",
                minute: "2-digit",
              })}
            </p>
          </div>

          {gen.updatedAt && (
            <p className="text-xs text-gray-500 mt-1">
              Updated: {new Date(gen.updatedAt).toLocaleString()}
            </p>
          )}

          <div className="text-right mt-2">
            <span className="text-xs px-2 py-1 bg-white/5 rounded-full">
              Aspect: {gen.aspectRatio}
            </span>
          </div>

          {/* description */}
          {gen.productDescription && (
            <div className="mt-3">
              <p className="text-xs text-gray-400 mb-1">Description</p>
              <div className="text-sm text-gray-300 bg-white/3 p-2 rounded-md break-words">
                {gen.productDescription}
              </div>
            </div>
          )}

          {/* prompt */}
          {gen.userPrompt && (
            <div className="mt-3 text-xs text-gray-300">
              {gen.userPrompt}
            </div>
          )}

          {/* buttons */}
          {!forCommunity && (
            <div className="mt-4 grid grid-cols-2 gap-3">
              <GhostButton
                className="text-xs justify-center"
                onClick={() => {
                  navigate(`/result/${gen.id}`);
                  scrollTo(0, 0);
                }}
              >
                View Details
              </GhostButton>

              <PrimaryButton
                onClick={() => togglePublish(gen.id)}
                className="rounded-md"
              >
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
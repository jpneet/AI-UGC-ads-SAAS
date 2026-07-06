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

    // TODO: API delete call
  };

  const togglePublish = (id: string) => {
    setGenerations((prev) =>
      prev.map((p) =>
        p.id === id ? { ...p, isPublished: !p.isPublished } : p
      )
    );
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
      console.log("Share cancelled or failed", err);
    }
  };

  return (
    <div className="mb-4 break-inside-avoid">
      <div className="bg-white/5 border border-white/10 rounded-xl overflow-hidden hover:border-white/20 transition group">

        {/* preview */}
        <div
          className={`relative overflow-hidden ${
            gen?.aspectRatio === "9:16" ? "aspect-[9/16]" : "aspect-video"
          }`}
        >
          {/* image */}
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

          {/* video */}
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
              <span className="px-3 py-1 rounded-full bg-yellow-500/90 text-black text-[11px] font-semibold">
                ⚡ Generating
              </span>
            )}

            {gen.isPublished && (
              <span className="px-3 py-1 rounded-full bg-emerald-500/90 text-white text-[11px] font-semibold">
                🌍 Published
              </span>
            )}

            {!gen.generatedImage && !gen.generatedVideo && (
              <span className="px-3 py-1 rounded-full bg-yellow-500/90 text-black text-[11px] font-semibold animate-pulse">
                ⚡ Generating
              </span>
            )}
          </div>

          {/* action menu */}
          {!forCommunity && (
            <div
              className="absolute right-3 top-3 sm:opacity-0 group-hover:opacity-100 transition"
              onMouseLeave={() => setMenuOpen(false)}
            >
              <EllipsisIcon
                className="bg-black/10 rounded-full p-1 size-7 cursor-pointer"
                onClick={() => setMenuOpen((p) => !p)}
              />

              {menuOpen && (
                <div className="absolute right-0 mt-2 w-40 bg-black/60 backdrop-blur border border-gray-500/40 rounded-lg shadow-lg z-10">
                  <ul className="text-xs text-white">

                    {gen.generatedImage && (
                      <a
                        href={gen.generatedImage}
                        download
                        className="flex gap-2 items-center px-4 py-2 hover:bg-white/10"
                      >
                        <ImageIcon size={14} />
                        Download Image
                      </a>
                    )}

                    {gen.generatedVideo && (
                      <a
                        href={gen.generatedVideo}
                        download
                        className="flex gap-2 items-center px-4 py-2 hover:bg-white/10"
                      >
                        <PlaySquareIcon size={14} />
                        Download Video
                      </a>
                    )}

                    {(gen.generatedVideo || gen.generatedImage) && (
                      <button
                        onClick={handleShare}
                        className="w-full flex gap-2 items-center px-4 py-2 hover:bg-white/10"
                      >
                        <Share2Icon size={14} />
                        Share
                      </button>
                    )}

                    <button
                      onClick={() => handleDelete(gen.id)}
                      className="w-full flex gap-2 items-center px-4 py-2 text-red-400 hover:bg-red-950/20"
                    >
                      <Trash2Icon size={14} />
                      Delete
                    </button>
                  </ul>
                </div>
              )}
            </div>
          )}

          {/* source images (safe rendering) */}
          <div className="absolute right-3 bottom-3 flex">
            {gen.uploadedImages?.[0] && (
              <img
                src={gen.uploadedImages[0]}
                alt="product"
                className="w-16 h-16 object-cover rounded-full animate-float"
              />
            )}

            {gen.uploadedImages?.[1] && (
              <img
                src={gen.uploadedImages[1]}
                alt="model"
                className="w-16 h-16 object-cover rounded-full animate-float -ml-8"
                style={{ animationDelay: "3s" }}
              />
            )}
          </div>
        </div>

        {/* details */}
        <div className="p-4">

          <div className="flex items-start justify-between gap-4">
            <h3 className="font-medium text-lg mb-1">
              {gen.productName}
            </h3>

            <p className="text-sm text-gray-400">
              Created:{" "}
              {new Date(gen.createdAt).toLocaleString()}
            </p>
          </div>

          {gen.updatedAt && (
            <p className="text-xs text-gray-500 mt-1">
              Updated: {new Date(gen.updatedAt).toLocaleString()}
            </p>
          )}

          <div className="mt-2 text-right">
            <span className="text-xs px-2 py-1 bg-white/5 rounded-full">
              Aspect: {gen.aspectRatio}
            </span>
          </div>

          {/* description */}
          {gen.productDescription && (
            <div className="mt-3">
              <p className="text-xs text-gray-400 mb-1">
                Description
              </p>
              <div className="text-sm text-gray-300 bg-white/5 p-2 rounded-md break-words">
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
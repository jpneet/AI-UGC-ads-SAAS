import { useState, useEffect, useRef } from "react";
import { useNavigate } from "react-router-dom";
import type { Project } from "../types";
import {
  MoreHorizontal,
  Image,
  PlaySquare,
  Share2,
  Trash2,
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
  const menuRef = useRef<HTMLDivElement | null>(null);

  // Close menu on outside click
  useEffect(() => {
    const handler = (e: MouseEvent) => {
      if (menuRef.current && !menuRef.current.contains(e.target as Node)) {
        setMenuOpen(false);
      }
    };

    if (menuOpen) {
      window.addEventListener("click", handler);
    }

    return () => window.removeEventListener("click", handler);
  }, [menuOpen]);

  const handleDelete = async (id: string) => {
    const ok = window.confirm("Are you sure you want to delete this project?");
    if (!ok) return;

    try {
      const res = await fetch(`/api/projects/${id}`, {
        method: "DELETE",
      });

      if (!res.ok) throw new Error("Delete failed");

      setGenerations((prev) => prev.filter((p) => p.id !== id));
    } catch (err) {
      console.error(err);
      alert("Failed to delete project");
    }
  };

  const togglePublish = async (id: string) => {
    try {
      const res = await fetch(`/api/projects/${id}/toggle-publish`, {
        method: "PATCH",
      });

      if (!res.ok) throw new Error("Failed to toggle publish");

      const updated = await res.json();

      setGenerations((prev) =>
        prev.map((p) =>
          p.id === id ? { ...p, ...updated } : p
        )
      );
    } catch (err) {
      console.error(err);
      alert("Failed to update publish status");
    }
  };

  const handleShare = async () => {
    const url = gen.generatedVideo || gen.generatedImage;

    if (!url) return;

    try {
      if (navigator.share) {
        await navigator.share({
          url,
          title: gen.productName,
          text: gen.productDescription,
        });
      } else {
        await navigator.clipboard.writeText(url);
        alert("Link copied to clipboard");
      }
    } catch (err) {
      console.error(err);
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
          {/* IMAGE */}
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

          {/* VIDEO */}
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
            {(gen.isGenerating || (!gen.generatedImage && !gen.generatedVideo)) && (
              <span className="px-3 py-1 rounded-full bg-yellow-500/90 text-black text-[11px] font-semibold shadow-lg backdrop-blur animate-pulse">
                ⚡ Generating
              </span>
            )}

            {gen.isPublished && (
              <span className="px-3 py-1 rounded-full bg-emerald-500/90 text-white text-[11px] font-semibold shadow-lg backdrop-blur">
                🌍 Published
              </span>
            )}
          </div>

          {/* Action Menu */}
          {!forCommunity && (
            <div
              ref={menuRef}
              className="absolute right-3 top-3 opacity-0 group-hover:opacity-100 transition"
            >
              <button
                onClick={() => setMenuOpen((prev) => !prev)}
                className="bg-black/20 rounded-full p-1"
              >
                <MoreHorizontal size={18} />
              </button>

              {menuOpen && (
                <ul className="absolute right-0 mt-2 w-40 bg-black/50 backdrop-blur text-white border border-gray-500/50 rounded-lg shadow-md py-1 z-10">
                  
                  {gen.generatedImage && (
                    <a
                      href={gen.generatedImage}
                      download
                      className="flex gap-2 items-center px-4 py-2 hover:bg-black/10"
                    >
                      <Image size={14} />
                      Download Image
                    </a>
                  )}

                  {gen.generatedVideo && (
                    <a
                      href={gen.generatedVideo}
                      download
                      className="flex gap-2 items-center px-4 py-2 hover:bg-black/10"
                    >
                      <PlaySquare size={14} />
                      Download Video
                    </a>
                  )}

                  {(gen.generatedImage || gen.generatedVideo) && (
                    <button
                      onClick={handleShare}
                      className="w-full flex gap-2 items-center px-4 py-2 hover:bg-black/10"
                    >
                      <Share2 size={14} />
                      Share
                    </button>
                  )}

                  <button
                    onClick={() => handleDelete(gen.id)}
                    className="w-full flex gap-2 items-center px-4 py-2 hover:bg-red-950/20 text-red-400"
                  >
                    <Trash2 size={14} />
                    Delete
                  </button>
                </ul>
              )}
            </div>
          )}

          {/* source images */}
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

          {gen.productDescription && (
            <div className="mt-3">
              <p className="text-xs text-gray-400 mb-1">Description</p>
              <div className="text-sm text-gray-300 bg-white/5 p-2 rounded-md break-words">
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
            <div className="mt-4 grid grid-cols-2 gap-3">
              <GhostButton
                className="text-xs justify-center"
                onClick={() => {
                  navigate(`/result/${gen.id}`);
                  window.scrollTo(0, 0);
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
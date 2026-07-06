import { useState } from "react";
import { useNavigate } from "react-router-dom";
import type { Dispatch, SetStateAction } from "react";
import type { Project } from "../types";
import {
  EllipsisIcon,
  ImageIcon,
  PlaySquareIcon,
  Share2Icon,
  Trash2Icon,
} from "lucide-react";
import { GhostButton, PrimaryButton } from "./Buttons";

interface ProjectCardProps {
  gen: Project;
  forCommunity?: boolean;
  setGenerations?: Dispatch<SetStateAction<Project[]>>;
}

const ProjectCard = ({
  gen,
  forCommunity = false,
  setGenerations,
}: ProjectCardProps) => {
  const navigate = useNavigate();
  const [menuOpen, setMenuOpen] = useState(false);

  const handleDelete = async (id: string) => {
    const confirmDelete = window.confirm(
      "Are you sure you want to delete this project?"
    );

    if (!confirmDelete) return;

    // TODO: Delete API

    setGenerations?.((prev) =>
      prev.filter((project) => project.id !== id)
    );
  };

  const togglePublish = async (projectId: string) => {
    // TODO: Publish API

    setGenerations?.((prev) =>
      prev.map((project) =>
        project.id === projectId
          ? {
              ...project,
              isPublished: !project.isPublished,
            }
          : project
      )
    );
  };

  const handleShare = async () => {
    const url = gen.generatedVideo || gen.generatedImage;

    if (!url) return;

    if (navigator.share) {
      try {
        await navigator.share({
          title: gen.productName,
          text: gen.productDescription,
          url,
        });
      } catch {}
    } else {
      await navigator.clipboard.writeText(url);
      alert("Link copied to clipboard!");
    }
  };

  return (
    <div className="mb-4 break-inside-avoid">
      <div className="group overflow-hidden rounded-xl border border-white/10 bg-white/5 transition hover:border-white/20">
        {/* Preview */}
        <div
          className={`relative overflow-hidden ${
            gen.aspectRatio === "9:16"
              ? "aspect-[9/16]"
              : "aspect-video"
          }`}
        >
          {gen.generatedImage && (
            <img
              src={gen.generatedImage}
              alt={gen.productName}
              className={`absolute inset-0 h-full w-full object-cover transition duration-500 ${
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
              className="absolute inset-0 h-full w-full object-cover opacity-0 transition duration-500 group-hover:opacity-100"
              onMouseEnter={(e) => e.currentTarget.play()}
              onMouseLeave={(e) => e.currentTarget.pause()}
            />
          )}

          {/* Status */}
          <div className="absolute left-3 top-3 flex items-center gap-2">
            {gen.isGenerating && (
              <span className="rounded-full bg-yellow-500/90 px-3 py-1 text-[11px] font-semibold text-black shadow-lg backdrop-blur">
                ⚡ Generating
              </span>
            )}

            {gen.isPublished && (
              <span className="rounded-full bg-emerald-500/90 px-3 py-1 text-[11px] font-semibold text-white shadow-lg backdrop-blur">
                🌍 Published
              </span>
            )}

            {!gen.generatedImage && !gen.generatedVideo && (
              <span className="animate-pulse rounded-full bg-yellow-500/90 px-3 py-1 text-[11px] font-semibold text-black shadow-lg backdrop-blur">
                ⚡ Generating
              </span>
            )}
          </div>

          {/* Menu */}
          {!forCommunity && (
            <div
              className="absolute right-3 top-3"
              onMouseLeave={() => setMenuOpen(false)}
            >
              <EllipsisIcon
                className="size-7 cursor-pointer rounded-full bg-black/30 p-1"
                onClick={() => setMenuOpen((prev) => !prev)}
              />

              {menuOpen && (
                <div className="absolute right-0 mt-2 w-44 rounded-lg border border-gray-500/50 bg-black/70 py-1 text-white backdrop-blur">
                  {gen.generatedImage && (
                    <a
                      href={gen.generatedImage}
                      download
                      className="flex items-center gap-2 px-4 py-2 hover:bg-white/10"
                    >
                      <ImageIcon size={14} />
                      Download Image
                    </a>
                  )}

                  {gen.generatedVideo && (
                    <a
                      href={gen.generatedVideo}
                      download
                      className="flex items-center gap-2 px-4 py-2 hover:bg-white/10"
                    >
                      <PlaySquareIcon size={14} />
                      Download Video
                    </a>
                  )}

                  {(gen.generatedImage || gen.generatedVideo) && (
                    <button
                      onClick={handleShare}
                      className="flex w-full items-center gap-2 px-4 py-2 hover:bg-white/10"
                    >
                      <Share2Icon size={14} />
                      Share
                    </button>
                  )}

                  <button
                    onClick={() => handleDelete(gen.id)}
                    className="flex w-full items-center gap-2 px-4 py-2 text-red-400 hover:bg-red-900/20"
                  >
                    <Trash2Icon size={14} />
                    Delete
                  </button>
                </div>
              )}
            </div>
          )}

          {/* Uploaded Images */}
          <div className="absolute bottom-3 right-3 flex">
            {gen.uploadedImages?.[0] && (
              <img
                src={gen.uploadedImages[0]}
                alt="Product"
                className="h-16 w-16 rounded-full object-cover"
              />
            )}

            {gen.uploadedImages?.[1] && (
              <img
                src={gen.uploadedImages[1]}
                alt="Model"
                className="-ml-8 h-16 w-16 rounded-full object-cover"
              />
            )}
          </div>
        </div>

        {/* Details */}
        <div className="p-4">
          <div className="flex items-start justify-between gap-4">
            <div>
              <h3 className="mb-1 text-lg font-medium">
                {gen.productName}
              </h3>

              <p className="text-sm text-gray-400">
                Created{" "}
                {new Date(gen.createdAt).toLocaleString([], {
                  year: "numeric",
                  month: "short",
                  day: "numeric",
                  hour: "2-digit",
                  minute: "2-digit",
                })}
              </p>

              {gen.updatedAt && (
                <p className="mt-1 text-xs text-gray-500">
                  Updated{" "}
                  {new Date(gen.updatedAt).toLocaleString()}
                </p>
              )}
            </div>

            <span className="rounded-full bg-white/5 px-2 py-1 text-xs">
              {gen.aspectRatio}
            </span>
          </div>

          {gen.productDescription && (
            <div className="mt-3">
              <p className="mb-1 text-xs text-gray-400">
                Description
              </p>

              <div className="break-words rounded-md bg-white/5 p-2 text-sm text-gray-300">
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
                className="justify-center text-xs"
                onClick={() => {
                  navigate(`/result/${gen.id}`);
                  window.scrollTo({
                    top: 0,
                    behavior: "smooth",
                  });
                }}
              >
                View Details
              </GhostButton>

              <PrimaryButton
                className="rounded-md"
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
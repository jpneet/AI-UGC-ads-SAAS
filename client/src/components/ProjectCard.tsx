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

type Props = {
  gen: Project;
  setGenerations: React.Dispatch<React.SetStateAction<Project[]>>;
  forCommunity?: boolean;
};

const ProjectCard = ({
  gen,
  setGenerations,
  forCommunity = false,
}: Props) => {
  const navigate = useNavigate();
  const [menuOpen, setMenuOpen] = useState(false);
  const menuRef = useRef<HTMLDivElement | null>(null);

  // Close dropdown on outside click
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
    const ok = window.confirm("Delete this project?");
    if (!ok) return;

    // optimistic UI update
    setGenerations((prev) => prev.filter((p) => p.id !== id));

    try {
      const res = await fetch(`/api/projects/${id}`, {
        method: "DELETE",
      });

      if (!res.ok) throw new Error("Delete failed");
    } catch (err) {
      console.error(err);
      alert("Delete failed");

      // rollback (important safety fix)
      window.location.reload();
    }
  };

  const togglePublish = async (id: string) => {
    try {
      const res = await fetch(`/api/projects/${id}/toggle-publish`, {
        method: "PATCH",
      });

      if (!res.ok) throw new Error("Toggle failed");

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
      if (navigator.share && navigator.canShare?.({ url })) {
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

  const createdDate = gen.createdAt
    ? new Date(gen.createdAt)
    : null;

  return (
    <div className="mb-4 break-inside-avoid">
      <div className="bg-white/5 border border-white/10 rounded-xl overflow-hidden hover:border-white/20 transition group">

        {/* MEDIA */}
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
              alt={gen.productName || "project"}
              className="absolute inset-0 w-full h-full object-cover"
            />
          )}

          {gen.generatedVideo && (
            <video
              src={gen.generatedVideo}
              muted
              loop
              playsInline
              className="absolute inset-0 w-full h-full object-cover opacity-0 group-hover:opacity-100 transition"
              onMouseEnter={(e) => e.currentTarget.play()}
              onMouseLeave={(e) => e.currentTarget.pause()}
            />
          )}

          {/* BADGES */}
          <div className="absolute left-3 top-3 flex gap-2">
            {gen.isGenerating && (
              <span className="px-3 py-1 rounded-full bg-yellow-500/90 text-black text-[11px]">
                Generating
              </span>
            )}

            {gen.isPublished && (
              <span className="px-3 py-1 rounded-full bg-green-500/90 text-white text-[11px]">
                Published
              </span>
            )}
          </div>

          {/* MENU */}
          {!forCommunity && (
            <div ref={menuRef} className="absolute right-3 top-3">
              <button
                onClick={() => setMenuOpen((v) => !v)}
                className="p-1 rounded-full bg-black/20"
              >
                <MoreHorizontal size={18} />
              </button>

              {menuOpen && (
                <div className="absolute right-0 mt-2 w-40 bg-black/70 backdrop-blur rounded-lg border border-gray-600 text-sm z-10">

                  {gen.generatedImage && (
                    <a
                      href={gen.generatedImage}
                      download
                      className="flex gap-2 px-3 py-2 hover:bg-white/10"
                    >
                      <Image size={14} />
                      Image
                    </a>
                  )}

                  {gen.generatedVideo && (
                    <a
                      href={gen.generatedVideo}
                      download
                      className="flex gap-2 px-3 py-2 hover:bg-white/10"
                    >
                      <PlaySquare size={14} />
                      Video
                    </a>
                  )}

                  <button
                    onClick={handleShare}
                    className="flex gap-2 px-3 py-2 w-full hover:bg-white/10"
                  >
                    <Share2 size={14} />
                    Share
                  </button>

                  <button
                    onClick={() => handleDelete(gen.id)}
                    className="flex gap-2 px-3 py-2 w-full text-red-400 hover:bg-red-500/10"
                  >
                    <Trash2 size={14} />
                    Delete
                  </button>
                </div>
              )}
            </div>
          )}

          {/* SAFE IMAGE STACK */}
          {gen.uploadedImages?.[0] && (
            <img
              src={gen.uploadedImages[0]}
              alt="uploaded preview"
              className="absolute bottom-3 right-3 w-14 h-14 rounded-full"
            />
          )}
        </div>

        {/* DETAILS */}
        <div className="p-4">

          <h3 className="font-medium text-lg">
            {gen.productName}
          </h3>

          <p className="text-sm text-gray-400">
            Created:{" "}
            {createdDate?.toLocaleString() || "N/A"}
          </p>

          <span className="text-xs px-2 py-1 bg-white/5 rounded-full mt-2 inline-block">
            Aspect: {gen.aspectRatio}
          </span>

          {gen.productDescription && (
            <p className="text-sm text-gray-300 mt-2 break-words">
              {gen.productDescription}
            </p>
          )}

          {!forCommunity && (
            <div className="grid grid-cols-2 gap-3 mt-4">

              <GhostButton
                onClick={() => {
                  navigate(`/result/${gen.id}`);
                  window.scrollTo(0, 0);
                }}
              >
                View
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
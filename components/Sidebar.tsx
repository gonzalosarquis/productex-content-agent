"use client";

import type { ReactNode } from "react";
import type { GenerationFormat, KnowledgeBase } from "@/lib/types";
import { CarouselForm, type CarouselFormState } from "./CarouselForm";
import { FormatSelector } from "./FormatSelector";
import { PostForm, type PostFormState } from "./PostForm";
import { VideoForm, type VideoFormState } from "./VideoForm";

type Props = {
  format: GenerationFormat;
  onFormatChange: (f: GenerationFormat) => void;
  carousel: CarouselFormState;
  onCarouselChange: (v: CarouselFormState) => void;
  video: VideoFormState;
  onVideoChange: (v: VideoFormState) => void;
  post: PostFormState;
  onPostChange: (v: PostFormState) => void;
  variants: 1 | 2 | 3;
  onVariantsChange: (n: 1 | 2 | 3) => void;
  onGenerate: () => void;
  generating: boolean;
  knowledgeBase: KnowledgeBase;
  footer?: ReactNode;
};

export function Sidebar({
  format,
  onFormatChange,
  carousel,
  onCarouselChange,
  video,
  onVideoChange,
  post,
  onPostChange,
  variants,
  onVariantsChange,
  onGenerate,
  generating,
  knowledgeBase,
  footer,
}: Props) {
  return (
    <aside className="flex h-screen w-[360px] shrink-0 flex-col border-r border-[#2a2a2a] bg-[#0a0a0a]">
      <div className="border-b border-[#2a2a2a] px-6 py-6">
        <h1
          className="text-3xl tracking-wide text-[#f5f2ec]"
          style={{ fontFamily: "var(--font-bebas), sans-serif" }}
        >
          Productex Content Agent
        </h1>
        <p className="mt-1 text-xs text-[#f5f2ec]/45">@productexok</p>
      </div>

      <div className="flex-1 overflow-y-auto px-6 py-6">
        <div className="space-y-6">
          <FormatSelector value={format} onChange={onFormatChange} />

          {format === "carousel" ? (
            <CarouselForm
              value={carousel}
              onChange={onCarouselChange}
              knowledgeBase={knowledgeBase}
            />
          ) : null}
          {format === "video" ? (
            <VideoForm
              value={video}
              onChange={onVideoChange}
              knowledgeBase={knowledgeBase}
            />
          ) : null}
          {format === "post" ? (
            <PostForm
              value={post}
              onChange={onPostChange}
              knowledgeBase={knowledgeBase}
            />
          ) : null}

          <div className="space-y-2 border-t border-[#2a2a2a] pt-4">
            <p className="text-xs uppercase tracking-[0.2em] text-[#f5f2ec]/40">
              Variantes
            </p>
            <div className="flex gap-2">
              {([1, 2, 3] as const).map((n) => (
                <button
                  key={n}
                  type="button"
                  onClick={() => onVariantsChange(n)}
                  className={`flex-1 border py-3 text-xl ${
                    variants === n
                      ? "border-[#c8ff00] text-[#c8ff00]"
                      : "border-[#2a2a2a] text-[#f5f2ec]/40"
                  }`}
                  style={{ fontFamily: "var(--font-bebas), sans-serif" }}
                >
                  {n}
                </button>
              ))}
            </div>
          </div>
        </div>
      </div>

      <div className="border-t border-[#2a2a2a] p-6">
        <button
          type="button"
          onClick={onGenerate}
          disabled={generating}
          className="w-full py-4 text-xl tracking-wide text-black transition hover:opacity-90 disabled:opacity-50"
          style={{
            fontFamily: "var(--font-bebas), sans-serif",
            backgroundColor: "#c8ff00",
          }}
        >
          {generating ? "Generando…" : "Generar"}
        </button>
        {footer}
      </div>
    </aside>
  );
}

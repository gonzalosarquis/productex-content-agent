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
    <aside className="flex h-screen w-[360px] shrink-0 flex-col border-r border-neutral-200 bg-white">
      <div className="border-b border-neutral-200 px-8 py-10">
        <h1
          className="text-3xl tracking-wide text-neutral-900"
          style={{ fontFamily: "var(--font-bebas), sans-serif" }}
        >
          Productex Content Agent
        </h1>
        <p className="mt-2 text-xs tracking-wide text-neutral-500">
          @productexok
        </p>
      </div>

      <div className="flex-1 overflow-y-auto px-8 py-8">
        <div className="space-y-8">
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

          <div className="space-y-3 border-t border-neutral-200 pt-8">
            <p className="text-xs uppercase tracking-[0.2em] text-neutral-400">
              Variantes
            </p>
            <div className="flex gap-2">
              {([1, 2, 3] as const).map((n) => (
                <button
                  key={n}
                  type="button"
                  onClick={() => onVariantsChange(n)}
                  className={`flex-1 border py-3 text-xl transition ${
                    variants === n
                      ? "border-[#7C3AED] bg-violet-50 text-[#7C3AED]"
                      : "border-neutral-200 text-neutral-400 hover:border-neutral-300"
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

      <div className="border-t border-neutral-200 bg-neutral-50/80 px-8 py-8">
        <button
          type="button"
          onClick={onGenerate}
          disabled={generating}
          className="w-full bg-[#7C3AED] py-4 text-xl tracking-wide text-white transition hover:bg-[#6d28d9] disabled:opacity-50"
          style={{ fontFamily: "var(--font-bebas), sans-serif" }}
        >
          {generating ? "Generando…" : "Generar"}
        </button>
        {footer}
      </div>
    </aside>
  );
}

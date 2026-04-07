"use client";

import { useEffect, useMemo, useState } from "react";
import { parseCarouselOutput } from "@/lib/parseCarousel";

type Props = {
  raw: string;
};

function kindLabel(k: string) {
  if (k === "portada") return "portada";
  if (k === "cierre") return "cierre";
  return "contenido";
}

export function CarouselOutput({ raw }: Props) {
  const parsed = useMemo(() => parseCarouselOutput(raw), [raw]);
  const [i, setI] = useState(0);

  useEffect(() => {
    setI(0);
  }, [raw]);
  const slide = parsed.slides[i];
  const total = parsed.slides.length;

  async function copy(text: string) {
    await navigator.clipboard.writeText(text);
  }

  const allText = `${raw}`;

  return (
    <div className="space-y-8">
      {slide ? (
        <div className="relative border border-[#2a2a2a] bg-[#1a1a1a] p-8">
          <div className="mb-6 flex items-center justify-between">
            <span
              className="text-5xl text-[#c8ff00]"
              style={{ fontFamily: "var(--font-bebas), sans-serif" }}
            >
              {String(slide.index).padStart(2, "0")}/{String(total).padStart(2, "0")}
            </span>
            <span className="rounded border border-[#2a2a2a] px-3 py-1 text-xs uppercase tracking-wider text-[#f5f2ec]/60">
              {kindLabel(slide.kind)}
            </span>
          </div>
          <p
            className="mb-4 text-xl text-[#f5f2ec]"
            style={{ fontFamily: "var(--font-bebas), sans-serif" }}
          >
            {slide.label}
          </p>
          <p className="whitespace-pre-wrap text-sm leading-relaxed text-[#f5f2ec]/85">
            {slide.body}
          </p>
          <div className="mt-8 flex items-center justify-between gap-4">
            <button
              type="button"
              onClick={() => setI((v) => Math.max(0, v - 1))}
              disabled={i <= 0}
              className="border border-[#2a2a2a] px-4 py-2 text-[#f5f2ec] transition hover:border-[#c8ff00] disabled:opacity-30"
            >
              ← anterior
            </button>
            <button
              type="button"
              onClick={() => setI((v) => Math.min(total - 1, v + 1))}
              disabled={i >= total - 1}
              className="border border-[#2a2a2a] px-4 py-2 text-[#f5f2ec] transition hover:border-[#c8ff00] disabled:opacity-30"
            >
              siguiente →
            </button>
          </div>
        </div>
      ) : null}

      <div className="border border-[#2a2a2a] bg-[#0a0a0a] p-6">
        <p className="mb-2 text-xs uppercase tracking-wider text-[#f5f2ec]/40">
          Caption
        </p>
        <p className="whitespace-pre-wrap text-sm text-[#f5f2ec]/90">
          {parsed.caption || "—"}
        </p>
        <p className="mt-4 mb-2 text-xs uppercase tracking-wider text-[#f5f2ec]/40">
          Hashtags
        </p>
        <p className="text-sm text-[#c8ff00]/90">{parsed.hashtags || "—"}</p>
      </div>

      <div className="flex flex-wrap gap-3">
        <button
          type="button"
          onClick={() => copy(allText)}
          className="border border-[#c8ff00] bg-[#c8ff00] px-6 py-2 text-sm font-medium text-black"
          style={{ fontFamily: "var(--font-bebas), sans-serif" }}
        >
          Copiar todo
        </button>
        <button
          type="button"
          onClick={() => copy(parsed.caption)}
          className="border border-[#2a2a2a] px-6 py-2 text-sm text-[#f5f2ec] hover:border-[#c8ff00]"
        >
          Copiar caption
        </button>
      </div>
    </div>
  );
}

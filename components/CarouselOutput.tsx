"use client";

import { useEffect, useMemo, useState } from "react";
import {
  extractIdeationBadges,
  splitCarouselIdeation,
} from "@/lib/ideationBadges";
import { parseCarouselOutput } from "@/lib/parseCarousel";
import { IdeationBadges } from "./IdeationBadges";

type Props = {
  raw: string;
};

function kindLabel(k: string) {
  if (k === "portada") return "portada";
  if (k === "cierre") return "cierre";
  return "contenido";
}

export function CarouselOutput({ raw }: Props) {
  const { ideation, body } = useMemo(
    () => splitCarouselIdeation(raw),
    [raw],
  );
  const badges = useMemo(
    () => extractIdeationBadges(ideation),
    [ideation],
  );
  const parsed = useMemo(() => parseCarouselOutput(body), [body]);
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
    <div className="space-y-10">
      <IdeationBadges badges={badges} />

      {slide ? (
        <div className="relative rounded-2xl border border-neutral-200/90 bg-white p-10 shadow-sm">
          <div className="mb-8 flex items-center justify-between">
            <span className="text-3xl font-semibold tabular-nums tracking-tight text-[#7C3AED]">
              {String(slide.index).padStart(2, "0")}/{String(total).padStart(2, "0")}
            </span>
            <span className="rounded-full border border-neutral-200 bg-neutral-50 px-3 py-1 text-xs font-medium uppercase tracking-wide text-neutral-500">
              {kindLabel(slide.kind)}
            </span>
          </div>
          <p className="mb-4 text-lg font-semibold leading-snug text-neutral-900">
            {slide.label}
          </p>
          <p className="whitespace-pre-wrap text-sm leading-relaxed text-neutral-700">
            {slide.body}
          </p>
          <div className="mt-10 flex items-center justify-between gap-4">
            <button
              type="button"
              onClick={() => setI((v) => Math.max(0, v - 1))}
              disabled={i <= 0}
              className="rounded-lg border border-neutral-900 px-4 py-2 text-sm font-medium text-neutral-900 transition hover:bg-neutral-900 hover:text-white disabled:opacity-30"
            >
              ← anterior
            </button>
            <button
              type="button"
              onClick={() => setI((v) => Math.min(total - 1, v + 1))}
              disabled={i >= total - 1}
              className="rounded-lg border border-neutral-900 px-4 py-2 text-sm font-medium text-neutral-900 transition hover:bg-neutral-900 hover:text-white disabled:opacity-30"
            >
              siguiente →
            </button>
          </div>
        </div>
      ) : null}

      <div className="rounded-2xl border border-neutral-200/90 bg-white p-8 shadow-sm">
        <p className="mb-2 text-xs font-medium uppercase tracking-wide text-neutral-400">
          Caption
        </p>
        <p className="whitespace-pre-wrap text-sm text-neutral-800">
          {parsed.caption || "—"}
        </p>
        <p className="mt-6 mb-2 text-xs font-medium uppercase tracking-wide text-neutral-400">
          Hashtags
        </p>
        <p className="text-sm text-[#7C3AED]">{parsed.hashtags || "—"}</p>
      </div>

      <div className="flex flex-wrap gap-3">
        <button
          type="button"
          onClick={() => copy(allText)}
          className="rounded-lg bg-[#7C3AED] px-6 py-2.5 text-sm font-medium text-white shadow-sm transition hover:bg-[#6d28d9]"
        >
          Copiar todo
        </button>
        <button
          type="button"
          onClick={() => copy(parsed.caption)}
          className="rounded-lg border border-neutral-900 px-6 py-2.5 text-sm font-medium text-neutral-900 transition hover:bg-neutral-900 hover:text-white"
        >
          Copiar caption
        </button>
      </div>
    </div>
  );
}

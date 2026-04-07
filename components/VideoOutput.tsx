"use client";

import { useMemo } from "react";
import {
  extractIdeationBadges,
  splitVideoIdeation,
} from "@/lib/ideationBadges";
import { parseVideoOutput } from "@/lib/parseVideo";
import { IdeationBadges } from "./IdeationBadges";

type Props = {
  raw: string;
};

export function VideoOutput({ raw }: Props) {
  const { ideation, body } = useMemo(() => splitVideoIdeation(raw), [raw]);
  const badges = useMemo(
    () => extractIdeationBadges(ideation),
    [ideation],
  );
  const parsed = useMemo(() => parseVideoOutput(body), [body]);

  async function copy(text: string) {
    await navigator.clipboard.writeText(text);
  }

  return (
    <div className="space-y-10">
      <IdeationBadges badges={badges} />

      <div className="space-y-4">
        {parsed.segments.map((seg, idx) => (
          <div
            key={`${seg.header}-${idx}`}
            className="border-l-2 border-[#7C3AED] bg-white pl-6 pr-4 py-5 shadow-sm"
          >
            <p
              className="mb-3 text-lg tracking-wide text-[#7C3AED]"
              style={{ fontFamily: "var(--font-bebas), sans-serif" }}
            >
              {seg.header}
            </p>
            <div className="space-y-2 text-sm text-neutral-700">
              {seg.lines.map((line, j) => (
                <p key={j}>
                  {line.label ? (
                    <span className="text-neutral-500">{line.label}: </span>
                  ) : null}
                  {line.text}
                </p>
              ))}
            </div>
          </div>
        ))}
      </div>

      <div className="grid gap-6 border border-neutral-200 bg-white p-8 shadow-sm">
        <div>
          <p className="mb-1 text-xs uppercase tracking-wider text-neutral-400">
            Música sugerida
          </p>
          <p className="text-sm text-neutral-900">{parsed.musica || "—"}</p>
          <p className="mt-2 text-xs text-neutral-500">
            Referencia de marca: Tyler The Creator, The Weeknd, Jean Tonique,
            Lithe
          </p>
        </div>
        <div>
          <p className="mb-1 text-xs uppercase tracking-wider text-neutral-400">
            Caption
          </p>
          <p className="whitespace-pre-wrap text-sm text-neutral-800">
            {parsed.caption || "—"}
          </p>
        </div>
        <div>
          <p className="mb-1 text-xs uppercase tracking-wider text-neutral-400">
            Hashtags
          </p>
          <p className="text-sm text-[#7C3AED]">{parsed.hashtags || "—"}</p>
        </div>
        {parsed.notaEdicion ? (
          <div>
            <p className="mb-1 text-xs uppercase tracking-wider text-neutral-400">
              Nota de edición
            </p>
            <p className="whitespace-pre-wrap text-sm text-neutral-700">
              {parsed.notaEdicion}
            </p>
          </div>
        ) : null}
      </div>

      <div className="flex flex-wrap gap-3">
        <button
          type="button"
          onClick={() => copy(raw)}
          className="bg-[#7C3AED] px-6 py-2 text-sm font-medium text-white transition hover:bg-[#6d28d9]"
          style={{ fontFamily: "var(--font-bebas), sans-serif" }}
        >
          Copiar script completo
        </button>
        <button
          type="button"
          onClick={() => copy(parsed.caption)}
          className="border border-neutral-900 px-6 py-2 text-sm text-neutral-900 transition hover:bg-neutral-900 hover:text-white"
        >
          Copiar caption
        </button>
      </div>
    </div>
  );
}

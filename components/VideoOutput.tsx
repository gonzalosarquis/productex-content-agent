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
    <div className="space-y-8">
      <IdeationBadges badges={badges} />

      <div className="space-y-4">
        {parsed.segments.map((seg, idx) => (
          <div
            key={`${seg.header}-${idx}`}
            className="border-l-2 border-[#c8ff00] bg-[#1a1a1a] pl-6 pr-4 py-4"
          >
            <p
              className="mb-3 text-lg tracking-wide text-[#c8ff00]"
              style={{ fontFamily: "var(--font-bebas), sans-serif" }}
            >
              {seg.header}
            </p>
            <div className="space-y-2 text-sm text-[#f5f2ec]/85">
              {seg.lines.map((line, j) => (
                <p key={j}>
                  {line.label ? (
                    <span className="text-[#f5f2ec]/50">{line.label}: </span>
                  ) : null}
                  {line.text}
                </p>
              ))}
            </div>
          </div>
        ))}
      </div>

      <div className="grid gap-4 border border-[#2a2a2a] bg-[#0a0a0a] p-6">
        <div>
          <p className="mb-1 text-xs uppercase tracking-wider text-[#f5f2ec]/40">
            Música sugerida
          </p>
          <p className="text-sm text-[#f5f2ec]">{parsed.musica || "—"}</p>
          <p className="mt-2 text-xs text-[#f5f2ec]/40">
            Referencia de marca: Tyler The Creator, The Weeknd, Jean Tonique,
            Lithe
          </p>
        </div>
        <div>
          <p className="mb-1 text-xs uppercase tracking-wider text-[#f5f2ec]/40">
            Caption
          </p>
          <p className="whitespace-pre-wrap text-sm text-[#f5f2ec]/90">
            {parsed.caption || "—"}
          </p>
        </div>
        <div>
          <p className="mb-1 text-xs uppercase tracking-wider text-[#f5f2ec]/40">
            Hashtags
          </p>
          <p className="text-sm text-[#c8ff00]/90">{parsed.hashtags || "—"}</p>
        </div>
        {parsed.notaEdicion ? (
          <div>
            <p className="mb-1 text-xs uppercase tracking-wider text-[#f5f2ec]/40">
              Nota de edición
            </p>
            <p className="whitespace-pre-wrap text-sm text-[#f5f2ec]/85">
              {parsed.notaEdicion}
            </p>
          </div>
        ) : null}
      </div>

      <div className="flex flex-wrap gap-3">
        <button
          type="button"
          onClick={() => copy(raw)}
          className="border border-[#c8ff00] bg-[#c8ff00] px-6 py-2 text-sm font-medium text-black"
          style={{ fontFamily: "var(--font-bebas), sans-serif" }}
        >
          Copiar script completo
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

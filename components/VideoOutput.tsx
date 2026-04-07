"use client";

import { useMemo } from "react";
import {
  extractIdeationBadges,
  splitVideoIdeation,
} from "@/lib/ideationBadges";
import { parseVideoOutput } from "@/lib/parseVideo";
import { IdeationBadges } from "./IdeationBadges";
import { CreativesSection } from "./CreativesSection";
import type { KnowledgeBase } from "@/lib/types";

type Props = {
  raw: string;
  knowledgeBase: KnowledgeBase;
};

export function VideoOutput({ raw, knowledgeBase }: Props) {
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

      <CreativesSection
        format="video"
        raw={raw}
        knowledgeBase={knowledgeBase}
      />

      <div className="space-y-4">
        {parsed.segments.map((seg, idx) => (
          <div
            key={`${seg.header}-${idx}`}
            className="rounded-2xl border border-neutral-200/90 border-l-4 border-l-neutral-900 bg-white py-5 pl-6 pr-5 shadow-sm"
          >
            <p className="mb-3 text-base font-bold leading-snug text-neutral-900">
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

      <div className="grid gap-6 rounded-2xl border border-neutral-200/90 bg-white p-8 shadow-sm">
        <div>
          <p className="mb-1 text-xs font-semibold uppercase tracking-wide text-neutral-500">
            Música sugerida
          </p>
          <p className="text-sm text-neutral-900">{parsed.musica || "—"}</p>
          <p className="mt-2 text-xs text-neutral-500">
            Referencia de marca: Tyler The Creator, The Weeknd, Jean Tonique,
            Lithe
          </p>
        </div>
        <div>
          <p className="mb-1 text-xs font-semibold uppercase tracking-wide text-neutral-500">
            Caption
          </p>
          <p className="whitespace-pre-wrap text-sm text-neutral-800">
            {parsed.caption || "—"}
          </p>
        </div>
        <div>
          <p className="mb-1 text-xs font-semibold uppercase tracking-wide text-neutral-500">
            Hashtags
          </p>
          <p className="text-sm font-semibold text-neutral-900">{parsed.hashtags || "—"}</p>
        </div>
        {parsed.notaEdicion ? (
          <div>
            <p className="mb-1 text-xs font-semibold uppercase tracking-wide text-neutral-500">
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
          className="rounded-lg bg-neutral-900 px-6 py-2.5 text-sm font-semibold text-white shadow-sm transition hover:bg-neutral-800"
        >
          Copiar script completo
        </button>
        <button
          type="button"
          onClick={() => copy(parsed.caption)}
          className="rounded-lg border border-neutral-900 px-6 py-2.5 text-sm font-semibold text-neutral-900 transition hover:bg-neutral-900 hover:text-white"
        >
          Copiar caption
        </button>
      </div>
    </div>
  );
}

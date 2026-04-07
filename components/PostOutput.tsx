"use client";

import { useMemo } from "react";
import {
  extractIdeationBadges,
  splitPostIdeation,
} from "@/lib/ideationBadges";
import { parsePostOutput } from "@/lib/parsePost";
import { IdeationBadges } from "./IdeationBadges";

type Props = {
  raw: string;
};

export function PostOutput({ raw }: Props) {
  const { ideation, body } = useMemo(() => splitPostIdeation(raw), [raw]);
  const badges = useMemo(
    () => extractIdeationBadges(ideation),
    [ideation],
  );
  const parsed = useMemo(() => parsePostOutput(body), [body]);

  async function copy(text: string) {
    await navigator.clipboard.writeText(text);
  }

  const block = [parsed.hook, parsed.cuerpo, parsed.cta, parsed.hashtags]
    .filter(Boolean)
    .join("\n\n");

  return (
    <div className="space-y-10">
      <IdeationBadges badges={badges} />

      <div className="border border-neutral-200 bg-white p-10 shadow-sm">
        <p className="mb-3 text-xs uppercase tracking-[0.2em] text-neutral-400">
          Hook
        </p>
        <p
          className="text-2xl leading-snug text-[#7C3AED]"
          style={{ fontFamily: "var(--font-bebas), sans-serif" }}
        >
          {parsed.hook || "—"}
        </p>
      </div>

      <div className="border border-neutral-200 bg-white p-10 shadow-sm">
        <p className="mb-3 text-xs uppercase tracking-[0.2em] text-neutral-400">
          Cuerpo
        </p>
        <p className="whitespace-pre-wrap text-sm leading-relaxed text-neutral-800">
          {parsed.cuerpo || "—"}
        </p>
      </div>

      <div className="border border-neutral-200 bg-neutral-50 p-8">
        <p className="mb-2 text-xs uppercase tracking-[0.2em] text-neutral-400">
          CTA
        </p>
        <p className="text-sm text-neutral-900">{parsed.cta || "—"}</p>
      </div>

      <div className="border border-neutral-200 bg-white p-8 shadow-sm">
        <p className="mb-2 text-xs uppercase tracking-[0.2em] text-neutral-400">
          Hashtags
        </p>
        <p className="text-sm text-[#7C3AED]">{parsed.hashtags || "—"}</p>
      </div>

      <div className="flex flex-wrap gap-3">
        <button
          type="button"
          onClick={() => copy(block)}
          className="bg-[#7C3AED] px-6 py-2 text-sm font-medium text-white transition hover:bg-[#6d28d9]"
          style={{ fontFamily: "var(--font-bebas), sans-serif" }}
        >
          Copiar todo
        </button>
        <button
          type="button"
          onClick={() => copy(parsed.hook)}
          className="border border-neutral-200 px-4 py-2 text-xs text-neutral-800 transition hover:border-[#7C3AED]"
        >
          Copiar hook
        </button>
        <button
          type="button"
          onClick={() => copy(parsed.cuerpo)}
          className="border border-neutral-200 px-4 py-2 text-xs text-neutral-800 transition hover:border-[#7C3AED]"
        >
          Copiar cuerpo
        </button>
        <button
          type="button"
          onClick={() => copy(parsed.cta)}
          className="border border-neutral-200 px-4 py-2 text-xs text-neutral-800 transition hover:border-[#7C3AED]"
        >
          Copiar CTA
        </button>
      </div>
    </div>
  );
}

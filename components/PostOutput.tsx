"use client";

import { useMemo } from "react";
import { parsePostOutput } from "@/lib/parsePost";

type Props = {
  raw: string;
};

export function PostOutput({ raw }: Props) {
  const parsed = useMemo(() => parsePostOutput(raw), [raw]);

  async function copy(text: string) {
    await navigator.clipboard.writeText(text);
  }

  const block = [parsed.hook, parsed.cuerpo, parsed.cta, parsed.hashtags]
    .filter(Boolean)
    .join("\n\n");

  return (
    <div className="space-y-8">
      <div className="border border-[#2a2a2a] bg-[#1a1a1a] p-8">
        <p className="mb-3 text-xs uppercase tracking-[0.2em] text-[#f5f2ec]/40">
          Hook
        </p>
        <p
          className="text-2xl leading-snug text-[#c8ff00]"
          style={{ fontFamily: "var(--font-bebas), sans-serif" }}
        >
          {parsed.hook || "—"}
        </p>
      </div>

      <div className="border border-[#2a2a2a] bg-[#0a0a0a] p-8">
        <p className="mb-3 text-xs uppercase tracking-[0.2em] text-[#f5f2ec]/40">
          Cuerpo
        </p>
        <p className="whitespace-pre-wrap text-sm leading-relaxed text-[#f5f2ec]/90">
          {parsed.cuerpo || "—"}
        </p>
      </div>

      <div className="border border-[#2a2a2a] bg-[#1a1a1a] p-6">
        <p className="mb-2 text-xs uppercase tracking-[0.2em] text-[#f5f2ec]/40">
          CTA
        </p>
        <p className="text-sm text-[#f5f2ec]">{parsed.cta || "—"}</p>
      </div>

      <div className="border border-[#2a2a2a] bg-[#0a0a0a] p-6">
        <p className="mb-2 text-xs uppercase tracking-[0.2em] text-[#f5f2ec]/40">
          Hashtags
        </p>
        <p className="text-sm text-[#c8ff00]/90">{parsed.hashtags || "—"}</p>
      </div>

      <div className="flex flex-wrap gap-3">
        <button
          type="button"
          onClick={() => copy(block)}
          className="border border-[#c8ff00] bg-[#c8ff00] px-6 py-2 text-sm font-medium text-black"
          style={{ fontFamily: "var(--font-bebas), sans-serif" }}
        >
          Copiar todo
        </button>
        <button
          type="button"
          onClick={() => copy(parsed.hook)}
          className="border border-[#2a2a2a] px-4 py-2 text-xs text-[#f5f2ec] hover:border-[#c8ff00]"
        >
          Copiar hook
        </button>
        <button
          type="button"
          onClick={() => copy(parsed.cuerpo)}
          className="border border-[#2a2a2a] px-4 py-2 text-xs text-[#f5f2ec] hover:border-[#c8ff00]"
        >
          Copiar cuerpo
        </button>
        <button
          type="button"
          onClick={() => copy(parsed.cta)}
          className="border border-[#2a2a2a] px-4 py-2 text-xs text-[#f5f2ec] hover:border-[#c8ff00]"
        >
          Copiar CTA
        </button>
      </div>
    </div>
  );
}

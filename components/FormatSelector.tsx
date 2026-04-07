"use client";

import type { GenerationFormat } from "@/lib/types";

const options: { id: GenerationFormat; label: string; icon: string }[] = [
  { id: "carousel", label: "CARRUSEL", icon: "📋" },
  { id: "video", label: "VIDEO / REEL", icon: "🎬" },
  { id: "post", label: "PUBLICACIÓN ÚNICA", icon: "🖼" },
];

type Props = {
  value: GenerationFormat;
  onChange: (f: GenerationFormat) => void;
};

export function FormatSelector({ value, onChange }: Props) {
  return (
    <div className="space-y-3">
      <p className="text-xs uppercase tracking-[0.2em] text-neutral-400">
        Formato
      </p>
      <div className="grid grid-cols-1 gap-2">
        {options.map((o) => {
          const active = value === o.id;
          return (
            <button
              key={o.id}
              type="button"
              onClick={() => onChange(o.id)}
              className={`flex items-center gap-3 border px-4 py-3 text-left transition ${
                active
                  ? "border-[#7C3AED] bg-violet-50 text-neutral-900"
                  : "border-neutral-200 bg-white text-neutral-600 hover:border-neutral-300"
              }`}
            >
              <span className="text-xl">{o.icon}</span>
              <span
                className="text-xl tracking-wide"
                style={{ fontFamily: "var(--font-bebas), sans-serif" }}
              >
                {o.label}
              </span>
            </button>
          );
        })}
      </div>
    </div>
  );
}

"use client";

import type { GenerationFormat } from "@/lib/types";

const options: { id: GenerationFormat; label: string; icon: string }[] = [
  { id: "carousel", label: "Carrusel", icon: "📋" },
  { id: "video", label: "Video / reel", icon: "🎬" },
  { id: "post", label: "Publicación única", icon: "🖼" },
];

type Props = {
  value: GenerationFormat;
  onChange: (f: GenerationFormat) => void;
};

export function FormatSelector({ value, onChange }: Props) {
  return (
    <div className="space-y-3">
      <p className="text-xs font-medium uppercase tracking-wide text-neutral-400">
        Formato
      </p>
      <div className="grid grid-cols-1 gap-2.5">
        {options.map((o) => {
          const active = value === o.id;
          return (
            <button
              key={o.id}
              type="button"
              onClick={() => onChange(o.id)}
              className={`flex items-center gap-3 rounded-xl border px-4 py-3.5 text-left text-sm font-medium transition ${
                active
                  ? "border-[#7C3AED] bg-violet-50 text-neutral-900 shadow-sm"
                  : "border-neutral-200 bg-white text-neutral-600 hover:border-neutral-300"
              }`}
            >
              <span className="text-lg">{o.icon}</span>
              <span>{o.label}</span>
            </button>
          );
        })}
      </div>
    </div>
  );
}

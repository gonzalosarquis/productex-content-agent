"use client";

import { useState } from "react";
import { fetchSuggest } from "@/lib/suggestApi";
import type { KnowledgeBase } from "@/lib/types";
import { SuggestFieldInnerSpinner } from "./SuggestFieldInnerSpinner";
import { SuggestSparkleButton } from "./SuggestSparkleButton";

const estilos = [
  {
    id: "manifiesto" as const,
    icon: "🔥",
    title: "Manifiesto",
    desc: "texto sobre imagen, verdad incómoda",
  },
  {
    id: "bts" as const,
    icon: "🏭",
    title: "Behind the scenes",
    desc: "proceso real de fábrica",
  },
  {
    id: "educativo" as const,
    icon: "📐",
    title: "Educativo",
    desc: "dato técnico con cortes rápidos",
  },
  {
    id: "tendencia" as const,
    icon: "📈",
    title: "Tendencia / Hook viral",
    desc: "formato de actualidad AR / mundo",
  },
];

const duraciones = ["15s", "30s", "60s"] as const;

export type VideoFormState = {
  estilo: (typeof estilos)[number]["id"];
  tema: string;
  duracion: (typeof duraciones)[number];
  contexto: string;
  useTrends: boolean;
};

type Props = {
  value: VideoFormState;
  onChange: (v: VideoFormState) => void;
  knowledgeBase: KnowledgeBase;
};

export function VideoForm({ value, onChange, knowledgeBase }: Props) {
  const [suggestLoading, setSuggestLoading] = useState<
    "tema" | "contexto" | null
  >(null);

  async function handleSuggest(field: "tema" | "contexto") {
    setSuggestLoading(field);
    try {
      const suggestion = await fetchSuggest({
        format: "video",
        subtype: value.estilo,
        suggest: field,
        currentTema:
          field === "contexto" ? value.tema : undefined,
        knowledgeBase,
      });
      if (field === "tema") {
        onChange({ ...value, tema: suggestion });
      } else {
        onChange({ ...value, contexto: suggestion });
      }
    } catch {
      /* silent */
    } finally {
      setSuggestLoading(null);
    }
  }

  return (
    <div className="space-y-4 border-t border-neutral-200 pt-4">
      <p className="text-xs uppercase tracking-[0.2em] text-neutral-400">
        Video / Reel
      </p>
      <div className="space-y-2">
        {estilos.map((e) => {
          const active = value.estilo === e.id;
          return (
            <button
              key={e.id}
              type="button"
              onClick={() => onChange({ ...value, estilo: e.id })}
              className={`w-full border px-3 py-3 text-left transition ${
                active
                  ? "border-[#7C3AED] bg-violet-50"
                  : "border-neutral-200 bg-white"
              }`}
            >
              <div className="flex items-start gap-2">
                <span className="text-lg">{e.icon}</span>
                <div>
                  <p className="text-sm font-medium text-neutral-900">{e.title}</p>
                  <p className="text-xs text-neutral-500">{e.desc}</p>
                </div>
              </div>
            </button>
          );
        })}
      </div>
      <div>
        <div className="mb-1 flex items-center justify-between gap-2">
          <label className="text-xs text-neutral-500">Tema o producto</label>
          <SuggestSparkleButton
            loading={suggestLoading === "tema"}
            onClick={() => handleSuggest("tema")}
            aria-label="Sugerir tema con IA"
          />
        </div>
        <div className="relative">
          <SuggestFieldInnerSpinner show={suggestLoading === "tema"} />
          <input
            value={value.tema}
            onChange={(e) => onChange({ ...value, tema: e.target.value })}
            disabled={suggestLoading === "tema"}
            className="w-full border border-neutral-200 bg-white px-3 py-2 pr-10 text-sm text-neutral-900 outline-none transition focus:border-[#7C3AED] focus:ring-1 focus:ring-[#7C3AED] disabled:opacity-60"
          />
        </div>
      </div>
      <div>
        <label className="mb-1 block text-xs text-neutral-500">
          Duración
        </label>
        <div className="flex gap-2">
          {duraciones.map((d) => (
            <button
              key={d}
              type="button"
              onClick={() => onChange({ ...value, duracion: d })}
              className={`flex-1 border py-2 text-sm ${
                value.duracion === d
                  ? "border-[#7C3AED] bg-violet-50 text-neutral-900"
                  : "border-neutral-200 text-neutral-500"
              }`}
            >
              {d}
            </button>
          ))}
        </div>
      </div>
      <div>
        <div className="mb-1 flex items-center justify-between gap-2">
          <label className="text-xs text-neutral-500">Contexto adicional</label>
          <SuggestSparkleButton
            loading={suggestLoading === "contexto"}
            onClick={() => handleSuggest("contexto")}
            aria-label="Sugerir contexto con IA"
          />
        </div>
        <div className="relative">
          <SuggestFieldInnerSpinner show={suggestLoading === "contexto"} multiline />
          <textarea
            value={value.contexto}
            onChange={(e) => onChange({ ...value, contexto: e.target.value })}
            disabled={suggestLoading === "contexto"}
            rows={4}
            className="w-full resize-none border border-neutral-200 bg-white px-3 py-2 pr-10 text-sm text-neutral-900 outline-none transition focus:border-[#7C3AED] focus:ring-1 focus:ring-[#7C3AED] disabled:opacity-60"
          />
        </div>
      </div>
      {value.estilo === "tendencia" ? (
        <label className="flex cursor-pointer items-center gap-3 border border-neutral-200 bg-neutral-50 px-3 py-3">
          <input
            type="checkbox"
            checked={value.useTrends}
            onChange={(e) =>
              onChange({ ...value, useTrends: e.target.checked })
            }
            className="h-4 w-4 accent-[#7C3AED]"
          />
          <span className="text-sm text-neutral-800">
            Buscar tendencias actuales (web search)
          </span>
        </label>
      ) : null}
    </div>
  );
}

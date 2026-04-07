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
    <div className="space-y-4 border-t border-[#2a2a2a] pt-4">
      <p className="text-xs uppercase tracking-[0.2em] text-[#f5f2ec]/40">
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
                  ? "border-[#c8ff00] bg-[#0a0a0a]"
                  : "border-[#2a2a2a] bg-[#1a1a1a]"
              }`}
            >
              <div className="flex items-start gap-2">
                <span className="text-lg">{e.icon}</span>
                <div>
                  <p className="text-sm font-medium text-[#f5f2ec]">{e.title}</p>
                  <p className="text-xs text-[#f5f2ec]/50">{e.desc}</p>
                </div>
              </div>
            </button>
          );
        })}
      </div>
      <div>
        <div className="mb-1 flex items-center justify-between gap-2">
          <label className="text-xs text-[#f5f2ec]/50">Tema o producto</label>
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
            className="w-full border border-[#2a2a2a] bg-[#0a0a0a] px-3 py-2 pr-10 text-sm text-[#f5f2ec] outline-none focus:border-[#c8ff00] disabled:opacity-60"
          />
        </div>
      </div>
      <div>
        <label className="mb-1 block text-xs text-[#f5f2ec]/50">
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
                  ? "border-[#c8ff00] text-[#f5f2ec]"
                  : "border-[#2a2a2a] text-[#f5f2ec]/50"
              }`}
            >
              {d}
            </button>
          ))}
        </div>
      </div>
      <div>
        <div className="mb-1 flex items-center justify-between gap-2">
          <label className="text-xs text-[#f5f2ec]/50">Contexto adicional</label>
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
            className="w-full resize-none border border-[#2a2a2a] bg-[#0a0a0a] px-3 py-2 pr-10 text-sm text-[#f5f2ec] outline-none focus:border-[#c8ff00] disabled:opacity-60"
          />
        </div>
      </div>
      {value.estilo === "tendencia" ? (
        <label className="flex cursor-pointer items-center gap-3 border border-[#2a2a2a] bg-[#1a1a1a] px-3 py-3">
          <input
            type="checkbox"
            checked={value.useTrends}
            onChange={(e) =>
              onChange({ ...value, useTrends: e.target.checked })
            }
            className="h-4 w-4 accent-[#c8ff00]"
          />
          <span className="text-sm text-[#f5f2ec]">
            Buscar tendencias actuales (web search)
          </span>
        </label>
      ) : null}
    </div>
  );
}

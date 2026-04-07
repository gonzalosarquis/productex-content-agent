"use client";

import { useState } from "react";
import { fetchSuggest } from "@/lib/suggestApi";
import type { KnowledgeBase } from "@/lib/types";
import { SuggestFieldInnerSpinner } from "./SuggestFieldInnerSpinner";
import { SuggestSparkleButton } from "./SuggestSparkleButton";

const subtipos = [
  { id: "educativo", label: "Educativo" },
  { id: "manifiesto", label: "Manifiesto" },
  { id: "faq", label: "FAQ" },
  { id: "proceso", label: "Proceso / BTS" },
] as const;

const slidesOpts = [6, 8, 10] as const;

const tonos = ["Técnico", "Disruptivo", "Cercano", "Informativo"] as const;

export type CarouselFormState = {
  subtipo: (typeof subtipos)[number]["id"];
  tema: string;
  slides: (typeof slidesOpts)[number];
  contexto: string;
  tono: string[];
};

type Props = {
  value: CarouselFormState;
  onChange: (v: CarouselFormState) => void;
  knowledgeBase: KnowledgeBase;
};

export function CarouselForm({ value, onChange, knowledgeBase }: Props) {
  const [suggestLoading, setSuggestLoading] = useState<
    "tema" | "contexto" | null
  >(null);

  async function handleSuggest(field: "tema" | "contexto") {
    setSuggestLoading(field);
    try {
      const suggestion = await fetchSuggest({
        format: "carousel",
        subtype: value.subtipo,
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
      /* silent — optional: toast */
    } finally {
      setSuggestLoading(null);
    }
  }

  function toggleTono(t: string) {
    const set = new Set(value.tono);
    if (set.has(t)) set.delete(t);
    else set.add(t);
    onChange({ ...value, tono: [...set] });
  }

  return (
    <div className="space-y-4 border-t border-[#2a2a2a] pt-4">
      <p className="text-xs uppercase tracking-[0.2em] text-[#f5f2ec]/40">
        Carrusel
      </p>
      <div className="grid grid-cols-2 gap-2">
        {subtipos.map((s) => (
          <button
            key={s.id}
            type="button"
            onClick={() => onChange({ ...value, subtipo: s.id })}
            className={`border px-3 py-2 text-sm transition ${
              value.subtipo === s.id
                ? "border-[#c8ff00] text-[#f5f2ec]"
                : "border-[#2a2a2a] text-[#f5f2ec]/60 hover:text-[#f5f2ec]"
            }`}
          >
            {s.label}
          </button>
        ))}
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
            placeholder="Ej: buzos frisa / mínimos express"
          />
        </div>
      </div>
      <div>
        <label className="mb-1 block text-xs text-[#f5f2ec]/50">
          Cantidad de slides
        </label>
        <div className="flex gap-2">
          {slidesOpts.map((n) => (
            <button
              key={n}
              type="button"
              onClick={() => onChange({ ...value, slides: n })}
              className={`flex-1 border py-2 text-sm ${
                value.slides === n
                  ? "border-[#c8ff00] text-[#f5f2ec]"
                  : "border-[#2a2a2a] text-[#f5f2ec]/50"
              }`}
            >
              {n}
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
            placeholder="Detalle lo que tiene que resolver el carrusel…"
          />
        </div>
      </div>
      <div>
        <p className="mb-2 text-xs text-[#f5f2ec]/50">Tono (multi)</p>
        <div className="flex flex-wrap gap-2">
          {tonos.map((t) => (
            <button
              key={t}
              type="button"
              onClick={() => toggleTono(t)}
              className={`border px-3 py-1 text-xs ${
                value.tono.includes(t)
                  ? "border-[#c8ff00] text-[#c8ff00]"
                  : "border-[#2a2a2a] text-[#f5f2ec]/50"
              }`}
            >
              {t}
            </button>
          ))}
        </div>
      </div>
    </div>
  );
}

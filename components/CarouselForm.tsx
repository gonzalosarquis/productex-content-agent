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
    <div className="space-y-5 border-t border-neutral-200/90 pt-6">
      <p className="text-xs font-medium uppercase tracking-wide text-neutral-400">
        Carrusel
      </p>
      <div className="grid grid-cols-2 gap-2">
        {subtipos.map((s) => (
          <button
            key={s.id}
            type="button"
            onClick={() => onChange({ ...value, subtipo: s.id })}
            className={`rounded-lg border px-3 py-2.5 text-sm font-medium transition ${
              value.subtipo === s.id
                ? "border-[#7C3AED] bg-violet-50 text-neutral-900"
                : "border-neutral-200 text-neutral-600 hover:border-neutral-300 hover:text-neutral-900"
            }`}
          >
            {s.label}
          </button>
        ))}
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
            className="w-full rounded-lg border border-neutral-200 bg-white px-3 py-2.5 pr-10 text-sm text-neutral-900 outline-none transition focus:border-[#7C3AED] focus:ring-2 focus:ring-[#7C3AED]/20 disabled:opacity-60"
            placeholder="Ej: buzos frisa / mínimos express"
          />
        </div>
      </div>
      <div>
        <label className="mb-1 block text-xs text-neutral-500">
          Cantidad de slides
        </label>
        <div className="flex gap-2">
          {slidesOpts.map((n) => (
            <button
              key={n}
              type="button"
              onClick={() => onChange({ ...value, slides: n })}
              className={`flex-1 rounded-lg border py-2.5 text-sm font-medium ${
                value.slides === n
                  ? "border-[#7C3AED] bg-violet-50 text-neutral-900"
                  : "border-neutral-200 text-neutral-500"
              }`}
            >
              {n}
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
            className="w-full resize-none rounded-lg border border-neutral-200 bg-white px-3 py-2.5 pr-10 text-sm text-neutral-900 outline-none transition focus:border-[#7C3AED] focus:ring-2 focus:ring-[#7C3AED]/20 disabled:opacity-60"
            placeholder="Detalle lo que tiene que resolver el carrusel…"
          />
        </div>
      </div>
      <div>
        <p className="mb-2 text-xs text-neutral-500">Tono (multi)</p>
        <div className="flex flex-wrap gap-2">
          {tonos.map((t) => (
            <button
              key={t}
              type="button"
              onClick={() => toggleTono(t)}
              className={`rounded-full border px-3 py-1.5 text-xs font-medium ${
                value.tono.includes(t)
                  ? "border-[#7C3AED] bg-violet-50 text-[#7C3AED]"
                  : "border-neutral-200 text-neutral-500"
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

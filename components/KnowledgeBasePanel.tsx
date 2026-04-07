"use client";

import { useCallback, useEffect, useState } from "react";
import { createBrowserSupabaseClient } from "@/lib/supabase";
import { mergeProductsField } from "@/lib/mergeProducts";
import type { KnowledgeBase } from "@/lib/types";

const empty: KnowledgeBase = {
  visual_direction: "",
  brand_dna: "",
  audience: "",
  voice: "",
  products: mergeProductsField(""),
  examples: "",
  refs: "",
};

export function KnowledgeBasePanel({
  onKbChange,
}: {
  onKbChange?: (kb: KnowledgeBase) => void;
}) {
  const [kb, setKb] = useState<KnowledgeBase>(empty);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [msg, setMsg] = useState<string | null>(null);

  const load = useCallback(async () => {
    setLoading(true);
    const supabase = createBrowserSupabaseClient();
    const {
      data: { user },
    } = await supabase.auth.getUser();
    if (!user) {
      setLoading(false);
      return;
    }
    const { data } = await supabase
      .from("knowledge_base")
      .select("*")
      .eq("user_id", user.id)
      .maybeSingle();

    if (data) {
      const row = data as Record<string, unknown>;
      const next: KnowledgeBase = {
        visual_direction:
          typeof row.visual_direction === "string" ? row.visual_direction : "",
        brand_dna: data.brand_dna ?? "",
        audience: data.audience ?? "",
        voice: data.voice ?? "",
        products: mergeProductsField(data.products ?? ""),
        examples: data.examples ?? "",
        refs: data.refs ?? "",
      };
      setKb(next);
      onKbChange?.(next);
    } else {
      onKbChange?.(empty);
    }
    setLoading(false);
  }, [onKbChange]);

  useEffect(() => {
    load();
  }, [load]);

  async function save() {
    setSaving(true);
    setMsg(null);
    const supabase = createBrowserSupabaseClient();
    const {
      data: { user },
    } = await supabase.auth.getUser();
    if (!user) {
      setMsg("Sesión inválida");
      setSaving(false);
      return;
    }
    const { error } = await supabase.from("knowledge_base").upsert(
      {
        user_id: user.id,
        visual_direction: kb.visual_direction,
        brand_dna: kb.brand_dna,
        audience: kb.audience,
        voice: kb.voice,
        products: kb.products,
        examples: kb.examples,
        refs: kb.refs,
        updated_at: new Date().toISOString(),
      },
      { onConflict: "user_id" },
    );
    setSaving(false);
    if (error) setMsg(error.message);
    else {
      setMsg("Guardado");
      onKbChange?.(kb);
    }
  }

  function field<K extends keyof KnowledgeBase>(key: K, label: string) {
    return (
      <div>
        <label className="mb-1.5 block text-xs font-semibold text-neutral-700">
          {label}
        </label>
        <textarea
          value={kb[key]}
          onChange={(e) => {
            const next = { ...kb, [key]: e.target.value };
            setKb(next);
            onKbChange?.(next);
          }}
          rows={key === "examples" || key === "products" ? 5 : 3}
          className="w-full resize-none rounded-lg border border-neutral-200 bg-white px-3 py-2.5 text-sm text-neutral-900 outline-none transition focus:border-neutral-900 focus:ring-2 focus:ring-neutral-900/15"
        />
      </div>
    );
  }

  if (loading) {
    return <p className="text-sm text-neutral-500">Cargando base…</p>;
  }

  return (
    <div className="space-y-8">
      <div>
        <label className="mb-1.5 block text-xs font-semibold text-neutral-700">
          Dirección visual para creativos (Gemini) — base del sistema
        </label>
        <p className="mb-2 text-xs text-neutral-500">
          Pegá acá tu brief largo <strong>o</strong> el JSON de identidad visual.
          Se usa en <strong>cada</strong> generación de imagen (carrusel, post,
          reel). Los campos de abajo suman contexto; esta es la referencia
          principal de estética.
        </p>
        <textarea
          value={kb.visual_direction}
          onChange={(e) => {
            const next = { ...kb, visual_direction: e.target.value };
            setKb(next);
            onKbChange?.(next);
          }}
          rows={14}
          placeholder="Ej.: prompt descriptivo de diseño completo, o el JSON Productex Visual Generation Base…"
          className="w-full resize-y rounded-lg border border-neutral-200 bg-white px-3 py-2.5 text-sm text-neutral-900 outline-none transition focus:border-neutral-900 focus:ring-2 focus:ring-neutral-900/15"
        />
      </div>
      {field("brand_dna", "ADN de marca (extra)")}
      {field("audience", "Audiencia (extra)")}
      {field("voice", "Voz (extra)")}
      {field("products", "Productos y servicios detallados")}
      {field("examples", "Copies de referencia aprobados")}
      {field("refs", "Referencias visuales / cuentas")}

      <div className="flex items-center gap-4">
        <button
          type="button"
          onClick={save}
          disabled={saving}
          className="rounded-xl bg-neutral-900 px-8 py-2.5 text-sm font-semibold text-white shadow-sm transition hover:bg-neutral-800 disabled:opacity-50"
        >
          {saving ? "Guardando…" : "Guardar base"}
        </button>
        {msg ? <span className="text-sm text-neutral-500">{msg}</span> : null}
      </div>
    </div>
  );
}

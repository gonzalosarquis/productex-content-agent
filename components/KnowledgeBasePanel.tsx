"use client";

import { useCallback, useEffect, useState } from "react";
import { createBrowserSupabaseClient } from "@/lib/supabase";
import { mergeProductsField } from "@/lib/mergeProducts";
import type { KnowledgeBase } from "@/lib/types";

const empty: KnowledgeBase = {
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
      const next: KnowledgeBase = {
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
        <label className="mb-1 block text-xs uppercase tracking-wider text-[#f5f2ec]/40">
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
          className="w-full resize-none border border-[#2a2a2a] bg-[#0a0a0a] px-3 py-2 text-sm text-[#f5f2ec] outline-none focus:border-[#c8ff00]"
        />
      </div>
    );
  }

  if (loading) {
    return <p className="text-sm text-[#f5f2ec]/50">Cargando base…</p>;
  }

  return (
    <div className="space-y-6">
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
          className="border border-[#c8ff00] bg-[#c8ff00] px-8 py-2 text-lg text-black disabled:opacity-50"
          style={{ fontFamily: "var(--font-bebas), sans-serif" }}
        >
          {saving ? "Guardando…" : "Guardar base"}
        </button>
        {msg ? <span className="text-sm text-[#f5f2ec]/60">{msg}</span> : null}
      </div>
    </div>
  );
}

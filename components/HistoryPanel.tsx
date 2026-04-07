"use client";

import { useCallback, useEffect, useState } from "react";
import type { GenerationRow } from "@/lib/types";

export function HistoryPanel() {
  const [items, setItems] = useState<GenerationRow[]>([]);
  const [loading, setLoading] = useState(true);
  const [err, setErr] = useState<string | null>(null);
  const [openId, setOpenId] = useState<string | null>(null);

  const load = useCallback(async () => {
    setLoading(true);
    setErr(null);
    try {
      const res = await fetch("/api/history");
      const data = await res.json();
      if (!res.ok) throw new Error(data.error ?? "Error");
      setItems(data.items ?? []);
    } catch (e) {
      setErr(e instanceof Error ? e.message : "Error");
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    load();
  }, [load]);

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <p className="text-xs uppercase tracking-[0.2em] text-[#f5f2ec]/40">
          Últimas generaciones
        </p>
        <button
          type="button"
          onClick={load}
          className="text-xs text-[#c8ff00] hover:underline"
        >
          Actualizar
        </button>
      </div>
      {loading ? (
        <p className="text-sm text-[#f5f2ec]/50">Cargando…</p>
      ) : err ? (
        <p className="text-sm text-red-400">{err}</p>
      ) : items.length === 0 ? (
        <p className="text-sm text-[#f5f2ec]/50">Todavía no hay historial.</p>
      ) : (
        <ul className="space-y-2">
          {items.map((g) => {
            const out = g.output as { raw?: string; variants?: string[] };
            const raw = out?.variants?.[0] ?? out?.raw ?? JSON.stringify(out);
            const open = openId === g.id;
            return (
              <li
                key={g.id}
                className="border border-[#2a2a2a] bg-[#1a1a1a]"
              >
                <button
                  type="button"
                  onClick={() => setOpenId(open ? null : g.id)}
                  className="flex w-full items-start justify-between gap-4 px-4 py-3 text-left"
                >
                  <span
                    className="text-sm text-[#f5f2ec]"
                    style={{ fontFamily: "var(--font-bebas), sans-serif" }}
                  >
                    {g.format} · {g.subtype}
                  </span>
                  <span className="shrink-0 text-xs text-[#f5f2ec]/40">
                    {new Date(g.created_at).toLocaleString("es-AR")}
                  </span>
                </button>
                {open ? (
                  <div className="border-t border-[#2a2a2a] px-4 py-3">
                    <p className="mb-2 text-xs text-[#f5f2ec]/50">
                      {g.producto}
                    </p>
                    <pre className="max-h-64 overflow-auto whitespace-pre-wrap text-xs text-[#f5f2ec]/80">
                      {raw}
                    </pre>
                  </div>
                ) : null}
              </li>
            );
          })}
        </ul>
      )}
    </div>
  );
}

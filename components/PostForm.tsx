"use client";

const subtipos = [
  { id: "producto", label: "Producto" },
  { id: "manifiesto", label: "Manifiesto" },
  { id: "bts", label: "Behind the scenes" },
  { id: "faq", label: "FAQ" },
] as const;

const tonos = [
  "Directo",
  "Aspiracional",
  "Técnico",
  "Cercano",
  "Urgente",
] as const;

export type PostFormState = {
  subtipo: (typeof subtipos)[number]["id"];
  producto: string;
  contexto: string;
  tono: string[];
};

type Props = {
  value: PostFormState;
  onChange: (v: PostFormState) => void;
};

export function PostForm({ value, onChange }: Props) {
  function toggleTono(t: string) {
    const set = new Set(value.tono);
    if (set.has(t)) set.delete(t);
    else set.add(t);
    onChange({ ...value, tono: [...set] });
  }

  return (
    <div className="space-y-4 border-t border-[#2a2a2a] pt-4">
      <p className="text-xs uppercase tracking-[0.2em] text-[#f5f2ec]/40">
        Publicación única
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
                : "border-[#2a2a2a] text-[#f5f2ec]/60"
            }`}
          >
            {s.label}
          </button>
        ))}
      </div>
      <div>
        <label className="mb-1 block text-xs text-[#f5f2ec]/50">
          Producto o tema
        </label>
        <input
          value={value.producto}
          onChange={(e) => onChange({ ...value, producto: e.target.value })}
          className="w-full border border-[#2a2a2a] bg-[#0a0a0a] px-3 py-2 text-sm text-[#f5f2ec] outline-none focus:border-[#c8ff00]"
        />
      </div>
      <div>
        <label className="mb-1 block text-xs text-[#f5f2ec]/50">
          Contexto adicional
        </label>
        <textarea
          value={value.contexto}
          onChange={(e) => onChange({ ...value, contexto: e.target.value })}
          rows={4}
          className="w-full resize-none border border-[#2a2a2a] bg-[#0a0a0a] px-3 py-2 text-sm text-[#f5f2ec] outline-none focus:border-[#c8ff00]"
        />
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

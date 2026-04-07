"use client";

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
};

export function CarouselForm({ value, onChange }: Props) {
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
        <label className="mb-1 block text-xs text-[#f5f2ec]/50">
          Tema o producto
        </label>
        <input
          value={value.tema}
          onChange={(e) => onChange({ ...value, tema: e.target.value })}
          className="w-full border border-[#2a2a2a] bg-[#0a0a0a] px-3 py-2 text-sm text-[#f5f2ec] outline-none focus:border-[#c8ff00]"
          placeholder="Ej: buzos frisa / mínimos express"
        />
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
        <label className="mb-1 block text-xs text-[#f5f2ec]/50">
          Contexto adicional
        </label>
        <textarea
          value={value.contexto}
          onChange={(e) => onChange({ ...value, contexto: e.target.value })}
          rows={4}
          className="w-full resize-none border border-[#2a2a2a] bg-[#0a0a0a] px-3 py-2 text-sm text-[#f5f2ec] outline-none focus:border-[#c8ff00]"
          placeholder="Detalle lo que tiene que resolver el carrusel…"
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

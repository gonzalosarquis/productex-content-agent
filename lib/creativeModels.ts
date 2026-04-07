/** Modelos de imagen Gemini (Nano Banana family). Ver https://ai.google.dev/gemini-api/docs/image-generation */
export const CREATIVE_MODELS = [
  {
    id: "gemini-2.5-flash-image",
    label: "Recomendado — 2.5 Flash Image",
    hint: "Mejor relación calidad/precio (API paga). Cuota free más amable que *-preview. Imágenes de referencia: sí.",
  },
  {
    id: "gemini-3.1-flash-image-preview",
    label: "Más calidad — 3.1 Flash Image",
    hint: "Mejor detalle; ~70% más caro que 2.5 a 1K. Suele exigir billing. Refs: sí.",
  },
  {
    id: "gemini-3-pro-image-preview",
    label: "Máxima calidad — 3 Pro Image",
    hint: "Premium; revisá pricing. Refs: sí.",
  },
] as const;

export type CreativeModelId = (typeof CREATIVE_MODELS)[number]["id"];

/** Default: coste optimizado + buena calidad en feed. */
export const DEFAULT_CREATIVE_MODEL: CreativeModelId =
  "gemini-2.5-flash-image";

export const ASPECT_RATIOS = [
  { id: "3:4", label: "3:4 — Feed vertical (recomendado API)" },
  { id: "1:1", label: "1:1 — Feed cuadrado" },
  { id: "4:5", label: "4:5 — Feed (API: 3:4)" },
  { id: "9:16", label: "9:16 — Stories / Reels" },
  { id: "16:9", label: "16:9 — Horizontal" },
] as const;

export type AspectRatioId = (typeof ASPECT_RATIOS)[number]["id"];

export const IMAGE_SIZES = ["1K", "2K", "4K"] as const;
export type ImageSizeId = (typeof IMAGE_SIZES)[number];

/** Label corto para UI: 1K = mejor coste para feed típico. */
export const IMAGE_SIZE_LABELS: Record<ImageSizeId, string> = {
  "1K": "1K — recomendado coste/calidad (feed)",
  "2K": "2K — más detalle",
  "4K": "4K — máximo detalle (más caro)",
};

/** Modelos de imagen Gemini (Nano Banana family). Ver https://ai.google.dev/gemini-api/docs/image-generation */
export const CREATIVE_MODELS = [
  {
    id: "gemini-2.5-flash-image",
    label: "Gratis / base — 2.5 Flash Image",
    hint: "Modelo estable con más cuota en free tier (API). Evitá *-preview si ves 429.",
  },
  {
    id: "gemini-3.1-flash-image-preview",
    label: "Equilibrado (3.1 Flash Image)",
    hint: "Nano Banana 2 — suele exigir facturación; si ves error 429, usá 2.5",
  },
  {
    id: "gemini-3-pro-image-preview",
    label: "Máxima calidad (3 Pro Image)",
    hint: "Nano Banana Pro — texto y detalle",
  },
] as const;

export type CreativeModelId = (typeof CREATIVE_MODELS)[number]["id"];

/** 2.5 suele estar disponible en más cuentas; 3.1/3 Pro se eligen en la UI. */
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

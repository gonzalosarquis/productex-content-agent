import {
  CREATIVE_MODELS,
  DEFAULT_CREATIVE_MODEL,
  type CreativeModelId,
} from "@/lib/creativeModels";

function isCreativeModel(id: string): id is CreativeModelId {
  return CREATIVE_MODELS.some((m) => m.id === id);
}

/** Solo IDs tipo gemini-* (permite override por env con modelos nuevos). */
function looksLikeGeminiModelId(id: string): boolean {
  return /^gemini-[a-z0-9.-]+$/i.test(id);
}

/**
 * Prioridad: `GEMINI_IMAGE_MODEL` en el servidor (forzar modelo base / gratis),
 * luego el pedido del cliente, luego default.
 * Doc modelo estable: https://ai.google.dev/gemini-api/docs/models/gemini-2.5-flash-image
 */
export function resolveGeminiImageModel(bodyModel: string | undefined): string {
  const env = process.env.GEMINI_IMAGE_MODEL?.trim();
  if (env && looksLikeGeminiModelId(env)) {
    return env;
  }
  if (bodyModel && isCreativeModel(bodyModel)) {
    return bodyModel;
  }
  return DEFAULT_CREATIVE_MODEL;
}

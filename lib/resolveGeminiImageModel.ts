import {
  CREATIVE_MODELS,
  DEFAULT_CREATIVE_MODEL,
  type CreativeModelId,
  type ImageSizeId,
} from "@/lib/creativeModels";

function isCreativeModel(id: string): id is CreativeModelId {
  return CREATIVE_MODELS.some((m) => m.id === id);
}

/** Solo IDs tipo gemini-* (permite override por env con modelos nuevos). */
function looksLikeGeminiModelId(id: string): boolean {
  return /^gemini-[a-z0-9.-]+$/i.test(id);
}

function isImageSize(id: string): id is ImageSizeId {
  return id === "1K" || id === "2K" || id === "4K";
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

/**
 * Resolución de salida.
 *
 * - `GEMINI_IMAGE_SIZE` (1K/2K/4K) siempre gana (staging o pruebas con coste fijo).
 * - En **producción** (`NODE_ENV=production`), sin env: siempre **1K** (coste predecible),
 *   salvo `GEMINI_ALLOW_IMAGE_SIZE_OPTIONS=true` para aceptar lo que envía el cliente.
 */
export function resolveGeminiImageSize(bodySize: string | undefined): ImageSizeId {
  const env = process.env.GEMINI_IMAGE_SIZE?.trim();
  if (env && isImageSize(env)) {
    return env;
  }

  const isProd = process.env.NODE_ENV === "production";
  const allowClientSizes =
    process.env.GEMINI_ALLOW_IMAGE_SIZE_OPTIONS?.trim() === "true";

  if (isProd && !allowClientSizes) {
    return "1K";
  }

  if (bodySize && isImageSize(bodySize)) {
    return bodySize;
  }
  return "1K";
}

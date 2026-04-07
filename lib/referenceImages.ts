/** Coste/calidad: pocas refs, tamaño acotado para no romper límites de body en hosting. */
export const MAX_REFERENCE_IMAGES = 3;
export const MAX_DECODED_BYTES_PER_IMAGE = 750_000;

const ALLOWED_MIME = new Set(["image/png", "image/jpeg", "image/webp"]);

export type ReferenceImagePayload = {
  mimeType: string;
  /** Base64 sin prefijo data: */
  data: string;
};

function stripDataUrl(s: string): { mime: string | null; b64: string } {
  const m = /^data:([^;]+);base64,(.+)$/.exec(s.trim());
  if (!m) return { mime: null, b64: s.replace(/\s/g, "") };
  return { mime: m[1]!.trim().toLowerCase(), b64: m[2]!.replace(/\s/g, "") };
}

function estimateDecodedLength(b64: string): number {
  const pad = b64.endsWith("==") ? 2 : b64.endsWith("=") ? 1 : 0;
  return Math.floor((b64.length * 3) / 4) - pad;
}

export function parseReferenceImages(raw: unknown):
  | { ok: true; images: ReferenceImagePayload[] }
  | { ok: false; error: string } {
  if (raw == null) return { ok: true, images: [] };
  if (!Array.isArray(raw)) {
    return { ok: false, error: "referenceImages debe ser un array" };
  }
  if (raw.length === 0) return { ok: true, images: [] };
  if (raw.length > MAX_REFERENCE_IMAGES) {
    return {
      ok: false,
      error: `Máximo ${MAX_REFERENCE_IMAGES} imágenes de referencia`,
    };
  }

  const out: ReferenceImagePayload[] = [];

  for (let i = 0; i < raw.length; i++) {
    const item = raw[i];
    if (!item || typeof item !== "object") {
      return { ok: false, error: `referenceImages[${i}]: objeto inválido` };
    }
    const rec = item as Record<string, unknown>;
    const dataIn =
      typeof rec.data === "string"
        ? rec.data
        : typeof rec.base64 === "string"
          ? rec.base64
          : null;
    if (!dataIn) {
      return {
        ok: false,
        error: `referenceImages[${i}]: falta data (base64)`,
      };
    }
    const { mime: fromDataUrl, b64 } = stripDataUrl(dataIn);
    if (!b64.length) {
      return { ok: false, error: `referenceImages[${i}]: base64 vacío` };
    }

    let mime =
      typeof rec.mimeType === "string"
        ? rec.mimeType.trim().toLowerCase()
        : fromDataUrl;
    if (!mime) {
      return {
        ok: false,
        error: `referenceImages[${i}]: indicá mimeType (png, jpeg o webp)`,
      };
    }
    if (mime === "image/jpg") mime = "image/jpeg";
    if (!ALLOWED_MIME.has(mime)) {
      return {
        ok: false,
        error: `referenceImages[${i}]: tipo ${mime} no permitido (usá png, jpeg o webp)`,
      };
    }

    const len = estimateDecodedLength(b64);
    if (len > MAX_DECODED_BYTES_PER_IMAGE) {
      return {
        ok: false,
        error: `referenceImages[${i}]: imagen demasiado grande (máx. ~${Math.round(
          MAX_DECODED_BYTES_PER_IMAGE / 1024,
        )} KB por archivo)`,
      };
    }

    out.push({ mimeType: mime, data: b64 });
  }

  return { ok: true, images: out };
}

export function referenceStyleBlock(count: number): string {
  if (count <= 0) return "";
  return `

REFERENCIA VISUAL (imágenes adjuntas en el mismo mensaje):
- Se adjuntan ${count} imagen(es) de referencia de estética de marca.
- Alineá la nueva pieza con su PALETA, ILUMINACIÓN, TEXTURA/GRAIN, COMPOSICIÓN y RITMO TIPOGRÁFICO (si aplica).
- No copies personajes, marcas ni logos reconocibles; no reproduzcas texto ilegible de las referencias.
- Generá una imagen nueva y original coherente con el mensaje del post y con esta estética.`;
}

/**
 * El SDK suele devolver el cuerpo JSON del error en Error.message (a veces con texto extra).
 * Lo traducimos a mensaje usable y detectamos 429 / cuota.
 */

const RATE_LIMITS_URL = "https://ai.google.dev/gemini-api/docs/rate-limits";

/** Texto único para 429 (API vs AI Studio tienen cuotas distintas). */
function message429Actions(extra?: string): string {
  const base =
    "Error 429 — cuota agotada o demasiadas peticiones (por minuto o por día). " +
    "Qué podés hacer: " +
    "(1) En el servidor, fijá GEMINI_IMAGE_MODEL=gemini-2.5-flash-image (modelo base con más cupo en free tier). " +
    "(2) Usá resolución 1K y generá menos slides por tanda. " +
    "(3) En Google Cloud, habilitá facturación para el proyecto vinculado a tu API key si necesitás imágenes sin tope. " +
    "(4) Esperá unos minutos o al reinicio diario de cuotas. " +
    `Más info: ${RATE_LIMITS_URL}`;
  return extra ? `${extra} ${base}` : base;
}

export function parseRetryAfterSecondsFromText(text: string): number | undefined {
  const m = text.match(/retry in ([\d.]+)s/i);
  if (m?.[1]) {
    const s = parseFloat(m[1]);
    if (!Number.isNaN(s)) return Math.ceil(s) + 1;
  }
  return undefined;
}

/** Primer `{ ... }` balanceado (por si el SDK antepone texto al JSON). */
function extractBalancedJsonObject(s: string): string | null {
  const start = s.indexOf("{");
  if (start === -1) return null;
  let depth = 0;
  for (let i = start; i < s.length; i++) {
    const c = s[i];
    if (c === "{") depth++;
    else if (c === "}") {
      depth--;
      if (depth === 0) return s.slice(start, i + 1);
    }
  }
  return null;
}

/** Extrae el objeto `error` de la respuesta típica de Google APIs. */
function extractGoogleErrorPayload(raw: string): {
  code?: number;
  message?: string;
  status?: string;
} | null {
  const trimmed = raw.trim();
  const tryParse = (s: string) => {
    try {
      const o = JSON.parse(s) as {
        error?: { code?: number; message?: string; status?: string };
      };
      if (o.error && typeof o.error === "object") return o.error;
      const code = (o as { code?: number }).code;
      const message = (o as { message?: string }).message;
      if (typeof code === "number" && typeof message === "string") {
        return { code, message, status: (o as { status?: string }).status };
      }
      return null;
    } catch {
      return null;
    }
  };

  let p = tryParse(trimmed);
  if (p) return p;

  const blob = extractBalancedJsonObject(trimmed);
  if (blob) {
    p = tryParse(blob);
    if (p) return p;
  }
  return null;
}

export function humanizeGeminiError(raw: string): string {
  const trimmed = raw.trim();
  if (!trimmed) return "Error desconocido al llamar a Gemini.";

  const err = extractGoogleErrorPayload(trimmed);
  if (err) {
    const code = err.code;
    const msg = err.message ?? "";
    const status = err.status ?? "";

    if (code === 429 || status === "RESOURCE_EXHAUSTED") {
      const wait = parseRetryAfterSecondsFromText(msg);
      const freeTier =
        /free_tier|limit:\s*0|quota exceeded/i.test(msg) ||
        /GenerateContent.*FreeTier/i.test(msg);
      const waitHint = wait ? ` Google pide esperar ~${wait}s antes de reintentar.` : "";
      const tierHint = freeTier
        ? " Tu cuenta marca free_tier con límite bajo o 0 para este modelo. "
        : "";
      return message429Actions(tierHint + waitHint);
    }

    if (code === 404) {
      return `Modelo no encontrado o no habilitado (404). Probá otro modelo en el selector.`;
    }

    return msg.slice(0, 500) || "Error de la API Gemini.";
  }

  if (/429|RESOURCE_EXHAUSTED|quota exceeded|rate limit|free_tier/i.test(trimmed)) {
    return message429Actions();
  }

  if (trimmed.startsWith("{")) {
    return message429Actions();
  }

  return trimmed.slice(0, 500);
}

export async function sleep(ms: number): Promise<void> {
  await new Promise((r) => setTimeout(r, ms));
}

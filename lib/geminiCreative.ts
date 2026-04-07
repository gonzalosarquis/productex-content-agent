import {
  GoogleGenAI,
  createPartFromBase64,
  createPartFromText,
  createUserContent,
} from "@google/genai";
import type { ContentListUnion, GenerateContentResponse } from "@google/genai";
import {
  humanizeGeminiError,
  parseRetryAfterSecondsFromText,
  sleep,
} from "@/lib/geminiApiError";
import { toGeminiImageAspectRatio } from "@/lib/geminiAspect";
import type { ImageSizeId } from "@/lib/creativeModels";

export type ReferenceImageInput = {
  mimeType: string;
  base64: string;
};

export type GenerateImageResult =
  | { ok: true; mimeType: string; base64: string }
  | { ok: false; error: string };

function extractImageParts(response: GenerateContentResponse): {
  mimeType: string;
  base64: string;
} | null {
  const candidates = response.candidates ?? [];
  for (const cand of candidates) {
    const parts = cand.content?.parts ?? [];
    for (const part of parts) {
      const data = part.inlineData?.data;
      if (data && typeof data === "string") {
        return {
          mimeType: part.inlineData?.mimeType ?? "image/png",
          base64: data,
        };
      }
    }
  }
  return null;
}

function describeFailure(response: GenerateContentResponse): string {
  const pf = response.promptFeedback;
  if (pf?.blockReason) {
    return `Prompt bloqueado (${pf.blockReason}).`;
  }
  const c0 = response.candidates?.[0];
  if (c0?.finishReason && c0.finishReason !== "STOP") {
    return `Generación detenida: ${c0.finishReason}.`;
  }
  const t = response.text?.trim();
  if (t) {
    return `Sin imagen. Texto del modelo: ${t.slice(0, 280)}`;
  }
  return "Sin imagen en la respuesta (revisá modelo, cuotas o políticas de contenido).";
}

function isQuotaOrRateLimit(message: string): boolean {
  return (
    /"code":\s*429|429|RESOURCE_EXHAUSTED|quota exceeded|rate limit|free_tier/i.test(
      message,
    )
  );
}

function buildContents(
  prompt: string,
  referenceImages: ReferenceImageInput[] | undefined,
): ContentListUnion {
  const refs = referenceImages?.length
    ? referenceImages
    : undefined;
  if (!refs?.length) {
    return prompt;
  }
  return createUserContent([
    createPartFromText(prompt),
    ...refs.map((r) => createPartFromBase64(r.base64, r.mimeType)),
  ]);
}

async function generateContentWithConfig(
  ai: GoogleGenAI,
  model: string,
  prompt: string,
  ar: string,
  imageSize: ImageSizeId | null,
  referenceImages: ReferenceImageInput[] | undefined,
): Promise<GenerateContentResponse> {
  return ai.models.generateContent({
    model,
    contents: buildContents(prompt, referenceImages),
    config: {
      responseModalities: ["TEXT", "IMAGE"],
      imageConfig:
        imageSize === null
          ? { aspectRatio: ar }
          : { aspectRatio: ar, imageSize },
    },
  });
}

/**
 * Un intento de generación: con imageSize y, si falla, sin imageSize.
 * Devuelve error crudo (para reintentos / humanize).
 */
async function attemptGeneration(params: {
  apiKey: string;
  model: string;
  prompt: string;
  aspectRatio: string;
  imageSize: ImageSizeId;
  referenceImages?: ReferenceImageInput[];
}): Promise<GenerateImageResult> {
  const { apiKey, model, prompt, aspectRatio, imageSize, referenceImages } =
    params;
  const ar = toGeminiImageAspectRatio(aspectRatio);

  try {
    const ai = new GoogleGenAI({ apiKey });

    let response: GenerateContentResponse;

    try {
      response = await generateContentWithConfig(
        ai,
        model,
        prompt,
        ar,
        imageSize,
        referenceImages,
      );
    } catch (first) {
      const msg1 = first instanceof Error ? first.message : String(first);
      try {
        response = await generateContentWithConfig(
          ai,
          model,
          prompt,
          ar,
          null,
          referenceImages,
        );
      } catch (second) {
        const msg2 = second instanceof Error ? second.message : String(second);
        return {
          ok: false,
          error: `${msg1} | Sin imageSize: ${msg2}`,
        };
      }
    }

    const img = extractImageParts(response);
    if (img) {
      return { ok: true, mimeType: img.mimeType, base64: img.base64 };
    }

    return { ok: false, error: describeFailure(response) };
  } catch (e) {
    const msg = e instanceof Error ? e.message : String(e);
    return { ok: false, error: msg };
  }
}

export async function generateGeminiImage(params: {
  apiKey: string;
  model: string;
  prompt: string;
  aspectRatio: string;
  imageSize: ImageSizeId;
  referenceImages?: ReferenceImageInput[];
}): Promise<GenerateImageResult> {
  let result = await attemptGeneration(params);

  if (!result.ok && isQuotaOrRateLimit(result.error)) {
    const sec = parseRetryAfterSecondsFromText(result.error) ?? 15;
    await sleep(Math.min(60_000, (sec + 1) * 1000));
    result = await attemptGeneration(params);
  }

  if (!result.ok) {
    return { ok: false, error: humanizeGeminiError(result.error) };
  }
  return result;
}

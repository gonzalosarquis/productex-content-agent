import { GoogleGenAI } from "@google/genai";
import type { CreativeModelId } from "@/lib/creativeModels";
import type { ImageSizeId } from "@/lib/creativeModels";

export type GenerateImageResult =
  | { ok: true; mimeType: string; base64: string }
  | { ok: false; error: string };

function extractImage(response: {
  candidates?: { content?: { parts?: Array<{ inlineData?: { data?: string; mimeType?: string } }> } }[];
}): { mimeType: string; base64: string } | null {
  const parts = response.candidates?.[0]?.content?.parts;
  if (!parts) return null;
  for (const part of parts) {
    const data = part.inlineData?.data;
    if (data) {
      return {
        mimeType: part.inlineData?.mimeType ?? "image/png",
        base64: data,
      };
    }
  }
  return null;
}

export async function generateGeminiImage(params: {
  apiKey: string;
  model: CreativeModelId;
  prompt: string;
  aspectRatio: string;
  imageSize: ImageSizeId;
}): Promise<GenerateImageResult> {
  const { apiKey, model, prompt, aspectRatio, imageSize } = params;

  try {
    const ai = new GoogleGenAI({ apiKey });

    const response = await ai.models.generateContent({
      model,
      contents: prompt,
      config: {
        responseModalities: ["TEXT", "IMAGE"],
        imageConfig: {
          aspectRatio,
          imageSize,
        },
      },
    });

    const img = extractImage(response);
    if (img) {
      return { ok: true, mimeType: img.mimeType, base64: img.base64 };
    }

    const text = response.text?.trim();
    if (text) {
      return {
        ok: false,
        error: `El modelo no devolvió imagen. Respuesta: ${text.slice(0, 200)}`,
      };
    }

    return {
      ok: false,
      error: "Sin imagen en la respuesta. Revisá modelo, cuotas o políticas de contenido.",
    };
  } catch (e) {
    const msg = e instanceof Error ? e.message : String(e);
    return { ok: false, error: msg };
  }
}

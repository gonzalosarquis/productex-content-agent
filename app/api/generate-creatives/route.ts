import { NextResponse } from "next/server";
import {
  ASPECT_RATIOS,
  CREATIVE_MODELS,
  DEFAULT_CREATIVE_MODEL,
  type AspectRatioId,
  type CreativeModelId,
  type ImageSizeId,
} from "@/lib/creativeModels";
import {
  buildCarouselSlidePrompt,
  buildPostCreativePrompt,
  buildVideoCreativePrompt,
} from "@/lib/buildImagePrompt";
import { generateGeminiImage } from "@/lib/geminiCreative";
import { splitCarouselIdeation, splitPostIdeation, splitVideoIdeation } from "@/lib/ideationBadges";
import { parseCarouselOutput } from "@/lib/parseCarousel";
import { parsePostOutput } from "@/lib/parsePost";
import { parseVideoOutput } from "@/lib/parseVideo";
import { createServerSupabaseClient } from "@/lib/supabase-server";
import type { KnowledgeBase } from "@/lib/types";

export const runtime = "nodejs";

const MAX_RAW = 600_000;

function isCreativeModel(id: string): id is CreativeModelId {
  return CREATIVE_MODELS.some((m) => m.id === id);
}

function isAspectRatio(id: string): id is AspectRatioId {
  return ASPECT_RATIOS.some((a) => a.id === id);
}

function aspectLabel(id: AspectRatioId): string {
  return ASPECT_RATIOS.find((a) => a.id === id)?.label ?? id;
}

type Body = {
  format: "carousel" | "post" | "video";
  raw: string;
  knowledgeBase: KnowledgeBase;
  model?: string;
  aspectRatio?: string;
  imageSize?: string;
  /** Carrusel: índice 0-based del slide, o omitir con batch */
  slideIndex?: number;
  /** Si true, genera todas las slides (carrusel) */
  batch?: boolean;
};

export async function POST(req: Request) {
  const key = process.env.GEMINI_API_KEY?.trim();
  if (!key) {
    return NextResponse.json(
      {
        error:
          "Falta GEMINI_API_KEY. Obtené una clave en Google AI Studio y agregala al entorno del servidor.",
      },
      { status: 503 },
    );
  }

  try {
    const supabaseAuth = await createServerSupabaseClient();
    const {
      data: { user },
    } = await supabaseAuth.auth.getUser();
    if (!user) {
      return NextResponse.json({ error: "No autorizado" }, { status: 401 });
    }

    const body = (await req.json()) as Body;
    const raw =
      typeof body.raw === "string" ? body.raw : String(body.raw ?? "");
    if (!raw.trim()) {
      return NextResponse.json({ error: "raw vacío" }, { status: 400 });
    }
    if (raw.length > MAX_RAW) {
      return NextResponse.json({ error: "Contenido demasiado largo" }, { status: 400 });
    }

    const kb: KnowledgeBase = body.knowledgeBase ?? {
      brand_dna: "",
      audience: "",
      voice: "",
      products: "",
      examples: "",
      refs: "",
    };

    const model: CreativeModelId = isCreativeModel(body.model ?? "")
      ? (body.model as CreativeModelId)
      : DEFAULT_CREATIVE_MODEL;

    const aspectRatio: AspectRatioId = isAspectRatio(body.aspectRatio ?? "")
      ? (body.aspectRatio as AspectRatioId)
      : "4:5";

    const imageSize = (["1K", "2K", "4K"] as const).includes(
      body.imageSize as ImageSizeId,
    )
      ? (body.imageSize as ImageSizeId)
      : "2K";

    const arLabel = aspectLabel(aspectRatio);

    if (body.format === "carousel") {
      const { body: carouselBody } = splitCarouselIdeation(raw);
      const parsed = parseCarouselOutput(carouselBody);
      const slides = parsed.slides;
      if (slides.length === 0) {
        return NextResponse.json(
          { error: "No se detectaron slides en el contenido" },
          { status: 400 },
        );
      }

      const batch = Boolean(body.batch);
      const idx =
        typeof body.slideIndex === "number" && !Number.isNaN(body.slideIndex)
          ? Math.floor(body.slideIndex)
          : -1;

      if (!batch) {
        if (idx < 0 || idx >= slides.length) {
          return NextResponse.json(
            { error: "slideIndex inválido para el carrusel" },
            { status: 400 },
          );
        }
        const slide = slides[idx]!;
        const prompt = buildCarouselSlidePrompt(
          kb,
          slide,
          idx,
          slides.length,
          arLabel,
        );
        const result = await generateGeminiImage({
          apiKey: key,
          model,
          prompt,
          aspectRatio,
          imageSize,
        });
        if (!result.ok) {
          return NextResponse.json({ error: result.error }, { status: 502 });
        }
        return NextResponse.json({
          format: "carousel",
          slideIndex: idx,
          mimeType: result.mimeType,
          data: result.base64,
        });
      }

      const results: {
        slideIndex: number;
        mimeType?: string;
        data?: string;
        error?: string;
      }[] = [];

      for (let i = 0; i < slides.length; i++) {
        const slide = slides[i]!;
        const prompt = buildCarouselSlidePrompt(
          kb,
          slide,
          i,
          slides.length,
          arLabel,
        );
        const result = await generateGeminiImage({
          apiKey: key,
          model,
          prompt,
          aspectRatio,
          imageSize,
        });
        if (result.ok) {
          results.push({
            slideIndex: i,
            mimeType: result.mimeType,
            data: result.base64,
          });
        } else {
          results.push({ slideIndex: i, error: result.error });
        }
        if (i < slides.length - 1) {
          await new Promise((r) => setTimeout(r, 120));
        }
      }

      return NextResponse.json({ format: "carousel", batch: true, results });
    }

    if (body.format === "post") {
      const { body: postBody } = splitPostIdeation(raw);
      const parsed = parsePostOutput(postBody);
      const prompt = buildPostCreativePrompt(
        kb,
        parsed.hook,
        parsed.cuerpo,
        arLabel,
      );
      const result = await generateGeminiImage({
        apiKey: key,
        model,
        prompt,
        aspectRatio,
        imageSize,
      });
      if (!result.ok) {
        return NextResponse.json({ error: result.error }, { status: 502 });
      }
      return NextResponse.json({
        format: "post",
        mimeType: result.mimeType,
        data: result.base64,
      });
    }

    if (body.format === "video") {
      const { body: videoBody } = splitVideoIdeation(raw);
      const parsed = parseVideoOutput(videoBody);
      const scriptExcerpt = parsed.segments
        .slice(0, 6)
        .map((s) => {
          const lines = s.lines.map((l) =>
            l.label ? `${l.label}: ${l.text}` : l.text,
          );
          return `${s.header}\n${lines.join("\n")}`;
        })
        .join("\n\n");

      const prompt = buildVideoCreativePrompt(
        kb,
        scriptExcerpt,
        parsed.caption,
        parsed.musica,
        arLabel,
      );
      const result = await generateGeminiImage({
        apiKey: key,
        model,
        prompt,
        aspectRatio,
        imageSize,
      });
      if (!result.ok) {
        return NextResponse.json({ error: result.error }, { status: 502 });
      }
      return NextResponse.json({
        format: "video",
        mimeType: result.mimeType,
        data: result.base64,
      });
    }

    return NextResponse.json({ error: "formato inválido" }, { status: 400 });
  } catch (e) {
    const message = e instanceof Error ? e.message : "Error desconocido";
    return NextResponse.json({ error: message }, { status: 500 });
  }
}

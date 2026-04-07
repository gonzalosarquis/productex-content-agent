import { NextResponse } from "next/server";
import { generateWithClaude, splitVariants } from "@/lib/anthropic";
import { buildCarouselPrompt } from "@/lib/prompts/carouselPrompt";
import { buildPostPrompt } from "@/lib/prompts/postPrompt";
import { buildVideoPrompt } from "@/lib/prompts/videoPrompt";
import {
  createServerSupabaseClient,
  createServiceRoleClient,
} from "@/lib/supabase-server";
import { buildSystemPrompt } from "@/lib/systemPrompt";
import { fetchTrendsContext } from "@/lib/trendsResearch";
import type { KnowledgeBase } from "@/lib/types";

export const runtime = "nodejs";

type Body = {
  format: "carousel" | "video" | "post";
  subtype: string;
  tema: string;
  contexto: string;
  tono: string[];
  variants: number;
  slides?: number;
  duracion?: string;
  useTrends?: boolean;
  knowledgeBase: KnowledgeBase;
};

export async function POST(req: Request) {
  try {
    const supabaseAuth = await createServerSupabaseClient();
    const {
      data: { user },
    } = await supabaseAuth.auth.getUser();
    if (!user) {
      return NextResponse.json({ error: "No autorizado" }, { status: 401 });
    }

    const body = (await req.json()) as Body;
    const kb = body.knowledgeBase ?? {
      visual_direction: "",
      brand_dna: "",
      audience: "",
      voice: "",
      products: "",
      examples: "",
      refs: "",
    };

    const system = buildSystemPrompt(kb);
    let userPrompt: string;

    let trendsContext: string | undefined;
    if (body.format === "video" && Boolean(body.useTrends)) {
      trendsContext = await fetchTrendsContext(body.tema);
    }

    if (body.format === "carousel") {
      userPrompt = buildCarouselPrompt({
        subtype: body.subtype,
        tema: body.tema,
        slides: body.slides ?? 6,
        contexto: body.contexto,
        tono: body.tono,
        variants: Math.min(Math.max(body.variants ?? 1, 1), 3),
        trendsContext,
      });
    } else if (body.format === "video") {
      userPrompt = buildVideoPrompt({
        style: body.subtype,
        tema: body.tema,
        duracion: body.duracion ?? "30s",
        contexto: body.contexto,
        variants: Math.min(Math.max(body.variants ?? 1, 1), 3),
        trendsContext,
      });
    } else {
      userPrompt = buildPostPrompt({
        subtype: body.subtype,
        tema: body.tema,
        contexto: body.contexto,
        tono: body.tono,
        variants: Math.min(Math.max(body.variants ?? 1, 1), 3),
        trendsContext,
      });
    }

    const raw = await generateWithClaude({
      system,
      user: userPrompt,
      useTrends: false,
    });

    const variants = splitVariants(raw);

    const admin = createServiceRoleClient();
    const { error: insertError } = await admin.from("generations").insert({
      user_id: user.id,
      format: body.format,
      subtype: body.subtype,
      producto: body.tema,
      contexto: body.contexto,
      tono: body.tono,
      output: { raw, variants },
    });

    if (insertError) {
      console.error(insertError);
      return NextResponse.json(
        { error: "No se pudo guardar el historial", detail: insertError.message },
        { status: 500 },
      );
    }

    return NextResponse.json({
      variants,
      format: body.format,
      subtype: body.subtype,
    });
  } catch (e) {
    const message = e instanceof Error ? e.message : "Error desconocido";
    return NextResponse.json({ error: message }, { status: 500 });
  }
}

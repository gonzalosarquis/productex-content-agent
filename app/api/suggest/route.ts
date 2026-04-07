import { NextResponse } from "next/server";
import { generateSuggestion } from "@/lib/anthropic";
import { createServerSupabaseClient } from "@/lib/supabase-server";
import { buildSystemPrompt } from "@/lib/systemPrompt";
import type { KnowledgeBase } from "@/lib/types";

export const runtime = "nodejs";

const FORMAT_LABEL: Record<"carousel" | "video" | "post", string> = {
  carousel: "carrusel",
  video: "video/reel",
  post: "publicación única",
};

type Body = {
  format: "carousel" | "video" | "post";
  subtype: string;
  suggest: "tema" | "contexto";
  currentTema?: string;
  knowledgeBase: KnowledgeBase;
};

export async function POST(req: Request) {
  try {
    const supabase = await createServerSupabaseClient();
    const {
      data: { user },
    } = await supabase.auth.getUser();
    if (!user) {
      return NextResponse.json({ error: "No autorizado" }, { status: 401 });
    }

    const body = (await req.json()) as Body;
    const kb = body.knowledgeBase ?? {
      brand_dna: "",
      audience: "",
      voice: "",
      products: "",
      examples: "",
      refs: "",
    };

    const formatLabel = FORMAT_LABEL[body.format] ?? body.format;
    const temaActualParaPrompt =
      body.suggest === "contexto"
        ? body.currentTema?.trim() || "(vacío)"
        : "—";

    const userPrompt = `Sos el agente de contenido de Productex. 
Según la identidad de la marca, su audiencia, 
su voz y su historial de contenido exitoso,
sugerí para un ${formatLabel} de tipo ${body.subtype}:

Si se pide TEMA: devolvé solo el tema en una línea, 
directo, sin comillas, sin explicación. 
Que sea específico, relevante y con potencial 
de engagement para la audiencia de Productex.

Si se pide CONTEXTO (tema actual: ${temaActualParaPrompt}): 
devolvé solo el contexto adicional en 2-3 líneas,
sin comillas, sin explicación.
Que especifique el ángulo, a quién apunta exactamente
y qué debe resolver el contenido.

Devolvé SOLO el texto pedido, nada más.

Pedido actual: ${body.suggest === "tema" ? "TEMA" : "CONTEXTO"}.`;

    const system = buildSystemPrompt(kb);
    const suggestion = await generateSuggestion({ system, user: userPrompt });

    return NextResponse.json({ suggestion });
  } catch (e) {
    const message = e instanceof Error ? e.message : "Error desconocido";
    return NextResponse.json({ error: message }, { status: 500 });
  }
}

"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { createBrowserSupabaseClient } from "@/lib/supabase";
import { mergeProductsField } from "@/lib/mergeProducts";
import type { KnowledgeBase } from "@/lib/types";
import type { GenerationFormat } from "@/lib/types";
import { CarouselOutput } from "@/components/CarouselOutput";
import { HistoryPanel } from "@/components/HistoryPanel";
import { KnowledgeBasePanel } from "@/components/KnowledgeBasePanel";
import { PostOutput } from "@/components/PostOutput";
import { Sidebar } from "@/components/Sidebar";
import { VideoOutput } from "@/components/VideoOutput";
import type { CarouselFormState } from "@/components/CarouselForm";
import type { VideoFormState } from "@/components/VideoForm";
import type { PostFormState } from "@/components/PostForm";

const emptyKb: KnowledgeBase = {
  visual_direction: "",
  brand_dna: "",
  audience: "",
  voice: "",
  products: mergeProductsField(""),
  examples: "",
  refs: "",
};

export default function DashboardPage() {
  const router = useRouter();
  const [format, setFormat] = useState<GenerationFormat>("carousel");
  const [carousel, setCarousel] = useState<CarouselFormState>({
    subtipo: "educativo",
    tema: "",
    slides: 6,
    contexto: "",
    tono: [],
  });
  const [video, setVideo] = useState<VideoFormState>({
    estilo: "manifiesto",
    tema: "",
    duracion: "30s",
    contexto: "",
    useTrends: false,
  });
  const [post, setPost] = useState<PostFormState>({
    subtipo: "producto",
    producto: "",
    contexto: "",
    tono: [],
  });
  const [variantCount, setVariantCount] = useState<1 | 2 | 3>(1);
  const [kb, setKb] = useState<KnowledgeBase>(emptyKb);
  const [mainTab, setMainTab] = useState<"results" | "kb" | "history">(
    "results",
  );
  const [generating, setGenerating] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [resultVariants, setResultVariants] = useState<string[]>([]);
  const [resultFormat, setResultFormat] = useState<GenerationFormat | null>(
    null,
  );
  const [viewIdx, setViewIdx] = useState(0);

  useEffect(() => {
    setViewIdx(0);
  }, [resultVariants]);

  async function signOut() {
    const supabase = createBrowserSupabaseClient();
    await supabase.auth.signOut();
    router.replace("/login");
    router.refresh();
  }

  async function handleGenerate() {
    setError(null);
    setGenerating(true);
    try {
      let body: Record<string, unknown>;
      if (format === "carousel") {
        body = {
          format: "carousel",
          subtype: carousel.subtipo,
          tema: carousel.tema,
          contexto: carousel.contexto,
          tono: carousel.tono,
          variants: variantCount,
          slides: carousel.slides,
          knowledgeBase: kb,
        };
      } else if (format === "video") {
        body = {
          format: "video",
          subtype: video.estilo,
          tema: video.tema,
          contexto: video.contexto,
          tono: [],
          variants: variantCount,
          duracion: video.duracion,
          useTrends: video.estilo === "tendencia" ? video.useTrends : false,
          knowledgeBase: kb,
        };
      } else {
        body = {
          format: "post",
          subtype: post.subtipo,
          tema: post.producto,
          contexto: post.contexto,
          tono: post.tono,
          variants: variantCount,
          knowledgeBase: kb,
        };
      }

      const res = await fetch("/api/generate", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(body),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error ?? "Error al generar");
      setResultVariants(data.variants ?? []);
      setResultFormat(data.format ?? format);
      setMainTab("results");
    } catch (e) {
      setError(e instanceof Error ? e.message : "Error");
    } finally {
      setGenerating(false);
    }
  }

  const rawView =
    resultVariants[Math.min(viewIdx, Math.max(0, resultVariants.length - 1))] ??
    "";

  return (
    <div className="flex min-h-screen bg-white">
      <Sidebar
        format={format}
        onFormatChange={setFormat}
        carousel={carousel}
        onCarouselChange={setCarousel}
        video={video}
        onVideoChange={setVideo}
        post={post}
        onPostChange={setPost}
        variants={variantCount}
        onVariantsChange={setVariantCount}
        onGenerate={handleGenerate}
        generating={generating}
        knowledgeBase={kb}
        footer={
          <button
            type="button"
            onClick={signOut}
            className="mt-4 w-full rounded-xl border border-neutral-900 py-2.5 text-sm font-medium text-neutral-900 transition hover:bg-neutral-900 hover:text-white"
          >
            Salir
          </button>
        }
      />

      <main className="flex min-h-screen flex-1 flex-col bg-neutral-50/50">
        <div className="flex flex-wrap gap-2 border-b border-neutral-200/90 bg-white px-8 py-5">
          {(
            [
              ["results", "Resultados"],
              ["kb", "Base de conocimiento"],
              ["history", "Historial"],
            ] as const
          ).map(([id, label]) => (
            <button
              key={id}
              type="button"
              onClick={() => setMainTab(id)}
              className={`rounded-full px-4 py-2 text-sm font-semibold transition ${
                mainTab === id
                  ? "bg-neutral-900 text-white shadow-sm"
                  : "text-neutral-500 hover:bg-neutral-100 hover:text-neutral-900"
              }`}
            >
              {label}
            </button>
          ))}
        </div>

        <div className="flex-1 overflow-y-auto px-10 py-14 sm:px-14 sm:py-16">
          {mainTab === "results" ? (
            <div className="mx-auto max-w-3xl">
              {error ? (
                <p className="mb-6 text-sm text-red-600">{error}</p>
              ) : null}
              {resultVariants.length > 1 ? (
                <div className="mb-8 flex flex-wrap gap-2">
                  {resultVariants.map((_, i) => (
                    <button
                      key={i}
                      type="button"
                      onClick={() => setViewIdx(i)}
                      className={`rounded-full border px-5 py-2 text-sm font-semibold transition ${
                        viewIdx === i
                          ? "border-neutral-900 bg-neutral-100 text-neutral-900"
                          : "border-neutral-200 text-neutral-500 hover:border-neutral-300"
                      }`}
                    >
                      Variante {i + 1}
                    </button>
                  ))}
                </div>
              ) : null}

              {!rawView ? (
                <p className="text-sm leading-relaxed text-neutral-400">
                  Elegí formato, completá el brief y pulsá Generar.
                </p>
              ) : resultFormat === "carousel" ? (
                <CarouselOutput raw={rawView} knowledgeBase={kb} />
              ) : resultFormat === "video" ? (
                <VideoOutput raw={rawView} knowledgeBase={kb} />
              ) : (
                <PostOutput raw={rawView} knowledgeBase={kb} />
              )}
            </div>
          ) : null}

          <div
            className={
              mainTab === "kb"
                ? "mx-auto max-w-3xl"
                : "hidden"
            }
          >
            <KnowledgeBasePanel onKbChange={setKb} />
          </div>

          {mainTab === "history" ? (
            <div className="mx-auto max-w-3xl">
              <HistoryPanel />
            </div>
          ) : null}
        </div>
      </main>
    </div>
  );
}

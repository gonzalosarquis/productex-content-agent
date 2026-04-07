"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { createBrowserSupabaseClient } from "@/lib/supabase";
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
  brand_dna: "",
  audience: "",
  voice: "",
  products: "",
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
    <div className="flex min-h-screen bg-[#0a0a0a]">
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
        footer={
          <button
            type="button"
            onClick={signOut}
            className="mt-4 w-full border border-[#2a2a2a] py-2 text-sm text-[#f5f2ec]/60 hover:text-[#f5f2ec]"
          >
            Salir
          </button>
        }
      />

      <main className="flex min-h-screen flex-1 flex-col">
        <div className="flex border-b border-[#2a2a2a]">
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
              className={`border-b-2 px-8 py-4 text-sm uppercase tracking-wider transition ${
                mainTab === id
                  ? "border-[#c8ff00] text-[#f5f2ec]"
                  : "border-transparent text-[#f5f2ec]/45 hover:text-[#f5f2ec]/70"
              }`}
            >
              {label}
            </button>
          ))}
        </div>

        <div className="flex-1 overflow-y-auto p-10">
          {mainTab === "results" ? (
            <div className="mx-auto max-w-3xl">
              {error ? (
                <p className="mb-6 text-sm text-red-400">{error}</p>
              ) : null}
              {resultVariants.length > 1 ? (
                <div className="mb-8 flex gap-2">
                  {resultVariants.map((_, i) => (
                    <button
                      key={i}
                      type="button"
                      onClick={() => setViewIdx(i)}
                      className={`border px-6 py-2 text-lg ${
                        viewIdx === i
                          ? "border-[#c8ff00] text-[#c8ff00]"
                          : "border-[#2a2a2a] text-[#f5f2ec]/50"
                      }`}
                      style={{ fontFamily: "var(--font-bebas), sans-serif" }}
                    >
                      Variante {i + 1}
                    </button>
                  ))}
                </div>
              ) : null}

              {!rawView ? (
                <p className="text-[#f5f2ec]/45">
                  Elegí formato, completá el brief y pulsá Generar.
                </p>
              ) : resultFormat === "carousel" ? (
                <CarouselOutput raw={rawView} />
              ) : resultFormat === "video" ? (
                <VideoOutput raw={rawView} />
              ) : (
                <PostOutput raw={rawView} />
              )}
            </div>
          ) : null}

          {mainTab === "kb" ? (
            <div className="mx-auto max-w-3xl">
              <KnowledgeBasePanel onKbChange={setKb} />
            </div>
          ) : null}

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

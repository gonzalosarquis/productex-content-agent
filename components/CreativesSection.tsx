"use client";

import { useCallback, useMemo, useState } from "react";
import {
  ASPECT_RATIOS,
  CREATIVE_MODELS,
  DEFAULT_CREATIVE_MODEL,
  IMAGE_SIZES,
  type AspectRatioId,
  type CreativeModelId,
  type ImageSizeId,
} from "@/lib/creativeModels";
import { humanizeGeminiError } from "@/lib/geminiApiError";
import { splitCarouselIdeation } from "@/lib/ideationBadges";
import { parseCarouselOutput } from "@/lib/parseCarousel";
import type { KnowledgeBase } from "@/lib/types";

type Props = {
  format: "carousel" | "post" | "video";
  raw: string;
  knowledgeBase: KnowledgeBase;
};

type BatchResultItem = {
  slideIndex: number;
  mimeType?: string;
  data?: string;
  error?: string;
};

function dataUrl(mime: string, b64: string) {
  return `data:${mime};base64,${b64}`;
}

export function CreativesSection({ format, raw, knowledgeBase }: Props) {
  const [model, setModel] = useState<CreativeModelId>(DEFAULT_CREATIVE_MODEL);
  const [aspectRatio, setAspectRatio] = useState<AspectRatioId>("3:4");
  const [imageSize, setImageSize] = useState<ImageSizeId>("1K");
  const [busy, setBusy] = useState(false);
  const [busySlide, setBusySlide] = useState<number | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [carouselImages, setCarouselImages] = useState<Record<number, string>>(
    {},
  );
  const [postImage, setPostImage] = useState<string | null>(null);
  const [videoImage, setVideoImage] = useState<string | null>(null);

  const carouselSlides = useMemo(() => {
    if (format !== "carousel") return [];
    const { body } = splitCarouselIdeation(raw);
    return parseCarouselOutput(body).slides;
  }, [format, raw]);

  const disabled = !raw.trim() || busy;

  const payloadBase = useMemo(
    () => ({
      knowledgeBase,
      model,
      aspectRatio,
      imageSize,
      raw,
    }),
    [knowledgeBase, model, aspectRatio, imageSize, raw],
  );

  const runCarouselOne = useCallback(
    async (slideIndex: number) => {
      setError(null);
      setBusy(true);
      setBusySlide(slideIndex);
      try {
        const res = await fetch("/api/generate-creatives", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            ...payloadBase,
            format: "carousel",
            batch: false,
            slideIndex,
          }),
        });
        const data = await res.json();
        if (!res.ok) {
          throw new Error(
            humanizeGeminiError(String(data.error ?? "Error al generar")),
          );
        }
        setCarouselImages((prev) => ({
          ...prev,
          [slideIndex]: dataUrl(data.mimeType, data.data),
        }));
      } catch (e) {
        setError(
          humanizeGeminiError(
            e instanceof Error ? e.message : "Error",
          ),
        );
      } finally {
        setBusy(false);
        setBusySlide(null);
      }
    },
    [payloadBase],
  );

  const runCarouselBatch = useCallback(async () => {
    setError(null);
    setBusy(true);
    try {
      const res = await fetch("/api/generate-creatives", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          ...payloadBase,
          format: "carousel",
          batch: true,
        }),
      });
      const data = await res.json();
      if (!res.ok) {
        throw new Error(
          humanizeGeminiError(String(data.error ?? "Error al generar")),
        );
      }
      const next: Record<number, string> = {};
      for (const item of data.results as BatchResultItem[]) {
        if (item.data && item.mimeType) {
          next[item.slideIndex] = dataUrl(item.mimeType, item.data);
        }
      }
      setCarouselImages((prev) => ({ ...prev, ...next }));
      const errs = (data.results as BatchResultItem[]).filter((x) => x.error);
      if (errs.length > 0) {
        const first = humanizeGeminiError(errs[0]?.error ?? "Error desconocido");
        const rest = errs
          .slice(0, 3)
          .map(
            (e) =>
              `Slide ${e.slideIndex + 1}: ${humanizeGeminiError(e.error ?? "")}`,
          )
          .join(" · ");
        setError(
          errs.length === 1
            ? `Slide ${errs[0]!.slideIndex + 1}: ${first}`
            : `${errs.length} slides fallaron. ${rest}${errs.length > 3 ? "…" : ""}`,
        );
      }
    } catch (e) {
      setError(
        humanizeGeminiError(e instanceof Error ? e.message : "Error"),
      );
    } finally {
      setBusy(false);
    }
  }, [payloadBase]);

  const runPost = useCallback(async () => {
    setError(null);
    setBusy(true);
    try {
      const res = await fetch("/api/generate-creatives", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ ...payloadBase, format: "post" }),
      });
      const data = await res.json();
      if (!res.ok) {
        throw new Error(
          humanizeGeminiError(String(data.error ?? "Error al generar")),
        );
      }
      setPostImage(dataUrl(data.mimeType, data.data));
    } catch (e) {
      setError(
        humanizeGeminiError(e instanceof Error ? e.message : "Error"),
      );
    } finally {
      setBusy(false);
    }
  }, [payloadBase]);

  const runVideo = useCallback(async () => {
    setError(null);
    setBusy(true);
    try {
      const res = await fetch("/api/generate-creatives", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ ...payloadBase, format: "video" }),
      });
      const data = await res.json();
      if (!res.ok) {
        throw new Error(
          humanizeGeminiError(String(data.error ?? "Error al generar")),
        );
      }
      setVideoImage(dataUrl(data.mimeType, data.data));
    } catch (e) {
      setError(
        humanizeGeminiError(e instanceof Error ? e.message : "Error"),
      );
    } finally {
      setBusy(false);
    }
  }, [payloadBase]);

  return (
    <div className="rounded-2xl border border-neutral-200/90 bg-neutral-50/80 p-6 shadow-sm">
      <div className="mb-4">
        <h3 className="text-sm font-bold text-neutral-900">
          Creativos (Gemini / Nano Banana)
        </h3>
          <p className="text-xs text-neutral-500">
          Imágenes usando tu base de conocimiento. Configurá{" "}
          <code className="rounded bg-white px-1 py-0.5 text-[11px]">
            GEMINI_API_KEY
          </code>{" "}
          (Google AI Studio) en el servidor.           En la API, el modelo con más cuota gratis suele ser{" "}
          <strong>gemini-2.5-flash-image</strong> (elige «Gratis / base» arriba).
          Podés fijarlo en el servidor con{" "}
          <code className="rounded bg-white px-1 py-0.5 text-[11px]">
            GEMINI_IMAGE_MODEL=gemini-2.5-flash-image
          </code>{" "}
          para ignorar otros modelos. Los *preview* a veces tienen cuota 0 en
          free tier (error 429).
        </p>
      </div>

      <div className="mb-4 grid gap-3 sm:grid-cols-3">
        <label className="block text-xs font-semibold text-neutral-700">
          Modelo
          <select
            value={model}
            onChange={(e) => setModel(e.target.value as CreativeModelId)}
            className="mt-1.5 w-full rounded-lg border border-neutral-200 bg-white px-3 py-2 text-sm"
            disabled={busy}
          >
            {CREATIVE_MODELS.map((m) => (
              <option key={m.id} value={m.id}>
                {m.label}
              </option>
            ))}
          </select>
        </label>
        <label className="block text-xs font-semibold text-neutral-700">
          Relación de aspecto
          <select
            value={aspectRatio}
            onChange={(e) =>
              setAspectRatio(e.target.value as AspectRatioId)
            }
            className="mt-1.5 w-full rounded-lg border border-neutral-200 bg-white px-3 py-2 text-sm"
            disabled={busy}
          >
            {ASPECT_RATIOS.map((a) => (
              <option key={a.id} value={a.id}>
                {a.label}
              </option>
            ))}
          </select>
        </label>
        <label className="block text-xs font-semibold text-neutral-700">
          Resolución
          <select
            value={imageSize}
            onChange={(e) => setImageSize(e.target.value as ImageSizeId)}
            className="mt-1.5 w-full rounded-lg border border-neutral-200 bg-white px-3 py-2 text-sm"
            disabled={busy}
          >
            {IMAGE_SIZES.map((s) => (
              <option key={s} value={s}>
                {s}
              </option>
            ))}
          </select>
        </label>
      </div>

      {error ? (
        <p className="mb-3 max-w-full whitespace-pre-wrap break-words text-sm leading-relaxed text-red-600">
          {error}
        </p>
      ) : null}

      {format === "carousel" && carouselSlides.length === 0 ? (
        <p className="mb-4 text-sm text-neutral-500">
          No se detectaron slides en el texto. Generá de nuevo o revisá el
          formato del output.
        </p>
      ) : null}

      {format === "carousel" && carouselSlides.length > 0 ? (
        <>
          <div className="mb-4 flex flex-wrap gap-2">
            <button
              type="button"
              onClick={runCarouselBatch}
              disabled={disabled}
              className="rounded-lg bg-neutral-900 px-4 py-2.5 text-sm font-semibold text-white shadow-sm transition hover:bg-neutral-800 disabled:opacity-50"
            >
              {busy && busySlide === null
                ? "Generando todas las slides…"
                : "Generar todas las slides"}
            </button>
          </div>
          <ul className="mb-6 space-y-2">
            {carouselSlides.map((s, idx) => (
              <li
                key={`${s.index}-${idx}`}
                className="flex flex-col gap-2 rounded-xl border border-neutral-200/90 bg-white px-4 py-3 sm:flex-row sm:items-center sm:justify-between"
              >
                <div className="min-w-0">
                  <p className="text-xs font-bold text-neutral-500">
                    Slide {idx + 1}
                  </p>
                  <p className="truncate text-sm font-semibold text-neutral-900">
                    {s.label}
                  </p>
                </div>
                <button
                  type="button"
                  onClick={() => runCarouselOne(idx)}
                  disabled={disabled}
                  className="shrink-0 rounded-lg border border-neutral-900 px-3 py-2 text-xs font-semibold text-neutral-900 transition hover:bg-neutral-900 hover:text-white disabled:opacity-50"
                >
                  {busy && busySlide === idx ? "Generando…" : "Solo esta slide"}
                </button>
              </li>
            ))}
          </ul>
        </>
      ) : null}

      {format === "post" ? (
        <div className="flex flex-wrap gap-2">
          <button
            type="button"
            onClick={runPost}
            disabled={disabled}
            className="rounded-lg bg-neutral-900 px-4 py-2.5 text-sm font-semibold text-white shadow-sm transition hover:bg-neutral-800 disabled:opacity-50"
          >
            {busy ? "Generando…" : "Generar imagen del post"}
          </button>
        </div>
      ) : null}

      {format === "video" ? (
        <div className="flex flex-wrap gap-2">
          <button
            type="button"
            onClick={runVideo}
            disabled={disabled}
            className="rounded-lg bg-neutral-900 px-4 py-2.5 text-sm font-semibold text-white shadow-sm transition hover:bg-neutral-800 disabled:opacity-50"
          >
            {busy ? "Generando…" : "Generar portada / key visual"}
          </button>
        </div>
      ) : null}

      {format === "carousel" && Object.keys(carouselImages).length > 0 ? (
        <div className="mt-6 space-y-4 border-t border-neutral-200/90 pt-6">
          <p className="text-xs font-semibold uppercase tracking-wide text-neutral-500">
            Galería
          </p>
          <div className="grid gap-4 sm:grid-cols-2">
            {Object.entries(carouselImages)
              .sort(([a], [b]) => Number(a) - Number(b))
              .map(([idx, src]) => (
                <figure
                  key={idx}
                  className="overflow-hidden rounded-xl border border-neutral-200/90 bg-white shadow-sm"
                >
                  {/* eslint-disable-next-line @next/next/no-img-element */}
                  <img
                    src={src}
                    alt={`Slide ${Number(idx) + 1}`}
                    className="h-auto w-full object-cover"
                  />
                  <figcaption className="flex items-center justify-between gap-2 border-t border-neutral-100 px-3 py-2 text-xs text-neutral-600">
                    <span className="font-semibold">
                      Slide {Number(idx) + 1}
                    </span>
                    <a
                      href={src}
                      download={`productex-slide-${Number(idx) + 1}.png`}
                      className="font-semibold text-neutral-900 underline-offset-2 hover:underline"
                    >
                      Descargar
                    </a>
                  </figcaption>
                </figure>
              ))}
          </div>
        </div>
      ) : null}

      {format === "post" && postImage ? (
        <CreativePreview src={postImage} filename="productex-post.png" />
      ) : null}
      {format === "video" && videoImage ? (
        <CreativePreview src={videoImage} filename="productex-video-cover.png" />
      ) : null}
    </div>
  );
}

function CreativePreview({
  src,
  filename,
}: {
  src: string;
  filename: string;
}) {
  return (
    <div className="mt-6 space-y-2 border-t border-neutral-200/90 pt-6">
      <p className="text-xs font-semibold uppercase tracking-wide text-neutral-500">
        Resultado
      </p>
      <figure className="overflow-hidden rounded-xl border border-neutral-200/90 bg-white shadow-sm">
        {/* eslint-disable-next-line @next/next/no-img-element */}
        <img src={src} alt="Creativo generado" className="w-full object-cover" />
        <figcaption className="border-t border-neutral-100 px-3 py-2 text-right">
          <a
            href={src}
            download={filename}
            className="text-xs font-semibold text-neutral-900 underline-offset-2 hover:underline"
          >
            Descargar
          </a>
        </figcaption>
      </figure>
    </div>
  );
}

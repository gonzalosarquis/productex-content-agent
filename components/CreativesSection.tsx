"use client";

import { useCallback, useMemo, useState } from "react";
import {
  ASPECT_RATIOS,
  CREATIVE_MODELS,
  DEFAULT_CREATIVE_MODEL,
  IMAGE_SIZE_LABELS,
  IMAGE_SIZES,
  type AspectRatioId,
  type CreativeModelId,
  type ImageSizeId,
} from "@/lib/creativeModels";
import { MAX_DESIGN_PASS_CHARS } from "@/lib/designPass";
import {
  MAX_DECODED_BYTES_PER_IMAGE,
  MAX_REFERENCE_IMAGES,
} from "@/lib/referenceImages";
import { humanizeGeminiError } from "@/lib/geminiApiError";
import { splitCarouselIdeation } from "@/lib/ideationBadges";
import { parseCarouselOutput } from "@/lib/parseCarousel";
import type { KnowledgeBase } from "@/lib/types";

/** En build de producción el servidor fija 1K salvo bypass (ver .env.example). */
const IMAGE_SIZE_LOCKED =
  process.env.NODE_ENV === "production" &&
  process.env.NEXT_PUBLIC_GEMINI_ALLOW_IMAGE_SIZE_OPTIONS !== "true";

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

type RefPayload = { mimeType: string; data: string };

function readFileAsRefPayload(file: File): Promise<RefPayload> {
  return new Promise((resolve, reject) => {
    const r = new FileReader();
    r.onload = () => {
      const res = String(r.result ?? "");
      const m = /^data:([^;]+);base64,(.+)$/.exec(res.trim());
      if (!m) {
        reject(new Error("No se pudo leer la imagen"));
        return;
      }
      const mime = m[1]!.trim().toLowerCase();
      const data = m[2]!.replace(/\s/g, "");
      const pad = data.endsWith("==") ? 2 : data.endsWith("=") ? 1 : 0;
      const bytes = Math.floor((data.length * 3) / 4) - pad;
      if (bytes > MAX_DECODED_BYTES_PER_IMAGE) {
        reject(
          new Error(
            `Imagen demasiado grande (máx. ~${Math.round(MAX_DECODED_BYTES_PER_IMAGE / 1024)} KB)`,
          ),
        );
        return;
      }
      if (!["image/png", "image/jpeg", "image/webp"].includes(mime)) {
        reject(new Error("Usá PNG, JPEG o WebP"));
        return;
      }
      resolve({ mimeType: mime === "image/jpg" ? "image/jpeg" : mime, data });
    };
    r.onerror = () => reject(r.error ?? new Error("Lectura fallida"));
    r.readAsDataURL(file);
  });
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
  const [referenceImages, setReferenceImages] = useState<RefPayload[]>([]);
  const [refError, setRefError] = useState<string | null>(null);
  const [designPass, setDesignPass] = useState("");

  const carouselSlides = useMemo(() => {
    if (format !== "carousel") return [];
    const { body } = splitCarouselIdeation(raw);
    return parseCarouselOutput(body).slides;
  }, [format, raw]);

  const disabled = !raw.trim() || busy;

  const effectiveImageSize: ImageSizeId = IMAGE_SIZE_LOCKED
    ? "1K"
    : imageSize;

  const payloadBase = useMemo(
    () => ({
      knowledgeBase,
      model,
      aspectRatio,
      imageSize: effectiveImageSize,
      raw,
      ...(referenceImages.length > 0
        ? { referenceImages }
        : {}),
      ...(designPass.trim()
        ? {
            designPass: designPass.trim().slice(0, MAX_DESIGN_PASS_CHARS),
          }
        : {}),
    }),
    [
      knowledgeBase,
      model,
      aspectRatio,
      effectiveImageSize,
      raw,
      referenceImages,
      designPass,
    ],
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
          Creativos (Gemini)
        </h3>
        <p className="text-xs text-neutral-500">
          Preset recomendado:{" "}
          <strong className="text-neutral-700">2.5 Flash Image + 1K</strong>{" "}
          (mejor coste/calidad para feed). En producción la resolución queda en{" "}
          <strong>1K</strong> salvo variables de entorno de bypass.           La <strong>base fija de estética</strong> va en Base de conocimiento →
          «Dirección visual para creativos». Acá podés sumar un{" "}
          <strong>pase extra</strong> puntual y/o hasta{" "}
          {MAX_REFERENCE_IMAGES} imágenes de referencia. Configurá{" "}
          <code className="rounded bg-white px-1 py-0.5 text-[11px]">
            GEMINI_API_KEY
          </code>{" "}
          en el servidor. Opcional:{" "}
          <code className="rounded bg-white px-1 py-0.5 text-[11px]">
            GEMINI_IMAGE_MODEL
          </code>{" "}
          y{" "}
          <code className="rounded bg-white px-1 py-0.5 text-[11px]">
            GEMINI_IMAGE_SIZE
          </code>{" "}
          para forzar modelo y resolución en deploy.
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
            value={effectiveImageSize}
            onChange={(e) => setImageSize(e.target.value as ImageSizeId)}
            className="mt-1.5 w-full rounded-lg border border-neutral-200 bg-white px-3 py-2 text-sm disabled:cursor-not-allowed disabled:opacity-70"
            disabled={busy || IMAGE_SIZE_LOCKED}
          >
            {IMAGE_SIZES.map((s) => (
              <option key={s} value={s}>
                {IMAGE_SIZE_LABELS[s]}
              </option>
            ))}
          </select>
          {IMAGE_SIZE_LOCKED ? (
            <span className="mt-1 block text-[11px] font-normal text-neutral-500">
              Fijo en 1K en producción. En local (<code className="rounded bg-white px-0.5">npm run dev</code>)
              podés elegir 2K/4K. Bypass:{" "}
              <code className="rounded bg-white px-0.5">GEMINI_ALLOW_IMAGE_SIZE_OPTIONS</code>{" "}
              +{" "}
              <code className="rounded bg-white px-0.5">
                NEXT_PUBLIC_GEMINI_ALLOW_IMAGE_SIZE_OPTIONS
              </code>
              .
            </span>
          ) : null}
        </label>
      </div>

      <div className="mb-4">
        <label className="block text-xs font-semibold text-neutral-700">
          Pase de diseño (opcional, texto)
          <textarea
            value={designPass}
            onChange={(e) =>
              setDesignPass(e.target.value.slice(0, MAX_DESIGN_PASS_CHARS))
            }
            rows={4}
            placeholder="Ej.: paleta #0A0A0A / #FAFAFA, sans geométrica, mucho aire, fotografía natural soft light, sin stock obvio… O pegá acá un brief que te arme otra persona / asistente."
            className="mt-1.5 w-full resize-y rounded-lg border border-neutral-200 bg-white px-3 py-2 text-sm text-neutral-800 placeholder:text-neutral-400"
            disabled={busy}
          />
        </label>
        <p className="mt-1 text-[11px] text-neutral-500">
          {designPass.length}/{MAX_DESIGN_PASS_CHARS} — Complementa o reemplaza referencias
          visuales si solo tenés una descripción. Podés combinar ambos.
        </p>
      </div>

      <div className="mb-4 rounded-xl border border-dashed border-neutral-300 bg-white/60 px-4 py-3">
        <label className="block text-xs font-semibold text-neutral-700">
          Referencias visuales (opcional)
          <input
            type="file"
            accept="image/png,image/jpeg,image/webp"
            multiple
            className="mt-1.5 block w-full text-xs text-neutral-600 file:mr-3 file:rounded-lg file:border-0 file:bg-neutral-900 file:px-3 file:py-1.5 file:text-xs file:font-semibold file:text-white"
            disabled={busy}
            onChange={async (e) => {
              setRefError(null);
              const files = Array.from(e.target.files ?? []);
              e.target.value = "";
              if (files.length === 0) return;
              if (
                referenceImages.length + files.length >
                MAX_REFERENCE_IMAGES
              ) {
                setRefError(
                  `Máximo ${MAX_REFERENCE_IMAGES} referencias (ya tenés ${referenceImages.length}).`,
                );
                return;
              }
              const next: RefPayload[] = [];
              try {
                for (const f of files) {
                  next.push(await readFileAsRefPayload(f));
                }
                setReferenceImages((prev) => [...prev, ...next]);
              } catch (err) {
                setRefError(
                  err instanceof Error ? err.message : "No se pudo cargar la imagen",
                );
              }
            }}
          />
        </label>
        {refError ? (
          <p className="mt-2 text-xs text-red-600">{refError}</p>
        ) : (
          <p className="mt-2 text-xs text-neutral-500">
            PNG/JPEG/WebP, ~{Math.round(MAX_DECODED_BYTES_PER_IMAGE / 1024)} KB
            c/u. El modelo usa estas piezas como guía de estilo (no copia logos ni
            marcas).
          </p>
        )}
        {referenceImages.length > 0 ? (
          <ul className="mt-3 flex flex-wrap gap-2">
            {referenceImages.map((r, i) => (
              <li
                key={`${r.data.slice(0, 12)}-${i}`}
                className="relative h-16 w-16 overflow-hidden rounded-lg border border-neutral-200 bg-neutral-100"
              >
                {/* eslint-disable-next-line @next/next/no-img-element */}
                <img
                  src={dataUrl(r.mimeType, r.data)}
                  alt=""
                  className="h-full w-full object-cover"
                />
                <button
                  type="button"
                  className="absolute right-0.5 top-0.5 rounded bg-neutral-900/80 px-1 text-[10px] font-bold text-white"
                  onClick={() =>
                    setReferenceImages((prev) => prev.filter((_, j) => j !== i))
                  }
                  disabled={busy}
                >
                  ×
                </button>
              </li>
            ))}
          </ul>
        ) : null}
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

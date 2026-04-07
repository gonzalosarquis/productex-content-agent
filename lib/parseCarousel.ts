export interface CarouselSlide {
  index: number;
  label: string;
  kind: "portada" | "contenido" | "cierre";
  body: string;
}

export interface ParsedCarousel {
  slides: CarouselSlide[];
  caption: string;
  hashtags: string;
}

function inferKind(
  label: string,
  paren: string | undefined,
): CarouselSlide["kind"] {
  const p = (paren ?? "").toLowerCase();
  const l = label.toLowerCase();
  if (p.includes("portada") || l.includes("portada")) return "portada";
  if (p.includes("cierre") || l.includes("cierre")) return "cierre";
  return "contenido";
}

export function parseCarouselOutput(raw: string): ParsedCarousel {
  const parts = raw.split(/\n---\s*\n/);
  const slideSection = parts[0] ?? raw;
  const metaBlock = parts.slice(1).join("\n");

  const captionMatch =
    metaBlock.match(/CAPTION:\s*([\s\S]*?)(?=HASHTAGS:|$)/i) ??
    raw.match(/CAPTION:\s*([\s\S]*?)(?=HASHTAGS:|$)/i);
  const hashtagsMatch =
    metaBlock.match(/HASHTAGS:\s*([\s\S]*?)$/im) ??
    raw.match(/HASHTAGS:\s*([\s\S]*?)$/im);

  const chunks = slideSection.split(/(?=SLIDE\s+\d+)/i).filter((c) => c.trim());

  const slides: CarouselSlide[] = [];
  for (const chunk of chunks) {
    const trimmed = chunk.trim();
    const lines = trimmed.split("\n");
    const first = lines[0] ?? "";
    const m = first.match(
      /SLIDE\s+(\d+)\s*[—\-]\s*([^\n(]+)(?:\(([^)]*)\))?/i,
    );
    if (!m) continue;
    const idx = parseInt(m[1], 10);
    const label = m[2].trim();
    const paren = m[3]?.trim();
    const body = lines.slice(1).join("\n").trim();
    slides.push({
      index: idx,
      label,
      kind: inferKind(label, paren),
      body,
    });
  }

  if (slides.length === 0) {
    slides.push({
      index: 1,
      label: "Contenido",
      kind: "contenido",
      body: slideSection.trim(),
    });
  }

  return {
    slides,
    caption: captionMatch?.[1]?.trim() ?? "",
    hashtags: hashtagsMatch?.[1]?.trim().replace(/\n/g, " ") ?? "",
  };
}

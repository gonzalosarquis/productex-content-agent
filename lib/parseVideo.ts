export interface VideoSegment {
  header: string;
  lines: { label: string; text: string }[];
}

export interface ParsedVideo {
  segments: VideoSegment[];
  musica: string;
  caption: string;
  hashtags: string;
  rawFooter: string;
}

const headerRe =
  /^(HOOK\s+VISUAL|CIERRE|CORTE\s+\d+[^\n]*|\[[^\]]+\]\s*[^\n]*)/i;

export function parseVideoOutput(raw: string): ParsedVideo {
  const parts = raw.split(/\n---\s*\n/);
  const main = parts[0] ?? raw;
  const footer = parts.slice(1).join("\n---\n");

  const musicaMatch = footer.match(/MÚSICA SUGERIDA:\s*([\s\S]*?)(?=CAPTION:|$)/i);
  const captionMatch = footer.match(/CAPTION:\s*([\s\S]*?)(?=HASHTAGS:|$)/i);
  const hashtagsMatch = footer.match(/HASHTAGS:\s*([\s\S]*?)$/im);

  const lines = main.split(/\r?\n/);
  const segments: VideoSegment[] = [];
  let current: VideoSegment | null = null;

  function flush() {
    if (current && (current.lines.length > 0 || current.header)) {
      segments.push(current);
    }
    current = null;
  }

  for (const line of lines) {
    const t = line.trim();
    if (!t) continue;
    if (headerRe.test(t)) {
      flush();
      current = { header: t, lines: [] };
      continue;
    }
    if (!current) {
      current = { header: "Bloque", lines: [] };
    }
    const kv = t.match(/^([^:]+):\s*(.+)$/);
    if (kv && kv[1].length < 40) {
      current.lines.push({ label: kv[1].trim(), text: kv[2].trim() });
    } else {
      current.lines.push({ label: "", text: t });
    }
  }
  flush();

  if (segments.length === 0) {
    segments.push({ header: "Script", lines: [{ label: "", text: main.trim() }] });
  }

  return {
    segments,
    musica: musicaMatch?.[1]?.trim() ?? "",
    caption: captionMatch?.[1]?.trim() ?? "",
    hashtags: hashtagsMatch?.[1]?.trim().replace(/\n/g, " ") ?? "",
    rawFooter: footer,
  };
}

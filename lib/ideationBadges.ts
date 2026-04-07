export type IdeationBadges = {
  territorio?: string;
  perfil?: string;
  tension?: string;
  hook?: string;
};

export function extractIdeationBadges(ideationBlock: string): IdeationBadges {
  const territorio = ideationBlock
    .match(/\[TERRITORIO:\s*([^\]]+)\]/i)?.[1]
    ?.trim();
  const perfil = ideationBlock.match(/\[PERFIL:\s*([^\]]+)\]/i)?.[1]?.trim();
  const tension = ideationBlock
    .match(/\[TENSIÓN:\s*([^\]]+)\]/i)?.[1]
    ?.trim();
  const hook =
    ideationBlock.match(/\[HOOK VISUAL:\s*([^\]]+)\]/i)?.[1]?.trim() ??
    ideationBlock.match(/\[ESTRUCTURA DE HOOK:\s*([^\]]+)\]/i)?.[1]?.trim() ??
    ideationBlock.match(/\[HOOK:\s*([^\]]+)\]/i)?.[1]?.trim();

  return { territorio, perfil, tension, hook };
}

export function splitCarouselIdeation(raw: string): {
  ideation: string;
  body: string;
} {
  const idx = raw.search(/\nSLIDE\s+0?1\s+[—\-–]\s*/i);
  if (idx === -1) {
    const atStart = raw.search(/^SLIDE\s+0?1\s+[—\-–]\s*/im);
    if (atStart === -1) return { ideation: "", body: raw };
    return { ideation: "", body: raw.trim() };
  }
  return {
    ideation: raw.slice(0, idx).trim(),
    body: raw.slice(idx + 1).trim(),
  };
}

export function splitVideoIdeation(raw: string): {
  ideation: string;
  body: string;
} {
  const idx = raw.search(/\n\[\s*0\s*s\s*[-–]\s*3\s*s\s*\]\s*HOOK/i);
  if (idx !== -1) {
    return {
      ideation: raw.slice(0, idx).trim(),
      body: raw.slice(idx + 1).trim(),
    };
  }
  const idx2 = raw.search(/\n\[\s*\d+\s*s\s*[-–]\s*\d+\s*s\s*\]/i);
  if (idx2 === -1) return { ideation: "", body: raw };
  return {
    ideation: raw.slice(0, idx2).trim(),
    body: raw.slice(idx2 + 1).trim(),
  };
}

export function splitPostIdeation(raw: string): {
  ideation: string;
  body: string;
} {
  const idx = raw.search(/\nHOOK:\s*\n/i);
  if (idx === -1) {
    const atStart = raw.search(/^HOOK:\s*\n/im);
    if (atStart === -1) return { ideation: "", body: raw };
    return { ideation: "", body: raw.trim() };
  }
  return {
    ideation: raw.slice(0, idx).trim(),
    body: raw.slice(idx + 1).trim(),
  };
}

export interface ParsedPost {
  hook: string;
  cuerpo: string;
  cta: string;
  hashtags: string;
}

export function parsePostOutput(raw: string): ParsedPost {
  const hook = raw.match(/HOOK:\s*([\s\S]*?)(?=CUERPO:|$)/i)?.[1]?.trim() ?? "";
  const cuerpo =
    raw.match(/CUERPO:\s*([\s\S]*?)(?=CTA:|HASHTAGS:|$)/i)?.[1]?.trim() ?? "";
  const cta = raw.match(/CTA:\s*([\s\S]*?)(?=HASHTAGS:|$)/i)?.[1]?.trim() ?? "";
  const hashtags =
    raw.match(/HASHTAGS:\s*([\s\S]*?)$/im)?.[1]?.trim().replace(/\n/g, " ") ?? "";

  return { hook, cuerpo, cta, hashtags };
}

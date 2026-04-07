/** Referencia escrita (moodboard / brief) cuando no hay imágenes o para complementarlas. */
export const MAX_DESIGN_PASS_CHARS = 4_000;

export function parseDesignPass(raw: unknown): string {
  if (raw == null || typeof raw !== "string") return "";
  return raw.trim().slice(0, MAX_DESIGN_PASS_CHARS);
}

export function designPassBlock(text: string): string {
  if (!text) return "";
  return `

PASE DE DISEÑO (referencia escrita — respetá paleta, tipografía, iluminación, textura y mood descritos; integralo con el mensaje del slide/post):
${text}`;
}

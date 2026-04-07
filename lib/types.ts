export interface KnowledgeBase {
  /**
   * Base fija para creativos (Gemini): dirección de arte, paleta, tipografía, etc.
   * Podés pegar texto largo o JSON; se inyecta en cada generación de imagen.
   */
  visual_direction: string;
  brand_dna: string;
  audience: string;
  voice: string;
  products: string;
  examples: string;
  refs: string;
}

export type GenerationFormat = "carousel" | "video" | "post";

export interface GenerationRow {
  id: string;
  user_id: string;
  format: GenerationFormat;
  subtype: string;
  producto: string;
  contexto: string;
  tono: string[];
  output: Record<string, unknown>;
  created_at: string;
}

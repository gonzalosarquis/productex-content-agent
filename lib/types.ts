export interface KnowledgeBase {
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

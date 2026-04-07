import type { KnowledgeBase } from "./types";

export async function fetchSuggest(params: {
  format: "carousel" | "video" | "post";
  subtype: string;
  suggest: "tema" | "contexto";
  currentTema?: string;
  knowledgeBase: KnowledgeBase;
}): Promise<string> {
  const res = await fetch("/api/suggest", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(params),
  });
  const data = (await res.json()) as { suggestion?: string; error?: string };
  if (!res.ok) throw new Error(data.error ?? "Error al sugerir");
  return data.suggestion ?? "";
}

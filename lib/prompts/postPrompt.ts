export function buildPostPrompt(params: {
  subtipo: string;
  producto: string;
  contexto: string;
  tono: string[];
  variants: number;
}): string {
  const { subtipo, producto, contexto, tono, variants } = params;
  return `Generá una publicación única (caption) para Instagram para Productex.

Subtipo: ${subtipo}
Producto o tema: ${producto}
Contexto adicional: ${contexto || "(ninguno)"}
Tono: ${tono.join(", ")}

Estructura obligatoria:
HOOK: [primera línea]
CUERPO: [desarrollo en minúsculas, sin bullets]
CTA: [una sola acción]
HASHTAGS: [máximo 5]

${variants > 1 ? `Generá ${variants} variantes distintas. Separá cada variante con una línea que diga exactamente:\n===VARIANTE===` : ""}`;
}

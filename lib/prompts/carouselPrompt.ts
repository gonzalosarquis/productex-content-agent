export function buildCarouselPrompt(params: {
  subtipo: string;
  tema: string;
  slides: number;
  contexto: string;
  tono: string[];
  variants: number;
}): string {
  const { subtipo, tema, slides, contexto, tono, variants } = params;
  return `Generá un carrusel de Instagram para Productex.

Subtipo: ${subtipo}
Tema o producto: ${tema}
Cantidad de slides: ${slides}
Contexto adicional: ${contexto || "(ninguno)"}
Tono (combiná estos registros): ${tono.join(", ")}

Estructura obligatoria, slide por slide:
- SLIDE 01 — PORTADA (hook/título)
- SLIDE 02 al ${String(slides - 1).padStart(2, "0")} — contenido según el subtipo
- SLIDE ${String(slides).padStart(2, "0")} — CIERRE (remate + CTA)

Para cada slide indicá el tipo entre paréntesis al final de la línea del slide: (portada) | (contenido) | (cierre)

Al final:
---
CAPTION: [caption completo para el post, sin bullets]
HASHTAGS: [máximo 5, separados por espacio]

${variants > 1 ? `Generá ${variants} variantes distintas del mismo brief. Separá cada variante con una línea que diga exactamente:\n===VARIANTE===` : ""}`;
}

export function buildVideoPrompt(params: {
  estilo: string;
  tema: string;
  duracion: string;
  contexto: string;
  useTrends: boolean;
  variants: number;
}): string {
  const { estilo, tema, duracion, contexto, useTrends, variants } = params;

  const estiloHints: Record<string, string> = {
    manifiesto:
      "texto bold sobre imagen oscura, verdad incómoda, sin narración de voz si no hace falta",
    bts: "mostrar proceso real, paso a paso, texto superpuesto, cercano",
    educativo:
      "dato técnico del rubro, cortes cada 3-4s, texto aparece y desaparece",
    tendencia:
      "hook de actualidad (Argentina o mundo) conectado con producción de ropa y tu marca",
  };

  return `Generá un script de video/reel para Instagram para Productex.

Estilo: ${estilo}
Guía de estilo: ${estiloHints[estilo] ?? estiloHints.tendencia}
Tema o producto: ${tema}
Duración total objetivo: ${duracion}
Contexto adicional: ${contexto || "(ninguno)"}
${useTrends ? "IMPORTANTE: usá información actual de tendencias (Argentina y/o mundo) y conectala con la producción de indumentaria." : ""}

Estructura del output (con timestamps que sumen la duración elegida):
HOOK VISUAL [0-3s]: texto en pantalla + qué se ve
CORTE 1 [X-Ys]: texto + qué se ve
... (seguí con cortes hasta cubrir la duración)
CIERRE [últimos segundos]: CTA + texto en pantalla + acción

Al final:
---
MÚSICA SUGERIDA: [elegí un estilo alineado a Tyler The Creator, The Weeknd, Jean Tonique o Lithe — describí el vibe]
CAPTION: [caption para el post]
HASHTAGS: [máximo 5]

${variants > 1 ? `Generá ${variants} variantes distintas. Separá cada variante con una línea que diga exactamente:\n===VARIANTE===` : ""}`;
}

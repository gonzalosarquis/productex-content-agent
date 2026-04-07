import type { KnowledgeBase } from "@/lib/types";
import type { CarouselSlide } from "@/lib/parseCarousel";

function kbBlock(kb: KnowledgeBase): string {
  const chunks: string[] = [];
  if (kb.brand_dna?.trim()) chunks.push(`ADN de marca: ${kb.brand_dna.trim()}`);
  if (kb.audience?.trim()) chunks.push(`Audiencia: ${kb.audience.trim()}`);
  if (kb.voice?.trim()) chunks.push(`Voz y personalidad: ${kb.voice.trim()}`);
  if (kb.products?.trim()) chunks.push(`Productos / oferta: ${kb.products.trim()}`);
  if (kb.refs?.trim()) chunks.push(`Referencias visuales: ${kb.refs.trim()}`);
  if (kb.examples?.trim()) {
    chunks.push(`Ejemplos de copy aprobados (tono, no copiar literal): ${kb.examples.trim().slice(0, 1200)}`);
  }
  return chunks.length ? chunks.join("\n") : "Sin datos extra de marca: inferí un estilo premium, limpio y coherente con el contenido.";
}

export function buildCarouselSlidePrompt(
  kb: KnowledgeBase,
  slide: CarouselSlide,
  slideIndex: number,
  totalSlides: number,
  aspectLabel: string,
): string {
  const kind =
    slide.kind === "portada"
      ? "PORTADA — impacto y claridad del tema"
      : slide.kind === "cierre"
        ? "CIERRE — llamado a la acción o síntesis"
        : "CONTENIDO — educar o profundizar";

  return `Sos director de arte para Instagram. Generá UNA imagen fija para un carrusel (slide ${slideIndex + 1} de ${totalSlides}).

${kbBlock(kb)}

ROL DEL SLIDE: ${kind}
Título / idea del slide: ${slide.label}
Copy / mensaje (usá la idea, no pegues texto ilegible denso): ${slide.body.slice(0, 2500)}

FORMATO DE SALIDA VISUAL:
- Relación de aspecto pedida: ${aspectLabel}
- Estilo: coherente con la marca arriba; iluminación y paleta profesionales
- Composición mobile-first, jerarquía clara
- Si incluís tipografía, que sea breve, legible y alineada al mensaje (español)
- Sin marcas de agua inventadas, sin logos de terceros falsos
- Calidad editorial / anuncio premium`;
}

export function buildPostCreativePrompt(
  kb: KnowledgeBase,
  hook: string,
  cuerpo: string,
  aspectLabel: string,
): string {
  return `Sos director de arte para Instagram. Generá UNA imagen para una publicación única (feed).

${kbBlock(kb)}

HOOK (idea hero): ${hook.slice(0, 1200)}
CUERPO (contexto visual): ${cuerpo.slice(0, 2000)}

FORMATO:
- ${aspectLabel}
- Una sola pieza potente que represente el mensaje principal
- Estética alineada a la marca; legible en móvil
- Tipografía opcional, corta y clara si aplica
- Sin marcas de agua ni logos inventados`;
}

export function buildVideoCreativePrompt(
  kb: KnowledgeBase,
  scriptExcerpt: string,
  caption: string,
  musica: string,
  aspectLabel: string,
): string {
  return `Sos director de arte para video vertical (Reel). Generá UNA imagen de portada / key visual para el reel.

${kbBlock(kb)}

RESUMEN DEL GUIÓN (ideas visuales): ${scriptExcerpt.slice(0, 3500)}
CAPTION (tono): ${caption.slice(0, 800)}
MÚSICA SUGERIDA (ambiente): ${musica.slice(0, 400)}

FORMATO:
- ${aspectLabel} — pensá en thumbnail que funcione en grilla de Reels
- Contraste fuerte, sujeto o mensaje claro
- Coherencia con la marca; sin texto ilegible pequeño
- Sin marcas de agua ni logos inventados`;
}

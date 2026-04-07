export function buildCarouselPrompt(params: {
  subtype: string;
  tema: string;
  slides: number;
  contexto: string;
  tono: string[];
  variants: number;
  trendsContext?: string;
}): string {
  const { subtype, tema, slides, contexto, tono, variants, trendsContext } =
    params;

  return `
FORMATO: Carrusel de Instagram
SUBTIPO: ${subtype}
TEMA: ${tema}
SLIDES SOLICITADOS: ${slides}
TONO: ${tono.join(", ")}
${contexto ? `CONTEXTO: ${contexto}` : ""}
${trendsContext ? `TENDENCIAS ACTUALES:\n${trendsContext}\n` : ""}

━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
PROCESO DE IDEACIÓN — HACÉ ESTO ANTES DE ESCRIBIR
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

PASO 1 — ELEGÍ EL TERRITORIO
Elegí el territorio temático más relevante para este
tema y subtipo. Declaralo al inicio del output así:
[TERRITORIO: T3 — Detrás del producto]

PASO 2 — IDENTIFICÁ EL PERFIL
¿A cuál de los 3 perfiles de audiencia le habla 
este carrusel? Declaralo así:
[PERFIL: B — La marca que ya produce pero está frustrada]

PASO 3 — DEFINÍ LA TENSIÓN CENTRAL
¿Qué cree la audiencia que es falso o incompleto?
¿Qué verdad va a cambiarles la perspectiva?
Declarala así:
[TENSIÓN: Creen que la calidad depende del diseño → 
La realidad es que se construye desde la tela y 
la costura]

PASO 4 — ELEGÍ LA ESTRUCTURA DEL HOOK
¿Cuál de las 6 estructuras de hook funciona mejor 
para esta tensión? Declarala así:
[HOOK: Estructura B — Creencia falsa + negación]

PASO 5 — MAPEÁ LOS SLIDES
Antes de escribirlos, definí qué resuelve cada slide:
Slide 01: portada/hook — para el scroll
Slide 02-0X: desarrollo — cada uno UN solo punto
Slide 0X: el giro o dato inesperado
Slide final: cierre + CTA

RECIÉN DESPUÉS DE COMPLETAR LOS 5 PASOS, 
ESCRIBÍ EL CARRUSEL.

━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
REGLAS ESPECÍFICAS POR SUBTIPO
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

SI SUBTIPO = EDUCATIVO:
- Cada slide = un concepto técnico con su "por qué importa"
- Slide 01: pregunta o dato que genera curiosidad técnica
- Slides intermedios: un término técnico por slide, 
  explicado en lenguaje claro con consecuencia real
- Slide final: síntesis + "si querés aplicar esto, 
  escribinos al DM"
- Usar datos reales del negocio donde apliquen

SI SUBTIPO = MANIFIESTO:
- Frases de máximo 8 palabras por línea
- Slide 01: la verdad incómoda más directa posible
- Slides 02-04: desarrollo de por qué el sistema falla
- Slide 05: el giro — "pero hay otra forma"
- Slide final: Productex como solución, sin sonar 
  a publicidad, sonando a verdad
- Cero adjetivos vacíos. Solo hechos y consecuencias.

SI SUBTIPO = FAQ:
- Pregunta en mayúscula, respuesta con datos reales
- Máximo 2-3 preguntas por slide si son cortas,
  o 1 pregunta por slide si la respuesta es larga
- Siempre datos concretos: números, procesos, opciones
- Slide final: "¿tenés más dudas? escribinos al DM"

SI SUBTIPO = PROCESO/BTS:
- Narrado en pasos numerados: paso 1, paso 2...
- Cada paso describe qué pasa en ese momento del proceso
- Incluir detalles que el cliente nunca vería solo:
  qué se revisa en la muestra, cómo se elige la tela,
  qué pasa cuando hay una corrección
- Slide final: "así se ve tu próxima colección. 
  agendá tu reunión."

━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
FORMATO DE OUTPUT — SEGUIR EXACTAMENTE
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

[TERRITORIO: ...]
[PERFIL: ...]
[TENSIÓN: ...]
[HOOK: ...]

SLIDE 01 — PORTADA
[título principal — el hook]
[subtítulo si aplica]

SLIDE 02 — CONTENIDO
[texto del slide]

[repetir hasta slide ${slides}]

SLIDE ${slides} — CIERRE
[texto de cierre]
[CTA]

---
CAPTION:
[caption completo para el post — hook + desarrollo 
en 3-4 oraciones + CTA + hashtags]

HASHTAGS: [máximo 5, específicos del rubro]

${variants > 1 ? `Generá ${variants} variantes completas del carrusel.
Cada variante debe tener un territorio, perfil y 
tensión DIFERENTE. Separar con ===VARIANTE===` : ""}
`;
}

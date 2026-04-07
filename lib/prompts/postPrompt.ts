export function buildPostPrompt(params: {
  subtype: string;
  tema: string;
  contexto: string;
  tono: string[];
  variants: number;
  trendsContext?: string;
}): string {
  const { subtype, tema, contexto, tono, variants, trendsContext } = params;

  return `
FORMATO: Publicación única de Instagram
SUBTIPO: ${subtype}
TEMA: ${tema}
TONO: ${tono.join(", ")}
${contexto ? `CONTEXTO: ${contexto}` : ""}
${trendsContext ? `TENDENCIAS ACTUALES:\n${trendsContext}\n` : ""}

━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
PROCESO DE IDEACIÓN
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

Antes de escribir, declarar:
[TERRITORIO: ...]
[PERFIL: ...]
[TENSIÓN: ...]
[ESTRUCTURA DE HOOK: A/B/C/D/E/F]

━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
REGLAS POR SUBTIPO
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

SI SUBTIPO = PRODUCTO:
- Mostrar el producto/servicio desde el problema 
  que resuelve, no desde sus características
- Incluir datos concretos: mínimos, tiempos, proceso
- Nunca sonar a publicidad — sonar a recomendación 
  de alguien que sabe del rubro

SI SUBTIPO = MANIFIESTO:
- Una sola idea central, bien desarrollada
- Sin listas. Párrafo corrido con frases cortas.
- La tensión debe estar en la primera línea
- Terminar con una afirmación, no con una pregunta

SI SUBTIPO = BEHIND THE SCENES:
- Describir un momento real del proceso de Productex
- Detalles específicos que el cliente no imaginaría
- Tono: cercano, como contándole a un amigo del rubro
- Puede terminar con una pregunta al lector

SI SUBTIPO = FAQ:
- Una sola pregunta frecuente bien respondida
- Pregunta en la primera línea (mayúscula o no)
- Respuesta directa con datos reales
- Expandir con contexto útil
- CTA al DM o a agendar reunión

━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
FORMATO DE OUTPUT
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

[TERRITORIO: ...]
[PERFIL: ...]
[TENSIÓN: ...]
[ESTRUCTURA DE HOOK: ...]

HOOK:
[primera línea — lo más importante]

CUERPO:
[desarrollo en 3-5 oraciones]

CTA:
[llamado a la acción único y directo]

HASHTAGS: [máximo 5]

${variants > 1 ? `Generá ${variants} variantes con territorios y 
tensiones diferentes. Separar con ===VARIANTE===` : ""}
`;
}

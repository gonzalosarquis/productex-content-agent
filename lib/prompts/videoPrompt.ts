export function buildVideoPrompt(params: {
  style: string;
  tema: string;
  duracion: string;
  contexto: string;
  variants: number;
  trendsContext?: string;
}): string {
  const { style, tema, duracion, contexto, variants, trendsContext } =
    params;

  const durSegundos =
    duracion === "15s" ? 15 : duracion === "30s" ? 30 : 60;

  return `
FORMATO: Script de Video/Reel
ESTILO: ${style}
(mapeo: manifiesto → MANIFIESTO; bts → BEHIND THE SCENES; educativo → EDUCATIVO; tendencia → TENDENCIA/HOOK VIRAL)
TEMA: ${tema}
DURACIÓN: ${duracion} (${durSegundos} segundos)
${contexto ? `CONTEXTO: ${contexto}` : ""}
${trendsContext ? `TENDENCIAS ACTUALES:\n${trendsContext}\n` : ""}

━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
PROCESO DE IDEACIÓN
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

Antes de escribir el script, declarar:
[TERRITORIO: ...]
[PERFIL: ...]
[TENSIÓN: ...]
[HOOK VISUAL: descripción de qué se ve en pantalla 
en los primeros 2 segundos]

━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
REGLAS POR ESTILO
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

SI ESTILO = MANIFIESTO:
- Texto grande sobre imagen/video oscuro
- Sin narración en voz — solo texto en pantalla
- Frases que aparecen y desaparecen, una por vez
- Ritmo rápido: una frase cada 1.5-2 segundos
- La música hace el trabajo emocional
- Música: Tyler The Creator, The Weeknd (oscuro, lento)
- No mostrar producto — mostrar imágenes de contexto:
  fábrica, telas, personas trabajando, ciudad

SI ESTILO = BEHIND THE SCENES:
- Cámara en mano, real, sin producción perfecta
- Mostrar el proceso: fábrica, máquinas, telas, muestras
- Texto superpuesto describe lo que se ve
- Voz off opcional — cercana, sin guión rígido
- Música: Jean Tonique, Lithe (ambiente, no protagonista)
- Terminar con el producto terminado en manos del cliente

SI ESTILO = EDUCATIVO:
- Cortes rápidos cada 3-4 segundos
- Texto aparece con cada corte: el dato técnico
- Puede ser talking head o b-roll con texto
- Música: instrumental suave, no distrae
- Estructura: problema → explicación → solución/dato
- Cada corte = un dato o concepto, no más

SI ESTILO = TENDENCIA/HOOK VIRAL:
- Formato que esté funcionando en el momento
  (usar trendsContext para definir el formato exacto)
- Conectar una tendencia cultural/moda con el mundo 
  de la producción de Productex
- Hook en los primeros 1.5 segundos: texto o acción
- Música: lo que esté trending en ese momento
- Si no hay trendsContext relevante, usar manifiesto
  como fallback

━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
FORMATO DE OUTPUT
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

[TERRITORIO: ...]
[PERFIL: ...]  
[TENSIÓN: ...]
[HOOK VISUAL: ...]

[0s - 3s] HOOK
TEXTO EN PANTALLA: "..."
QUÉ SE VE: [descripción visual específica]
DIRECCIÓN: [instrucción para quien filma/edita]

[3s - Xs] DESARROLLO
TEXTO: "..."
QUÉ SE VE: ...
CORTE A: ...

[continuar hasta ${durSegundos}s]

[${durSegundos - 5}s - ${durSegundos}s] CIERRE
TEXTO: "..."
CTA: "..."
QUÉ SE VE: ...

---
MÚSICA SUGERIDA: [artista/estilo específico]
CAPTION: [caption completo]
HASHTAGS: [máximo 5]
NOTA DE EDICIÓN: [1-2 tips específicos para editar 
este video que marquen la diferencia]

${variants > 1 ? `Generá ${variants} variantes con ángulos diferentes.
Separar con ===VARIANTE===` : ""}
`;
}

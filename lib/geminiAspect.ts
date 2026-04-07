/**
 * ImageConfig de la API Gemini no lista 4:5 en todos los modelos/regiones.
 * Mapeamos a 3:4 (vertical feed) y reforzamos el pedido en el prompt de texto.
 */
export function toGeminiImageAspectRatio(aspectRatio: string): string {
  const stable = new Set([
    "1:1",
    "2:3",
    "3:2",
    "3:4",
    "4:3",
    "9:16",
    "16:9",
    "21:9",
  ]);
  if (stable.has(aspectRatio)) return aspectRatio;
  if (aspectRatio === "4:5" || aspectRatio === "5:4") return "3:4";
  return "3:4";
}

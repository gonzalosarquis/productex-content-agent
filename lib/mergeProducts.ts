export const PRODUCTS_SNIPPET =
  "Mínimo de producción: 100 prendas por color y modelo (se puede variar talle dentro del mismo modelo/color). Tiempos de producción: 30 a 45 días hábiles.";

export function mergeProductsField(products: string): string {
  if (products.includes("100 prendas por color y modelo")) {
    return products;
  }
  const t = products.trim();
  return t ? `${t}\n\n${PRODUCTS_SNIPPET}` : PRODUCTS_SNIPPET;
}

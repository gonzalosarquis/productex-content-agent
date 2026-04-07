import { fetchTrendsWithWebSearch } from "./anthropic";
import { getCurrentMonthYear } from "./getCurrentMonthYear";

export function buildTrendQueries(tema: string): string[] {
  const my = getCurrentMonthYear();
  return [
    `tendencias moda Argentina ${my}`,
    `industria textil Argentina noticias recientes`,
    `streetwear marcas Argentina 2026`,
    `${tema} moda tendencia`,
  ];
}

export async function fetchTrendsContext(tema: string): Promise<string> {
  const trendQueries = buildTrendQueries(tema);
  return fetchTrendsWithWebSearch({ tema, trendQueries });
}

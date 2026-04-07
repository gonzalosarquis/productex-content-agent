import Anthropic from "@anthropic-ai/sdk";

let client: Anthropic | null = null;

export function getAnthropic(): Anthropic {
  if (!process.env.ANTHROPIC_API_KEY) {
    throw new Error("ANTHROPIC_API_KEY no configurada");
  }
  if (!client) {
    client = new Anthropic({ apiKey: process.env.ANTHROPIC_API_KEY });
  }
  return client;
}

function extractTextFromContent(
  content: Anthropic.ContentBlock[],
): string {
  return content
    .filter((b): b is Anthropic.TextBlock => b.type === "text")
    .map((b) => b.text)
    .join("\n\n");
}

export async function generateWithClaude(params: {
  system: string;
  user: string;
  useTrends?: boolean;
}): Promise<string> {
  const anthropic = getAnthropic();
  const tools: Anthropic.ToolUnion[] | undefined = params.useTrends
    ? [
        {
          type: "web_search_20250305",
          name: "web_search",
          max_uses: 5,
          user_location: {
            type: "approximate",
            country: "AR",
          },
        },
      ]
    : undefined;

  const response = await anthropic.messages.create({
    model: "claude-sonnet-4-20250514",
    max_tokens: 2000,
    system: params.system,
    messages: [{ role: "user", content: params.user }],
    tools,
  });

  return extractTextFromContent(response.content);
}

export async function fetchTrendsWithWebSearch(params: {
  tema: string;
  trendQueries: string[];
}): Promise<string> {
  const anthropic = getAnthropic();
  const user = `Usá la herramienta de búsqueda web para consultar estas temáticas y devolvé un resumen en español (4 a 8 párrafos) con hallazgos útiles para guionar un reel de Instagram sobre fabricación de indumentaria en Argentina. No inventes datos; basate en lo que encuentres en fuentes.

Consultas:
${params.trendQueries.map((q, i) => `${i + 1}. ${q}`).join("\n")}

Tema del contenido del usuario: ${params.tema}`;

  const response = await anthropic.messages.create({
    model: "claude-sonnet-4-20250514",
    max_tokens: 2000,
    system:
      "Sos investigador de tendencias. Usá web search para informarte y respondé solo con el resumen basado en fuentes encontradas.",
    messages: [{ role: "user", content: user }],
    tools: [
      {
        type: "web_search_20250305",
        name: "web_search",
        max_uses: 8,
        user_location: {
          type: "approximate",
          country: "AR",
        },
      },
    ],
  });

  return extractTextFromContent(response.content).trim();
}

export async function generateSuggestion(params: {
  system: string;
  user: string;
}): Promise<string> {
  const anthropic = getAnthropic();
  const response = await anthropic.messages.create({
    model: "claude-sonnet-4-20250514",
    max_tokens: 200,
    system: params.system,
    messages: [{ role: "user", content: params.user }],
  });
  return extractTextFromContent(response.content).trim();
}

export function splitVariants(raw: string): string[] {
  const parts = raw.split(/===VARIANTE===/g).map((s) => s.trim());
  return parts.length ? parts : [raw.trim()];
}

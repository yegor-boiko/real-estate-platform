
import OpenAI from "openai";
import { aiSearchResultSchema } from "./aiSearchSchema.js";
import type { AiSearchResult } from "./aiSearchSchema.js";
import type { LlmProvider } from "./llmProvider.js";

export class GeminiProvider implements LlmProvider {
  private client: OpenAI;
  private model: string;

  constructor(apiKey: string, model: string) {
    this.client = new OpenAI({
      apiKey,
      baseURL: "https://generativelanguage.googleapis.com/v1beta/openai/",
    });

    this.model = model;
  }

  async interpretSearch(query: string): Promise<AiSearchResult> {
    const response = await this.client.chat.completions.create({
      model: this.model,
      response_format: { type: "json_object" },
      messages: [
        {
          role: "system",
          content: `
You interpret natural-language apartment searches into structured filters.

Return ONLY a JSON object with:
{
  "filters": {
    "city": "optional city",
    "minPrice": 0,
    "maxPrice": 0,
    "minArea": 0,
    "maxArea": 0,
    "sortBy": "default | price_asc | price_desc"
  },
  "explanation": "Short explanation of the interpreted search"
}

Rules:
- Include only filters supported by the user's request.
- Omit unknown or unspecified fields.
- All numeric values must be positive.
- If a user says "around 40 m²", interpret it approximately as 35–45 m².
- If an area is described as approximate, use a ±5 m² range.
- If the user requests exactly 40 m², use minArea=40 and maxArea=40.
- Interpret "cheap" as sortBy="price_asc", not as an invented price ceiling.
- Do not assume property condition or quality from words such as "nice".
- Do not invent apartments or unsupported property attributes.
- Output valid JSON only.
          `.trim(),
        },
        {
          role: "user",
          content: query,
        },
      ],
    });

    const content = response.choices[0]?.message.content;

    if (!content) {
      throw new Error("Gemini returned an empty response");
    }

    const parsed: unknown = JSON.parse(content);

    return aiSearchResultSchema.parse(parsed);
  }
}

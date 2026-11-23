
import type { AiSearchResult } from "./aiSearchSchema.js";
import type { LlmProvider } from "./llmProvider.js";
import { DeepSeekProvider } from "./deepSeekProvider.js";
import { GeminiProvider } from "./geminiProvider.js";

// Try providers sequentially so one provider's failure does not stop AI search.
export class AiSearchService {
  constructor(private providers: LlmProvider[]) {}

  async interpretSearch(query: string): Promise<AiSearchResult> {
    for (const provider of this.providers) {
      try {
        return await provider.interpretSearch(query);
      } catch (error) {
        console.warn("AI provider failed:", error);
      }
    }

    throw new Error("All AI providers failed");
  }
}

export function createAiSearchService(): AiSearchService {
  const providers: LlmProvider[] = [];

  if (process.env.DEEPSEEK_API_KEY) {
    providers.push(
      new DeepSeekProvider(
        process.env.DEEPSEEK_API_KEY,
        process.env.DEEPSEEK_MODEL ?? "deepseek-flash",
      ),
    );
  }

  if (process.env.GEMINI_API_KEY) {
    providers.push(
      new GeminiProvider(
        process.env.GEMINI_API_KEY,
        process.env.GEMINI_MODEL ?? "gemini-3.1-flash-lite-preview",
      ),
    );
  }

  return new AiSearchService(providers);
}

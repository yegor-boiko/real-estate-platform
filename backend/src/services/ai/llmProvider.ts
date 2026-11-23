import type { AiSearchResult } from "../../schemas/aiSearchSchema.js";

// Common interface so AI providers can be replaced without changing search logic.
export interface LlmProvider {
  interpretSearch(query: string): Promise<AiSearchResult>;
}

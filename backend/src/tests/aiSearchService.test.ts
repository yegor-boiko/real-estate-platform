import assert from "node:assert/strict";
import test from "node:test";
import { AiSearchService } from "../services/ai/aiSearchService.js";
import type { LlmProvider } from "../services/ai/llmProvider.js";
import type { AiSearchResult } from "../schemas/aiSearchSchema.js";

const expectedResult: AiSearchResult = {
  filters: {
    city: "Kraków",
    minArea: 35,
    maxArea: 45,
    sortBy: "price_asc",
  },
  explanation: "Affordable apartments around 40 m².",
};

test("uses the primary provider when it succeeds", async () => {
  let fallbackCalled = false;

  const primary: LlmProvider = {
    interpretSearch: async () => expectedResult,
  };

  const fallback: LlmProvider = {
    interpretSearch: async () => {
      fallbackCalled = true;
      return expectedResult;
    },
  };

  const service = new AiSearchService([primary, fallback]);
  const result = await service.interpretSearch("Cheap flat in Kraków");

  assert.deepEqual(result, expectedResult);
  assert.equal(fallbackCalled, false);
});

test("uses the fallback when the primary provider fails", async () => {
  const primary: LlmProvider = {
    interpretSearch: async () => {
      throw new Error("Primary provider unavailable");
    },
  };

  const fallback: LlmProvider = {
    interpretSearch: async () => expectedResult,
  };

  const service = new AiSearchService([primary, fallback]);
  const result = await service.interpretSearch("Cheap flat in Kraków");

  assert.deepEqual(result, expectedResult);
});

test("fails when all providers fail", async () => {
  const failingProvider: LlmProvider = {
    interpretSearch: async () => {
      throw new Error("Provider unavailable");
    },
  };

  const service = new AiSearchService([
    failingProvider,
    failingProvider,
  ]);

  await assert.rejects(
    service.interpretSearch("Cheap flat in Kraków"),
    /All AI providers failed/,
  );
});

test("fails when no providers are configured", async () => {
  const service = new AiSearchService([]);

  await assert.rejects(
    service.interpretSearch("Cheap flat in Kraków"),
    /All AI providers failed/,
  );
});

import assert from "node:assert/strict";
import test from "node:test";
import { aiSearchResultSchema } from "../schemas/aiSearchSchema.js";

test("accepts valid AI search filters", () => {
  const result = aiSearchResultSchema.safeParse({
    filters: {
      city: "Kraków",
      minArea: 35,
      maxArea: 45,
      sortBy: "price_asc",
    },
    explanation: "Affordable apartments around 40 m².",
  });

  assert.equal(result.success, true);
});

test("rejects negative apartment area", () => {
  const result = aiSearchResultSchema.safeParse({
    filters: { minArea: -10 },
    explanation: "Invalid area.",
  });

  assert.equal(result.success, false);
});

test("rejects reversed area ranges", () => {
  const result = aiSearchResultSchema.safeParse({
    filters: { minArea: 80, maxArea: 40 },
    explanation: "Invalid range.",
  });

  assert.equal(result.success, false);
});

test("rejects reversed price ranges", () => {
  const result = aiSearchResultSchema.safeParse({
    filters: { minPrice: 800000, maxPrice: 300000 },
    explanation: "Invalid price range.",
  });

  assert.equal(result.success, false);
});

test("rejects unsupported sorting", () => {
  const result = aiSearchResultSchema.safeParse({
    filters: { sortBy: "random" },
    explanation: "Invalid sorting.",
  });

  assert.equal(result.success, false);
});

test("rejects missing explanations", () => {
  const result = aiSearchResultSchema.safeParse({
    filters: { city: "Kraków" },
  });

  assert.equal(result.success, false);
});

test("accepts searches without optional filters", () => {
  const result = aiSearchResultSchema.safeParse({
    filters: {},
    explanation: "No specific search filters were provided.",
  });

  assert.equal(result.success, true);
});

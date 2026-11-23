import { Router } from "express";
import { z } from "zod";
import { createAiSearchService } from "../services/ai/aiSearchService.js";

const router = Router();

// Validate untrusted user input before sending it to an AI provider.
const aiSearchRequestSchema = z.object({
  query: z.string().trim().min(3).max(500),
});

router.post("/search", async (req, res) => {
  const parsed = aiSearchRequestSchema.safeParse(req.body);

  if (!parsed.success) {
    res.status(400).json({ error: "Invalid search query" });
    return;
  }

  try {
    const service = createAiSearchService();
    const result = await service.interpretSearch(parsed.data.query);

    // Return interpreted filters only; listing retrieval stays in the regular API.
    res.json(result);
  } catch (error) {
    console.error("AI search failed:", error);
    res.status(503).json({ error: "AI search is temporarily unavailable" });
  }
});

export default router;

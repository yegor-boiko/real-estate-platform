import { z } from "zod";

// Validate untrusted LLM output before using it as search filters.
export const aiSearchResultSchema = z.object({
  filters: z
    .object({
      city: z.string().trim().min(1).optional(),

      minPrice: z.number().positive().finite().optional(),
      maxPrice: z.number().positive().finite().optional(),

      minArea: z.number().positive().finite().optional(),
      maxArea: z.number().positive().finite().optional(),

      sortBy: z.enum(["default", "price_asc", "price_desc"]).optional(),
    })
    .refine(
      (filters) =>
        filters.minPrice === undefined ||
        filters.maxPrice === undefined ||
        filters.minPrice <= filters.maxPrice,
      { message: "Invalid price range" },
    )
    .refine(
      (filters) =>
        filters.minArea === undefined ||
        filters.maxArea === undefined ||
        filters.minArea <= filters.maxArea,
      { message: "Invalid area range" },
    ),

  explanation: z.string().trim().min(1),
});

export type AiSearchResult = z.infer<typeof aiSearchResultSchema>;

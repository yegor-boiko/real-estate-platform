import { z } from "zod";

// Convert non-empty query string values into positive numbers.
const positiveNumber = z
  .string()
  .trim()
  .min(1)
  .transform(Number)
  .pipe(z.number().positive().finite());

// Validate untrusted HTTP query parameters before querying the database.
// Also reject invalid price and area ranges.
export const listingSearchSchema = z
  .object({
    page: z.coerce.number().int().positive().safe().default(1),
    limit: z.coerce.number().int().min(1).max(100).default(10),

    city: z.string().trim().optional(),

    minPrice: positiveNumber.optional(),
    maxPrice: positiveNumber.optional(),
    minArea: positiveNumber.optional(),
    maxArea: positiveNumber.optional(),

    sortBy: z.enum(["default", "price_asc", "price_desc"]).optional(),
  })
  .refine(
    (data) =>
      data.minPrice === undefined ||
      data.maxPrice === undefined ||
      data.minPrice <= data.maxPrice,
    { message: "Invalid price range" },
  )
  .refine(
    (data) =>
      data.minArea === undefined ||
      data.maxArea === undefined ||
      data.minArea <= data.maxArea,
    { message: "Invalid area range" },
  );

// Derive repository filter types from the schema to avoid duplicate definitions.
export type ListingFilters = Omit<
  z.infer<typeof listingSearchSchema>,
  "page" | "limit"
>;
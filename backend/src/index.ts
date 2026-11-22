import express from "express";
import { getListings } from "./repositories/listingRepository.js";
import { listingSearchSchema } from "./schemas/listingSearchSchema.js";

const app = express();

app.use(express.json());

app.get("/api/listings", async (req, res) => {
  // Keep request validation at the HTTP boundary, separate from database logic.
  const parsed = listingSearchSchema.safeParse(req.query);

  if (!parsed.success) {
    res.status(400).json({ error: "Invalid search parameters" });
    return;
  }

  const { page, limit, ...filters } = parsed.data;

  try {
    const { listings, totalFilteredRows, totalRows } = await getListings(
      page,
      limit,
      filters,
    );

    // Return both matching and overall counts for frontend pagination and context.
    res.json({
      data: listings,
      pagination: {
        page,
        limit,
        totalRows,
        totalFilteredRows,
        totalPages: Math.ceil(totalFilteredRows / limit),
      },
    });
  } catch (error) {
    console.error("Failed to fetch listings:", error);
    res.status(500).json({ error: "Failed to fetch listings" });
  }
});

app.listen(3000);

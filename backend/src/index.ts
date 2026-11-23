import express from "express";
import { getListings, getListingById } from "./repositories/listingRepository.js";
import { listingSearchSchema } from "./schemas/listingSearchSchema.js";
import aiSearchRoutes from "./routes/aiSearchRoutes.js";

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
    const { listings, totalFilteredRows, totalRows } = await getListings(page, limit, filters);

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

app.get("/api/listings/:id", async (req, res) => {
  const id = Number(req.params.id);

  // Validate the URL parameter before passing it to MySQL.
  if (!Number.isSafeInteger(id) || id <= 0) {
    res.status(400).json({ error: "Invalid listing ID" });
    return;
  }

  try {
    const listing = await getListingById(id);

    if (!listing) {
      res.status(404).json({ error: "Listing not found" });
      return;
    }

    res.json({ data: listing });
  } catch (error) {
    console.error("Failed to fetch listing:", error);
    res.status(500).json({ error: "Failed to fetch listing" });
  }
});

app.use("/api/ai", aiSearchRoutes);

app.listen(3000);

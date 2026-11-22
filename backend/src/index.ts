import express from "express";
import { getListings } from "./repositories/listingRepository.js";

const app = express();

app.use(express.json());

app.get("/api/listings", async (req, res) => {
  const page = Number(req.query.page ?? 1);
  const limit = Number(req.query.limit ?? 10);

  if (!Number.isSafeInteger(page) || page < 1) {
    res.status(400).json({ error: "Invalid page" });
    return;
  }

  if (!Number.isSafeInteger(limit) || limit < 1 || limit > 100) {
    res.status(400).json({ error: "Invalid limit" });
    return;
  }

  try {
    const { listings, totalRows } = await getListings(page, limit);

    // Return pagination metadata so clients can navigate between pages.
    res.json({
      data: listings,
      pagination: {
        page,
        limit,
        totalRows,
        totalPages: Math.ceil(totalRows / limit),
      },
    });
  } catch (error) {
    console.error("Failed to fetch listings:", error);
    res.status(500).json({ error: "Failed to fetch listings" });
  }
});

app.listen(3000);

import pool from "../db/connection.js";
import {
  downloadListings,
  readListings,
} from "../services/importer/listingImporter.js";
import { saveListings } from "../repositories/listingRepository.js";

// CLI entry point: downloads, normalizes, validates, and saves the dataset.
// Always closes the database pool, even if the import fails.
async function main(): Promise<void> {
  try {
    const file = await downloadListings();
    const listings = await readListings(file);

    await saveListings(listings);
  } finally {
    await pool.end();
  }
}

main().catch((error) => {
  console.error("Import failed:", error);
  process.exitCode = 1;
});

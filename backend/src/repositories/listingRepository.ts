import pool from "../db/connection.js";
import type { Listing } from "../types/listing.js";
import type { ListingFilters } from "../schemas/listingSearchSchema.js";
import type { RowDataPacket } from "mysql2";

// Replaces the dataset atomically: failed imports roll back to the previous data.
export async function saveListings(listings: Listing[]): Promise<void> {
  // Prevent an empty or failed import from deleting existing listings.
  if (listings.length === 0) {
    throw new Error("Refusing to replace listings with an empty dataset");
  }

  const connection = await pool.getConnection();

  try {
    await connection.beginTransaction();

    await connection.query("DELETE FROM listings");

    const sql = `
            INSERT INTO listings (
                source_unit_identifier,
                voivodeship,
                city,
                street,
                building_number,
                postal_code,
                longitude,
                latitude,
                property_type,
                price_per_m2,
                price_per_m2_valid_from,
                price_total,
                price_total_valid_from,
                area_m2
            ) VALUES ?
        `;

    // Insert in batches to avoid excessively large SQL statements.
    const batchSize = 500;

    for (let index = 0; index < listings.length; index += batchSize) {
      const batch = listings.slice(index, index + batchSize);

      const values = batch.map((listing) => [
        listing.sourceUnitIdentifier,
        listing.voivodeship,
        listing.city,
        listing.street,
        listing.buildingNumber,
        listing.postalCode,
        listing.longitude,
        listing.latitude,
        listing.propertyType,
        listing.pricePerM2,
        listing.pricePerM2ValidFrom,
        listing.priceTotal,
        listing.priceTotalValidFrom,
        listing.areaM2,
      ]);

      await connection.query(sql, [values]);
    }

    await connection.commit();
    console.log(`Saved ${listings.length} listings to MySQL`);
  } catch (error) {
    await connection.rollback();
    throw error;
  } finally {
    connection.release();
  }
}

// Build a paginated listing query using optional, validated filters.
// SQL values are parameterized; only predefined column expressions are used.
export async function getListings(
    page: number = 1,
    limit: number = 10,
    filters: ListingFilters = {},
): Promise<{ listings: RowDataPacket[], totalFilteredRows: number, totalRows: number }> {
  const conditions: string[] = [];
  const params: (string | number)[] = [];

  if (filters.city) {
    conditions.push("city LIKE ?");
    params.push(`%${filters.city}%`);
  }

  if (filters.minPrice !== undefined) {
    conditions.push("price_total >= ?");
    params.push(filters.minPrice);
  }

  if (filters.maxPrice !== undefined) {
    conditions.push("price_total <= ?");
    params.push(filters.maxPrice);
  }

  if (filters.minArea !== undefined) {
    conditions.push("area_m2 >= ?");
    params.push(filters.minArea);
  }

  if (filters.maxArea !== undefined) {
    conditions.push("area_m2 <= ?");
    params.push(filters.maxArea);
  }

  // Reuse the same conditions for both listing retrieval and filtered counts.
  const whereClause =
    conditions.length > 0 ? `WHERE ${conditions.join(" AND ")}` : "";

  const offset = (page - 1) * limit;

  // Parameterized values prevent SQL injection through search filters.
  const [listings] = await pool.query<RowDataPacket[]>(
    `SELECT * FROM listings ${whereClause} ORDER BY id ASC LIMIT ? OFFSET ?`,
    [...params, limit, offset],
  );

  // Count matching records separately from the total dataset size.
  const [filteredCount] = await pool.query<RowDataPacket[]>(
    `SELECT COUNT(*) AS total FROM listings ${whereClause}`,
    params,
  );

  const [allCount] = await pool.query<RowDataPacket[]>(
    "SELECT COUNT(*) AS total FROM listings",
  );

  return {
    listings,
    totalFilteredRows: Number(filteredCount[0]?.total ?? 0),
    totalRows: Number(allCount[0]?.total ?? 0),
  };
}

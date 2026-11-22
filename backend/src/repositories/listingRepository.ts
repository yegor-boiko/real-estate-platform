import pool from "../db/connection.js";
import type { Listing } from "../types/listing.js";
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

// Fetches one page of listings and the total count for pagination.
export async function getListings(
    page: number = 1,
    limit: number = 10
): Promise<{ listings: RowDataPacket[], totalRows: number}> {
    const offset = (page - 1) * limit;

    const [listings] = await pool.query<RowDataPacket[]>(
        "SELECT * FROM `listings` ORDER BY id LIMIT ? OFFSET ?",
        [limit, offset]
    );

    const [countRows] = await pool.query<RowDataPacket[]>(
        "SELECT COUNT(*) as totalRows FROM `listings`"
    );

    return {
        listings,
        totalRows: Number(countRows[0]?.totalRows ?? 0),
    };
};

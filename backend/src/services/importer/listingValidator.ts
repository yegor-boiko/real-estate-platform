import type { Listing } from "../../types/listing.js";

// Validates normalized listings before database insertion.
// Returns all validation errors so invalid source records can be diagnosed and skipped.
export function validateListing(listing: Listing): string[] {
  const errors: string[] = [];

  if (!listing.city) {
    errors.push("Missing city");
  }

  if (!listing.sourceUnitIdentifier) {
    errors.push("Missing unit identifier");
  }

  if (listing.priceTotal === null || listing.priceTotal <= 0) {
    errors.push("Invalid total price");
  }

  if (listing.pricePerM2 === null || listing.pricePerM2 <= 0) {
    errors.push("Invalid price per m²");
  }

  if (listing.areaM2 === null || listing.areaM2 <= 0) {
    errors.push("Invalid area");
  }

  if (
    listing.latitude !== null &&
    (listing.latitude < -90 || listing.latitude > 90)
  ) {
    errors.push("Invalid latitude");
  }

  if (
    listing.longitude !== null &&
    (listing.longitude < -180 || listing.longitude > 180)
  ) {
    errors.push("Invalid longitude");
  }

  return errors;
}

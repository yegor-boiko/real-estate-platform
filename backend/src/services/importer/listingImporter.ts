import { readSheet } from "read-excel-file/node";
import type { Listing } from "../../types/listing.js";
import { normalizeText, normalizeDecimal, calculateArea } from "./listingNormalizer.js";
import { validateListing } from "./listingValidator.js";

const ATAL_FILE_URL =
  "https://api.dane.gov.pl/resources/3015190,ceny-ofertowe-mieszkan-dewelopera-atal-spoka-akcyjna-2026-11-19/file";

// Map columns by header name rather than position, so column reordering
// in the source spreadsheet does not break the importer.
function getColumnIndexes(headers: unknown[]) {
  function columnIndex(headerName: string): number {
    const index = headers.indexOf(headerName);

    if (index === -1) {
      throw new Error(`Missing required Excel column: ${headerName}`);
    }

    return index;
  }

  const locationSuffix = "lokalizacji przedsięwzięcia deweloperskiego lub zadania inwestycyjnego";

  return {
    voivodeship: columnIndex(`Województwo ${locationSuffix}`),
    city: columnIndex(`Miejscowość ${locationSuffix}`),
    street: columnIndex(`Ulica ${locationSuffix}`),
    buildingNumber: columnIndex(`Numer nieruchomości ${locationSuffix}`),
    postalCode: columnIndex(`Kod pocztowy ${locationSuffix}`),

    longitude: columnIndex(
      "Długość geograficzna punktu określającego lokalizację przestrzenną przedsięwzięcia deweloperskiego lub zadania inwestycyjnego",
    ),
    latitude: columnIndex(
      "Szerokość geograficzna punktu określającego lokalizację przestrzenną przedsięwzięcia deweloperskiego lub zadania inwestycyjnego",
    ),

    propertyType: columnIndex("Rodzaj nieruchomości"),
    sourceUnitIdentifier: columnIndex(
      "Identyfikator lokalu mieszkalnego albo domu jednorodzinnego",
    ),
    pricePerM2: columnIndex(
      "Cena 1 m2 powierzchni użytkowej lokalu mieszkalnego albo domu jednorodzinnego",
    ),
    pricePerM2ValidFrom: columnIndex(
      "Data i czas, od których obowiązuje cena 1 m2 powierzchni użytkowej lokalu mieszkalnego albo domu jednorodzinnego",
    ),
    priceTotal: columnIndex(
      "Cena lokalu mieszkalnego albo domu jednorodzinnego lub ich części będących przedmiotem umowy",
    ),
    priceTotalValidFrom: columnIndex(
      "Data i czas, od których obowiązuje cena lokalu mieszkalnego albo domu jednorodzinnego lub ich części",
    ),
  };
}

// Convert raw Excel values into a normalized Listing before validation.
function mapRowToListing(row: unknown[], columns: ReturnType<typeof getColumnIndexes>): Listing {
  const pricePerM2 = normalizeDecimal(row[columns.pricePerM2]);
  const priceTotal = normalizeDecimal(row[columns.priceTotal]);

  return {
    sourceUnitIdentifier: normalizeText(row[columns.sourceUnitIdentifier]),

    voivodeship: normalizeText(row[columns.voivodeship]),
    city: normalizeText(row[columns.city]),
    street: normalizeText(row[columns.street]),
    buildingNumber: normalizeText(row[columns.buildingNumber]),
    postalCode: normalizeText(row[columns.postalCode]),

    longitude: normalizeDecimal(row[columns.longitude]),
    latitude: normalizeDecimal(row[columns.latitude]),

    propertyType: normalizeText(row[columns.propertyType]),

    pricePerM2,
    pricePerM2ValidFrom: normalizeText(row[columns.pricePerM2ValidFrom]),

    priceTotal,
    priceTotalValidFrom: normalizeText(row[columns.priceTotalValidFrom]),

    areaM2: calculateArea(priceTotal, pricePerM2),
  };
}

// Fetch the original XLSX snapshot from Poland's public data portal.
export async function downloadListings(): Promise<Buffer> {
  const response = await fetch(ATAL_FILE_URL);

  if (!response.ok) {
    throw new Error(`Download failed: HTTP ${response.status}`);
  }

  const data = await response.arrayBuffer();

  return Buffer.from(data);
}

export async function readListings(file: Buffer): Promise<Listing[]> {
  const rows = await readSheet(file, "Dane");
  const columns = getColumnIndexes(rows[0] ?? []);

  const validListings: Listing[] = [];
  const invalidListings: { row: number; errors: string[] }[] = [];

  for (let index = 1; index < rows.length; index++) {
    const row = rows[index];

    if (!row) continue;

    // Exclude parking spaces and other non-residential records from apartment search.
    if (normalizeText(row[columns.propertyType]) !== "lokal mieszkalny") {
      continue;
    }

    const listing = mapRowToListing(row, columns);
    // Keep valid apartments and record validation failures for diagnostics.
    const errors = validateListing(listing);

    if (errors.length === 0) {
      validListings.push(listing);
    } else {
      invalidListings.push({
        row: index + 1,
        errors,
      });
    }
  }

  console.log("Valid listings:", validListings.length);
  console.log("Invalid listings:", invalidListings.length);

  if (invalidListings.length > 0) {
    console.log("Validation failures:", invalidListings.slice(0, 5));
  }

  return validListings;
}

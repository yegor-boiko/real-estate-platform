// Represents a listing during import, before validation.
// Fields are nullable because source data may be missing or invalid.
// Validation rejects incomplete records before insertion into MySQL.

export interface Listing {
  sourceUnitIdentifier: string | null;

  voivodeship: string | null;
  city: string | null;
  street: string | null;
  buildingNumber: string | null;
  postalCode: string | null;

  longitude: number | null;
  latitude: number | null;

  propertyType: string | null;

  pricePerM2: number | null;
  pricePerM2ValidFrom: string | null;

  priceTotal: number | null;
  priceTotalValidFrom: string | null;

  areaM2: number | null;
}

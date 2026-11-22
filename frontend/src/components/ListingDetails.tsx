import { useEffect, useState } from "react";
import type { Listing } from "../types/listing";

interface Props {
  id: number;
}

export default function ListingDetails({ id }: Props) {
  const [listing, setListing] = useState<Listing | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    async function loadListing() {
      setLoading(true);
      setError(null);

      try {
        const response = await fetch(`/api/listings/${id}`);

        if (!response.ok) {
          throw new Error(`HTTP ${response.status}`);
        }

        const result: { data: Listing } = await response.json();
        setListing(result.data);
      } catch (error) {
        setError(
          error instanceof Error ? error.message : "Unknown error",
        );
      } finally {
        setLoading(false);
      }
    }

    void loadListing();
  }, [id]);

  if (loading) {
    return <main>Loading apartment details...</main>;
  }

  if (error) {
    return <main>Failed to load apartment: {error}</main>;
  }

  if (!listing) {
    return <main>Apartment not found.</main>;
  }

  return (
    <main>
      <h1>Apartment in {listing.city}</h1>

      <p>
        {listing.street ?? "Street unavailable"}
        {listing.building_number
          ? ` ${listing.building_number}`
          : ""}
        {listing.postal_code
          ? `, ${listing.postal_code}`
          : ""}
      </p>

      <h2>Pricing</h2>

      <p>
        Total price:{" "}
        {Number(listing.price_total).toLocaleString("pl-PL")} zł
      </p>

      <p>Area: {listing.area_m2} m²</p>

      <p>
        Price per m²:{" "}
        {Number(listing.price_per_m2).toLocaleString("pl-PL")} zł
      </p>

      <h2>Property information</h2>

      <dl>
        <dt>City</dt>
        <dd>{listing.city ?? "Not specified"}</dd>

        <dt>Region</dt>
        <dd>{listing.voivodeship ?? "Not specified"}</dd>

        <dt>Postal code</dt>
        <dd>{listing.postal_code ?? "Not specified"}</dd>

        <dt>Apartment identifier</dt>
        <dd>{listing.source_unit_identifier ?? "Not specified"}</dd>
      </dl>
    </main>
  );
}

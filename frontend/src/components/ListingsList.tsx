import { useEffect, useState } from "react";
import type { Listing, ListingsResponse } from "../types/listing";

export default function ListingsList() {
  const [listings, setListings] = useState<Listing[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    async function loadListings() {
      try {
        const response = await fetch("/api/listings?page=1&limit=6");

        if (!response.ok) {
          throw new Error(`HTTP ${response.status}`);
        }

        const result: ListingsResponse = await response.json();
        setListings(result.data);
      } catch (error) {
        setError(
          error instanceof Error ? error.message : "Unknown error",
        );
      } finally {
        setLoading(false);
      }
    }

    void loadListings();
  }, []);

  if (loading) return <p>Loading apartments...</p>;
  if (error) return <p>Failed to load listings: {error}</p>;

  return (
    <main>
      <h1>Available apartments</h1>

      {listings.map((listing) => (
        <article key={listing.id}>
          <h2>{listing.city}</h2>
          <p>
            {listing.street} {listing.building_number ?? ""}
          </p>
          <p>Area: {listing.area_m2} m²</p>
          <p>
            Price: {Number(listing.price_total).toLocaleString("pl-PL")} zł
          </p>
        </article>
      ))}
    </main>
  );
}

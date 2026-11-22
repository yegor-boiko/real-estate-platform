
import { useEffect, useState } from "react";
import type { Listing, ListingsResponse } from "../types/listing";

export default function ListingsList() {
  const [listings, setListings] = useState<Listing[]>([]);
  const [page, setPage] = useState(1);
  const [totalPages, setTotalPages] = useState(0);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    async function loadListings() {
      setLoading(true);
      setError(null);

      try {
        const response = await fetch(`/api/listings?page=${page}&limit=6`);

        if (!response.ok) {
          throw new Error(`HTTP ${response.status}`);
        }

        const result: ListingsResponse = await response.json();

        setListings(result.data);
        setTotalPages(result.pagination.totalPages);
      } catch (error) {
        setError(
          error instanceof Error ? error.message : "Unknown error",
        );
      } finally {
        setLoading(false);
      }
    }

    void loadListings();
  }, [page]);

  return (
    <main>
      <h1>Available apartments</h1>

      {loading ? (
        <p>Loading apartments...</p>
      ) : error ? (
        <p>Failed to load listings: {error}</p>
      ) : (
        <>
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

          {totalPages > 1 && (
            <nav aria-label="Listings pagination">
              <button
                type="button"
                disabled={page <= 1}
                onClick={() => setPage(page - 1)}
              >
                Previous
              </button>

              <span>
                {" "}
                Page {page} of {totalPages}{" "}
              </span>

              <button
                type="button"
                disabled={page >= totalPages}
                onClick={() => setPage(page + 1)}
              >
                Next
              </button>
            </nav>
          )}
        </>
      )}
    </main>
  );
}

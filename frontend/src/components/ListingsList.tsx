import { useEffect, useState } from "react";
import { Link, useSearchParams } from "react-router-dom";
import type { Listing, ListingsResponse } from "../types/listing";
import ListingFiltersForm from "./ListingFiltersForm";
import type { SearchFilters } from "./ListingFiltersForm";

export default function ListingsList() {
  const [listings, setListings] = useState<Listing[]>([]);
  const [totalPages, setTotalPages] = useState(0);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  
  const [searchParams, setSearchParams] = useSearchParams();
  const queryString = searchParams.toString();

  const pageParam = Number(searchParams.get("page") ?? 1);
  const page = Number.isSafeInteger(pageParam) && pageParam > 0 ? pageParam : 1;

  const searchFilters: SearchFilters = {
    city: searchParams.get("city") ?? "",
    minPrice: searchParams.get("minPrice") ?? "",
    maxPrice: searchParams.get("maxPrice") ?? "",
    minArea: searchParams.get("minArea") ?? "",
    maxArea: searchParams.get("maxArea") ?? "",
    sortBy: searchParams.get("sortBy") ?? "default",
  };


  useEffect(() => {
    async function loadListings() {
      setLoading(true);
      setError(null);

      try {
        const urlParams = new URLSearchParams(queryString);

        const currentPageParam = Number(urlParams.get("page") ?? 1);
        const currentPage =
          Number.isSafeInteger(currentPageParam) && currentPageParam > 0
            ? currentPageParam
            : 1;

        const params = new URLSearchParams({
          page: String(currentPage),
          limit: "6",
        });

        for (const key of [
          "city",
          "minPrice",
          "maxPrice",
          "minArea",
          "maxArea",
          "sortBy",
        ]) {
          const value = urlParams.get(key)?.trim();

          if (value) {
            params.set(key, value);
          }
        }

        const response = await fetch(`/api/listings?${params.toString()}`);

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
  }, [queryString]);

  function handleSearch(filters: SearchFilters) {
    const params = new URLSearchParams();

    for (const [key, value] of Object.entries(filters)) {
      if (value.trim()) {
        params.set(key, value.trim());
      }
    }

    params.set("page", "1");
    setSearchParams(params);
  }

  function handleReset() {
    setSearchParams(new URLSearchParams());
  }

  function changePage(newPage: number) {
    const params = new URLSearchParams(searchParams);
    params.set("page", String(newPage));
    setSearchParams(params);
  }

  return (
    <main>
      <h1>Available apartments</h1>

      <ListingFiltersForm
        key={queryString}
        initialFilters={searchFilters}
        onSearch={handleSearch}
        onReset={handleReset}
      />

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
              <Link
                to={`/listings/${listing.id}`}
                state={{ from: `?${queryString}` }}
              >
                View details
              </Link>
            </article>
          ))}

          {totalPages > 1 && (
            <nav aria-label="Listings pagination">
              <button
                type="button"
                disabled={page <= 1}
                onClick={() => changePage(page - 1)}
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
                onClick={() => changePage(page + 1)}
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

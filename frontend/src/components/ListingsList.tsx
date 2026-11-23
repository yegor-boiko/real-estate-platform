import { useEffect, useState } from "react";
import { Link, useSearchParams } from "react-router-dom";
import type { Listing, ListingsResponse } from "../types/listing";
import ListingFiltersForm from "./ListingFiltersForm";
import type { SearchFilters } from "./ListingFiltersForm";
import AiSearch from "./AiSearch";

export default function ListingsList() {
  const [listings, setListings] = useState<Listing[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [totalPages, setTotalPages] = useState(0);
  const [totalRows, setTotalRows] = useState(0);
  const [totalFilteredRows, setTotalFilteredRows] = useState(0);

  // URL parameters are the source of truth for filters and pagination.
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

  // Reload listings whenever the URL query changes.
  useEffect(() => {
    async function loadListings() {
      setLoading(true);
      setError(null);

      try {
        const urlParams = new URLSearchParams(queryString);

        const currentPageParam = Number(urlParams.get("page") ?? 1);
        const currentPage =
          Number.isSafeInteger(currentPageParam) && currentPageParam > 0 ? currentPageParam : 1;

        const params = new URLSearchParams({
          page: String(currentPage),
          limit: "6",
        });

        for (const key of ["city", "minPrice", "maxPrice", "minArea", "maxArea", "sortBy"]) {
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
        setTotalRows(result.pagination.totalRows);
        setTotalFilteredRows(result.pagination.totalFilteredRows);
      } catch (error) {
        setError(error instanceof Error ? error.message : "Unknown error");
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
    <main className="container px-4 py-4">
      <header className="mb-4">
        <h1 className="h3 fw-bold mb-1">Find your next home</h1>
        <p className="text-muted small">Explore apartment listings from ATAL across Poland.</p>
      </header>

      <AiSearch />

      <div className="row g-3">
        <aside className="col-12 col-lg-3">
          <div className="card border-0 shadow-sm">
            <div className="card-body p-3">
              <h2 className="h5 mb-3">Filters</h2>
              <ListingFiltersForm
                key={queryString}
                initialFilters={searchFilters}
                onSearch={handleSearch}
                onReset={handleReset}
              />
            </div>
          </div>
        </aside>

        <section className="col-12 col-lg-9">
          {loading ? (
            <p>Loading apartments...</p>
          ) : error ? (
            <div className="alert alert-danger">Failed to load listings: {error}</div>
          ) : (
            <>
              <div className="d-flex align-items-center mb-3">
                <div>
                  <h2 className="h5 fw-bold mb-1">Available apartments</h2>
                  <p className="text-muted small mb-0">
                    {totalFilteredRows.toLocaleString("en-US")} matching records out of{" "}
                    {totalRows.toLocaleString("en-US")}
                  </p>
                </div>
              </div>

              {listings.length === 0 ? (
                <div className="alert alert-info">No apartments match your search.</div>
              ) : (
                <div className="row g-4">
                  {listings.map((listing) => (
                    <div className="col-12 col-md-6 col-xl-4" key={listing.id}>
                      <article className="card h-100 shadow-sm border-0 listing-card">
                        <div className="card-body p-3">
                          <span className="badge text-bg-light mb-3">Apartment</span>

                          <h3 className="h5 fw-bold">{listing.city ?? "Location unavailable"}</h3>

                          <p className="text-muted mb-4">
                            {listing.street ?? "Street unavailable"}
                            {listing.building_number ? ` ${listing.building_number}` : ""}
                          </p>

                          <div className="d-flex justify-content-between mb-3">
                            <span className="text-muted">Area</span>
                            <strong>{listing.area_m2} m²</strong>
                          </div>

                          <div className="d-flex justify-content-between mb-4">
                            <span className="text-muted">Price</span>
                            <strong>
                              {Number(listing.price_total).toLocaleString("pl-PL")} zł
                            </strong>
                          </div>

                          <Link
                            to={`/listings/${listing.id}`}
                            state={{ from: `?${queryString}` }}
                            className="btn btn-primary w-100"
                          >
                            View details
                          </Link>
                        </div>
                      </article>
                    </div>
                  ))}
                </div>
              )}

              {totalPages > 1 && (
                <nav
                  className="d-flex justify-content-center align-items-center gap-3 mt-5"
                  aria-label="Listings pagination"
                >
                  <button
                    className="btn btn-outline-primary"
                    type="button"
                    disabled={page <= 1}
                    onClick={() => changePage(page - 1)}
                  >
                    Previous
                  </button>

                  <span className="text-muted">
                    {page} / {totalPages}
                  </span>

                  <button
                    className="btn btn-outline-primary"
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
        </section>
      </div>
    </main>
  );
}

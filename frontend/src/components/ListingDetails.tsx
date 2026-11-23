import { useEffect, useState } from "react";
import { Link, useLocation, useParams } from "react-router-dom";
import type { Listing } from "../types/listing";


export default function ListingDetails() {
  const { id } = useParams();
  const [listing, setListing] = useState<Listing | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  
  const location = useLocation();
  // Restore the previous search URL when returning from apartment details.
  const backUrl =
    typeof location.state?.from === "string" &&
    location.state.from.startsWith("?")
      ? `/${location.state.from}`
      : "/";

  useEffect(() => {
    async function loadListing() {
      setLoading(true);
      setError(null);
      setListing(null);

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
    <main className="container py-5">
      <Link to={backUrl} className="btn btn-outline-secondary mb-4">
        ← Back to listings
      </Link>

      <div className="card border-0 shadow-sm">
        <div className="card-body p-4 p-md-5">
          <span className="badge text-bg-light mb-3">Apartment</span>

          <h1 className="fw-bold mb-2">
            Apartment in {listing.city ?? "Unknown location"}
          </h1>

          <p className="text-muted mb-4">
            {listing.street ?? "Street unavailable"}
            {listing.building_number ? ` ${listing.building_number}` : ""}
            {listing.postal_code ? `, ${listing.postal_code}` : ""}
          </p>

          <div className="row g-4 mb-4">
            <div className="col-md-4">
              <div className="bg-light rounded p-3 h-100">
                <div className="text-muted small mb-1">Total price</div>
                <div className="fs-4 fw-bold text-primary">
                  {listing.price_total
                    ? `${Number(listing.price_total).toLocaleString("pl-PL")} zł`
                    : "Not available"}
                </div>
              </div>
            </div>

            <div className="col-md-4">
              <div className="bg-light rounded p-3 h-100">
                <div className="text-muted small mb-1">Area</div>
                <div className="fs-4 fw-bold">{listing.area_m2 ?? "—"} m²</div>
              </div>
            </div>

            <div className="col-md-4">
              <div className="bg-light rounded p-3 h-100">
                <div className="text-muted small mb-1">Price per m²</div>
                <div className="fs-4 fw-bold">
                  {listing.price_per_m2
                    ? `${Number(listing.price_per_m2).toLocaleString("pl-PL")} zł`
                    : "Not available"}
                </div>
              </div>
            </div>
          </div>

          <h2 className="h5 fw-bold mb-3">Property information</h2>

          <dl className="row mb-0">
            <dt className="col-sm-4">City</dt>
            <dd className="col-sm-8">{listing.city ?? "Not specified"}</dd>

            <dt className="col-sm-4">Region</dt>
            <dd className="col-sm-8">
              {listing.voivodeship ?? "Not specified"}
            </dd>

            <dt className="col-sm-4">Postal code</dt>
            <dd className="col-sm-8">
              {listing.postal_code ?? "Not specified"}
            </dd>

            <dt className="col-sm-4">Apartment identifier</dt>
            <dd className="col-sm-8">
              {listing.source_unit_identifier ?? "Not specified"}
            </dd>
          </dl>
        </div>
      </div>
    </main>
  );
}

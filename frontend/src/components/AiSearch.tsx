import { useState } from "react";
import { useSearchParams } from "react-router-dom";

type AiFilters = {
  city?: string;
  minPrice?: number;
  maxPrice?: number;
  minArea?: number;
  maxArea?: number;
  sortBy?: "default" | "price_asc" | "price_desc";
};

type AiSearchResponse = {
  filters: AiFilters;
  explanation: string;
};

export default function AiSearch() {
  const [, setSearchParams] = useSearchParams();

  const [query, setQuery] = useState("");
  const [explanation, setExplanation] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  async function handleSearch(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault();

    if (!query.trim() || loading) return;

    setLoading(true);
    setError("");
    setExplanation("");

    try {
      const response = await fetch("/api/ai/search", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ query: query.trim() }),
      });

      if (!response.ok) {
        throw new Error("AI search is unavailable. Please try manual filters.");
      }

      const result: AiSearchResponse = await response.json();

      const params = new URLSearchParams();
      const filters = result.filters;

      if (filters.city) params.set("city", filters.city);
      if (filters.minPrice !== undefined) {
        params.set("minPrice", String(filters.minPrice));
      }
      if (filters.maxPrice !== undefined) {
        params.set("maxPrice", String(filters.maxPrice));
      }
      if (filters.minArea !== undefined) {
        params.set("minArea", String(filters.minArea));
      }
      if (filters.maxArea !== undefined) {
        params.set("maxArea", String(filters.maxArea));
      }
      if (filters.sortBy && filters.sortBy !== "default") {
        params.set("sortBy", filters.sortBy);
      }

      // Start from the first page of the new search.
      params.set("page", "1");

      setSearchParams(params);
      setExplanation(result.explanation);
    } catch (err) {
      setError(err instanceof Error ? err.message : "Something went wrong.");
    } finally {
      setLoading(false);
    }
  }

  return (
    <div className="card shadow-sm mb-4">
      <div className="card-body">
        <h5 className="card-title">Search with AI</h5>

        <p className="text-muted small">
          Describe the apartment you're looking for in everyday language.
        </p>

        <form onSubmit={handleSearch}>
          <div className="input-group">
            <input
              type="text"
              className="form-control"
              placeholder="Cheap flat around 40 m² in Kraków..."
              value={query}
              onChange={(event) => setQuery(event.target.value)}
              maxLength={500}
              disabled={loading}
              aria-label="Describe your ideal apartment"
            />

            <button
              type="submit"
              className="btn btn-primary"
              disabled={loading || query.trim().length < 3}
            >
              {loading && (
                <span
                  className="spinner-border spinner-border-sm me-2"
                  role="status"
                  aria-hidden="true"
                />
              )}
              {loading ? "Searching..." : "AI Search"}
            </button>
          </div>
        </form>

        {explanation && (
          <div className="alert alert-info mt-3 mb-0" role="status">
            <strong>AI interpretation:</strong> {explanation}
          </div>
        )}

        {error && (
          <div className="alert alert-danger mt-3 mb-0" role="alert">
            {error}
          </div>
        )}
      </div>
    </div>
  );
}

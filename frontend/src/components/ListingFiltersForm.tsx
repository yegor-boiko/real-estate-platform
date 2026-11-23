import { useState } from "react";

export interface SearchFilters {
  city: string;
  minPrice: string;
  maxPrice: string;
  minArea: string;
  maxArea: string;
  sortBy: string;
}

interface Props {
  initialFilters: SearchFilters;
  onSearch: (filters: SearchFilters) => void;
  onReset: () => void;
}

// Keeps form inputs as strings until submitted; the backend validates numeric filters.
export default function ListingFiltersForm({
  initialFilters,
  onSearch,
  onReset,
}: Props) {
  const [filters, setFilters] = useState<SearchFilters>(initialFilters);

  function updateFilter(field: keyof SearchFilters, value: string) {
    setFilters((previous) => ({ ...previous, [field]: value }));
  }

  function handleSubmit(event: React.SubmitEvent<HTMLFormElement>) {
    event.preventDefault();
    onSearch(filters);
  }

  function handleReset() {
    setFilters({
        city: "",
        minPrice: "",
        maxPrice: "",
        minArea: "",
        maxArea: "",
        sortBy: "default",
    });

    onReset();
    }

  return (
    <form onSubmit={handleSubmit}>
      <div className="row g-2 align-items-end">
        <div className="col-12">
          <label htmlFor="city" className="form-label">
            City
          </label>
          <input
            id="city"
            className="form-control form-control-sm"
            placeholder="e.g. Kraków"
            value={filters.city}
            onChange={(event) => updateFilter("city", event.target.value)}
          />
        </div>

        <div className="col-12">
          <label htmlFor="minPrice" className="form-label">
            Minimum price (PLN)
          </label>
          <input
            id="minPrice"
            type="number"
            className="form-control form-control-sm"
            min="0"
            placeholder="e.g. 300000"
            value={filters.minPrice}
            onChange={(event) => updateFilter("minPrice", event.target.value)}
          />
        </div>

        <div className="col-12">
          <label htmlFor="maxPrice" className="form-label">
            Maximum price (PLN)
          </label>
          <input
            id="maxPrice"
            type="number"
            className="form-control form-control-sm"
            min="0"
            placeholder="e.g. 800000"
            value={filters.maxPrice}
            onChange={(event) => updateFilter("maxPrice", event.target.value)}
          />
        </div>

        <div className="col-12">
          <label htmlFor="minArea" className="form-label">
            Minimum area (m²)
          </label>
          <input
            id="minArea"
            type="number"
            className="form-control form-control-sm"
            min="0"
            step="any"
            placeholder="e.g. 40"
            value={filters.minArea}
            onChange={(event) => updateFilter("minArea", event.target.value)}
          />
        </div>

        <div className="col-12">
          <label htmlFor="maxArea" className="form-label">
            Maximum area (m²)
          </label>
          <input
            id="maxArea"
            type="number"
            className="form-control form-control-sm"
            min="0"
            step="any"
            placeholder="e.g. 80"
            value={filters.maxArea}
            onChange={(event) => updateFilter("maxArea", event.target.value)}
          />
        </div>

        <div className="col-12">
          <label htmlFor="sortBy" className="form-label">
            Sort by
          </label>

          <select
            id="sortBy"
            className="form-select form-select-sm"
            value={filters.sortBy}
            onChange={(event) => updateFilter("sortBy", event.target.value)}
          >
            <option value="default">Default order</option>
            <option value="price_asc">Price: low to high</option>
            <option value="price_desc">Price: high to low</option>
          </select>
        </div>

        <div className="col-12">
          <div className="d-flex gap-2">
            <button
              type="submit"
              className="btn btn-primary btn-sm flex-grow-1"
            >
              Search
            </button>

            <button
              type="button"
              className="btn btn-outline-secondary btn-sm"
              onClick={onReset}
            >
              Reset
            </button>
          </div>
        </div>
      </div>
    </form>
  );
}

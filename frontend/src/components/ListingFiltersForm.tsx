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
      <div className="mb-3">
        <label className="form-label" htmlFor="city">
          City
        </label>
        <input
          id="city"
          className="form-control form-control-sm"
          type="text"
          placeholder="e.g. Kraków"
          value={filters.city}
          onChange={(event) => updateFilter("city", event.target.value)}
        />
      </div>

      {(
        [
          ["minPrice", "Minimum price (PLN)"],
          ["maxPrice", "Maximum price (PLN)"],
          ["minArea", "Minimum area (m²)"],
          ["maxArea", "Maximum area (m²)"],
        ] as const
      ).map(([field, label]) => (
        <div className="mb-3" key={field}>
          <label className="form-label" htmlFor={field}>
            {label}
          </label>
          <input
            id={field}
            className="form-control form-control-sm"
            type="number"
            min="0"
            step="any"
            value={filters[field]}
            onChange={(event) => updateFilter(field, event.target.value)}
          />
        </div>
      ))}

      <div className="mb-4">
        <label className="form-label" htmlFor="sortBy">
          Sort by
        </label>
        <select
          id="sortBy"
          className="form-select form-select-sm"
          value={filters.sortBy}
          onChange={(event) => updateFilter("sortBy", event.target.value)}
        >
          <option value="default">Default</option>
          <option value="price_asc">Price: Low to High</option>
          <option value="price_desc">Price: High to Low</option>
        </select>
      </div>

      <div className="d-grid gap-2">
        <button className="btn btn-primary" type="submit">
          Search
        </button>
        <button
          className="btn btn-outline-secondary"
          type="button"
          onClick={handleReset}
        >
          Reset
        </button>
      </div>
    </form>
  );
}

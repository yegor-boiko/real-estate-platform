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
      <h2>Filters</h2>

      <label>
        City
        <input
          type="text"
          value={filters.city}
          onChange={(event) => updateFilter("city", event.target.value)}
        />
      </label>

      {(
        [
          ["minPrice", "Minimum price (PLN)"],
          ["maxPrice", "Maximum price (PLN)"],
          ["minArea", "Minimum area (m²)"],
          ["maxArea", "Maximum area (m²)"],
        ] as const
      ).map(([field, label]) => (
        <label key={field}>
          {label}
          <input
            type="number"
            min="0"
            step="any"
            value={filters[field]}
            onChange={(event) => updateFilter(field, event.target.value)}
          />
        </label>
      ))}

      <label>
        Sort by
        <select
          value={filters.sortBy}
          onChange={(event) => updateFilter("sortBy", event.target.value)}
        >
          <option value="default">Default</option>
          <option value="price_asc">Price: Low to High</option>
          <option value="price_desc">Price: High to Low</option>
        </select>
      </label>

      <button type="submit">Search</button>
      <button type="button" onClick={handleReset}>
        Reset
      </button>
    </form>
  );
}

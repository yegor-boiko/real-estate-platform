export interface Listing {
  id: number;
  source_unit_identifier: string | null;

  city: string | null;
  street: string | null;
  building_number: string | null;
  postal_code: string | null;
  voivodeship: string | null;

  price_total: number | string;
  price_per_m2: number | string;
  area_m2: number | string;
}

export interface ListingsResponse {
  data: Listing[];
  pagination: {
    page: number;
    limit: number;
    totalRows: number;
    totalFilteredRows: number;
    totalPages: number;
  };
}

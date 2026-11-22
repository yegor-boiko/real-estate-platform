export interface Listing {
  id: number;
  source_unit_identifier: string;
  city: string;
  street: string | null;
  building_number: string | null;
  price_total: number | string;
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

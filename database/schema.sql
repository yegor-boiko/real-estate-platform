-- Data source: ATAL S.A. residential property dataset (dane.gov.pl).
--
-- The source contains 48 columns. This schema keeps a subset relevant
-- to apartment search, pricing, location, and future data analysis.
-- Ancillary items (parking, storage, etc.) are excluded from the MVP.
--
-- The source does not provide apartment area directly, so it is derived
-- during import from total price and price per square meter.
--
-- Source identifiers and price validity dates are retained to support
-- potential deduplication and price history analysis in the future.

CREATE TABLE listings (
    id BIGINT UNSIGNED AUTO_INCREMENT PRIMARY KEY,
    source_unit_identifier VARCHAR(100) NOT NULL,

    voivodeship VARCHAR(32),
    city VARCHAR(120) NOT NULL,
    street VARCHAR(255) NOT NULL,
    building_number VARCHAR(100),
    postal_code VARCHAR(20),

    longitude DECIMAL(10,7),
    latitude DECIMAL(9,7),

    property_type VARCHAR(50),

    price_per_m2 DECIMAL(12,2) NOT NULL,
    price_per_m2_valid_from DATETIME,
    price_total DECIMAL(14,2) NOT NULL,
    price_total_valid_from DATETIME,

    area_m2 DECIMAL(10,2) NOT NULL,

    -- Indexes target the filters used by the listing search API.
    INDEX idx_city (city),
    INDEX idx_price (price_total),
    INDEX idx_area (area_m2)
);

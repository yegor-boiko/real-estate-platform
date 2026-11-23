import assert from "node:assert/strict";
import test from "node:test";

const baseUrl = "http://localhost:3000";

test("GET /api/listings returns paginated listings", async () => {
  const response = await fetch(`${baseUrl}/api/listings?page=1&limit=5`);
  const body = await response.json();

  assert.equal(response.status, 200);
  assert.equal(body.data.length, 5);
  assert.equal(body.pagination.page, 1);
  assert.equal(body.pagination.limit, 5);
  assert.ok(body.pagination.totalRows > 0);
});

test("GET /api/listings filters by city", async () => {
  const response = await fetch(
    `${baseUrl}/api/listings?city=Krak%C3%B3w&limit=10`,
  );
  const body = await response.json();

  assert.equal(response.status, 200);
  assert.ok(body.data.length > 0);
  assert.ok(
    body.data.every((listing: { city: string }) =>
      listing.city.toLowerCase().includes("kraków"),
    ),
  );
});

test("GET /api/listings filters by apartment area", async () => {
  const response = await fetch(
    `${baseUrl}/api/listings?minArea=40&maxArea=80`,
  );
  const body = await response.json();

  assert.equal(response.status, 200);
  assert.ok(body.data.length > 0);
  assert.ok(
    body.data.every(
      (listing: { area_m2: number }) =>
        Number(listing.area_m2) >= 40 &&
        Number(listing.area_m2) <= 80,
    ),
  );
});

test("GET /api/listings sorts by ascending price", async () => {
  const response = await fetch(
    `${baseUrl}/api/listings?sortBy=price_asc&limit=20`,
  );
  const body = await response.json();

  assert.equal(response.status, 200);

  const prices = body.data.map(
    (listing: { price_total: number }) => Number(listing.price_total),
  );

  assert.deepEqual(prices, [...prices].sort((a, b) => a - b));
});

test("GET /api/listings rejects invalid filters", async () => {
  const response = await fetch(
    `${baseUrl}/api/listings?minArea=80&maxArea=40`,
  );

  assert.equal(response.status, 400);
});

test("GET /api/listings/:id returns 404 for a missing listing", async () => {
  const response = await fetch(`${baseUrl}/api/listings/999999999`);

  assert.equal(response.status, 404);
});

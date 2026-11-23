export function normalizeText(value: unknown): string | null {
  if (value === null || value === undefined) return null;

  const text = String(value).trim().replace(/\s+/g, " ");

  if (!text || text.toUpperCase() === "X") return null;

  return text;
}

// Converts Polish decimal commas to dots and rejects invalid numeric values.
export function normalizeDecimal(value: unknown): number | null {
  const text = normalizeText(value);

  if (text === null) return null;

  const number = Number(text.replace(",", "."));

  return Number.isFinite(number) ? number : null;
}

// The source dataset has no explicit apartment area.
// Derive it from total price / price per m², rounded to two decimals.
export function calculateArea(totalPrice: number | null, pricePerM2: number | null): number | null {
  if (totalPrice === null || pricePerM2 === null || totalPrice <= 0 || pricePerM2 <= 0) {
    return null;
  }

  return Math.round((totalPrice / pricePerM2) * 100) / 100;
}

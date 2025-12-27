/**
 * Format price as integer with thousands separator and "ريال" currency
 */
export function formatPrice(price: number): string {
  const integerPrice = Math.round(price);
  return integerPrice.toLocaleString('ar-SA') + ' ريال';
}

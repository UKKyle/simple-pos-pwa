export function isValidEmail(value: string) {
  return /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(value)
}

export function parsePrice(value: string) {
  const price = Number(value)
  return Number.isFinite(price) && price > 0 ? price : null
}

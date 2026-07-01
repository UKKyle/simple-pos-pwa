export function isValidEmail(value: string) {
  return /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(value)
}

export function parsePrice(value: string) {
  const price = Number(value)
  return Number.isFinite(price) && price > 0 ? price : null
}

export function normalizeTag(value: string) {
  const cleaned = value.trim().replace(/\s+/g, ' ')
  return cleaned ? cleaned : undefined
}

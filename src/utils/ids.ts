export function createId(prefix = 'id') {
  return `${prefix}_${crypto.randomUUID()}`
}

export function nextOrderNumber(sequence: number, date = new Date()) {
  return `ORD-${date.getFullYear()}-${String(sequence).padStart(4, '0')}`
}

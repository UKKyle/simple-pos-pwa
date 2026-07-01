import type { Order } from '../types'

function escapeCsv(value: string | number | undefined) {
  const text = String(value ?? '')
  return `"${text.replaceAll('"', '""')}"`
}

export function downloadOrdersCsv(orders: Order[]) {
  const rows = [
    ['orderNumber', 'createdAt', 'customerEmail', 'paymentMethod', 'total', 'itemSummary'],
    ...orders.map((order) => [
      order.orderNumber,
      order.createdAt,
      order.customerEmail ?? '',
      order.paymentMethod,
      order.total,
      order.items.map((item) => `${item.quantity}x ${item.name}`).join('; '),
    ]),
  ]
  const csv = rows.map((row) => row.map(escapeCsv).join(',')).join('\n')
  const blob = new Blob([csv], { type: 'text/csv;charset=utf-8' })
  const url = URL.createObjectURL(blob)
  const link = document.createElement('a')
  link.href = url
  link.download = `simple-pos-orders-${new Date().toISOString().slice(0, 10)}.csv`
  link.click()
  URL.revokeObjectURL(url)
}

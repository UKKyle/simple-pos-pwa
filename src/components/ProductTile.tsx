import type { Product } from '../types'
import { formatCurrency } from '../utils/currency'

interface ProductTileProps {
  product: Product
  currency: string
  onAdd: (product: Product) => void
}

export function ProductTile({ product, currency, onAdd }: ProductTileProps) {
  const initials = product.name
    .split(' ')
    .slice(0, 2)
    .map((word) => word[0])
    .join('')
    .toUpperCase()

  return (
    <button
      className="group flex min-h-32 flex-col justify-between rounded-2xl border border-white/8 bg-zinc-900 p-4 text-left shadow-sm transition hover:-translate-y-0.5 hover:border-blue-400/60 hover:bg-zinc-800 focus:outline-none focus:ring-2 focus:ring-blue-500 lg:min-h-28"
      onClick={() => onAdd(product)}
    >
      <span className="grid h-11 w-11 place-items-center rounded-xl bg-blue-500/15 text-sm font-black text-blue-300 ring-1 ring-blue-400/20 lg:h-10 lg:w-10">
        {initials}
      </span>
      <span>
        <span className="line-clamp-2 block text-base font-bold leading-tight text-white lg:text-lg">{product.name}</span>
        <span className="mt-2 block text-sm font-semibold text-zinc-400">{formatCurrency(product.price, currency)}</span>
      </span>
    </button>
  )
}

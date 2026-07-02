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
      className="group flex min-h-32 flex-col justify-between rounded-[22px] border border-black/8 bg-white p-4 text-left shadow-sm transition hover:-translate-y-0.5 hover:border-[#008060]/35 hover:shadow-md focus:outline-none focus:ring-2 focus:ring-[#008060]/25 lg:min-h-28"
      onClick={() => onAdd(product)}
    >
      <span className="grid h-11 w-11 place-items-center rounded-[16px] bg-[#eef6ff] text-sm font-black text-[#1256a1] ring-1 ring-[#cfe0ff] lg:h-10 lg:w-10">
        {initials}
      </span>
      <span>
        <span className="line-clamp-2 block text-base font-bold leading-tight text-[#202223] lg:text-lg">{product.name}</span>
        <span className="mt-2 block text-sm font-semibold text-[#5f6368]">{formatCurrency(product.price, currency)}</span>
      </span>
    </button>
  )
}

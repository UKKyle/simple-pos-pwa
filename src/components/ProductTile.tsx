import type { Product } from '../types'
import { formatCurrency } from '../utils/currency'

interface ProductTileProps {
  product: Product
  currency: string
  theme: 'light' | 'dark'
  onAdd: (product: Product) => void
}

export function ProductTile({ product, currency, theme, onAdd }: ProductTileProps) {
  const dark = theme === 'dark'
  const initials = product.name
    .split(' ')
    .slice(0, 2)
    .map((word) => word[0])
    .join('')
    .toUpperCase()

  return (
    <button
      className={`group flex min-h-32 flex-col justify-between rounded-[22px] border p-4 text-left shadow-sm transition hover:-translate-y-0.5 hover:border-[#008060]/45 hover:shadow-md focus:outline-none focus:ring-2 focus:ring-[#008060]/25 lg:min-h-28 ${dark ? 'border-white/10 bg-[#171a1d] shadow-black/20 hover:bg-[#1f2327]' : 'border-black/8 bg-white shadow-black/5 hover:bg-[#fbfbfc]'}`}
      onClick={() => onAdd(product)}
    >
      <span className={`grid h-11 w-11 place-items-center rounded-[16px] text-sm font-black ring-1 lg:h-10 lg:w-10 ${dark ? 'bg-[#1d3d5e] text-[#8fc2ff] ring-white/10' : 'bg-[#eef6ff] text-[#1256a1] ring-[#cfe0ff]'}`}>
        {initials}
      </span>
      <span>
        <span className={`line-clamp-2 block text-base font-bold leading-tight lg:text-lg ${dark ? 'text-white' : 'text-[#202223]'}`}>{product.name}</span>
        <span className={`mt-2 block text-sm font-semibold ${dark ? 'text-white/58' : 'text-[#5f6368]'}`}>{formatCurrency(product.price, currency)}</span>
      </span>
    </button>
  )
}

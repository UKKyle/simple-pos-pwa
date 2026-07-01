import { ArrowLeft, ChevronRight, Search, Tag, Truck, UserRound } from 'lucide-react'
import { useEffect, useMemo, useState } from 'react'
import { CartPanel } from '../components/CartPanel'
import { ProductTile } from '../components/ProductTile'
import type { CartItem, PaymentMethod, Product } from '../types'

interface PosPageProps {
  products: Product[]
  cartItems: CartItem[]
  totals: { subtotal: number; total: number; itemCount: number }
  currency: string
  customerEmail: string
  paymentMethod: PaymentMethod | ''
  checkoutError: string | null
  onAddProduct: (product: Product) => void
  onCustomerEmailChange: (value: string) => void
  onPaymentMethodChange: (value: PaymentMethod) => void
  onQuantityChange: (productId: string, value: number) => void
  onRemoveItem: (productId: string) => void
  onClearCart: () => void
  onCheckout: () => void
}

const quickActions = [
  { label: 'Custom sale', icon: Tag },
  { label: 'Delivery fee', icon: Truck },
  { label: 'Attribute staff', icon: UserRound },
]

export function PosPage({
  products,
  cartItems,
  totals,
  currency,
  customerEmail,
  paymentMethod,
  checkoutError,
  onAddProduct,
  onCustomerEmailChange,
  onPaymentMethodChange,
  onQuantityChange,
  onRemoveItem,
  onClearCart,
  onCheckout,
}: PosPageProps) {
  const [search, setSearch] = useState('')
  const [selectedTag, setSelectedTag] = useState<string | null>(null)

  const activeProducts = useMemo(() => {
    const term = search.trim().toLowerCase()
    return products.filter((product) => product.active && (!term || product.name.toLowerCase().includes(term) || product.tag?.toLowerCase().includes(term)))
  }, [products, search])

  const groupedProducts = useMemo(() => {
    const groups = new Map<string, Product[]>()

    for (const product of activeProducts) {
      const tag = product.tag?.trim()
      if (!tag) continue
      groups.set(tag, [...(groups.get(tag) ?? []), product])
    }

    return [...groups.entries()]
      .map(([tag, items]) => ({
        tag,
        items: items.sort((left, right) => left.name.localeCompare(right.name)),
      }))
      .sort((left, right) => left.tag.localeCompare(right.tag))
  }, [activeProducts])

  useEffect(() => {
    if (selectedTag && !groupedProducts.some((group) => group.tag === selectedTag)) {
      setSelectedTag(null)
    }
  }, [groupedProducts, selectedTag])

  const selectedGroup = useMemo(
    () => groupedProducts.find((group) => group.tag === selectedTag) ?? null,
    [groupedProducts, selectedTag],
  )

  const visibleGroups = useMemo(() => {
    if (selectedTag) return []
    const term = search.trim().toLowerCase()

    return groupedProducts.filter((group) => {
      if (!term) return true
      return (
        group.tag.toLowerCase().includes(term) ||
        group.items.some((product) => product.name.toLowerCase().includes(term))
      )
    })
  }, [groupedProducts, search, selectedTag])

  const visibleUngroupedProducts = useMemo(() => {
    if (selectedTag) return []

    return activeProducts.filter((product) => !product.tag?.trim())
  }, [activeProducts, selectedTag])

  const visibleProducts = selectedGroup?.items ?? visibleUngroupedProducts
  const searchPlaceholder = selectedGroup ? `Search ${selectedGroup.tag.toLowerCase()}` : 'Search products or collections'

  return (
    <div className="grid h-full min-h-0 gap-4 lg:grid-cols-[minmax(0,1fr)_360px] lg:overflow-hidden xl:grid-cols-[minmax(0,1fr)_420px]">
      <section className="grid min-h-0 min-w-0 grid-rows-[auto_minmax(0,1fr)] rounded-3xl border border-white/8 bg-zinc-950/70 p-4 shadow-2xl shadow-black/20">
        <div className="space-y-4">
          <label className="relative block">
            <span className="sr-only">Search products</span>
            <Search className="pointer-events-none absolute left-4 top-1/2 h-5 w-5 -translate-y-1/2 text-zinc-400" aria-hidden="true" />
            <input
              className="h-14 w-full rounded-2xl border border-white/10 bg-zinc-900 pl-12 pr-4 text-lg font-semibold text-white outline-none placeholder:text-zinc-500 focus:border-blue-500 focus:ring-2 focus:ring-blue-500/30"
              value={search}
              onChange={(event) => setSearch(event.target.value)}
              placeholder={searchPlaceholder}
            />
          </label>

          {selectedGroup ? (
            <button
              className="inline-flex h-11 items-center gap-2 rounded-xl border border-white/10 bg-zinc-900 px-4 text-sm font-bold text-zinc-200 transition hover:border-blue-400/50 hover:text-white"
              onClick={() => setSelectedTag(null)}
            >
              <ArrowLeft className="h-4 w-4" aria-hidden="true" />
              Back to collections
            </button>
          ) : (
            <div className="flex items-center justify-between rounded-2xl border border-white/8 bg-zinc-900/60 px-4 py-3">
              <div>
                <p className="text-xs font-bold uppercase tracking-[0.18em] text-blue-300">Collections</p>
                <p className="mt-1 text-sm text-zinc-400">Grouped tags appear as a clean browse list before the individual products.</p>
              </div>
              <div className="rounded-full bg-blue-500/15 px-3 py-1 text-xs font-bold text-blue-200 ring-1 ring-blue-400/20">
                {visibleGroups.length} grouped
              </div>
            </div>
          )}
        </div>

        <div className="mt-4 grid min-h-0 content-start gap-3 overflow-auto pr-1 sm:grid-cols-2 lg:auto-rows-fr 2xl:grid-cols-3">
          {!selectedGroup &&
            visibleGroups.map((group) => (
              <button
                key={group.tag}
                className="group col-span-full flex items-center justify-between rounded-2xl border border-white/8 bg-zinc-900/85 px-4 py-4 text-left shadow-sm transition hover:border-blue-400/50 hover:bg-zinc-800 focus:outline-none focus:ring-2 focus:ring-blue-500"
                onClick={() => setSelectedTag(group.tag)}
              >
                <div className="flex min-w-0 items-center gap-4">
                  <span className="grid h-11 w-11 shrink-0 place-items-center rounded-2xl bg-blue-500/15 text-sm font-black text-blue-200 ring-1 ring-blue-400/20">
                    {group.tag.slice(0, 2).toUpperCase()}
                  </span>
                  <span className="min-w-0">
                    <span className="block truncate text-base font-bold leading-tight text-white">{group.tag}</span>
                    <span className="mt-1 block text-sm font-medium text-zinc-400">
                      {group.items.length} product{group.items.length === 1 ? '' : 's'}
                    </span>
                  </span>
                </div>
                <span className="flex items-center gap-3">
                  <span className="hidden text-sm font-semibold text-zinc-500 md:inline">
                    View
                  </span>
                  <ChevronRight className="h-5 w-5 text-zinc-500 transition group-hover:text-blue-200" aria-hidden="true" />
                </span>
              </button>
            ))}

          {visibleProducts.map((product) => (
            <ProductTile key={product.id} product={product} currency={currency} onAdd={onAddProduct} />
          ))}

          {!selectedGroup &&
            quickActions.map(({ label, icon: Icon }) => (
              <div key={label} className="flex min-h-32 flex-col justify-between rounded-2xl border border-white/8 bg-zinc-900 p-4 lg:min-h-28">
                <Icon className="h-6 w-6 text-blue-400" aria-hidden="true" />
                <p className="text-base font-bold text-white lg:text-lg">{label}</p>
              </div>
            ))}

          {selectedGroup && visibleProducts.length === 0 && (
            <div className="col-span-full grid min-h-40 place-items-center rounded-2xl border border-dashed border-white/10 bg-zinc-900/60 p-6 text-center">
              <div>
                <p className="text-lg font-bold text-white">No matching products</p>
                <p className="mt-1 text-sm text-zinc-500">Try a different search or go back to all collections.</p>
              </div>
            </div>
          )}
        </div>
      </section>

      <CartPanel
        items={cartItems}
        subtotal={totals.subtotal}
        total={totals.total}
        itemCount={totals.itemCount}
        currency={currency}
        customerEmail={customerEmail}
        paymentMethod={paymentMethod}
        error={checkoutError}
        onCustomerEmailChange={onCustomerEmailChange}
        onPaymentMethodChange={onPaymentMethodChange}
        onQuantityChange={onQuantityChange}
        onRemove={onRemoveItem}
        onClear={onClearCart}
        onCheckout={onCheckout}
      />
    </div>
  )
}

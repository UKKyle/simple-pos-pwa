import { ArrowLeft, ChevronRight, Layers3, Receipt, Search } from 'lucide-react'
import { useEffect, useMemo, useState } from 'react'
import { CartPanel } from '../components/CartPanel'
import { ProductTile } from '../components/ProductTile'
import type { CartItem, PaymentMethod, Product } from '../types'
import { formatCurrency } from '../utils/currency'

interface PosPageProps {
  products: Product[]
  cartItems: CartItem[]
  totals: { subtotal: number; total: number; itemCount: number }
  currency: string
  customerName: string
  customerEmail: string
  customerPhone: string
  paymentMethod: PaymentMethod | ''
  checkoutError: string | null
  onAddProduct: (product: Product) => void
  onCustomerNameChange: (value: string) => void
  onCustomerEmailChange: (value: string) => void
  onCustomerPhoneChange: (value: string) => void
  onPaymentMethodChange: (value: PaymentMethod) => void
  onQuantityChange: (productId: string, value: number) => void
  onRemoveItem: (productId: string) => void
  onClearCart: () => void
  onCheckout: () => void
}

export function PosPage({
  products,
  cartItems,
  totals,
  currency,
  customerName,
  customerEmail,
  customerPhone,
  paymentMethod,
  checkoutError,
  onAddProduct,
  onCustomerNameChange,
  onCustomerEmailChange,
  onCustomerPhoneChange,
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
  const collectionCount = groupedProducts.length
  const summaryCards = [
    {
      label: 'Collections',
      value: String(collectionCount),
      detail: collectionCount === 1 ? 'Tagged group' : 'Tagged groups',
      icon: Layers3,
    },
    {
      label: 'Visible products',
      value: String(visibleProducts.length),
      detail: selectedGroup ? selectedGroup.tag : 'Ready to sell',
      icon: Receipt,
    },
  ]

  return (
    <div className="grid h-full min-h-0 gap-4 lg:grid-cols-[minmax(0,1fr)_380px] lg:overflow-hidden xl:grid-cols-[minmax(0,1fr)_430px]">
      <section className="grid min-h-0 min-w-0 grid-rows-[auto_minmax(0,1fr)] rounded-[26px] border border-black/8 bg-white p-4 shadow-xl shadow-black/8">
        <div className="space-y-4">
          <label className="relative block">
            <span className="sr-only">Search products</span>
            <Search className="pointer-events-none absolute left-4 top-1/2 h-5 w-5 -translate-y-1/2 text-[#6d7175]" aria-hidden="true" />
            <input
              className="h-14 w-full rounded-[20px] border border-black/8 bg-[#f8fafc] pl-12 pr-4 text-lg font-semibold text-[#202223] outline-none placeholder:text-[#9aa0a6] focus:border-[#008060] focus:bg-white focus:ring-2 focus:ring-[#008060]/20"
              value={search}
              onChange={(event) => setSearch(event.target.value)}
              placeholder={searchPlaceholder}
            />
          </label>

          {selectedGroup ? (
            <button
              className="inline-flex h-11 items-center gap-2 rounded-[16px] border border-black/8 bg-[#f8fafc] px-4 text-sm font-bold text-[#202223] transition hover:bg-[#eef6ff]"
              onClick={() => setSelectedTag(null)}
            >
              <ArrowLeft className="h-4 w-4" aria-hidden="true" />
              Back to collections
            </button>
          ) : null}
        </div>

        <div className={`mt-4 min-h-0 overflow-auto pr-1 ${selectedGroup ? 'space-y-3' : 'grid content-start gap-3 sm:grid-cols-2 lg:auto-rows-fr 2xl:grid-cols-3'}`}>
          {!selectedGroup &&
            visibleGroups.map((group) => (
              <button
                key={group.tag}
                className="group col-span-full flex items-center justify-between rounded-[22px] border border-black/8 bg-[#fbfbfc] px-4 py-4 text-left shadow-sm transition hover:border-[#008060]/35 hover:bg-white hover:shadow-md focus:outline-none focus:ring-2 focus:ring-[#008060]/25"
                onClick={() => setSelectedTag(group.tag)}
              >
                <div className="flex min-w-0 items-center gap-4">
                  <span className="grid h-11 w-11 shrink-0 place-items-center rounded-[16px] bg-[#eef6ff] text-sm font-black text-[#1256a1] ring-1 ring-[#cfe0ff]">
                    {group.tag.slice(0, 2).toUpperCase()}
                  </span>
                  <span className="min-w-0">
                    <span className="block truncate text-base font-bold leading-tight text-[#202223]">{group.tag}</span>
                    <span className="mt-1 block text-sm font-medium text-[#6d7175]">
                      {group.items.length} product{group.items.length === 1 ? '' : 's'}
                    </span>
                  </span>
                </div>
                <span className="flex items-center gap-3">
                  <span className="hidden text-sm font-semibold text-[#6d7175] md:inline">
                    View
                  </span>
                  <ChevronRight className="h-5 w-5 text-[#9aa0a6] transition group-hover:text-[#008060]" aria-hidden="true" />
                </span>
              </button>
            ))}

          {!selectedGroup && visibleGroups.length > 0 && visibleUngroupedProducts.length > 0 && (
            <div className="col-span-full mt-1 flex items-center gap-3 px-1 pt-2">
              <div className="h-px flex-1 bg-black/8" />
              <p className="text-[11px] font-bold uppercase tracking-[0.2em] text-[#6d7175]">Products</p>
              <div className="h-px flex-1 bg-black/8" />
            </div>
          )}

          {selectedGroup
            ? visibleProducts.map((product) => {
                const initials = product.name
                  .split(' ')
                  .slice(0, 2)
                  .map((word) => word[0])
                  .join('')
                  .toUpperCase()

                return (
                  <button
                    key={product.id}
                    className="group flex w-full items-center gap-4 rounded-[22px] border border-black/8 bg-[#fbfbfc] px-4 py-4 text-left shadow-sm transition hover:border-[#008060]/35 hover:bg-white hover:shadow-md focus:outline-none focus:ring-2 focus:ring-[#008060]/25"
                    onClick={() => onAddProduct(product)}
                  >
                    <span className="grid h-12 w-12 shrink-0 place-items-center rounded-[16px] bg-[#eef6ff] text-sm font-black text-[#1256a1] ring-1 ring-[#cfe0ff]">
                      {initials}
                    </span>
                    <span className="min-w-0 flex-1">
                      <span className="block truncate text-base font-bold leading-tight text-[#202223]">
                        {product.name}
                      </span>
                      <span className="mt-1 block text-sm font-medium text-[#6d7175]">
                        Tap to add to basket
                      </span>
                    </span>
                    <span className="shrink-0 text-right">
                      <span className="block text-base font-black text-[#202223]">
                        {formatCurrency(product.price, currency)}
                      </span>
                      <span className="mt-1 block text-xs font-bold uppercase tracking-[0.16em] text-[#6d7175] transition group-hover:text-[#008060]">
                        Add
                      </span>
                    </span>
                  </button>
                )
              })
            : visibleProducts.map((product) => (
                <ProductTile key={product.id} product={product} currency={currency} onAdd={onAddProduct} />
              ))}

          {!selectedGroup &&
            summaryCards.map(({ label, value, detail, icon: Icon }) => (
              <div key={label} className="flex min-h-28 flex-col justify-between rounded-[22px] border border-black/8 bg-[#fbfbfc] p-4 shadow-sm">
                <Icon className="h-5 w-5 text-[#1256a1]" aria-hidden="true" />
                <div>
                  <p className="text-2xl font-black text-[#202223]">{value}</p>
                  <p className="mt-1 text-sm font-semibold text-[#5f6368]">{label}</p>
                  <p className="mt-1 text-xs font-medium uppercase tracking-[0.16em] text-[#6d7175]">{detail}</p>
                </div>
              </div>
            ))}

          {selectedGroup && visibleProducts.length === 0 && (
            <div className="grid min-h-40 place-items-center rounded-[22px] border border-dashed border-black/12 bg-[#f8fafc] p-6 text-center">
              <div>
                <p className="text-lg font-bold text-[#202223]">No matching products</p>
                <p className="mt-1 text-sm text-[#6d7175]">Try a different search or go back to all collections.</p>
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
        customerName={customerName}
        customerEmail={customerEmail}
        customerPhone={customerPhone}
        paymentMethod={paymentMethod}
        error={checkoutError}
        onCustomerNameChange={onCustomerNameChange}
        onCustomerEmailChange={onCustomerEmailChange}
        onCustomerPhoneChange={onCustomerPhoneChange}
        onPaymentMethodChange={onPaymentMethodChange}
        onQuantityChange={onQuantityChange}
        onRemove={onRemoveItem}
        onClear={onClearCart}
        onCheckout={onCheckout}
      />
    </div>
  )
}

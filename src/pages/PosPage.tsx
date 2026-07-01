import { Search, Tag, Truck, UserRound } from 'lucide-react'
import { useMemo, useState } from 'react'
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

  const activeProducts = useMemo(() => {
    const term = search.trim().toLowerCase()
    return products.filter((product) => product.active && (!term || product.name.toLowerCase().includes(term)))
  }, [products, search])

  return (
    <div className="grid h-full gap-4 lg:grid-cols-[minmax(0,1fr)_360px] xl:grid-cols-[minmax(0,1fr)_420px]">
      <section className="min-w-0 rounded-3xl border border-white/8 bg-zinc-950/70 p-4">
        <label className="relative block">
          <span className="sr-only">Search products</span>
          <Search className="pointer-events-none absolute left-4 top-1/2 h-5 w-5 -translate-y-1/2 text-zinc-400" aria-hidden="true" />
          <input
            className="h-14 w-full rounded-2xl border border-white/10 bg-zinc-900 pl-12 pr-4 text-lg font-semibold text-white outline-none placeholder:text-zinc-500 focus:border-blue-500 focus:ring-2 focus:ring-blue-500/30"
            value={search}
            onChange={(event) => setSearch(event.target.value)}
            placeholder="Search products"
          />
        </label>

        <div className="mt-4 grid grid-cols-1 gap-3 sm:grid-cols-2 2xl:grid-cols-3">
          {activeProducts.map((product) => (
            <ProductTile key={product.id} product={product} currency={currency} onAdd={onAddProduct} />
          ))}
          {quickActions.map(({ label, icon: Icon }) => (
            <div key={label} className="flex min-h-36 flex-col justify-between rounded-2xl border border-white/8 bg-zinc-900 p-4">
              <Icon className="h-6 w-6 text-blue-400" aria-hidden="true" />
              <p className="text-lg font-bold text-white">{label}</p>
            </div>
          ))}
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

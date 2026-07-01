import { CreditCard, Receipt, Trash2, UserRound, WalletCards } from 'lucide-react'
import type { CartItem, PaymentMethod } from '../types'
import { formatCurrency } from '../utils/currency'
import { QuantityStepper } from './QuantityStepper'

interface CartPanelProps {
  items: CartItem[]
  subtotal: number
  total: number
  itemCount: number
  currency: string
  customerEmail: string
  paymentMethod: PaymentMethod | ''
  error: string | null
  onCustomerEmailChange: (value: string) => void
  onPaymentMethodChange: (value: PaymentMethod) => void
  onQuantityChange: (productId: string, value: number) => void
  onRemove: (productId: string) => void
  onClear: () => void
  onCheckout: () => void
}

export function CartPanel({
  items,
  subtotal,
  total,
  itemCount,
  currency,
  customerEmail,
  paymentMethod,
  error,
  onCustomerEmailChange,
  onPaymentMethodChange,
  onQuantityChange,
  onRemove,
  onClear,
  onCheckout,
}: CartPanelProps) {
  return (
    <aside className="flex h-full min-h-[70vh] min-w-0 flex-col overflow-hidden rounded-3xl border border-white/10 bg-zinc-950 p-4 shadow-2xl lg:min-h-0 lg:max-h-full">
      <div className="mb-4 flex items-center justify-between">
        <div>
          <h2 className="text-2xl font-black text-white">Basket</h2>
          <p className="text-sm text-zinc-400">{itemCount} items</p>
        </div>
        <button className="rounded-xl p-2 text-zinc-400 hover:bg-white/10 hover:text-white disabled:opacity-40" onClick={onClear} disabled={items.length === 0} aria-label="Clear basket">
          <Trash2 className="h-5 w-5" aria-hidden="true" />
        </button>
      </div>

      <label className="mb-4 block">
        <span className="mb-2 flex items-center gap-2 text-sm font-semibold text-zinc-300">
          <UserRound className="h-4 w-4 text-blue-400" aria-hidden="true" />
          Customer email
        </span>
        <input
          className="h-12 w-full rounded-xl border border-white/10 bg-zinc-900 px-4 text-white outline-none transition placeholder:text-zinc-500 focus:border-blue-500 focus:ring-2 focus:ring-blue-500/30"
          type="email"
          value={customerEmail}
          onChange={(event) => onCustomerEmailChange(event.target.value)}
          placeholder="optional@email.co.uk"
        />
      </label>

      <div className="min-h-0 flex-1 space-y-3 overflow-auto pr-1">
        {items.length === 0 ? (
          <div className="grid h-56 place-items-center rounded-2xl border border-dashed border-white/10 bg-white/[0.03] text-center">
            <div>
              <Receipt className="mx-auto mb-3 h-8 w-8 text-zinc-500" aria-hidden="true" />
              <p className="font-bold text-white">Basket is empty</p>
              <p className="mt-1 text-sm text-zinc-500">Tap a product tile to start an order.</p>
            </div>
          </div>
        ) : (
          items.map((item) => (
            <div key={item.productId} className="rounded-2xl bg-zinc-900 p-3">
              <div className="flex items-start justify-between gap-3">
                <div>
                  <p className="font-bold text-white">{item.name}</p>
                  <p className="mt-1 text-sm text-zinc-400">{formatCurrency(item.price, currency)} each</p>
                </div>
                <p className="shrink-0 font-bold text-white">{formatCurrency(item.price * item.quantity, currency)}</p>
              </div>
              <div className="mt-3 grid grid-cols-[1fr_auto] gap-3">
                <QuantityStepper value={item.quantity} onChange={(value) => onQuantityChange(item.productId, value)} />
                <button className="grid h-11 w-11 place-items-center rounded-xl bg-zinc-800 text-zinc-300 hover:bg-red-500/20 hover:text-red-200" onClick={() => onRemove(item.productId)} aria-label={`Remove ${item.name}`}>
                  <Trash2 className="h-4 w-4" aria-hidden="true" />
                </button>
              </div>
            </div>
          ))
        )}
      </div>

      <div className="mt-4 space-y-4 border-t border-white/10 pt-4">
        <div className="grid grid-cols-2 gap-2">
          {(['card', 'cash'] as const).map((method) => (
            <button
              key={method}
              className={`flex h-12 items-center justify-center gap-2 rounded-xl border text-sm font-bold capitalize transition ${
                paymentMethod === method ? 'border-blue-400 bg-blue-500 text-white' : 'border-white/10 bg-zinc-900 text-zinc-300 hover:bg-zinc-800'
              }`}
              onClick={() => onPaymentMethodChange(method)}
            >
              {method === 'card' ? <CreditCard className="h-4 w-4" aria-hidden="true" /> : <WalletCards className="h-4 w-4" aria-hidden="true" />}
              {method}
            </button>
          ))}
        </div>
        <dl className="space-y-2 text-sm">
          <div className="flex justify-between text-zinc-400">
            <dt>Subtotal</dt>
            <dd>{formatCurrency(subtotal, currency)}</dd>
          </div>
          <div className="flex justify-between text-xl font-black text-white">
            <dt>Total</dt>
            <dd>{formatCurrency(total, currency)}</dd>
          </div>
        </dl>
        {error && <p className="rounded-xl bg-red-500/10 px-3 py-2 text-sm font-semibold text-red-200">{error}</p>}
        <button
          className="h-14 w-full rounded-2xl bg-blue-500 text-base font-black text-white shadow-lg shadow-blue-500/20 transition hover:bg-blue-400 disabled:cursor-not-allowed disabled:bg-zinc-800 disabled:text-zinc-500 disabled:shadow-none"
          onClick={onCheckout}
          disabled={items.length === 0}
        >
          Mark paid
        </button>
      </div>
    </aside>
  )
}

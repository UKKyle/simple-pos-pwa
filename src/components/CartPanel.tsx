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
  customerName: string
  customerEmail: string
  customerPhone: string
  paymentMethod: PaymentMethod | ''
  error: string | null
  onCustomerNameChange: (value: string) => void
  onCustomerEmailChange: (value: string) => void
  onCustomerPhoneChange: (value: string) => void
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
  customerName,
  customerEmail,
  customerPhone,
  paymentMethod,
  error,
  onCustomerNameChange,
  onCustomerEmailChange,
  onCustomerPhoneChange,
  onPaymentMethodChange,
  onQuantityChange,
  onRemove,
  onClear,
  onCheckout,
}: CartPanelProps) {
  return (
    <aside className="flex h-full min-h-[70vh] min-w-0 flex-col overflow-hidden rounded-[26px] border border-black/8 bg-white p-4 shadow-xl shadow-black/8 lg:min-h-0 lg:max-h-full">
      <div className="mb-4 flex items-center justify-between">
        <div>
          <h2 className="text-2xl font-black text-[#202223]">Cart</h2>
          <p className="text-sm font-semibold text-[#6d7175]">{itemCount} items</p>
        </div>
        <button className="rounded-[14px] p-2 text-[#6d7175] hover:bg-[#f1f2f4] hover:text-[#202223] disabled:opacity-40" onClick={onClear} disabled={items.length === 0} aria-label="Clear basket">
          <Trash2 className="h-5 w-5" aria-hidden="true" />
        </button>
      </div>

      <div className="mb-4 grid gap-2 rounded-[22px] bg-[#f8fafc] p-3">
        <label className="block">
          <span className="mb-1.5 flex items-center gap-2 text-xs font-black uppercase tracking-[0.14em] text-[#6d7175]">
            <UserRound className="h-4 w-4 text-[#1256a1]" aria-hidden="true" />
            Customer name
          </span>
          <input
            className="h-11 w-full rounded-[16px] border border-black/8 bg-white px-3 text-[#202223] outline-none transition placeholder:text-[#9aa0a6] focus:border-[#008060] focus:ring-2 focus:ring-[#008060]/20"
            value={customerName}
            onChange={(event) => onCustomerNameChange(event.target.value)}
            placeholder="Optional walk-in name"
          />
        </label>

        <label className="block">
          <span className="mb-1.5 flex items-center gap-2 text-xs font-black uppercase tracking-[0.14em] text-[#6d7175]">
            <UserRound className="h-4 w-4 text-[#1256a1]" aria-hidden="true" />
            Customer email
          </span>
          <input
            className="h-11 w-full rounded-[16px] border border-black/8 bg-white px-3 text-[#202223] outline-none transition placeholder:text-[#9aa0a6] focus:border-[#008060] focus:ring-2 focus:ring-[#008060]/20"
            type="email"
            value={customerEmail}
            onChange={(event) => onCustomerEmailChange(event.target.value)}
            placeholder="optional@email.co.uk"
          />
        </label>

        <label className="block">
          <span className="mb-1.5 flex items-center gap-2 text-xs font-black uppercase tracking-[0.14em] text-[#6d7175]">
            <UserRound className="h-4 w-4 text-[#1256a1]" aria-hidden="true" />
            Customer phone
          </span>
          <input
            className="h-11 w-full rounded-[16px] border border-black/8 bg-white px-3 text-[#202223] outline-none transition placeholder:text-[#9aa0a6] focus:border-[#008060] focus:ring-2 focus:ring-[#008060]/20"
            type="tel"
            value={customerPhone}
            onChange={(event) => onCustomerPhoneChange(event.target.value)}
            placeholder="Optional contact number"
          />
        </label>
      </div>

      <div className="min-h-0 flex-1 space-y-3 overflow-auto pr-1">
        {items.length === 0 ? (
          <div className="grid h-56 place-items-center rounded-[22px] border border-dashed border-black/12 bg-[#f8fafc] text-center">
            <div>
              <Receipt className="mx-auto mb-3 h-8 w-8 text-[#9aa0a6]" aria-hidden="true" />
              <p className="font-bold text-[#202223]">Cart is empty</p>
              <p className="mt-1 text-sm text-[#6d7175]">Tap a product tile to start an order.</p>
            </div>
          </div>
        ) : (
          items.map((item) => (
            <div key={item.productId} className="rounded-[20px] border border-black/8 bg-[#fbfbfc] p-3">
              <div className="flex items-start justify-between gap-3">
                <div>
                  <p className="font-bold text-[#202223]">{item.name}</p>
                  <p className="mt-1 text-sm text-[#6d7175]">{formatCurrency(item.price, currency)} each</p>
                </div>
                <p className="shrink-0 font-bold text-[#202223]">{formatCurrency(item.price * item.quantity, currency)}</p>
              </div>
              <div className="mt-3 grid grid-cols-[1fr_auto] gap-3">
                <QuantityStepper value={item.quantity} onChange={(value) => onQuantityChange(item.productId, value)} />
                <button className="grid h-11 w-11 place-items-center rounded-[14px] bg-white text-[#6d7175] ring-1 ring-black/8 hover:bg-[#fff0f0] hover:text-[#a12018]" onClick={() => onRemove(item.productId)} aria-label={`Remove ${item.name}`}>
                  <Trash2 className="h-4 w-4" aria-hidden="true" />
                </button>
              </div>
            </div>
          ))
        )}
      </div>

      <div className="mt-4 space-y-4 border-t border-black/8 pt-4">
        <div className="grid grid-cols-2 gap-2">
          {(['card', 'cash'] as const).map((method) => (
            <button
              key={method}
              className={`flex h-12 items-center justify-center gap-2 rounded-[16px] border text-sm font-bold capitalize transition ${
                paymentMethod === method ? 'border-[#008060] bg-[#008060] text-white' : 'border-black/8 bg-[#f8fafc] text-[#5f6368] hover:bg-[#eef6ff]'
              }`}
              onClick={() => onPaymentMethodChange(method)}
            >
              {method === 'card' ? <CreditCard className="h-4 w-4" aria-hidden="true" /> : <WalletCards className="h-4 w-4" aria-hidden="true" />}
              {method}
            </button>
          ))}
        </div>
        <dl className="space-y-2 rounded-[20px] bg-[#f8fafc] p-4 text-sm">
          <div className="flex justify-between text-[#6d7175]">
            <dt>Subtotal</dt>
            <dd>{formatCurrency(subtotal, currency)}</dd>
          </div>
          <div className="flex justify-between text-xl font-black text-[#202223]">
            <dt>Total</dt>
            <dd>{formatCurrency(total, currency)}</dd>
          </div>
        </dl>
        {error && <p className="rounded-[16px] bg-[#fff0f0] px-3 py-2 text-sm font-semibold text-[#a12018]">{error}</p>}
        <button
          className="h-14 w-full rounded-[20px] bg-[#008060] text-base font-black text-white shadow-lg shadow-[#008060]/20 transition hover:bg-[#006e52] disabled:cursor-not-allowed disabled:bg-[#d6d9dc] disabled:text-white disabled:shadow-none"
          onClick={onCheckout}
          disabled={items.length === 0}
        >
          Mark paid
        </button>
      </div>
    </aside>
  )
}

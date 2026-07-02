import { CloudUpload, Download, ReceiptText, Search, Trash2 } from 'lucide-react'
import { useMemo, useState } from 'react'
import { EmptyState } from '../components/EmptyState'
import { Modal } from '../components/Modal'
import type { Order, OrderSyncStatus, PaymentMethod } from '../types'
import { downloadOrdersCsv } from '../utils/csv'
import { formatCurrency } from '../utils/currency'

interface OrdersPageProps {
  orders: Order[]
  currency: string
  theme: 'light' | 'dark'
  syncing: boolean
  onDeleteOrder: (id: string) => void
  onSyncPendingOrders: () => void
}

function syncBadgeTone(status: OrderSyncStatus) {
  if (status === 'synced') return 'bg-emerald-500/15 text-emerald-200'
  if (status === 'failed') return 'bg-amber-500/15 text-amber-100'
  return 'bg-blue-500/15 text-blue-200'
}

export function OrdersPage({ orders, currency, theme, syncing, onDeleteOrder, onSyncPendingOrders }: OrdersPageProps) {
  const dark = theme === 'dark'
  const [search, setSearch] = useState('')
  const [method, setMethod] = useState<'all' | PaymentMethod>('all')
  const [selected, setSelected] = useState<Order | null>(null)

  const filtered = useMemo(() => {
    const term = search.trim().toLowerCase()
    return orders.filter((order) => {
      const matchesMethod = method === 'all' || order.paymentMethod === method
      const matchesSearch =
        !term ||
        order.orderNumber.toLowerCase().includes(term) ||
        order.customerEmail?.toLowerCase().includes(term) ||
        order.customerName?.toLowerCase().includes(term) ||
        order.cmsOrderId?.toLowerCase().includes(term)
      return matchesMethod && matchesSearch
    })
  }, [orders, search, method])

  const pendingCount = orders.filter((order) => order.syncStatus === 'pending' || order.syncStatus === 'failed').length

  return (
    <section className={`grid h-full min-h-0 grid-rows-[auto_auto_minmax(0,1fr)] rounded-3xl border p-4 shadow-2xl ${dark ? 'border-white/8 bg-zinc-950/70 shadow-black/20' : 'border-black/8 bg-white shadow-black/8'}`}>
      <div className="mb-4 flex flex-col gap-3 xl:flex-row xl:items-center xl:justify-between">
        <div>
          <h2 className={`text-2xl font-black ${dark ? 'text-white' : 'text-[#202223]'}`}>Orders</h2>
          <p className={`text-sm ${dark ? 'text-zinc-400' : 'text-[#6d7175]'}`}>Local-first history with CMS sync tracking.</p>
        </div>
        <div className="flex flex-col gap-2 sm:flex-row">
          <button
            className={`inline-flex h-11 items-center justify-center gap-2 rounded-xl px-4 text-sm font-bold disabled:opacity-40 ${dark ? 'bg-zinc-900 text-white hover:bg-zinc-800' : 'bg-[#f1f2f4] text-[#202223] hover:bg-[#e7e9eb]'}`}
            onClick={onSyncPendingOrders}
            disabled={pendingCount === 0 || syncing}
          >
            <CloudUpload className="h-4 w-4" aria-hidden="true" />
            {syncing ? 'Syncing...' : `Sync pending orders${pendingCount ? ` (${pendingCount})` : ''}`}
          </button>
          <button className={`inline-flex h-11 items-center justify-center gap-2 rounded-xl px-4 text-sm font-bold disabled:opacity-40 ${dark ? 'bg-zinc-900 text-white hover:bg-zinc-800' : 'bg-[#f1f2f4] text-[#202223] hover:bg-[#e7e9eb]'}`} onClick={() => downloadOrdersCsv(filtered)} disabled={filtered.length === 0}>
            <Download className="h-4 w-4" aria-hidden="true" />
            Export CSV
          </button>
        </div>
      </div>

      <div className="mb-4 grid gap-3 md:grid-cols-[1fr_auto]">
        <label className="relative block">
          <span className="sr-only">Search orders</span>
          <Search className={`pointer-events-none absolute left-4 top-1/2 h-5 w-5 -translate-y-1/2 ${dark ? 'text-zinc-400' : 'text-[#6d7175]'}`} aria-hidden="true" />
          <input className={`h-12 w-full rounded-xl border pl-12 pr-4 outline-none focus:border-[#008060] focus:ring-2 focus:ring-[#008060]/20 ${dark ? 'border-white/10 bg-zinc-900 text-white' : 'border-black/8 bg-[#f8fafc] text-[#202223]'}`} value={search} onChange={(event) => setSearch(event.target.value)} placeholder="Search reference, customer, email, or CMS order ID" />
        </label>
        <div className={`grid grid-cols-3 rounded-xl p-1 ${dark ? 'bg-zinc-900' : 'bg-[#f1f2f4]'}`}>
          {(['all', 'card', 'cash'] as const).map((option) => (
            <button key={option} className={`h-10 rounded-lg px-4 text-sm font-bold capitalize ${method === option ? 'bg-[#008060] text-white' : dark ? 'text-zinc-400 hover:text-white' : 'text-[#5f6368] hover:bg-white hover:text-[#202223]'}`} onClick={() => setMethod(option)}>
              {option}
            </button>
          ))}
        </div>
      </div>

      {filtered.length === 0 ? (
        <div className="min-h-0 overflow-auto">
          <EmptyState icon={ReceiptText} title="No orders found" body="Completed checkouts will be saved here first, then synced to the Baked By Mady CMS." theme={theme} />
        </div>
      ) : (
        <div className="grid min-h-0 gap-3 overflow-auto pr-1">
          {filtered.map((order) => (
            <button key={order.id} className={`grid gap-3 rounded-2xl border p-4 text-left transition hover:border-[#008060]/50 md:grid-cols-[1fr_auto] ${dark ? 'border-white/8 bg-zinc-900 hover:bg-zinc-800' : 'border-black/8 bg-[#fbfbfc] hover:bg-white'}`} onClick={() => setSelected(order)}>
              <div>
                <div className="flex flex-wrap items-center gap-2">
                  <p className={`text-lg font-black ${dark ? 'text-white' : 'text-[#202223]'}`}>{order.orderNumber}</p>
                  <span className={`rounded-full px-2.5 py-1 text-xs font-bold uppercase tracking-[0.12em] ${syncBadgeTone(order.syncStatus)}`}>
                    {order.syncStatus}
                  </span>
                </div>
                <p className={`mt-1 text-sm ${dark ? 'text-zinc-400' : 'text-[#6d7175]'}`}>{new Date(order.createdAt).toLocaleString('en-GB')}</p>
                <p className={`mt-1 text-sm ${dark ? 'text-zinc-300' : 'text-[#5f6368]'}`}>{order.customerName || order.customerEmail || 'Walk-in customer'}</p>
                {order.cmsOrderNumber ? (
                  <p className="mt-1 text-sm text-blue-300">CMS #{order.cmsOrderNumber}</p>
                ) : (
                  <p className="mt-1 text-sm text-amber-200">{order.syncError || 'Awaiting CMS sync'}</p>
                )}
              </div>
              <div className="text-left md:text-right">
                <p className={`text-xl font-black ${dark ? 'text-white' : 'text-[#202223]'}`}>{formatCurrency(order.total, currency)}</p>
                <p className={`mt-1 text-sm font-semibold capitalize ${dark ? 'text-zinc-400' : 'text-[#6d7175]'}`}>
                  {order.paymentMethod} - {order.items.reduce((sum, item) => sum + item.quantity, 0)} items
                </p>
              </div>
            </button>
          ))}
        </div>
      )}

      {selected && (
        <Modal title={selected.orderNumber} theme={theme} onClose={() => setSelected(null)}>
          <div className="space-y-4">
            <div className={`rounded-2xl p-4 text-sm ${dark ? 'bg-zinc-900 text-zinc-300' : 'bg-[#f8fafc] text-[#5f6368]'}`}>
              <p>{new Date(selected.createdAt).toLocaleString('en-GB')}</p>
              <p className="mt-1 capitalize">Paid by {selected.paymentMethod}</p>
              <p className="mt-1">Sync status: <span className={`font-semibold ${dark ? 'text-white' : 'text-[#202223]'}`}>{selected.syncStatus}</span></p>
              {selected.cmsOrderNumber && <p className="mt-1 text-blue-300">CMS #{selected.cmsOrderNumber}</p>}
              {selected.customerName && <p className={`mt-1 ${dark ? 'text-white' : 'text-[#202223]'}`}>{selected.customerName}</p>}
              {selected.customerEmail && <p className="mt-1 text-blue-300">{selected.customerEmail}</p>}
              {selected.customerPhone && <p className="mt-1">{selected.customerPhone}</p>}
              {selected.syncError && <p className="mt-2 rounded-xl bg-amber-500/10 px-3 py-2 text-amber-100">{selected.syncError}</p>}
            </div>
            <div className="space-y-2">
              {selected.items.map((item) => (
                <div key={item.productId} className={`flex justify-between gap-3 rounded-xl p-3 text-sm ${dark ? 'bg-zinc-900' : 'bg-[#f8fafc]'}`}>
                  <span className={dark ? 'text-white' : 'text-[#202223]'}>{item.quantity}x {item.name}</span>
                  <span className={`font-bold ${dark ? 'text-white' : 'text-[#202223]'}`}>{formatCurrency(item.price * item.quantity, currency)}</span>
                </div>
              ))}
            </div>
            <div className={`flex justify-between text-xl font-black ${dark ? 'text-white' : 'text-[#202223]'}`}>
              <span>Total</span>
              <span>{formatCurrency(selected.total, currency)}</span>
            </div>
            <button
              className="inline-flex h-11 items-center gap-2 rounded-xl bg-red-500/15 px-4 text-sm font-bold text-red-200 hover:bg-red-500/25"
              onClick={() => {
                if (confirm(`Delete ${selected.orderNumber}?`)) {
                  onDeleteOrder(selected.id)
                  setSelected(null)
                }
              }}
            >
              <Trash2 className="h-4 w-4" aria-hidden="true" />
              Delete order
            </button>
          </div>
        </Modal>
      )}
    </section>
  )
}

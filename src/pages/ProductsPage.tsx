import { Package, Pencil, Plus, Search, Trash2 } from 'lucide-react'
import { useMemo, useState } from 'react'
import type { FormEvent } from 'react'
import { EmptyState } from '../components/EmptyState'
import type { Product } from '../types'
import { formatCurrency } from '../utils/currency'
import { parsePrice } from '../utils/validation'

interface ProductsPageProps {
  products: Product[]
  currency: string
  onAddProduct: (name: string, price: number, tag: string) => Promise<void>
  onUpdateProduct: (id: string, patch: Pick<Product, 'name' | 'price' | 'active' | 'tag'>) => Promise<void>
  onDeleteProduct: (id: string) => Promise<void>
  onNotify: (message: string) => void
}

export function ProductsPage({ products, currency, onAddProduct, onUpdateProduct, onDeleteProduct, onNotify }: ProductsPageProps) {
  const [search, setSearch] = useState('')
  const [editingId, setEditingId] = useState<string | null>(null)
  const [name, setName] = useState('')
  const [price, setPrice] = useState('')
  const [tag, setTag] = useState('')
  const [error, setError] = useState<string | null>(null)

  const filtered = useMemo(() => {
    const term = search.trim().toLowerCase()
    return products.filter((product) => {
      if (!term) return true
      return (
        product.name.toLowerCase().includes(term) ||
        product.tag?.toLowerCase().includes(term)
      )
    })
  }, [products, search])

  const resetForm = () => {
    setEditingId(null)
    setName('')
    setPrice('')
    setTag('')
    setError(null)
  }

  const submit = async (event: FormEvent) => {
    event.preventDefault()
    const parsedPrice = parsePrice(price)
    if (!name.trim()) return setError('Product name is required.')
    if (parsedPrice === null) return setError('Enter a valid positive price.')

    try {
      if (editingId) {
        const current = products.find((product) => product.id === editingId)
        await onUpdateProduct(editingId, { name, price: parsedPrice, tag, active: current?.active ?? true })
        onNotify('Product updated')
      } else {
        await onAddProduct(name, parsedPrice, tag)
        onNotify('Product added')
      }
      resetForm()
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Unable to save product.')
    }
  }

  const startEdit = (product: Product) => {
    setEditingId(product.id)
    setName(product.name)
    setPrice(String(product.price))
    setTag(product.tag ?? '')
    setError(null)
  }

  return (
    <section className="grid h-full min-h-0 gap-4 xl:grid-cols-[380px_minmax(0,1fr)]">
      <form className="overflow-auto rounded-3xl border border-white/8 bg-zinc-950/70 p-4 shadow-2xl shadow-black/20" onSubmit={submit}>
        <h2 className="text-2xl font-black text-white">{editingId ? 'Edit product' : 'Add product'}</h2>
        <label className="mt-5 block">
          <span className="mb-2 block text-sm font-bold text-zinc-300">Product name</span>
          <input className="h-12 w-full rounded-xl border border-white/10 bg-zinc-900 px-4 text-white outline-none focus:border-blue-500 focus:ring-2 focus:ring-blue-500/30" value={name} onChange={(event) => setName(event.target.value)} />
        </label>
        <label className="mt-4 block">
          <span className="mb-2 block text-sm font-bold text-zinc-300">Price</span>
          <input className="h-12 w-full rounded-xl border border-white/10 bg-zinc-900 px-4 text-white outline-none focus:border-blue-500 focus:ring-2 focus:ring-blue-500/30" value={price} onChange={(event) => setPrice(event.target.value)} inputMode="decimal" />
        </label>
        <label className="mt-4 block">
          <span className="mb-2 block text-sm font-bold text-zinc-300">Group tag</span>
          <input
            className="h-12 w-full rounded-xl border border-white/10 bg-zinc-900 px-4 text-white outline-none focus:border-blue-500 focus:ring-2 focus:ring-blue-500/30"
            value={tag}
            onChange={(event) => setTag(event.target.value)}
            placeholder="Cupcakes"
          />
          <p className="mt-2 text-xs text-zinc-500">Use the same tag on multiple products to create one collection row in the POS, such as Cupcakes.</p>
        </label>
        {error && <p className="mt-4 rounded-xl bg-red-500/10 px-3 py-2 text-sm font-semibold text-red-200">{error}</p>}
        <div className="mt-5 flex gap-3">
          <button className="inline-flex h-12 flex-1 items-center justify-center gap-2 rounded-xl bg-blue-500 px-4 font-black text-white hover:bg-blue-400">
            {editingId ? <Pencil className="h-4 w-4" aria-hidden="true" /> : <Plus className="h-4 w-4" aria-hidden="true" />}
            {editingId ? 'Save' : 'Add'}
          </button>
          {editingId && (
            <button type="button" className="h-12 rounded-xl bg-zinc-900 px-4 font-bold text-zinc-300 hover:bg-zinc-800" onClick={resetForm}>
              Cancel
            </button>
          )}
        </div>
      </form>

      <div className="grid min-h-0 grid-rows-[auto_minmax(0,1fr)] rounded-3xl border border-white/8 bg-zinc-950/70 p-4 shadow-2xl shadow-black/20">
        <label className="relative mb-4 block">
          <span className="sr-only">Search products</span>
          <Search className="pointer-events-none absolute left-4 top-1/2 h-5 w-5 -translate-y-1/2 text-zinc-400" aria-hidden="true" />
          <input className="h-12 w-full rounded-xl border border-white/10 bg-zinc-900 pl-12 pr-4 text-white outline-none focus:border-blue-500 focus:ring-2 focus:ring-blue-500/30" value={search} onChange={(event) => setSearch(event.target.value)} placeholder="Search products" />
        </label>
        {filtered.length === 0 ? (
          <div className="min-h-0 overflow-auto">
            <EmptyState icon={Package} title="No products" body="Add products with a name and price to make them available in the POS grid." />
          </div>
        ) : (
          <div className="grid min-h-0 gap-3 overflow-auto pr-1">
            {filtered.map((product) => (
              <div key={product.id} className="grid gap-3 rounded-2xl bg-zinc-900 p-4 md:grid-cols-[1fr_auto] md:items-center">
                <div>
                  <p className="font-black text-white">{product.name}</p>
                  <p className="mt-1 text-sm text-zinc-400">{formatCurrency(product.price, currency)}</p>
                  {product.tag && <p className="mt-2 inline-flex rounded-full bg-blue-500/15 px-2.5 py-1 text-xs font-bold text-blue-200 ring-1 ring-blue-400/20">{product.tag}</p>}
                </div>
                <div className="flex flex-wrap items-center gap-2">
                  <label className="flex h-10 items-center gap-2 rounded-xl bg-zinc-800 px-3 text-sm font-bold text-zinc-300">
                    <input type="checkbox" checked={product.active} onChange={(event) => void onUpdateProduct(product.id, { name: product.name, price: product.price, tag: product.tag, active: event.target.checked })} />
                    Active
                  </label>
                  <button className="grid h-10 w-10 place-items-center rounded-xl bg-zinc-800 text-zinc-300 hover:text-white" onClick={() => startEdit(product)} aria-label={`Edit ${product.name}`}>
                    <Pencil className="h-4 w-4" aria-hidden="true" />
                  </button>
                  <button
                    className="grid h-10 w-10 place-items-center rounded-xl bg-zinc-800 text-zinc-300 hover:bg-red-500/20 hover:text-red-200"
                    onClick={() => {
                      if (confirm(`Delete ${product.name}?`)) void onDeleteProduct(product.id).then(() => onNotify('Product deleted'))
                    }}
                    aria-label={`Delete ${product.name}`}
                  >
                    <Trash2 className="h-4 w-4" aria-hidden="true" />
                  </button>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </section>
  )
}

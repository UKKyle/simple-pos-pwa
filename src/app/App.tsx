import { useEffect, useMemo, useRef, useState } from 'react'
import { Layout } from '../components/Layout'
import { PosUnlock } from '../components/PosUnlock'
import { Toast } from '../components/Toast'
import { clearAllData, ensureSeedData, resetDemoData } from '../db/seed'
import { useCart } from '../hooks/useCart'
import { useOrders } from '../hooks/useOrders'
import { useProducts } from '../hooks/useProducts'
import { useSettings } from '../hooks/useSettings'
import { OrdersPage } from '../pages/OrdersPage'
import { PosPage } from '../pages/PosPage'
import { SettingsPage } from '../pages/SettingsPage'
import type { PaymentMethod, Tab } from '../types'
import { isValidEmail } from '../utils/validation'

export function App() {
  const [ready, setReady] = useState(false)
  const [accessChecked, setAccessChecked] = useState(false)
  const [posConfigured, setPosConfigured] = useState(false)
  const [posUnlocked, setPosUnlocked] = useState(false)
  const [accessError, setAccessError] = useState('')
  const [activeTab, setActiveTab] = useState<Tab>('pos')
  const [customerName, setCustomerName] = useState('')
  const [customerEmail, setCustomerEmail] = useState('')
  const [customerPhone, setCustomerPhone] = useState('')
  const [paymentMethod, setPaymentMethod] = useState<PaymentMethod | ''>('')
  const [checkoutError, setCheckoutError] = useState<string | null>(null)
  const [toast, setToast] = useState<string | null>(null)
  const [online, setOnline] = useState(() => navigator.onLine)
  const bootstrapped = useRef(false)

  const products = useProducts()
  const orders = useOrders()
  const settings = useSettings()
  const cart = useCart()
  const { refresh: refreshProducts } = products
  const { refresh: refreshOrders, syncPendingOrders, createOrder, deleteOrder, pendingSyncCount, syncing } = orders
  const { refresh: refreshSettings } = settings

  const syncContext = useMemo(() => ({
    currency: settings.settings.currency,
    businessName: settings.settings.businessName,
    posLocation: settings.settings.businessName,
  }), [settings.settings.businessName, settings.settings.currency])

  const notify = (message: string) => {
    setToast(message)
    window.setTimeout(() => setToast(null), 3500)
  }

  useEffect(() => {
    void fetch('/api/pos-session')
      .then(async (response) => {
        const data = await response.json().catch(() => null) as { configured?: boolean; unlocked?: boolean; error?: string } | null
        setPosConfigured(Boolean(data?.configured))
        setPosUnlocked(Boolean(response.ok && data?.unlocked))
        setAccessError(response.ok ? '' : data?.error || 'POS access status unavailable')
      })
      .catch(() => {
        setPosConfigured(false)
        setPosUnlocked(false)
        setAccessError('POS access status unavailable')
      })
      .finally(() => setAccessChecked(true))
  }, [])

  const unlockPos = async (pin: string) => {
    const response = await fetch('/api/pos-session', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({ pin }),
    }).catch(() => null)
    const data = response ? await response.json().catch(() => null) as { ok?: boolean; error?: string } | null : null
    const ok = Boolean(response?.ok && data?.ok)

    setPosUnlocked(ok)
    setAccessError(ok ? '' : data?.error || 'PIN was not accepted')

    return ok
  }

  useEffect(() => {
    if (!accessChecked || !posUnlocked) return
    if (bootstrapped.current) return
    bootstrapped.current = true
    void ensureSeedData().then(async () => {
      await Promise.all([refreshProducts(), refreshOrders(), refreshSettings()])
      setReady(true)
    })
  }, [accessChecked, posUnlocked, refreshOrders, refreshProducts, refreshSettings])

  useEffect(() => {
    if (!ready || !posUnlocked) return
    void syncPendingOrders(syncContext).then((result) => {
      if (result.total > 0 && result.syncedCount > 0 && result.failedCount === 0) {
        notify(`Synced ${result.syncedCount} pending order${result.syncedCount === 1 ? '' : 's'} to CMS`)
      }
    })
  }, [ready, posUnlocked, syncContext, syncPendingOrders])

  useEffect(() => {
    const handleOnline = () => {
      setOnline(true)
      if (!posUnlocked) return
      void syncPendingOrders(syncContext).then((result) => {
        if (result.syncedCount > 0) {
          notify(`Recovered ${result.syncedCount} order${result.syncedCount === 1 ? '' : 's'} to CMS`)
        }
      })
    }

    const handleOffline = () => setOnline(false)

    window.addEventListener('online', handleOnline)
    window.addEventListener('offline', handleOffline)

    return () => {
      window.removeEventListener('online', handleOnline)
      window.removeEventListener('offline', handleOffline)
    }
  }, [posUnlocked, syncContext, syncPendingOrders])

  const checkout = async () => {
    setCheckoutError(null)
    if (cart.items.length === 0) return setCheckoutError('Add at least one item before checkout.')
    if (!paymentMethod) return setCheckoutError('Choose card or cash before marking paid.')
    if (customerEmail.trim() && !isValidEmail(customerEmail.trim())) return setCheckoutError('Enter a valid customer email address.')

    const order = await createOrder({
      items: cart.items,
      subtotal: cart.totals.subtotal,
      total: cart.totals.total,
      paymentMethod,
      customerName: customerName.trim() || undefined,
      customerEmail: customerEmail.trim() || undefined,
      customerPhone: customerPhone.trim() || undefined,
      notes: '',
    }, syncContext)

    cart.clearCart()
    setCustomerName('')
    setCustomerEmail('')
    setCustomerPhone('')
    setPaymentMethod('')

    if (order.syncStatus === 'synced') {
      notify(`${order.orderNumber} saved and synced to CMS`)
    } else {
      notify(`${order.orderNumber} saved locally. CMS sync will retry automatically.`)
    }

    setActiveTab('orders')
  }

  const clearCart = () => {
    if (cart.items.length === 0 || confirm('Clear the current basket?')) cart.clearCart()
  }

  if (!accessChecked) {
    return <div className="grid min-h-dvh place-items-center bg-black text-lg font-black text-white">Checking POS access...</div>
  }

  if (!posUnlocked) {
    return <PosUnlock configured={posConfigured} error={accessError} onUnlock={unlockPos} />
  }

  if (!ready) {
    return <div className="grid min-h-dvh place-items-center bg-black text-lg font-black text-white">Loading POS...</div>
  }

  return (
    <>
      <Layout
        activeTab={activeTab}
        businessName={settings.settings.businessName}
        pendingSyncCount={pendingSyncCount}
        online={online}
        onTabChange={setActiveTab}
      >
        {activeTab === 'pos' && (
          <PosPage
            products={products.products}
            productLoadError={products.error}
            cartItems={cart.items}
            totals={cart.totals}
            currency={settings.settings.currency}
            customerName={customerName}
            customerEmail={customerEmail}
            customerPhone={customerPhone}
            paymentMethod={paymentMethod}
            checkoutError={checkoutError}
            onAddProduct={(product) => {
              cart.addProduct(product)
              setCheckoutError(null)
            }}
            onCustomerNameChange={setCustomerName}
            onCustomerEmailChange={setCustomerEmail}
            onCustomerPhoneChange={setCustomerPhone}
            onPaymentMethodChange={setPaymentMethod}
            onQuantityChange={cart.setQuantity}
            onRemoveItem={cart.removeItem}
            onClearCart={clearCart}
            onCheckout={() => void checkout()}
          />
        )}
        {activeTab === 'orders' && (
          <OrdersPage
            orders={orders.orders}
            currency={settings.settings.currency}
            syncing={syncing}
            onDeleteOrder={(id) => void deleteOrder(id).then(() => notify('Order deleted'))}
            onSyncPendingOrders={() => {
              void syncPendingOrders(syncContext).then((result) => {
                if (result.total === 0) {
                  notify('No pending orders to sync')
                } else if (result.failedCount > 0) {
                  notify(`Synced ${result.syncedCount} order${result.syncedCount === 1 ? '' : 's'}, ${result.failedCount} still need attention`)
                } else {
                  notify(`Synced ${result.syncedCount} pending order${result.syncedCount === 1 ? '' : 's'}`)
                }
              })
            }}
          />
        )}
        {activeTab === 'settings' && (
          <SettingsPage
            settings={settings.settings}
            onSave={settings.saveSettings}
            onResetDemo={async () => {
              await resetDemoData()
              await Promise.all([refreshProducts(), refreshOrders(), refreshSettings()])
            }}
            onClearAll={async () => {
              await clearAllData()
              await Promise.all([refreshProducts(), refreshOrders(), refreshSettings()])
            }}
            onNotify={notify}
          />
        )}
      </Layout>
      <Toast message={toast} onClose={() => setToast(null)} />
    </>
  )
}

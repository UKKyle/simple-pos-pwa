import { useEffect, useMemo, useRef, useState } from 'react'
import { Layout } from '../components/Layout'
import { Toast } from '../components/Toast'
import { clearAllData, ensureSeedData, resetDemoData } from '../db/seed'
import { useCart } from '../hooks/useCart'
import { useOrders } from '../hooks/useOrders'
import { useProducts } from '../hooks/useProducts'
import { useSettings } from '../hooks/useSettings'
import { OrdersPage } from '../pages/OrdersPage'
import { PosPage } from '../pages/PosPage'
import { ProductsPage } from '../pages/ProductsPage'
import { SettingsPage } from '../pages/SettingsPage'
import type { PaymentMethod, Tab } from '../types'
import { isValidEmail } from '../utils/validation'

export function App() {
  const [ready, setReady] = useState(false)
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
    if (bootstrapped.current) return
    bootstrapped.current = true
    void ensureSeedData().then(async () => {
      await Promise.all([refreshProducts(), refreshOrders(), refreshSettings()])
      setReady(true)
    })
  }, [refreshOrders, refreshProducts, refreshSettings])

  useEffect(() => {
    if (!ready) return
    void syncPendingOrders(syncContext).then((result) => {
      if (result.total > 0 && result.syncedCount > 0 && result.failedCount === 0) {
        notify(`Synced ${result.syncedCount} pending order${result.syncedCount === 1 ? '' : 's'} to CMS`)
      }
    })
  }, [ready, syncContext, syncPendingOrders])

  useEffect(() => {
    const handleOnline = () => {
      setOnline(true)
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
  }, [syncContext, syncPendingOrders])

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
        {activeTab === 'products' && (
          <ProductsPage
            products={products.products}
            currency={settings.settings.currency}
            onAddProduct={products.addProduct}
            onUpdateProduct={products.updateProduct}
            onDeleteProduct={products.deleteProduct}
            onNotify={notify}
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

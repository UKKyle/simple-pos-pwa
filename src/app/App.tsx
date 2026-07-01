import { useEffect, useRef, useState } from 'react'
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
  const [customerEmail, setCustomerEmail] = useState('')
  const [paymentMethod, setPaymentMethod] = useState<PaymentMethod | ''>('')
  const [checkoutError, setCheckoutError] = useState<string | null>(null)
  const [toast, setToast] = useState<string | null>(null)
  const bootstrapped = useRef(false)

  const products = useProducts()
  const orders = useOrders()
  const settings = useSettings()
  const cart = useCart()

  const notify = (message: string) => {
    setToast(message)
    window.setTimeout(() => setToast(null), 3500)
  }

  useEffect(() => {
    if (bootstrapped.current) return
    bootstrapped.current = true
    void ensureSeedData().then(async () => {
      await Promise.all([products.refresh(), orders.refresh(), settings.refresh()])
      setReady(true)
    })
  }, [orders.refresh, products.refresh, settings.refresh])

  const checkout = async () => {
    setCheckoutError(null)
    if (cart.items.length === 0) return setCheckoutError('Add at least one item before checkout.')
    if (!paymentMethod) return setCheckoutError('Choose card or cash before marking paid.')
    if (customerEmail.trim() && !isValidEmail(customerEmail.trim())) return setCheckoutError('Enter a valid customer email address.')

    const order = await orders.createOrder({
      items: cart.items,
      subtotal: cart.totals.subtotal,
      total: cart.totals.total,
      paymentMethod,
      customerEmail: customerEmail.trim() || undefined,
    })
    cart.clearCart()
    setCustomerEmail('')
    setPaymentMethod('')
    notify(`${order.orderNumber} saved`)
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
      <Layout activeTab={activeTab} businessName={settings.settings.businessName} onTabChange={setActiveTab}>
        {activeTab === 'pos' && (
          <PosPage
            products={products.products}
            cartItems={cart.items}
            totals={cart.totals}
            currency={settings.settings.currency}
            customerEmail={customerEmail}
            paymentMethod={paymentMethod}
            checkoutError={checkoutError}
            onAddProduct={(product) => {
              cart.addProduct(product)
              setCheckoutError(null)
            }}
            onCustomerEmailChange={setCustomerEmail}
            onPaymentMethodChange={setPaymentMethod}
            onQuantityChange={cart.setQuantity}
            onRemoveItem={cart.removeItem}
            onClearCart={clearCart}
            onCheckout={() => void checkout()}
          />
        )}
        {activeTab === 'orders' && <OrdersPage orders={orders.orders} currency={settings.settings.currency} onDeleteOrder={(id) => void orders.deleteOrder(id).then(() => notify('Order deleted'))} />}
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
              await Promise.all([products.refresh(), orders.refresh(), settings.refresh()])
            }}
            onClearAll={async () => {
              await clearAllData()
              await Promise.all([products.refresh(), orders.refresh(), settings.refresh()])
            }}
            onNotify={notify}
          />
        )}
      </Layout>
      <Toast message={toast} onClose={() => setToast(null)} />
    </>
  )
}

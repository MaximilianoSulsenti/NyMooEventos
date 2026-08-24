import { useEffect, useMemo, useState } from 'react'
import { Navigate, Link } from 'react-router-dom'
import { motion, AnimatePresence } from 'motion/react'
import { Plus, X, ChevronDown, Wallet, ShoppingBag, Clock, PieChart } from 'lucide-react'
import api from '../services/api'
import { getStoredUser } from '../services/auth'
import Button from '../components/ui/Button'
import GlassPanel from '../components/ui/GlassPanel'
import OrderForm from '../components/orders/OrderForm'
import useLockBodyScroll from '../hooks/useLockBodyScroll'
import { BRAND } from '../utils/brand'
import { LANDING_PACKS } from '../utils/landingConfig'
import { EMPTY_ORDER_FORM } from '../utils/orderForm'

const PAYMENT_STATUSES = ['Pendiente', 'Señado (50%)', 'Pagado Completo']
const STATUS_COLORS = {
  Pendiente: '#f59e0b',
  'Señado (50%)': BRAND.blue,
  'Pagado Completo': BRAND.lime,
}

function currency(n) {
  return `$${Number(n || 0).toLocaleString('es-AR')}`
}

function StatCard({ icon: Icon, label, value, color }) {
  return (
    <div className="rounded-2xl bg-white/[0.03] border border-white/10 p-4 sm:p-5">
      <div className="flex items-center gap-2 mb-2">
        <span className="w-8 h-8 rounded-lg flex items-center justify-center" style={{ background: `${color}22`, color }}>
          <Icon className="w-4 h-4" />
        </span>
        <p className="text-white/50 text-xs uppercase tracking-wide">{label}</p>
      </div>
      <p className="text-2xl font-extrabold">{value}</p>
    </div>
  )
}

function StatusSelect({ order, onChange }) {
  return (
    <select
      value={order.paymentStatus}
      onChange={(e) => onChange(order._id, e.target.value)}
      className="rounded-lg bg-neutral-800 border border-white/10 px-2.5 py-1.5 text-xs outline-none focus:ring-2"
      style={{ color: STATUS_COLORS[order.paymentStatus], '--tw-ring-color': STATUS_COLORS[order.paymentStatus] }}
    >
      {PAYMENT_STATUSES.map((s) => (
        <option key={s} value={s} className="text-white bg-neutral-800">
          {s}
        </option>
      ))}
    </select>
  )
}

function OrderDetails({ order }) {
  return (
    <div className="grid sm:grid-cols-2 gap-4 px-4 pb-4 text-sm">
      <div className="space-y-1">
        <p className="text-white/40 text-xs uppercase tracking-wide mb-1">Evento</p>
        <p className="text-white/70">Protagonistas: {order.eventData?.protagonists || '—'}</p>
        <p className="text-white/70">Tipo: {order.eventData?.eventType || '—'}</p>
        <p className="text-white/70">
          Fecha: {order.eventData?.date ? new Date(order.eventData.date).toLocaleDateString('es-AR') : '—'} {order.eventData?.time || ''}
        </p>
        <p className="text-white/70">Lugar(es): {order.eventData?.locations || '—'}</p>
      </div>
      <div className="space-y-1">
        <p className="text-white/40 text-xs uppercase tracking-wide mb-1">Estética</p>
        <p className="text-white/70">Tema: {order.designPresets?.theme || '—'}</p>
        <p className="text-white/70">Tipografía: {order.designPresets?.typography || '—'}</p>
        <p className="text-white/70">Fondo: {order.designPresets?.customBgInstructions || '—'}</p>
      </div>
      {order.guestCardDetails?.hasCost && (
        <div className="space-y-1 sm:col-span-2 pt-2 border-t border-white/10">
          <p className="text-white/40 text-xs uppercase tracking-wide mb-1">Tarjeta con costo</p>
          <p className="text-white/70">Precio por tarjeta: {currency(order.guestCardDetails.pricePerCard)}</p>
          <p className="text-white/70">Menú: {order.guestCardDetails.includesMenuDetails || '—'}</p>
          <p className="text-white/70">Pago invitados: {order.guestCardDetails.paymentInstructions || '—'}</p>
        </div>
      )}
      <div className="space-y-1 sm:col-span-2 pt-2 border-t border-white/10">
        <p className="text-white/40 text-xs uppercase tracking-wide mb-1">Info adicional</p>
        <p className="text-white/70">Dress code: {order.additionalInfo?.dressCode || '—'}</p>
        <p className="text-white/70">Datos bancarios: {order.additionalInfo?.bankDetails || '—'}</p>
        <p className="text-white/70">Tips: {order.additionalInfo?.importantTips || '—'}</p>
        <p className="text-white/70">Contacto: {order.clientData?.phone || '—'} · {order.clientData?.email || '—'}</p>
      </div>
    </div>
  )
}

function ManualOrderModal({ onClose, onCreated }) {
  useLockBodyScroll()
  const [form, setForm] = useState(EMPTY_ORDER_FORM)
  const [packId, setPackId] = useState(LANDING_PACKS[0].id)
  const [paymentMethod, setPaymentMethod] = useState('whatsapp_coordinar')
  const [paymentStatus, setPaymentStatus] = useState('Pagado Completo')
  const [status, setStatus] = useState('idle')
  const [errorMessage, setErrorMessage] = useState('')

  const pack = LANDING_PACKS.find((p) => p.id === packId)

  function updateField(section, field, value) {
    setForm((prev) => ({ ...prev, [section]: { ...prev[section], [field]: value } }))
  }

  async function handleSubmit(e) {
    e.preventDefault()
    setStatus('submitting')
    setErrorMessage('')
    try {
      const { data } = await api.post('/orders/manual', {
        ...form,
        guestCardDetails: {
          ...form.guestCardDetails,
          pricePerCard: form.guestCardDetails.hasCost ? Number(form.guestCardDetails.pricePerCard) || 0 : 0,
        },
        packDetails: { packName: pack.name },
        paymentMethod,
        paymentStatus,
      })
      onCreated(data.order)
    } catch (err) {
      setStatus('error')
      setErrorMessage(err.response?.data?.message || 'No se pudo cargar el pedido')
    }
  }

  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      className="fixed inset-0 z-50 bg-black/70 backdrop-blur-sm flex items-start sm:items-center justify-center p-4 overflow-y-auto"
    >
      <motion.div
        initial={{ opacity: 0, scale: 0.96, y: 10 }}
        animate={{ opacity: 1, scale: 1, y: 0 }}
        exit={{ opacity: 0, scale: 0.96 }}
        className="w-full max-w-2xl my-8 bg-neutral-950 border border-white/10 rounded-3xl p-5 sm:p-7 relative"
      >
        <button type="button" onClick={onClose} className="absolute top-4 right-4 text-white/40 hover:text-white transition" aria-label="Cerrar">
          <X className="w-5 h-5" />
        </button>

        <h2 className="text-lg font-semibold mb-1">Nuevo pedido manual</h2>
        <p className="text-white/40 text-xs mb-5">Para clientes que compraron de palabra, fuera de la web.</p>

        <form onSubmit={handleSubmit} className="space-y-5">
          <div className="grid sm:grid-cols-3 gap-4">
            <div className="sm:col-span-2">
              <label className="block text-sm text-white/60 mb-1.5">Pack</label>
              <select
                value={packId}
                onChange={(e) => setPackId(e.target.value)}
                className="w-full rounded-xl bg-white/5 border border-white/10 px-3 py-2.5 text-sm outline-none"
              >
                {LANDING_PACKS.map((p) => (
                  <option key={p.id} value={p.id}>
                    {p.name} · {p.price}
                  </option>
                ))}
              </select>
            </div>
            <div>
              <label className="block text-sm text-white/60 mb-1.5">Estado de pago</label>
              <select
                value={paymentStatus}
                onChange={(e) => setPaymentStatus(e.target.value)}
                className="w-full rounded-xl bg-white/5 border border-white/10 px-3 py-2.5 text-sm outline-none"
              >
                {PAYMENT_STATUSES.map((s) => (
                  <option key={s} value={s}>
                    {s}
                  </option>
                ))}
              </select>
            </div>
          </div>

          <OrderForm form={form} onField={updateField} />

          <div>
            <label className="block text-sm text-white/60 mb-1.5">Método de pago</label>
            <select
              value={paymentMethod}
              onChange={(e) => setPaymentMethod(e.target.value)}
              className="w-full sm:w-64 rounded-xl bg-white/5 border border-white/10 px-3 py-2.5 text-sm outline-none"
            >
              <option value="whatsapp_coordinar">Coordinado por WhatsApp</option>
              <option value="mercado_pago">Mercado Pago</option>
            </select>
          </div>

          {errorMessage && <p className="text-red-400 text-sm">{errorMessage}</p>}

          <Button type="submit" disabled={status === 'submitting'} primaryColor={BRAND.blue} className="w-full disabled:opacity-40">
            {status === 'submitting' ? 'Guardando...' : 'Guardar pedido'}
          </Button>
        </form>
      </motion.div>
    </motion.div>
  )
}

function OrderRow({ order, onStatusChange }) {
  const [open, setOpen] = useState(false)

  return (
    <div className="rounded-2xl bg-white/[0.02] border border-white/10 overflow-hidden">
      <button type="button" onClick={() => setOpen((v) => !v)} className="w-full flex items-center gap-3 px-4 py-3.5 text-left">
        <motion.span animate={{ rotate: open ? 90 : 0 }} className="shrink-0 text-white/30">
          <ChevronDown className="w-4 h-4" />
        </motion.span>
        <div className="min-w-0 flex-1 grid grid-cols-2 sm:grid-cols-5 gap-2 items-center">
          <p className="font-mono text-xs sm:text-sm text-white/50 truncate">{order.orderNumber}</p>
          <p className="text-sm truncate">{order.clientData?.name}</p>
          <p className="text-sm text-white/60 truncate hidden sm:block">{order.packDetails?.packName}</p>
          <p className="text-sm font-semibold">{currency(order.packDetails?.price)}</p>
          <p className="text-xs text-white/40 hidden sm:block">{new Date(order.createdAt).toLocaleDateString('es-AR')}</p>
        </div>
        <div onClick={(e) => e.stopPropagation()}>
          <StatusSelect order={order} onChange={onStatusChange} />
        </div>
      </button>
      <AnimatePresence initial={false}>
        {open && (
          <motion.div
            initial={{ height: 0, opacity: 0 }}
            animate={{ height: 'auto', opacity: 1 }}
            exit={{ height: 0, opacity: 0 }}
            transition={{ duration: 0.2 }}
            className="overflow-hidden border-t border-white/5"
          >
            <OrderDetails order={order} />
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  )
}

function OrdersDashboard() {
  const isAdmin = Boolean(getStoredUser()?.isAdmin)
  const [orders, setOrders] = useState([])
  const [loadState, setLoadState] = useState('loading')
  const [modalOpen, setModalOpen] = useState(false)

  useEffect(() => {
    if (!isAdmin) return
    api
      .get('/orders')
      .then(({ data }) => {
        setOrders(data)
        setLoadState('ready')
      })
      .catch(() => setLoadState('error'))
  }, [isAdmin])

  async function handleStatusChange(orderId, paymentStatus) {
    const previous = orders
    setOrders((prev) => prev.map((o) => (o._id === orderId ? { ...o, paymentStatus } : o)))
    try {
      await api.patch(`/orders/${orderId}/status`, { paymentStatus })
    } catch {
      setOrders(previous)
    }
  }

  const stats = useMemo(() => {
    const totalFacturado = orders
      .filter((o) => o.paymentStatus === 'Pagado Completo')
      .reduce((sum, o) => sum + (o.packDetails?.price || 0), 0)
    const ventas = orders.filter((o) => o.paymentStatus !== 'Pendiente').length
    const pendientes = orders.filter((o) => o.paymentStatus === 'Pendiente').length
    const byPack = {}
    orders.forEach((o) => {
      const name = o.packDetails?.packName || 'Sin pack'
      byPack[name] = (byPack[name] || 0) + 1
    })
    const topPack = Object.entries(byPack).sort((a, b) => b[1] - a[1])[0]
    return { totalFacturado, ventas, pendientes, topPack }
  }, [orders])

  if (!isAdmin) {
    return <Navigate to="/eventos" replace />
  }

  return (
    <div className="min-h-screen w-full text-white px-4 sm:px-6 py-10" style={{ background: BRAND.night }}>
      <div className="max-w-6xl mx-auto space-y-6">
        <div className="flex items-center justify-between flex-wrap gap-3">
          <div>
            <Link to="/eventos" className="text-white/40 text-xs uppercase tracking-widest hover:text-white transition">
              ← Volver a eventos
            </Link>
            <h1 className="text-2xl font-semibold mt-1">Pedidos</h1>
          </div>
          <Button type="button" onClick={() => setModalOpen(true)} primaryColor={BRAND.blue} className="text-sm py-2.5">
            <Plus className="w-4 h-4" />
            Nuevo pedido manual
          </Button>
        </div>

        <div className="grid grid-cols-2 lg:grid-cols-4 gap-3 sm:gap-4">
          <StatCard icon={Wallet} label="Total facturado" value={currency(stats.totalFacturado)} color={BRAND.lime} />
          <StatCard icon={ShoppingBag} label="Cantidad de ventas" value={stats.ventas} color={BRAND.blue} />
          <StatCard icon={Clock} label="Pedidos pendientes" value={stats.pendientes} color="#f59e0b" />
          <StatCard icon={PieChart} label="Pack más vendido" value={stats.topPack ? stats.topPack[0] : '—'} color={BRAND.pink} />
        </div>

        <GlassPanel accentColor={BRAND.blue} className="p-4 sm:p-6">
          {loadState === 'loading' && <p className="text-white/40 text-center py-10">Cargando pedidos...</p>}
          {loadState === 'error' && <p className="text-red-400 text-center py-10">No se pudieron cargar los pedidos.</p>}
          {loadState === 'ready' && orders.length === 0 && (
            <p className="text-white/40 text-center py-10">Todavía no hay pedidos.</p>
          )}
          {loadState === 'ready' && orders.length > 0 && (
            <div className="space-y-2">
              <div className="hidden sm:grid grid-cols-[16px_1fr] gap-3 px-4 pb-2">
                <div />
                <div className="grid grid-cols-5 gap-2 text-xs text-white/40 uppercase tracking-wide">
                  <span>Pedido</span>
                  <span>Cliente</span>
                  <span>Pack</span>
                  <span>Precio</span>
                  <span>Fecha</span>
                </div>
              </div>
              {orders.map((order) => (
                <OrderRow key={order._id} order={order} onStatusChange={handleStatusChange} />
              ))}
            </div>
          )}
        </GlassPanel>
      </div>

      <AnimatePresence>
        {modalOpen && (
          <ManualOrderModal
            onClose={() => setModalOpen(false)}
            onCreated={(order) => {
              setOrders((prev) => [order, ...prev])
              setModalOpen(false)
            }}
          />
        )}
      </AnimatePresence>
    </div>
  )
}

export default OrdersDashboard

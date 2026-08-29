import { useEffect, useMemo, useState } from 'react'
import { Navigate, Link } from 'react-router-dom'
import { motion, AnimatePresence } from 'motion/react'
import {
  Plus,
  X,
  ChevronDown,
  Wallet,
  ShoppingBag,
  Clock,
  PieChart,
  Archive,
  ArchiveRestore,
  Share2,
  Check as CheckIcon,
  Receipt,
  Printer,
  CloudUpload,
  AlertTriangle,
} from 'lucide-react'
import api from '../services/api'
import { getStoredUser } from '../services/auth'
import Button from '../components/ui/Button'
import GlassPanel from '../components/ui/GlassPanel'
import OrderForm from '../components/orders/OrderForm'
import PackPicker from '../components/orders/PackPicker'
import DuoAddonToggle from '../components/orders/DuoAddonToggle'
import useLockBodyScroll from '../hooks/useLockBodyScroll'
import { BRAND } from '../utils/brand'
import {
  LANDING_PACKS,
  LANDING_TOOLS,
  LANDING_CONTACT,
  DUO_ADDON_NAME,
  computeDuoAddonPrice,
  computeToolsPricing,
} from '../utils/landingConfig'
import { EMPTY_ORDER_FORM } from '../utils/orderForm'

const PAYMENT_STATUSES = ['Pendiente', 'Señado (50%)', 'Pagado Completo']
const STATUS_COLORS = {
  Pendiente: '#f59e0b',
  'Señado (50%)': BRAND.blue,
  'Pagado Completo': BRAND.lime,
}

const SHARED_FORM_URL = `${window.location.origin}/completar-pedido`
const SOURCE_LABELS = {
  carga_manual: 'Carga manual',
  formulario_compartido: 'Formulario compartido',
}
const PAYMENT_METHOD_LABELS = {
  mercado_pago: 'Mercado Pago',
  whatsapp_coordinar: 'Coordinado por WhatsApp',
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

// Aviso de uso del plan de Cloudinary (fotos/videos de los álbumes) --
// discreto cuando está todo bien (nivel 'ok'), pero se pone amarillo/rojo
// solo cuando se acerca al límite del plan gratuito (ver
// backend/controllers/systemController.js para los cortes de 70%/90%), así
// el admin lo nota apenas entra al panel sin tener que ir a buscarlo a otro
// lado ni depender de un mensaje de WhatsApp aparte.
const CLOUDINARY_LEVEL_STYLE = {
  ok: { bg: 'rgba(255,255,255,0.03)', border: 'rgba(255,255,255,0.1)', text: 'rgba(255,255,255,0.5)', icon: 'rgba(255,255,255,0.35)' },
  warning: { bg: '#f59e0b1a', border: '#f59e0b55', text: '#f59e0b', icon: '#f59e0b' },
  critical: { bg: '#ef44441a', border: '#ef444455', text: '#ef4444', icon: '#ef4444' },
}

function CloudinaryUsageBar({ usage }) {
  if (!usage) return null
  const style = CLOUDINARY_LEVEL_STYLE[usage.level] || CLOUDINARY_LEVEL_STYLE.ok
  const Icon = usage.level === 'ok' ? CloudUpload : AlertTriangle

  return (
    <div
      className="rounded-xl px-4 py-2.5 flex items-center gap-3 text-xs"
      style={{ background: style.bg, border: `1px solid ${style.border}` }}
    >
      <Icon className="w-3.5 h-3.5 shrink-0" style={{ color: style.icon }} />
      <span style={{ color: style.text }}>
        Almacenamiento de fotos/videos (Cloudinary):{' '}
        <span className="font-semibold">{usage.usedPercent.toFixed(1)}% del plan gratuito usado este mes</span>
        {usage.level !== 'ok' && ' -- puede que haya que pasar a un plan pago pronto'}
      </span>
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
      {(order.items || []).length > 1 && (
        <div className="sm:col-span-2 flex flex-wrap gap-1.5">
          {order.items.map((item) => (
            <span key={item.name} className="text-xs px-2.5 py-1 rounded-full bg-white/5 text-white/60">
              {item.name} · {currency(item.price)}
            </span>
          ))}
        </div>
      )}
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
          <p className="text-white/70">Precio por tarjeta: {order.guestCardDetails.pricePerCard || '—'}</p>
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
  const [packIds, setPackIds] = useState([LANDING_PACKS[0].id])
  const [toolIds, setToolIds] = useState([])
  const [duoSelected, setDuoSelected] = useState(false)
  const [paymentMethod, setPaymentMethod] = useState('whatsapp_coordinar')
  const [paymentStatus, setPaymentStatus] = useState('Pagado Completo')
  const [status, setStatus] = useState('idle')
  const [errorMessage, setErrorMessage] = useState('')

  const packs = LANDING_PACKS.filter((p) => packIds.includes(p.id))
  const tools = LANDING_TOOLS.filter((t) => toolIds.includes(t.id))
  const items = [...packs, ...tools]
  const duoPrice = computeDuoAddonPrice(packs)
  const duoActive = duoSelected && duoPrice > 0
  // Mismo motor de descuentos por combo que Checkout.jsx (ver
  // computeToolsPricing en landingConfig.js) -- importa especialmente acá
  // porque este modal es para cargar pedidos ya cobrados: si el total en
  // pantalla no coincide con lo que realmente calcula el backend, queda un
  // desfasaje contable real, no solo visual.
  const packsTotal = packs.reduce((sum, p) => sum + p.priceValue, 0)
  const { toolsTotal } = computeToolsPricing(packs, tools)
  const total = packsTotal + toolsTotal + (duoActive ? duoPrice : 0)
  const isToolOnlyOrder = items.length > 0 && items.every((item) => item.id === 'vision' || LANDING_TOOLS.some((t) => t.id === item.id))

  function togglePack(id) {
    setPackIds((prev) => (prev.includes(id) ? prev.filter((p) => p !== id) : [...prev, id]))
  }

  function toggleTool(id) {
    setToolIds((prev) => (prev.includes(id) ? prev.filter((t) => t !== id) : [...prev, id]))
  }

  function updateField(section, field, value) {
    setForm((prev) => ({ ...prev, [section]: { ...prev[section], [field]: value } }))
  }

  async function handleSubmit(e) {
    e.preventDefault()
    if (items.length === 0) {
      setErrorMessage('Elegí al menos un producto')
      return
    }
    setStatus('submitting')
    setErrorMessage('')
    try {
      const { data } = await api.post('/orders/manual', {
        ...form,
        guestCardDetails: {
          ...form.guestCardDetails,
          pricePerCard: form.guestCardDetails.hasCost ? form.guestCardDetails.pricePerCard : '',
        },
        items: [...items.map((item) => ({ name: item.name })), ...(duoActive ? [{ name: DUO_ADDON_NAME }] : [])],
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
      className="fixed inset-0 z-50 bg-black/70 backdrop-blur-sm flex items-center justify-center p-4"
    >
      {/* El scroll va DENTRO de esta tarjeta (max-h + overflow-y-auto acá),
          no en el fondo de atrás -- con "items-center" en el contenedor de
          afuera, un hijo más alto que la pantalla queda con la parte de
          arriba inaccesible aunque el fondo tenga overflow-y-auto (bug
          clásico de flexbox centrado + scroll). Mismo patrón que ya usan
          UploadAccessModal/GiftModal/etc. en el resto del sitio. */}
      <motion.div
        initial={{ opacity: 0, scale: 0.96, y: 10 }}
        animate={{ opacity: 1, scale: 1, y: 0 }}
        exit={{ opacity: 0, scale: 0.96 }}
        className="w-full max-w-2xl max-h-[90vh] overflow-y-auto bg-neutral-950 border border-white/10 rounded-3xl p-5 sm:p-7 relative"
      >
        <button type="button" onClick={onClose} className="absolute top-4 right-4 text-white/40 hover:text-white transition" aria-label="Cerrar">
          <X className="w-5 h-5" />
        </button>

        <h2 className="text-lg font-semibold mb-1">Nuevo pedido manual</h2>
        <p className="text-white/40 text-xs mb-5">Para clientes que compraron de palabra, fuera de la web.</p>

        <form onSubmit={handleSubmit} className="space-y-5">
          <div>
            <div className="flex items-center justify-between mb-1.5 gap-3 flex-wrap">
              <label className="block text-sm text-white/60">Pack(s)</label>
              {items.length > 0 && (
                <p className="text-xs text-white/50">
                  Total: <span className="font-semibold text-white">{currency(total)}</span>
                </p>
              )}
            </div>
            <PackPicker selectedIds={packIds} onToggle={togglePack} />
            <div className="mt-3">
              <DuoAddonToggle selectedPacks={packs} selected={duoActive} onToggle={() => setDuoSelected((v) => !v)} />
            </div>
          </div>

          <div>
            <label className="block text-sm text-white/60 mb-1.5">Herramientas</label>
            <PackPicker items={LANDING_TOOLS} selectedIds={toolIds} onToggle={toggleTool} />
          </div>

          <div>
            <label className="block text-sm text-white/60 mb-1.5">Estado de pago</label>
            <select
              value={paymentStatus}
              onChange={(e) => setPaymentStatus(e.target.value)}
              className="w-full sm:w-64 rounded-xl bg-white/5 border border-white/10 px-3 py-2.5 text-sm outline-none"
            >
              {PAYMENT_STATUSES.map((s) => (
                <option key={s} value={s} className="text-white bg-neutral-800">
                  {s}
                </option>
              ))}
            </select>
          </div>

          {isToolOnlyOrder && (
            <p className="text-white/40 text-xs">
              Como es solo herramientas, no hace falta el diseño de la tarjeta -- alcanza con los datos básicos.
            </p>
          )}
          <OrderForm form={form} onField={updateField} showDesignFields={!isToolOnlyOrder} />

          <div>
            <label className="block text-sm text-white/60 mb-1.5">Método de pago</label>
            <select
              value={paymentMethod}
              onChange={(e) => setPaymentMethod(e.target.value)}
              className="w-full sm:w-64 rounded-xl bg-white/5 border border-white/10 px-3 py-2.5 text-sm outline-none"
            >
              <option value="whatsapp_coordinar" className="text-white bg-neutral-800">
                Coordinado por WhatsApp
              </option>
              <option value="mercado_pago" className="text-white bg-neutral-800">
                Mercado Pago
              </option>
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

function OrderRow({ order, onStatusChange, onArchiveToggle, onInvoice }) {
  const [open, setOpen] = useState(false)
  const itemNames = (order.items || []).map((i) => i.name).join(', ')

  return (
    <div className="rounded-2xl bg-white/[0.02] border border-white/10 overflow-hidden">
      <button type="button" onClick={() => setOpen((v) => !v)} className="w-full flex items-center gap-3 px-4 py-3.5 text-left">
        <motion.span animate={{ rotate: open ? 90 : 0 }} className="shrink-0 text-white/30">
          <ChevronDown className="w-4 h-4" />
        </motion.span>
        <div className="min-w-0 flex-1 grid grid-cols-2 sm:grid-cols-5 gap-2 items-center">
          <div className="min-w-0">
            <p className="font-mono text-xs sm:text-sm text-white/50 truncate">{order.orderNumber}</p>
            {SOURCE_LABELS[order.source] && (
              <p className="text-[10px] text-white/30 truncate">{SOURCE_LABELS[order.source]}</p>
            )}
          </div>
          <p className="text-sm truncate">{order.clientData?.name}</p>
          <p className="text-sm text-white/60 truncate hidden sm:block" title={itemNames}>
            {itemNames}
          </p>
          <p className="text-sm font-semibold">{currency(order.totalPrice)}</p>
          <p className="text-xs text-white/40 hidden sm:block">{new Date(order.createdAt).toLocaleDateString('es-AR')}</p>
        </div>
        <div className="flex items-center gap-1.5 shrink-0" onClick={(e) => e.stopPropagation()}>
          <StatusSelect order={order} onChange={onStatusChange} />
          <button
            type="button"
            onClick={() => onInvoice(order)}
            aria-label="Generar factura"
            title="Generar factura"
            className="p-1.5 rounded-lg text-white/40 hover:text-white hover:bg-white/10 transition"
          >
            <Receipt className="w-4 h-4" />
          </button>
          <button
            type="button"
            onClick={() => onArchiveToggle(order._id, !order.archived)}
            aria-label={order.archived ? 'Desarchivar pedido' : 'Archivar pedido'}
            title={order.archived ? 'Desarchivar' : 'Archivar'}
            className="p-1.5 rounded-lg text-white/40 hover:text-white hover:bg-white/10 transition"
          >
            {order.archived ? <ArchiveRestore className="w-4 h-4" /> : <Archive className="w-4 h-4" />}
          </button>
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

// Comprobante formal para que el equipo se lo pase al cliente por mail al
// cerrar la venta. "Descargar" acá es imprimir/guardar como PDF desde el
// navegador -- mismo truco que MessageBookPrint.jsx, pero recortado a este
// modal en vez de a la página entera: en @media print se ocultan todos los
// elementos del documento salvo .invoice-print-area (ver <style> abajo).
function InvoiceModal({ order, onClose }) {
  useLockBodyScroll()

  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      className="fixed inset-0 z-50 bg-black/70 backdrop-blur-sm flex items-center justify-center p-4"
    >
      <style>{`
        @media print {
          body * { visibility: hidden; }
          .invoice-print-area, .invoice-print-area * { visibility: visible; }
          .invoice-print-area {
            position: fixed; inset: 0; margin: 0; max-height: none; overflow: visible;
            box-shadow: none; border-radius: 0;
          }
          .no-print { display: none !important; }
          @page { margin: 1.6cm; }
        }
      `}</style>

      <motion.div
        initial={{ opacity: 0, scale: 0.96, y: 10 }}
        animate={{ opacity: 1, scale: 1, y: 0 }}
        exit={{ opacity: 0, scale: 0.96 }}
        className="invoice-print-area w-full max-w-xl max-h-[90vh] overflow-y-auto rounded-3xl"
        style={{ background: '#f7f3ec', color: '#1c1917' }}
      >
        <div className="no-print flex items-center justify-end gap-2 p-4 border-b sticky top-0" style={{ borderColor: '#e7e1d6', background: '#f7f3ec' }}>
          <button
            type="button"
            onClick={() => window.print()}
            className="flex items-center gap-1.5 px-4 py-2 rounded-full text-sm font-semibold text-white transition hover:brightness-110"
            style={{ background: BRAND.blue }}
          >
            <Printer className="w-4 h-4" />
            Descargar / Imprimir PDF
          </button>
          <button
            type="button"
            onClick={onClose}
            className="p-2 rounded-full hover:bg-black/5 transition"
            style={{ color: '#78716c' }}
            aria-label="Cerrar"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        <div className="p-8 sm:p-10">
          <div className="flex items-start justify-between gap-4 mb-8">
            <div>
              <img src="/img/nymologo-navbar.png" alt="Nymoo" className="h-9 w-auto mb-3" />
              <p className="text-xs uppercase tracking-widest" style={{ color: '#78716c' }}>
                Comprobante de compra
              </p>
            </div>
            <div className="text-right">
              <p className="font-mono text-sm font-semibold">{order.orderNumber}</p>
              <p className="text-xs" style={{ color: '#78716c' }}>
                {new Date(order.createdAt).toLocaleDateString('es-AR', { day: 'numeric', month: 'long', year: 'numeric' })}
              </p>
            </div>
          </div>

          <div className="grid sm:grid-cols-2 gap-6 mb-8 text-sm">
            <div>
              <p className="text-xs uppercase tracking-wide mb-1" style={{ color: '#78716c' }}>
                Cliente
              </p>
              <p className="font-semibold">{order.clientData?.name}</p>
              {order.clientData?.email && <p style={{ color: '#57534e' }}>{order.clientData.email}</p>}
              {order.clientData?.phone && <p style={{ color: '#57534e' }}>{order.clientData.phone}</p>}
            </div>
            <div>
              <p className="text-xs uppercase tracking-wide mb-1" style={{ color: '#78716c' }}>
                Estado
              </p>
              <p className="font-semibold">{order.paymentStatus}</p>
              <p style={{ color: '#57534e' }}>{PAYMENT_METHOD_LABELS[order.paymentMethod] || order.paymentMethod}</p>
            </div>
          </div>

          <div className="rounded-2xl border overflow-hidden mb-6" style={{ borderColor: '#e7e1d6' }}>
            <div
              className="grid grid-cols-[1fr_auto] gap-3 px-4 py-2.5 text-xs uppercase tracking-wide"
              style={{ background: '#efe9dd', color: '#78716c' }}
            >
              <span>Producto</span>
              <span>Precio</span>
            </div>
            {(order.items || []).map((item) => (
              <div
                key={item.name}
                className="grid grid-cols-[1fr_auto] gap-3 px-4 py-3 text-sm border-t"
                style={{ borderColor: '#e7e1d6' }}
              >
                <span>{item.name}</span>
                <span className="font-medium">{currency(item.price)}</span>
              </div>
            ))}
            <div
              className="grid grid-cols-[1fr_auto] gap-3 px-4 py-3 text-sm font-bold border-t"
              style={{ borderColor: '#e7e1d6', background: '#efe9dd' }}
            >
              <span>Total</span>
              <span>{currency(order.totalPrice)}</span>
            </div>
          </div>

          <p className="text-xs leading-relaxed" style={{ color: '#78716c' }}>
            Gracias por confiar en Nymoo Eventos Digitales. Ante cualquier consulta sobre este comprobante, escribinos por WhatsApp al{' '}
            {LANDING_CONTACT.whatsappNumber}.
          </p>
        </div>
      </motion.div>
    </motion.div>
  )
}

function OrdersDashboard() {
  const isAdmin = Boolean(getStoredUser()?.isAdmin)
  const [orders, setOrders] = useState([])
  const [loadState, setLoadState] = useState('loading')
  const [modalOpen, setModalOpen] = useState(false)
  const [activeTab, setActiveTab] = useState('activos') // activos | archivados
  const [linkCopied, setLinkCopied] = useState(false)
  const [invoiceOrder, setInvoiceOrder] = useState(null)
  const [cloudinaryUsage, setCloudinaryUsage] = useState(null)

  async function handleCopyShareLink() {
    try {
      await navigator.clipboard.writeText(SHARED_FORM_URL)
    } catch {
      window.prompt('Copiá este link:', SHARED_FORM_URL)
      return
    }
    setLinkCopied(true)
    setTimeout(() => setLinkCopied(false), 2000)
  }

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

  // Solo informativo -- si falla (token vencido, Cloudinary caído, etc.) no
  // pasa nada, la barra simplemente no se muestra, sin romper el resto del
  // panel de pedidos.
  useEffect(() => {
    if (!isAdmin) return
    api
      .get('/system/cloudinary-usage')
      .then(({ data }) => setCloudinaryUsage(data))
      .catch(() => setCloudinaryUsage(null))
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

  async function handleArchiveToggle(orderId, archived) {
    const previous = orders
    setOrders((prev) => prev.map((o) => (o._id === orderId ? { ...o, archived } : o)))
    try {
      await api.patch(`/orders/${orderId}/archive`, { archived })
    } catch {
      setOrders(previous)
    }
  }

  // Los archivados no cuentan para las estadísticas ni para la lista de
  // "Activos" -- son pedidos que quedaron en Pendiente y nunca se cerraron.
  const activeOrders = useMemo(() => orders.filter((o) => !o.archived), [orders])
  const archivedOrders = useMemo(() => orders.filter((o) => o.archived), [orders])
  const visibleOrders = activeTab === 'archivados' ? archivedOrders : activeOrders

  const stats = useMemo(() => {
    const totalFacturado = activeOrders
      .filter((o) => o.paymentStatus === 'Pagado Completo')
      .reduce((sum, o) => sum + (o.totalPrice || 0), 0)
    const ventas = activeOrders.filter((o) => o.paymentStatus !== 'Pendiente').length
    const pendientes = activeOrders.filter((o) => o.paymentStatus === 'Pendiente').length
    const byPack = {}
    activeOrders.forEach((o) => {
      ;(o.items || []).forEach((item) => {
        byPack[item.name] = (byPack[item.name] || 0) + 1
      })
    })
    const topPack = Object.entries(byPack).sort((a, b) => b[1] - a[1])[0]
    return { totalFacturado, ventas, pendientes, topPack }
  }, [activeOrders])

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
          <div className="flex items-center gap-2 flex-wrap">
            <Button
              type="button"
              onClick={handleCopyShareLink}
              className="text-sm py-2.5 bg-white/5 border border-white/10 hover:bg-white/10"
              style={{ color: 'white' }}
            >
              {linkCopied ? <CheckIcon className="w-4 h-4" style={{ color: BRAND.lime }} /> : <Share2 className="w-4 h-4" />}
              {linkCopied ? '¡Link copiado!' : 'Compartir formulario'}
            </Button>
            <Button type="button" onClick={() => setModalOpen(true)} primaryColor={BRAND.blue} className="text-sm py-2.5">
              <Plus className="w-4 h-4" />
              Nuevo pedido manual
            </Button>
          </div>
        </div>

        <div className="grid grid-cols-2 lg:grid-cols-4 gap-3 sm:gap-4">
          <StatCard icon={Wallet} label="Total facturado" value={currency(stats.totalFacturado)} color={BRAND.lime} />
          <StatCard icon={ShoppingBag} label="Cantidad de ventas" value={stats.ventas} color={BRAND.blue} />
          <StatCard icon={Clock} label="Pedidos pendientes" value={stats.pendientes} color="#f59e0b" />
          <StatCard icon={PieChart} label="Pack más vendido" value={stats.topPack ? stats.topPack[0] : '—'} color={BRAND.pink} />
        </div>

        <CloudinaryUsageBar usage={cloudinaryUsage} />

        <div className="flex items-center gap-2">
          <button
            type="button"
            onClick={() => setActiveTab('activos')}
            className="px-3.5 py-1.5 rounded-full text-xs font-semibold transition"
            style={
              activeTab === 'activos'
                ? { background: `${BRAND.blue}22`, color: BRAND.blue, boxShadow: `inset 0 0 0 1px ${BRAND.blue}55` }
                : { color: 'rgba(255,255,255,0.4)' }
            }
          >
            Activos ({activeOrders.length})
          </button>
          <button
            type="button"
            onClick={() => setActiveTab('archivados')}
            className="px-3.5 py-1.5 rounded-full text-xs font-semibold transition flex items-center gap-1.5"
            style={
              activeTab === 'archivados'
                ? { background: `${BRAND.blue}22`, color: BRAND.blue, boxShadow: `inset 0 0 0 1px ${BRAND.blue}55` }
                : { color: 'rgba(255,255,255,0.4)' }
            }
          >
            <Archive className="w-3.5 h-3.5" />
            Archivados ({archivedOrders.length})
          </button>
        </div>

        <GlassPanel accentColor={BRAND.blue} className="p-4 sm:p-6">
          {loadState === 'loading' && <p className="text-white/40 text-center py-10">Cargando pedidos...</p>}
          {loadState === 'error' && <p className="text-red-400 text-center py-10">No se pudieron cargar los pedidos.</p>}
          {loadState === 'ready' && visibleOrders.length === 0 && (
            <p className="text-white/40 text-center py-10">
              {activeTab === 'archivados' ? 'Todavía no archivaste ningún pedido.' : 'Todavía no hay pedidos.'}
            </p>
          )}
          {loadState === 'ready' && visibleOrders.length > 0 && (
            <div className="space-y-2">
              <div className="hidden sm:grid grid-cols-[16px_1fr] gap-3 px-4 pb-2">
                <div />
                <div className="grid grid-cols-5 gap-2 text-xs text-white/40 uppercase tracking-wide">
                  <span>Pedido</span>
                  <span>Cliente</span>
                  <span>Producto(s)</span>
                  <span>Total</span>
                  <span>Fecha</span>
                </div>
              </div>
              {visibleOrders.map((order) => (
                <OrderRow
                  key={order._id}
                  order={order}
                  onStatusChange={handleStatusChange}
                  onArchiveToggle={handleArchiveToggle}
                  onInvoice={setInvoiceOrder}
                />
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

      <AnimatePresence>{invoiceOrder && <InvoiceModal order={invoiceOrder} onClose={() => setInvoiceOrder(null)} />}</AnimatePresence>
    </div>
  )
}

export default OrdersDashboard

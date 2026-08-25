import { useEffect, useState } from 'react'
import { useSearchParams, Link } from 'react-router-dom'
import { motion } from 'motion/react'
import { Sparkles, CreditCard } from 'lucide-react'
import api from '../services/api'
import Button from '../components/ui/Button'
import OrderForm from '../components/orders/OrderForm'
import PackPicker from '../components/orders/PackPicker'
import DuoAddonToggle from '../components/orders/DuoAddonToggle'
import { WhatsappIcon } from '../components/icons/BrandIcons'
import { BRAND } from '../utils/brand'
import { cn } from '../utils/cn'
import { LANDING_CONTACT, LANDING_PACKS, buildWhatsappUrl, DUO_ADDON_NAME, computeDuoAddonPrice } from '../utils/landingConfig'
import { EMPTY_ORDER_FORM } from '../utils/orderForm'

const WELCOME_MESSAGE =
  '✨ ¡Estás a un paso de comenzar la transformación de tu gran día! Completar estos campos nos ayudará a orientarnos para diseñar y maquetar tu software de forma ágil. No te preocupes por la perfección, esto es un punto de partida inicial; luego, a través de nuestro contacto privado, realizaremos la personalización al 100% de cada detalle.'

function buildOrderWhatsappMessage(orderNumber, form, packNames, total) {
  const lines = [
    `¡Hola Nymoo! Acabo de completar mi solicitud para el Pedido ${orderNumber}.`,
    `Pack(s): ${packNames.join(', ')}.`,
    `Total: $${total.toLocaleString('es-AR')}.`,
    form.eventData.protagonists && `Protagonistas: ${form.eventData.protagonists}.`,
    form.eventData.eventType && `Tipo de evento: ${form.eventData.eventType}.`,
    form.eventData.date && `Fecha: ${form.eventData.date}.`,
    '¡Quedo atento/a para coordinar los próximos pasos!',
  ].filter(Boolean)
  return lines.join('\n')
}

function Checkout() {
  const [searchParams] = useSearchParams()
  const initialPackId = searchParams.get('pack')
  const initialPack = LANDING_PACKS.find((p) => p.id === initialPackId) || null

  const [selectedPackIds, setSelectedPackIds] = useState(initialPack ? [initialPack.id] : [LANDING_PACKS[1].id])
  const [duoSelected, setDuoSelected] = useState(false)
  const [form, setForm] = useState(EMPTY_ORDER_FORM)
  const [paymentMethod, setPaymentMethod] = useState(null)
  const [status, setStatus] = useState('idle') // idle | submitting | error
  const [errorMessage, setErrorMessage] = useState('')

  // Se llega acá con <Link> desde la landing (navegación de cliente, sin
  // recarga de página) -- el navegador no resetea el scroll solo, así que
  // sin esto el checkout "empieza" donde haya quedado scrolleada la landing.
  useEffect(() => {
    window.scrollTo(0, 0)
  }, [])

  const selectedPacks = LANDING_PACKS.filter((p) => selectedPackIds.includes(p.id))
  const duoPrice = computeDuoAddonPrice(selectedPacks)
  const duoActive = duoSelected && duoPrice > 0
  const total = selectedPacks.reduce((sum, p) => sum + p.priceValue, 0) + (duoActive ? duoPrice : 0)

  function togglePack(id) {
    setSelectedPackIds((prev) => (prev.includes(id) ? prev.filter((p) => p !== id) : [...prev, id]))
  }

  function updateField(section, field, value) {
    setForm((prev) => ({ ...prev, [section]: { ...prev[section], [field]: value } }))
  }

  async function handleSubmit(e) {
    e.preventDefault()
    if (selectedPacks.length === 0) {
      setErrorMessage('Elegí al menos un pack para continuar')
      return
    }
    if (!paymentMethod) {
      setErrorMessage('Elegí una forma de pago para continuar')
      return
    }

    setStatus('submitting')
    setErrorMessage('')

    try {
      const { data } = await api.post('/orders', {
        ...form,
        guestCardDetails: {
          ...form.guestCardDetails,
          pricePerCard: form.guestCardDetails.hasCost ? form.guestCardDetails.pricePerCard : '',
        },
        items: [...selectedPacks.map((p) => ({ name: p.name })), ...(duoActive ? [{ name: DUO_ADDON_NAME }] : [])],
        paymentMethod,
      })

      if (paymentMethod === 'mercado_pago' && data.redirectUrl) {
        window.location.href = data.redirectUrl
        return
      }

      // whatsapp_coordinar, o mercado_pago sin credenciales reales activadas
      // todavía -- mismo destino honesto: coordinar por WhatsApp con todo el
      // contexto del pedido ya guardado.
      const message = buildOrderWhatsappMessage(
        data.order.orderNumber,
        form,
        [...selectedPacks.map((p) => p.name), ...(duoActive ? [DUO_ADDON_NAME] : [])],
        total
      )
      window.location.href = buildWhatsappUrl(message, LANDING_CONTACT.whatsappNumber)
    } catch (err) {
      setStatus('error')
      setErrorMessage(err.response?.data?.message || 'No se pudo enviar tu solicitud')
    }
  }

  return (
    <div className="min-h-screen w-full text-white" style={{ background: BRAND.night }}>
      <header className="border-b border-white/10 px-4 md:px-8 py-4">
        <div className="max-w-3xl mx-auto flex items-center justify-between">
          <Link to="/" className="flex items-center gap-2">
            <img src="/img/nymologo-navbar.png" alt="Nymoo" className="h-10 w-auto" />
          </Link>
        </div>
      </header>

      <form onSubmit={handleSubmit} className="max-w-3xl mx-auto px-4 md:px-8 py-10 space-y-6">
        <motion.div
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          className="rounded-2xl p-5 sm:p-6 flex items-start gap-3"
          style={{ background: `${BRAND.blue}14`, border: `1px solid ${BRAND.blue}35` }}
        >
          <Sparkles className="w-5 h-5 shrink-0 mt-0.5" style={{ color: BRAND.blue }} />
          <p className="text-sm text-white/80 leading-relaxed">{WELCOME_MESSAGE}</p>
        </motion.div>

        <div>
          <div className="flex items-center justify-between mb-3 gap-3 flex-wrap">
            <h2 className="text-base font-semibold">Elegí uno o más packs</h2>
            {selectedPacks.length > 0 && (
              <p className="text-sm text-white/60">
                Total: <span className="font-bold text-white">${total.toLocaleString('es-AR')}</span>
              </p>
            )}
          </div>
          <PackPicker selectedIds={selectedPackIds} onToggle={togglePack} />
          <div className="mt-3">
            <DuoAddonToggle selectedPacks={selectedPacks} selected={duoActive} onToggle={() => setDuoSelected((v) => !v)} />
          </div>
        </div>

        <OrderForm form={form} onField={updateField} />

        <div>
          <h2 className="text-base font-semibold mb-3">Forma de pago</h2>
          <div className="grid sm:grid-cols-2 gap-4">
            <button
              type="button"
              onClick={() => setPaymentMethod('mercado_pago')}
              className={cn(
                'flex flex-col items-center gap-2 text-center rounded-2xl border p-5 transition',
                paymentMethod === 'mercado_pago' ? 'border-transparent bg-white/[0.06]' : 'border-white/10 bg-white/[0.02] hover:bg-white/[0.04]'
              )}
              style={paymentMethod === 'mercado_pago' ? { boxShadow: `0 0 0 2px ${BRAND.blue}` } : undefined}
            >
              <CreditCard className="w-6 h-6" style={{ color: BRAND.blue }} />
              <span className="font-semibold text-sm">Mercado Pago</span>
              <span className="text-white/50 text-xs italic">Hasta 3 cuotas con tarjeta bancaria</span>
            </button>
            <button
              type="button"
              onClick={() => setPaymentMethod('whatsapp_coordinar')}
              className={cn(
                'flex flex-col items-center gap-2 text-center rounded-2xl border p-5 transition',
                paymentMethod === 'whatsapp_coordinar' ? 'border-transparent bg-white/[0.06]' : 'border-white/10 bg-white/[0.02] hover:bg-white/[0.04]'
              )}
              style={paymentMethod === 'whatsapp_coordinar' ? { boxShadow: '0 0 0 2px #25D366' } : undefined}
            >
              <WhatsappIcon className="w-6 h-6" style={{ color: '#25D366' }} />
              <span className="font-semibold text-sm">Coordinar por WhatsApp</span>
              <span className="text-white/50 text-xs">Transferencia o efectivo</span>
            </button>
          </div>
        </div>

        {errorMessage && <p className="text-red-400 text-sm text-center">{errorMessage}</p>}

        <Button
          type="submit"
          disabled={status === 'submitting'}
          primaryColor={selectedPacks[0]?.accentColor || BRAND.blue}
          className="w-full py-3.5 text-base font-semibold disabled:opacity-40"
        >
          {status === 'submitting' ? 'Enviando...' : `Finalizar compra · $${total.toLocaleString('es-AR')}`}
        </Button>
      </form>
    </div>
  )
}

export default Checkout

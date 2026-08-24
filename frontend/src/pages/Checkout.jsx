import { useState } from 'react'
import { useSearchParams, Link } from 'react-router-dom'
import { motion } from 'motion/react'
import { Sparkles, CreditCard, Check } from 'lucide-react'
import api from '../services/api'
import Button from '../components/ui/Button'
import OrderForm from '../components/orders/OrderForm'
import { WhatsappIcon } from '../components/icons/BrandIcons'
import { BRAND } from '../utils/brand'
import { cn } from '../utils/cn'
import { LANDING_CONTACT, LANDING_PACKS, buildWhatsappUrl } from '../utils/landingConfig'
import { EMPTY_ORDER_FORM } from '../utils/orderForm'

const WELCOME_MESSAGE =
  '✨ ¡Estás a un paso de comenzar la transformación de tu gran día! Completar estos campos nos ayudará a orientarnos para diseñar y maquetar tu software de forma ágil. No te preocupes por la perfección, esto es un punto de partida inicial; luego, a través de nuestro contacto privado, realizaremos la personalización al 100% de cada detalle.'

function buildOrderWhatsappMessage(orderNumber, form, packName) {
  const lines = [
    `¡Hola Nymoo! Acabo de completar mi solicitud para el Pedido ${orderNumber}.`,
    `Pack: ${packName}.`,
    form.eventData.protagonists && `Protagonistas: ${form.eventData.protagonists}.`,
    form.eventData.eventType && `Tipo de evento: ${form.eventData.eventType}.`,
    form.eventData.date && `Fecha: ${form.eventData.date}.`,
    '¡Quedo atento/a para coordinar los próximos pasos!',
  ].filter(Boolean)
  return lines.join('\n')
}

function PackPicker({ selectedId, onSelect }) {
  return (
    <div className="grid sm:grid-cols-2 lg:grid-cols-4 gap-3">
      {LANDING_PACKS.map((pack) => {
        const isSelected = pack.id === selectedId
        return (
          <button
            key={pack.id}
            type="button"
            onClick={() => onSelect(pack.id)}
            className={cn(
              'relative text-left rounded-2xl border p-4 transition',
              isSelected ? 'border-transparent bg-white/[0.06]' : 'border-white/10 bg-white/[0.02] hover:bg-white/[0.04]'
            )}
            style={isSelected ? { boxShadow: `0 0 0 2px ${pack.accentColor}` } : undefined}
          >
            {isSelected && (
              <span
                className="absolute top-3 right-3 w-5 h-5 rounded-full flex items-center justify-center"
                style={{ background: pack.accentColor }}
              >
                <Check className="w-3 h-3 text-white" />
              </span>
            )}
            <p className="font-semibold text-sm">{pack.name}</p>
            <p className="text-lg font-extrabold mt-1" style={{ color: pack.accentColor }}>
              {pack.price}
            </p>
          </button>
        )
      })}
    </div>
  )
}

function Checkout() {
  const [searchParams] = useSearchParams()
  const initialPackId = searchParams.get('pack')
  const initialPack = LANDING_PACKS.find((p) => p.id === initialPackId) || null

  const [selectedPackId, setSelectedPackId] = useState(initialPack?.id || LANDING_PACKS[1].id)
  const [form, setForm] = useState(EMPTY_ORDER_FORM)
  const [paymentMethod, setPaymentMethod] = useState(null)
  const [status, setStatus] = useState('idle') // idle | submitting | error
  const [errorMessage, setErrorMessage] = useState('')

  const selectedPack = LANDING_PACKS.find((p) => p.id === selectedPackId)

  function updateField(section, field, value) {
    setForm((prev) => ({ ...prev, [section]: { ...prev[section], [field]: value } }))
  }

  async function handleSubmit(e) {
    e.preventDefault()
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
          pricePerCard: form.guestCardDetails.hasCost ? Number(form.guestCardDetails.pricePerCard) || 0 : 0,
        },
        packDetails: { packName: selectedPack.name },
        paymentMethod,
      })

      if (paymentMethod === 'mercado_pago' && data.redirectUrl) {
        window.location.href = data.redirectUrl
        return
      }

      // whatsapp_coordinar, o mercado_pago sin credenciales reales activadas
      // todavía -- mismo destino honesto: coordinar por WhatsApp con todo el
      // contexto del pedido ya guardado.
      const message = buildOrderWhatsappMessage(data.order.orderNumber, form, selectedPack.name)
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
          <h2 className="text-base font-semibold mb-3">Elegí tu pack</h2>
          <PackPicker selectedId={selectedPackId} onSelect={setSelectedPackId} />
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
              <span className="text-white/50 text-xs">Hasta 3 cuotas</span>
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
          primaryColor={selectedPack?.accentColor || BRAND.blue}
          className="w-full py-3.5 text-base font-semibold disabled:opacity-40"
        >
          {status === 'submitting' ? 'Enviando...' : `Finalizar compra · ${selectedPack?.price || ''}`}
        </Button>
      </form>
    </div>
  )
}

export default Checkout

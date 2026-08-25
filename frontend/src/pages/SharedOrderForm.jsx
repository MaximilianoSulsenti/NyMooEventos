import { useEffect, useState } from 'react'
import { useSearchParams, Link } from 'react-router-dom'
import { motion } from 'motion/react'
import { Sparkles, CheckCircle2 } from 'lucide-react'
import api from '../services/api'
import Button from '../components/ui/Button'
import OrderForm from '../components/orders/OrderForm'
import PackPicker from '../components/orders/PackPicker'
import DuoAddonToggle from '../components/orders/DuoAddonToggle'
import { BRAND } from '../utils/brand'
import { LANDING_PACKS, DUO_ADDON_NAME, computeDuoAddonPrice } from '../utils/landingConfig'
import { EMPTY_ORDER_FORM } from '../utils/orderForm'

const WELCOME_MESSAGE =
  '✨ ¡Hola! Ya coordinamos tu compra por otro medio -- este formulario es solo para que nos cuentes los detalles de tu evento y cómo te gustaría que se vea tu tarjeta digital. No te preocupes por la perfección, esto es un punto de partida: después lo terminamos de afinar juntos por WhatsApp.'

function Checkmark() {
  return (
    <motion.div
      initial={{ opacity: 0, y: 10 }}
      animate={{ opacity: 1, y: 0 }}
      className="max-w-md mx-auto text-center py-24 px-4"
    >
      <CheckCircle2 className="w-14 h-14 mx-auto mb-4" style={{ color: BRAND.lime }} />
      <h1 className="text-xl font-semibold mb-2">¡Listo, recibimos tus datos!</h1>
      <p className="text-white/60 text-sm leading-relaxed">
        Nos vamos a poner en contacto por WhatsApp para coordinar los últimos detalles y arrancar con el diseño de tu evento.
      </p>
      <Link to="/" className="inline-block mt-6 text-sm underline text-white/50 hover:text-white transition">
        Volver al inicio
      </Link>
    </motion.div>
  )
}

function SharedOrderForm() {
  const [searchParams] = useSearchParams()
  const initialPackId = searchParams.get('pack')
  const initialPack = LANDING_PACKS.find((p) => p.id === initialPackId) || null

  const [selectedPackIds, setSelectedPackIds] = useState(initialPack ? [initialPack.id] : [LANDING_PACKS[1].id])
  const [duoSelected, setDuoSelected] = useState(false)
  const [form, setForm] = useState(EMPTY_ORDER_FORM)
  const [status, setStatus] = useState('idle') // idle | submitting | done | error
  const [errorMessage, setErrorMessage] = useState('')

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

    setStatus('submitting')
    setErrorMessage('')

    try {
      await api.post('/orders/self-fill', {
        ...form,
        guestCardDetails: {
          ...form.guestCardDetails,
          pricePerCard: form.guestCardDetails.hasCost ? form.guestCardDetails.pricePerCard : '',
        },
        items: [...selectedPacks.map((p) => ({ name: p.name })), ...(duoActive ? [{ name: DUO_ADDON_NAME }] : [])],
      })
      setStatus('done')
    } catch (err) {
      setStatus('error')
      setErrorMessage(err.response?.data?.message || 'No se pudo enviar tu formulario')
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

      {status === 'done' ? (
        <Checkmark />
      ) : (
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
              <h2 className="text-base font-semibold">Tu(s) pack(s)</h2>
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

          {errorMessage && <p className="text-red-400 text-sm text-center">{errorMessage}</p>}

          <Button
            type="submit"
            disabled={status === 'submitting'}
            primaryColor={selectedPacks[0]?.accentColor || BRAND.blue}
            className="w-full py-3.5 text-base font-semibold disabled:opacity-40"
          >
            {status === 'submitting' ? 'Enviando...' : 'Enviar mis datos'}
          </Button>
        </form>
      )}
    </div>
  )
}

export default SharedOrderForm

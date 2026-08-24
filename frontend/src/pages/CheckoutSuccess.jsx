import { useSearchParams, Link } from 'react-router-dom'
import { motion } from 'motion/react'
import { CheckCircle2 } from 'lucide-react'
import Button from '../components/ui/Button'
import { WhatsappIcon } from '../components/icons/BrandIcons'
import { BRAND } from '../utils/brand'
import { LANDING_CONTACT, buildWhatsappUrl } from '../utils/landingConfig'

function CheckoutSuccess() {
  const [searchParams] = useSearchParams()
  const orderNumber = searchParams.get('pedido') || ''
  // Mercado Pago agrega estos parámetros solos al volver del pago
  // (back_urls + auto_return), no hace falta armarlos a mano.
  const paymentId = searchParams.get('payment_id') || searchParams.get('collection_id') || ''

  const message = [
    `¡Hola Nymoo! Ya completé el pago de mi pedido ${orderNumber || ''}.`.trim(),
    paymentId && `ID de transacción de Mercado Pago: ${paymentId}.`,
    '¿Podemos coordinar la entrega?',
  ]
    .filter(Boolean)
    .join(' ')

  return (
    <div className="min-h-screen w-full flex items-center justify-center px-4 text-white" style={{ background: BRAND.night }}>
      <motion.div
        initial={{ opacity: 0, y: 16 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5 }}
        className="max-w-md w-full text-center rounded-3xl border border-white/10 bg-white/[0.03] p-8 sm:p-10"
      >
        <motion.div
          initial={{ scale: 0.6, opacity: 0 }}
          animate={{ scale: 1, opacity: 1 }}
          transition={{ delay: 0.15, type: 'spring', stiffness: 200, damping: 16 }}
          className="w-16 h-16 rounded-full flex items-center justify-center mx-auto mb-5"
          style={{ background: `${BRAND.lime}22`, border: `1px solid ${BRAND.lime}45` }}
        >
          <CheckCircle2 className="w-8 h-8" style={{ color: BRAND.lime }} />
        </motion.div>

        <h1 className="text-2xl font-extrabold tracking-tight mb-2">¡Gracias por tu compra!</h1>
        <p className="text-white/60 text-sm mb-1">
          {orderNumber ? (
            <>
              Tu pedido <span className="font-semibold text-white">{orderNumber}</span> quedó registrado.
            </>
          ) : (
            'Tu pedido quedó registrado.'
          )}
        </p>
        <p className="text-white/60 text-sm mb-7">
          Escribinos por WhatsApp para coordinar la entrega y arrancar con el diseño de tu invitación.
        </p>

        <Button
          as="a"
          href={buildWhatsappUrl(message, LANDING_CONTACT.whatsappNumber)}
          target="_blank"
          rel="noreferrer"
          primaryColor="#25D366"
          className="w-full py-3 text-sm font-semibold"
        >
          <WhatsappIcon className="w-4 h-4" />
          Contactar por WhatsApp y entregar pedido
        </Button>

        <Link to="/" className="block text-white/40 text-xs mt-5 hover:text-white transition">
          Volver al inicio
        </Link>
      </motion.div>
    </div>
  )
}

export default CheckoutSuccess

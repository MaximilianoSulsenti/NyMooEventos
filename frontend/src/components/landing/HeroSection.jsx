import { motion } from 'motion/react'
import { Sparkles } from 'lucide-react'
import { WhatsappIcon } from '../icons/BrandIcons'
import Button from '../ui/Button'
import { BRAND } from '../../utils/brand'
import { LANDING_CONTACT, buildWhatsappUrl } from '../../utils/landingConfig'

const WHATSAPP_MESSAGE = '¡Hola Nymoo! Quiero armar la invitación digital de mi evento.'

function HeroSection() {
  return (
    <section className="relative overflow-hidden min-h-[85vh] flex items-center justify-center text-center px-4 md:px-8">
      {/* Capa de fondo ambiental: manchas de color de marca flotando despacio,
          mismo lenguaje visual que BrandBackground (login / listado de
          eventos) -- si más adelante hay una foto/video real de un evento
          entregado, esta capa puede reemplazarse por EnvelopeBackground-style
          bgType image/video sin tocar el resto de la sección. */}
      <div className="absolute inset-0 -z-10" style={{ background: BRAND.night }}>
        <motion.div
          className="absolute w-[34rem] h-[34rem] rounded-full blur-3xl opacity-30"
          style={{ background: BRAND.blue, top: '-10%', left: '-10%' }}
          animate={{ x: [0, 40, 0], y: [0, 30, 0] }}
          transition={{ duration: 18, repeat: Infinity, ease: 'easeInOut' }}
        />
        <motion.div
          className="absolute w-[30rem] h-[30rem] rounded-full blur-3xl opacity-25"
          style={{ background: BRAND.violet, bottom: '-14%', right: '-8%' }}
          animate={{ x: [0, -30, 0], y: [0, -20, 0] }}
          transition={{ duration: 22, repeat: Infinity, ease: 'easeInOut' }}
        />
        <motion.div
          className="absolute w-[22rem] h-[22rem] rounded-full blur-3xl opacity-20"
          style={{ background: BRAND.pink, top: '30%', right: '15%' }}
          animate={{ x: [0, 20, 0], y: [0, 25, 0] }}
          transition={{ duration: 20, repeat: Infinity, ease: 'easeInOut' }}
        />
        <div className="absolute inset-0 bg-gradient-to-t from-neutral-950 via-transparent to-neutral-950/40" />
      </div>

      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.8, ease: 'easeOut' }}
        className="max-w-3xl mx-auto"
      >
        <motion.p
          initial={{ opacity: 0, y: -10, scale: 0.9 }}
          animate={{ opacity: 1, y: 0, scale: 1 }}
          transition={{ duration: 0.5, delay: 0.2 }}
          className="inline-flex items-center gap-2 mb-5 px-4 py-1.5 rounded-full text-xs md:text-sm font-medium"
          style={{ background: `${BRAND.lime}22`, color: BRAND.lime, border: `1px solid ${BRAND.lime}40` }}
        >
          <Sparkles className="w-3.5 h-3.5" />
          Invitaciones digitales que se sienten premium
        </motion.p>

        <h1
          className="font-extrabold tracking-tight mb-5 leading-tight"
          style={{ fontSize: 'clamp(2.25rem, 6vw, 3.75rem)' }}
        >
          La invitación de tu evento,{' '}
          <span
            style={{
              backgroundImage: `linear-gradient(90deg, ${BRAND.blue}, ${BRAND.violet}, ${BRAND.pink})`,
              WebkitBackgroundClip: 'text',
              backgroundClip: 'text',
              color: 'transparent',
            }}
          >
            viva en el celular
          </span>{' '}
          de cada invitado
        </h1>

        <p
          className="text-white/60 mx-auto mb-9"
          style={{ fontSize: 'clamp(0.95rem, 2vw, 1.15rem)', maxWidth: '38rem' }}
        >
          Diseñamos y programamos tu tarjeta digital interactiva: cuenta regresiva, ubicación, confirmación de
          asistencia, álbum colaborativo y pantalla en vivo para la fiesta. Todo listo en menos de 3 días.
        </p>

        <motion.div animate={{ scale: [1, 1.03, 1] }} transition={{ duration: 2.4, repeat: Infinity, ease: 'easeInOut' }}>
          <Button
            as="a"
            href={buildWhatsappUrl(WHATSAPP_MESSAGE, LANDING_CONTACT.whatsappNumber)}
            target="_blank"
            rel="noreferrer"
            primaryColor="#25D366"
            whileHover={{ scale: 1.05 }}
            whileTap={{ scale: 0.95 }}
            className="px-9 py-4 text-base font-semibold"
          >
            <WhatsappIcon className="w-5 h-5" />
            Chatear por WhatsApp
          </Button>
        </motion.div>
      </motion.div>
    </section>
  )
}

export default HeroSection

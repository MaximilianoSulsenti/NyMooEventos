import { motion } from 'motion/react'
import { Check, HeartCrack } from 'lucide-react'
import RsvpModalShell from './RsvpModalShell'
import { secondaryTextColor } from '../utils/color'

// Reemplaza al RsvpForm cuando un invitado VIP que YA confirmó (o declinó)
// vuelve a entrar con su link personalizado -- en vez de mostrarle de nuevo
// el formulario para completar, se le muestra esto: ya no hay nada que
// llenar, solo la confirmación de lo que ya quedó registrado.
function RsvpStatusCard({ guestName, status, companionNames, primaryColor = '#a855f7', modalBgColor, modalTextColor, onClose }) {
  const isConfirmed = status === 'confirmado'
  const companions = Array.isArray(companionNames) ? companionNames.filter(Boolean) : []
  const mutedColor = secondaryTextColor(modalTextColor, '99')
  const bodyColor = secondaryTextColor(modalTextColor, 'd9')

  return (
    <RsvpModalShell accentColor={primaryColor} bgColor={modalBgColor} textColor={modalTextColor} onClose={onClose}>
      <div className="text-center">
        <motion.span
          initial={{ scale: 0, rotate: -30 }}
          animate={{ scale: 1, rotate: 0 }}
          transition={{ type: 'spring', stiffness: 260, damping: 16 }}
          className="w-14 h-14 rounded-full flex items-center justify-center mx-auto mb-4"
          style={{ background: `${primaryColor}22`, color: primaryColor }}
        >
          {isConfirmed ? <Check className="w-7 h-7" /> : <HeartCrack className="w-7 h-7" />}
        </motion.span>

        <p className="text-sm mb-1" style={{ color: mutedColor }}>
          ¡Hola, {guestName}!
        </p>
        <h2 className="text-xl font-semibold mb-2">
          {isConfirmed ? 'Ya confirmaste tu asistencia' : 'Ya registramos tu respuesta'}
        </h2>

        {isConfirmed ? (
          <p className="text-sm leading-relaxed" style={{ color: bodyColor }}>
            {companions.length > 0 ? (
              <>Vas a venir con {companions.join(', ')}. ¡Los esperamos en el evento!</>
            ) : (
              '¡Te esperamos en el evento!'
            )}
          </p>
        ) : (
          <p className="text-sm leading-relaxed" style={{ color: bodyColor }}>
            Registramos que no vas a poder acompañarnos. ¡Gracias por avisarnos!
          </p>
        )}
      </div>
    </RsvpModalShell>
  )
}

export default RsvpStatusCard

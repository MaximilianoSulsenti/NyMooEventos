import { PartyPopper } from 'lucide-react'
import RsvpModalShell from './RsvpModalShell'
import { secondaryTextColor } from '../utils/color'

// Reemplaza al RsvpForm cuando el evento es una Invitación Dúo de un
// original con invitaciones VIP -- el invitado ya confirmó su asistencia en
// la invitación principal, así que acá no vuelve a pedirse RSVP: solo se
// muestra la info que cargó el organizador (rsvpSettings.duoInfoDescription
// en RsvpSettingsPanel.jsx) una vez identificado por nombre o passcode.
function DuoGuestInfoCard({ guestName, title, description, primaryColor = '#a855f7', modalBgColor, modalTextColor, onClose }) {
  const mutedColor = secondaryTextColor(modalTextColor, '99')
  const bodyColor = secondaryTextColor(modalTextColor, 'd9')
  const faintColor = secondaryTextColor(modalTextColor, '80')

  return (
    <RsvpModalShell accentColor={primaryColor} bgColor={modalBgColor} textColor={modalTextColor} onClose={onClose}>
      <div className="text-center">
        <span
          className="w-14 h-14 rounded-full flex items-center justify-center mx-auto mb-4"
          style={{ background: `${primaryColor}22`, color: primaryColor }}
        >
          <PartyPopper className="w-7 h-7" />
        </span>

        <p className="text-sm mb-1" style={{ color: mutedColor }}>
          ¡Hola, {guestName}!
        </p>
        <h2 className="text-xl font-semibold mb-4">{title}</h2>

        {description ? (
          <p className="text-sm leading-relaxed whitespace-pre-line" style={{ color: bodyColor }}>
            {description}
          </p>
        ) : (
          <p className="text-sm" style={{ color: faintColor }}>
            Ya tenés tu lugar confirmado -- ¡te esperamos!
          </p>
        )}
      </div>
    </RsvpModalShell>
  )
}

export default DuoGuestInfoCard

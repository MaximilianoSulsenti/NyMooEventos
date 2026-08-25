import { useState } from 'react'
import { MessageCircle, Database, Check, Crown, CreditCard } from 'lucide-react'
import api from '../../services/api'
import { BRAND } from '../../utils/brand'

const RSVP_TYPE_OPTIONS = [
  {
    value: 'basico_whatsapp',
    label: 'Básico · WhatsApp',
    description: 'Sin base de datos: un botón redirige directo a WhatsApp con el mensaje ya armado.',
    icon: MessageCircle,
  },
  {
    value: 'intermedio_db',
    label: 'Intermedio · Formulario propio',
    description: 'Los invitados confirman en la web, se guarda todo en la base y se exporta a Excel/CSV.',
    icon: Database,
  },
]

function RsvpSettingsPanel({ eventId, settings, onChange }) {
  const rsvpType = settings.rsvpType || 'intermedio_db'
  const [saveState, setSaveState] = useState('idle') // idle | saving | saved | error

  function update(patch) {
    onChange({ ...settings, ...patch })
  }

  // El plan se guarda al toque (no espera al "Guardar todo" general) porque
  // es lo que decide qué se muestra en la invitación pública -- si quedara
  // solo en el estado local del editor, era muy fácil elegir uno, no
  // acordarse de guardar, e irse pensando que ya había quedado activo.
  async function handleTypeChange(value) {
    update({ rsvpType: value })
    setSaveState('saving')
    try {
      await api.patch(`/events/${eventId}/rsvp-settings`, { rsvpType: value })
      setSaveState('saved')
      setTimeout(() => setSaveState('idle'), 1500)
    } catch {
      setSaveState('error')
    }
  }

  return (
    <div className="space-y-3" style={{ '--accent': BRAND.blue }}>
      {saveState === 'saved' && (
        <p className="flex items-center gap-1.5 text-xs text-green-400">
          <Check className="w-3.5 h-3.5" />
          Plan guardado
        </p>
      )}
      {saveState === 'error' && <p className="text-xs text-red-400">No se pudo guardar el plan, probá de nuevo.</p>}

      <div className="space-y-2">
        {RSVP_TYPE_OPTIONS.map((opt) => {
          const Icon = opt.icon
          const isActive = rsvpType === opt.value
          return (
            <button
              key={opt.value}
              type="button"
              onClick={() => handleTypeChange(opt.value)}
              className="w-full text-left rounded-xl border p-3 transition flex items-start gap-3"
              style={{
                background: isActive ? `${BRAND.blue}14` : 'rgba(255,255,255,0.03)',
                borderColor: isActive ? `${BRAND.blue}80` : 'rgba(255,255,255,0.1)',
              }}
            >
              <span
                className="w-8 h-8 rounded-full flex items-center justify-center shrink-0"
                style={{
                  background: isActive ? `${BRAND.blue}22` : 'rgba(255,255,255,0.06)',
                  color: isActive ? BRAND.blue : 'rgba(255,255,255,0.5)',
                }}
              >
                <Icon className="w-4 h-4" />
              </span>
              <span className="min-w-0">
                <span className="block text-sm font-medium">{opt.label}</span>
                <span className="block text-xs text-neutral-500 mt-0.5">{opt.description}</span>
              </span>
            </button>
          )
        })}
      </div>

      {rsvpType === 'basico_whatsapp' && (
        <div className="space-y-3 pt-3 border-t border-white/10">
          <div>
            <label className="block text-sm text-neutral-400 mb-1">Número de WhatsApp (con código de país, sin +)</label>
            <input
              type="text"
              value={settings.whatsappNumber || ''}
              onChange={(e) => update({ whatsappNumber: e.target.value.replace(/\D/g, '') })}
              placeholder="5491122334455"
              className="w-full rounded-xl bg-neutral-800 border border-white/10 px-3 py-2 text-sm outline-none focus:ring-2 focus:ring-[var(--accent)] transition"
            />
          </div>
          <div>
            <label className="block text-sm text-neutral-400 mb-1">Mensaje pre-armado (opcional)</label>
            <textarea
              value={settings.whatsappMessage || ''}
              onChange={(e) => update({ whatsappMessage: e.target.value })}
              rows={3}
              placeholder="Ej: ¡Hola! Quiero confirmar mi asistencia..."
              className="w-full rounded-xl bg-neutral-800 border border-white/10 px-3 py-2 text-sm outline-none focus:ring-2 focus:ring-[var(--accent)] transition"
            />
            <p className="text-xs text-neutral-500 mt-1">
              Si lo dejás vacío, se arma un mensaje automático con el nombre del evento.
            </p>
          </div>
        </div>
      )}

      <div className="space-y-3 pt-3 border-t border-white/10">
        <button
          type="button"
          onClick={() => update({ guestCardEnabled: !settings.guestCardEnabled })}
          className="w-full text-left rounded-xl border p-3 transition flex items-start gap-3"
          style={{
            background: settings.guestCardEnabled ? `${BRAND.blue}14` : 'rgba(255,255,255,0.03)',
            borderColor: settings.guestCardEnabled ? `${BRAND.blue}80` : 'rgba(255,255,255,0.1)',
          }}
        >
          <span
            className="w-8 h-8 rounded-full flex items-center justify-center shrink-0"
            style={{
              background: settings.guestCardEnabled ? `${BRAND.blue}22` : 'rgba(255,255,255,0.06)',
              color: settings.guestCardEnabled ? BRAND.blue : 'rgba(255,255,255,0.5)',
            }}
          >
            <CreditCard className="w-4 h-4" />
          </span>
          <span className="min-w-0">
            <span className="block text-sm font-medium">Mostrar "Ver valor de la tarjeta"</span>
            <span className="block text-xs text-neutral-500 mt-0.5">
              Agrega un botón dentro del RSVP para que el invitado vea cuánto cuesta su lugar, sin tener que
              preguntarles directo a ustedes.
            </span>
          </span>
        </button>

        {settings.guestCardEnabled && (
          <div className="space-y-3 pl-1">
            <div className="grid grid-cols-2 gap-3">
              <div>
                <label className="block text-sm text-neutral-400 mb-1">Precio adultos</label>
                <input
                  type="text"
                  value={settings.guestCardAdultPrice || ''}
                  onChange={(e) => update({ guestCardAdultPrice: e.target.value })}
                  placeholder="Ej: $15.000"
                  className="w-full rounded-xl bg-neutral-800 border border-white/10 px-3 py-2 text-sm outline-none focus:ring-2 focus:ring-[var(--accent)] transition"
                />
              </div>
              <div>
                <label className="block text-sm text-neutral-400 mb-1">Precio menores</label>
                <input
                  type="text"
                  value={settings.guestCardMinorPrice || ''}
                  onChange={(e) => update({ guestCardMinorPrice: e.target.value })}
                  placeholder="Ej: $7.500"
                  className="w-full rounded-xl bg-neutral-800 border border-white/10 px-3 py-2 text-sm outline-none focus:ring-2 focus:ring-[var(--accent)] transition"
                />
              </div>
            </div>
            <div>
              <label className="block text-sm text-neutral-400 mb-1">Descripción (opcional)</label>
              <textarea
                value={settings.guestCardDescription || ''}
                onChange={(e) => update({ guestCardDescription: e.target.value })}
                rows={2}
                placeholder="Ej: Incluye menú de 3 pasos, barra libre y torta."
                className="w-full rounded-xl bg-neutral-800 border border-white/10 px-3 py-2 text-sm outline-none focus:ring-2 focus:ring-[var(--accent)] transition"
              />
            </div>
            <p className="text-xs text-neutral-500">Dejá un campo vacío si no aplica (ej: sin costo para menores).</p>
          </div>
        )}
      </div>

      <p className="text-xs text-neutral-500 bg-white/5 border border-white/10 rounded-xl p-3 flex items-start gap-2">
        <Crown className="w-3.5 h-3.5 mt-0.5 shrink-0" />
        <span>
          ¿Invitaciones VIP con link personalizado por familia? Se activa aparte, como módulo, desde "Módulos" en el
          panel del evento.
        </span>
      </p>
    </div>
  )
}

export default RsvpSettingsPanel

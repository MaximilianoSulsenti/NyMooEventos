import { useState } from 'react'
import { UserPlus, Copy, Check, Trash2, MessageSquareText } from 'lucide-react'
import api from '../../services/api'
import { BRAND } from '../../utils/brand'
import { getContrastTextColor } from '../../utils/color'

const STATUS_STYLES = {
  confirmado: 'bg-green-500/15 text-green-400',
  declinado: 'bg-red-500/15 text-red-400',
  pendiente: 'bg-yellow-500/15 text-yellow-400',
}

function CopyButton({ text, label, icon: Icon }) {
  const [copied, setCopied] = useState(false)

  async function handleCopy() {
    try {
      await navigator.clipboard.writeText(text)
      setCopied(true)
      setTimeout(() => setCopied(false), 1500)
    } catch {
      setCopied(false)
    }
  }

  return (
    <button
      type="button"
      onClick={handleCopy}
      className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-medium transition shrink-0"
      style={{
        background: copied ? BRAND.lime : 'rgba(255,255,255,0.08)',
        color: copied ? getContrastTextColor(BRAND.lime) : 'rgba(255,255,255,0.7)',
      }}
    >
      {copied ? <Check className="w-3.5 h-3.5" /> : <Icon className="w-3.5 h-3.5" />}
      {copied ? 'Copiado' : label}
    </button>
  )
}

function PremiumGuestsPanel({ eventSlug, eventName, token, guests, onGuestsChange }) {
  const [name, setName] = useState('')
  const [maxCompanions, setMaxCompanions] = useState(0)
  const [status, setStatus] = useState('idle') // idle | sending | error
  const [errorMessage, setErrorMessage] = useState('')
  const [confirmDeleteId, setConfirmDeleteId] = useState(null)

  const premiumGuests = guests.filter((g) => g.passcode)
  const origin = window.location.origin

  async function handleCreate(event) {
    event.preventDefault()
    if (!name.trim()) return

    setStatus('sending')
    setErrorMessage('')
    try {
      await api.post(
        `/guests/client/${eventSlug}/premium`,
        { name: name.trim(), maxCompanionsAllowed: Number(maxCompanions) || 0 },
        { params: { token } }
      )
      setName('')
      setMaxCompanions(0)
      setStatus('idle')
      onGuestsChange()
    } catch (err) {
      setStatus('error')
      setErrorMessage(err.response?.data?.message || 'No se pudo agregar el invitado')
    }
  }

  async function handleDelete(guestId) {
    if (confirmDeleteId !== guestId) {
      setConfirmDeleteId(guestId)
      setTimeout(() => setConfirmDeleteId((current) => (current === guestId ? null : current)), 3000)
      return
    }
    setConfirmDeleteId(null)
    try {
      await api.delete(`/guests/client/${eventSlug}/${guestId}`, { params: { token } })
      onGuestsChange()
    } catch {
      // si falla, el invitado sigue en la lista y se puede reintentar
    }
  }

  return (
    <div className="space-y-6 max-w-2xl">
      <div>
        <h2 className="font-medium mb-1">Invitados VIP</h2>
        <p className="text-white/40 text-sm">
          Precargá cada familia o invitado con su cupo de acompañantes. Cada uno recibe un link personalizado con su
          nombre bloqueado y el cupo ya limitado en el formulario de confirmación.
        </p>
      </div>

      <form onSubmit={handleCreate} className="rounded-2xl bg-white/5 border border-white/10 p-4 space-y-3">
        <div className="flex flex-col sm:flex-row gap-3">
          <div className="flex-1 min-w-0">
            <label className="block text-xs text-white/40 mb-1">Nombre (ej. Familia Pérez)</label>
            <input
              type="text"
              value={name}
              onChange={(e) => setName(e.target.value)}
              required
              className="w-full rounded-xl bg-white/5 border border-white/10 px-3 py-2 text-sm outline-none focus:border-[var(--accent)] focus:ring-2 focus:ring-[var(--accent)]/30 transition"
              style={{ '--accent': BRAND.blue }}
            />
          </div>
          <div className="w-full sm:w-40">
            <label className="block text-xs text-white/40 mb-1">Cupo de acompañantes</label>
            <input
              type="number"
              min={0}
              max={50}
              value={maxCompanions}
              onChange={(e) => setMaxCompanions(e.target.value)}
              className="w-full rounded-xl bg-white/5 border border-white/10 px-3 py-2 text-sm outline-none focus:border-[var(--accent)] focus:ring-2 focus:ring-[var(--accent)]/30 transition"
              style={{ '--accent': BRAND.blue }}
            />
          </div>
        </div>
        {errorMessage && <p className="text-red-400 text-sm">{errorMessage}</p>}
        <button
          type="submit"
          disabled={status === 'sending'}
          className="w-full sm:w-auto flex items-center justify-center gap-2 px-4 py-2 rounded-xl text-sm font-medium transition disabled:opacity-40 hover:brightness-110"
          style={{ background: BRAND.blue, color: '#ffffff' }}
        >
          <UserPlus className="w-4 h-4" />
          {status === 'sending' ? 'Agregando...' : 'Agregar invitado VIP'}
        </button>
      </form>

      {premiumGuests.length === 0 ? (
        <div className="rounded-2xl bg-white/5 border border-white/10 p-6 text-center text-white/50">
          Todavía no cargaste ningún invitado VIP.
        </div>
      ) : (
        <div className="space-y-2">
          {premiumGuests.map((guest) => {
            // encodeURIComponent es clave acá: el slug de un evento puede
            // tener espacios u otros caracteres, y sin encodear, al pegar
            // el link en WhatsApp el mensaje se corta ahí mismo y el link
            // queda roto (404 al abrirlo).
            const link = `${origin}/evento/${encodeURIComponent(eventSlug)}?guest=${encodeURIComponent(guest.passcode)}`
            const companionsText =
              guest.maxCompanionsAllowed > 0
                ? ` (con lugar para hasta ${guest.maxCompanionsAllowed} acompañante${guest.maxCompanionsAllowed === 1 ? '' : 's'})`
                : ''
            const message = `¡Hola ${guest.name}! 🎉 Los invitamos con mucho cariño a acompañarnos en ${eventName}. Esta es tu invitación personalizada${companionsText}, confirmá tu asistencia acá:\n${link}`

            return (
              <div key={guest._id} className="rounded-2xl bg-white/5 border border-white/10 p-4 space-y-2">
                <div className="flex items-center justify-between gap-3 flex-wrap">
                  <div className="min-w-0">
                    <p className="font-medium truncate">{guest.name}</p>
                    <p className="text-white/40 text-xs">
                      Cupo: {guest.maxCompanionsAllowed} acompañante(s)
                      {guest.status && (
                        <span className={`ml-2 px-2 py-0.5 rounded-full text-xs ${STATUS_STYLES[guest.status] || ''}`}>
                          {guest.status}
                        </span>
                      )}
                    </p>
                  </div>
                  <button
                    type="button"
                    onClick={() => handleDelete(guest._id)}
                    className={`flex items-center justify-center gap-1 text-xs py-1.5 px-2.5 rounded-lg transition shrink-0 ${
                      confirmDeleteId === guest._id
                        ? 'bg-red-600 text-white'
                        : 'bg-white/5 text-neutral-400 hover:bg-white/10'
                    }`}
                  >
                    <Trash2 className="w-3.5 h-3.5" />
                    {confirmDeleteId === guest._id ? '¿Seguro?' : ''}
                  </button>
                </div>
                <div className="flex flex-col sm:flex-row items-stretch sm:items-center gap-2">
                  <p className="w-full min-w-0 truncate rounded-lg bg-neutral-800 border border-white/10 px-3 py-1.5 text-xs text-white/60">
                    {link}
                  </p>
                  <div className="flex gap-2">
                    <CopyButton text={message} label="Copiar mensaje" icon={MessageSquareText} />
                    <CopyButton text={link} label="Copiar link" icon={Copy} />
                  </div>
                </div>
              </div>
            )
          })}
        </div>
      )}
    </div>
  )
}

export default PremiumGuestsPanel

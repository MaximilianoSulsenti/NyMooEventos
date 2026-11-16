import { useState } from 'react'
import { Trash2 } from 'lucide-react'
import SelfieCapture from './SelfieCapture'
import Button from '../ui/Button'
import { VIBES } from '../../utils/weddingMatch'

// Edad y nombre quedan fuera de lo editable a propósito -- la edad es el
// campo que se valida (18+) al crear el perfil, dejarla editable abriría
// la puerta a cambiarla después sin esa validación real. El nombre no es
// técnicamente inmutable en el backend, pero re-escribirlo acá no aporta
// nada y suma un campo más al formulario -- si hace falta corregirlo algún
// día, es un caso raro que puede resolverse borrando y creando de nuevo.
function MyProfilePanel({ profile, primaryColor, onUpdate, onDelete }) {
  const [vibes, setVibes] = useState(profile.vibes || [])
  const [bio, setBio] = useState(profile.bio || '')
  const [whatsapp, setWhatsapp] = useState(profile.whatsapp || '')
  const [photoFile, setPhotoFile] = useState(null)
  const [status, setStatus] = useState('idle') // idle | saving | saved | error
  const [errorMessage, setErrorMessage] = useState('')
  const [confirmingDelete, setConfirmingDelete] = useState(false)
  const [deleting, setDeleting] = useState(false)

  function toggleVibe(vibe) {
    setVibes((prev) => {
      if (prev.includes(vibe)) return prev.filter((v) => v !== vibe)
      if (prev.length >= 5) return prev
      return [...prev, vibe]
    })
  }

  async function handleSave(e) {
    e.preventDefault()
    setStatus('saving')
    setErrorMessage('')
    try {
      await onUpdate({ name: profile.name, vibes, bio: bio.trim(), whatsapp: whatsapp.trim() }, photoFile)
      setPhotoFile(null)
      setStatus('saved')
      setTimeout(() => setStatus('idle'), 1500)
    } catch (err) {
      setStatus('error')
      setErrorMessage(err.response?.data?.message || 'No se pudo guardar')
    }
  }

  async function handleDeleteClick() {
    if (!confirmingDelete) {
      setConfirmingDelete(true)
      setTimeout(() => setConfirmingDelete(false), 3000)
      return
    }
    setDeleting(true)
    try {
      await onDelete()
    } finally {
      setDeleting(false)
    }
  }

  return (
    <form onSubmit={handleSave} className="flex flex-col gap-5">
      <div className="flex flex-col items-center gap-2">
        <SelfieCapture initialPhotoUrl={profile.photoUrl} onChange={setPhotoFile} primaryColor={primaryColor} />
        <p className="text-white font-semibold">
          {profile.name}, {profile.age}
        </p>
      </div>

      <div>
        <label className="block text-sm text-white/60 mb-2">Tu vibe (hasta 5)</label>
        <div className="flex flex-wrap gap-2">
          {VIBES.map((vibe) => {
            const selected = vibes.includes(vibe)
            return (
              <button
                key={vibe}
                type="button"
                onClick={() => toggleVibe(vibe)}
                className="px-3 py-1.5 rounded-full text-xs font-medium border transition"
                style={
                  selected
                    ? { background: primaryColor, borderColor: primaryColor, color: '#111' }
                    : { background: 'rgba(255,255,255,0.06)', borderColor: 'rgba(255,255,255,0.15)', color: 'rgba(255,255,255,0.7)' }
                }
              >
                {vibe}
              </button>
            )
          })}
        </div>
      </div>

      <div>
        <label className="block text-sm text-white/60 mb-1">Algo sobre vos / tu trago favorito</label>
        <textarea
          value={bio}
          onChange={(e) => setBio(e.target.value.slice(0, 160))}
          rows={2}
          className="w-full rounded-xl bg-white/10 border border-white/15 px-3 py-2.5 text-sm text-white outline-none focus:border-[var(--accent)] focus:ring-2 focus:ring-[var(--accent)]/30 transition resize-none"
          style={{ '--accent': primaryColor }}
        />
      </div>

      <div>
        <label className="block text-sm text-white/60 mb-1">WhatsApp</label>
        <input
          type="tel"
          value={whatsapp}
          onChange={(e) => setWhatsapp(e.target.value)}
          placeholder="11 1234-5678"
          className="w-full rounded-xl bg-white/10 border border-white/15 px-3 py-2.5 text-sm text-white outline-none focus:border-[var(--accent)] focus:ring-2 focus:ring-[var(--accent)]/30 transition"
          style={{ '--accent': primaryColor }}
        />
        <p className="text-white/30 text-xs mt-1">Solo se comparte con quien hagas match.</p>
      </div>

      {status === 'error' && <p className="text-red-400 text-sm text-center">{errorMessage}</p>}

      <Button type="submit" primaryColor={primaryColor} disabled={status === 'saving'} className="w-full disabled:opacity-60">
        {status === 'saving' ? 'Guardando...' : status === 'saved' ? '¡Guardado!' : 'Guardar cambios'}
      </Button>

      <button
        type="button"
        onClick={handleDeleteClick}
        disabled={deleting}
        className={`flex items-center justify-center gap-1.5 text-sm py-2.5 rounded-xl transition disabled:opacity-60 ${
          confirmingDelete ? 'bg-red-600 text-white' : 'text-white/40 hover:text-red-400'
        }`}
      >
        <Trash2 className="w-4 h-4" />
        {confirmingDelete ? '¿Seguro? Esto borra tu perfil para siempre' : 'Eliminar mi perfil'}
      </button>
    </form>
  )
}

export default MyProfilePanel

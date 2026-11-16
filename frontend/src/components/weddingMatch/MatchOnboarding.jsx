import { useState } from 'react'
import { Heart, Sparkles } from 'lucide-react'
import SelfieCapture from './SelfieCapture'
import Button from '../ui/Button'
import { VIBES, isValidAge, MATCH_ACCENT } from '../../utils/weddingMatch'

function MatchOnboarding({ eventName, participants, primaryColor, onSubmit }) {
  const [photoFile, setPhotoFile] = useState(null)
  const [name, setName] = useState('')
  const [age, setAge] = useState('')
  const [vibes, setVibes] = useState([])
  const [bio, setBio] = useState('')
  const [whatsapp, setWhatsapp] = useState('')
  const [status, setStatus] = useState('idle') // idle | saving | error
  const [errorMessage, setErrorMessage] = useState('')

  function toggleVibe(vibe) {
    setVibes((prev) => {
      if (prev.includes(vibe)) return prev.filter((v) => v !== vibe)
      if (prev.length >= 5) return prev
      return [...prev, vibe]
    })
  }

  const canSubmit = Boolean(photoFile) && name.trim().length >= 2 && isValidAge(age) && status !== 'saving'

  async function handleSubmit(e) {
    e.preventDefault()
    if (!canSubmit) return
    setStatus('saving')
    setErrorMessage('')
    try {
      await onSubmit({ name: name.trim(), age: Number(age), vibes, bio: bio.trim(), whatsapp: whatsapp.trim() }, photoFile)
    } catch (err) {
      setStatus('error')
      setErrorMessage(err.response?.data?.message || 'No se pudo crear tu perfil, intentá de nuevo')
    }
  }

  return (
    <form onSubmit={handleSubmit} className="flex flex-col gap-5">
      <div className="text-center flex flex-col items-center gap-1.5">
        <span
          className="w-12 h-12 rounded-full flex items-center justify-center mb-1"
          style={{ background: `${primaryColor}22`, color: primaryColor }}
        >
          <Heart className="w-6 h-6" />
        </span>
        <h1 className="text-xl sm:text-2xl font-semibold text-white">Wedding Match</h1>
        <p className="text-white/50 text-sm max-w-xs flex items-center gap-1.5 justify-center">
          <Sparkles className="w-3.5 h-3.5 shrink-0" style={{ color: primaryColor }} />
          {participants > 0
            ? `Ya hay ${participants} soltero${participants === 1 ? '' : 's'} participando en ${eventName}`
            : `Sé de los primeros en sumarte en ${eventName}`}
        </p>
      </div>

      <SelfieCapture onChange={setPhotoFile} primaryColor={primaryColor} />

      <div>
        <label className="block text-sm text-white/60 mb-1">Nombre</label>
        <input
          type="text"
          value={name}
          onChange={(e) => setName(e.target.value.slice(0, 30))}
          placeholder="Tu nombre"
          required
          className="w-full rounded-xl bg-white/10 border border-white/15 px-3 py-2.5 text-sm text-white outline-none focus:border-[var(--accent)] focus:ring-2 focus:ring-[var(--accent)]/30 transition"
          style={{ '--accent': primaryColor }}
        />
      </div>

      <div>
        <label className="block text-sm text-white/60 mb-1">Edad</label>
        <input
          type="number"
          inputMode="numeric"
          min={18}
          max={99}
          value={age}
          onChange={(e) => setAge(e.target.value)}
          placeholder="18+"
          required
          className="w-full rounded-xl bg-white/10 border border-white/15 px-3 py-2.5 text-sm text-white outline-none focus:border-[var(--accent)] focus:ring-2 focus:ring-[var(--accent)]/30 transition"
          style={{ '--accent': primaryColor }}
        />
        <p className="text-white/30 text-xs mt-1">Wedding Match es solo para mayores de 18 años.</p>
      </div>

      <div>
        <label className="block text-sm text-white/60 mb-2">¿Cuál es tu vibe esta noche? (hasta 5)</label>
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
        <label className="block text-sm text-white/60 mb-1">Algo sobre vos / tu trago favorito (opcional)</label>
        <textarea
          value={bio}
          onChange={(e) => setBio(e.target.value.slice(0, 160))}
          rows={2}
          placeholder="Ej: me encanta el fernet y bailar hasta que cierren el salón"
          className="w-full rounded-xl bg-white/10 border border-white/15 px-3 py-2.5 text-sm text-white outline-none focus:border-[var(--accent)] focus:ring-2 focus:ring-[var(--accent)]/30 transition resize-none"
          style={{ '--accent': primaryColor }}
        />
      </div>

      <div>
        <label className="block text-sm text-white/60 mb-1">WhatsApp (opcional)</label>
        <input
          type="tel"
          value={whatsapp}
          onChange={(e) => setWhatsapp(e.target.value)}
          placeholder="11 1234-5678"
          className="w-full rounded-xl bg-white/10 border border-white/15 px-3 py-2.5 text-sm text-white outline-none focus:border-[var(--accent)] focus:ring-2 focus:ring-[var(--accent)]/30 transition"
          style={{ '--accent': primaryColor }}
        />
        <p className="text-white/30 text-xs mt-1">Solo se comparte con quien hagas match. Nadie más lo ve.</p>
      </div>

      {status === 'error' && <p className="text-red-400 text-sm text-center">{errorMessage}</p>}

      <Button type="submit" gradient={MATCH_ACCENT.gradient} disabled={!canSubmit} className="w-full disabled:opacity-40">
        {status === 'saving' ? 'Creando tu perfil...' : 'Empezar a conocer gente'}
      </Button>
    </form>
  )
}

export default MatchOnboarding

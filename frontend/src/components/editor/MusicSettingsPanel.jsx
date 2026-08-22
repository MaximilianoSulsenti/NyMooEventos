import AudioUploadField from './AudioUploadField'
import { BRAND } from '../../utils/brand'

const POSITIONS = [
  { value: 'top-left', label: 'Arriba izquierda' },
  { value: 'top-right', label: 'Arriba derecha' },
  { value: 'bottom-left', label: 'Abajo izquierda' },
  { value: 'bottom-right', label: 'Abajo derecha' },
]

function MusicSettingsPanel({ eventId, settings, onChange }) {
  function update(patch) {
    onChange({ ...settings, ...patch })
  }

  return (
    <div className="space-y-3">
      <div className="flex items-center justify-between gap-3">
        <div>
          <span className="text-sm font-medium">Música de fondo</span>
          <p className="text-xs text-neutral-500 mt-0.5">
            Un reproductor flotante y discreto que suena mientras se ve la invitación.
          </p>
        </div>
        <button
          type="button"
          role="switch"
          aria-checked={settings.enabled}
          onClick={() => update({ enabled: !settings.enabled })}
          className="relative w-10 h-6 rounded-full transition-colors shrink-0"
          style={{ background: settings.enabled ? BRAND.blue : 'rgba(255,255,255,0.12)' }}
        >
          <span
            className={`absolute top-1 left-1 w-4 h-4 rounded-full bg-white transition-transform ${
              settings.enabled ? 'translate-x-4' : ''
            }`}
          />
        </button>
      </div>

      {settings.enabled && (
        <div className="space-y-3 pt-3 border-t border-white/10" style={{ '--accent': BRAND.blue }}>
          <AudioUploadField
            eventId={eventId}
            label="Tema musical"
            value={settings.audioUrl || ''}
            onChange={(url) => update({ audioUrl: url })}
          />

          <div>
            <label className="block text-sm text-neutral-400 mb-1">Título (opcional, aparece un momento al sonar)</label>
            <input
              type="text"
              value={settings.title || ''}
              onChange={(e) => update({ title: e.target.value })}
              placeholder="Ej. Perfect - Ed Sheeran"
              className="w-full rounded-xl bg-white/5 border border-white/10 px-3 py-2 text-sm outline-none focus:ring-2 focus:ring-[var(--accent)] transition"
            />
          </div>

          <div>
            <label className="block text-sm text-neutral-400 mb-1">Posición del reproductor</label>
            <select
              value={settings.position || 'bottom-right'}
              onChange={(e) => update({ position: e.target.value })}
              className="w-full rounded-xl bg-white/5 border border-white/10 px-3 py-2 text-sm outline-none focus:ring-2 focus:ring-[var(--accent)]"
            >
              {POSITIONS.map((opt) => (
                <option key={opt.value} value={opt.value}>
                  {opt.label}
                </option>
              ))}
            </select>
          </div>

          <div>
            <label className="block text-sm text-neutral-400 mb-1">Volumen: {settings.volume ?? 70}%</label>
            <input
              type="range"
              min={0}
              max={100}
              step={5}
              value={settings.volume ?? 70}
              onChange={(e) => update({ volume: Number(e.target.value) })}
              className="w-full accent-[var(--accent)]"
            />
          </div>
        </div>
      )}
    </div>
  )
}

export default MusicSettingsPanel

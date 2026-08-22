import ImageUploadField from './ImageUploadField'
import { BRAND } from '../../utils/brand'

const THEMES = ['minimalista', 'moderno', 'vanguardista', 'romantica', 'bohemio', 'elegante', 'festivo']

const inputClass =
  'w-full rounded-xl bg-neutral-800 border border-white/10 px-3 py-2 text-sm outline-none focus:ring-2 focus:ring-[var(--accent)]'

function ColorField({ label, value, onChange }) {
  return (
    <div>
      <label className="block text-sm text-neutral-400 mb-1">{label}</label>
      <div className="flex items-center gap-2">
        <input
          type="color"
          value={value}
          onChange={(e) => onChange(e.target.value)}
          className="w-10 h-10 rounded cursor-pointer bg-transparent"
        />
        <input
          type="text"
          value={value}
          onChange={(e) => onChange(e.target.value)}
          className={`flex-1 ${inputClass}`}
        />
      </div>
    </div>
  )
}

function UploadPageStylePanel({ eventId, settings, onChange }) {
  function update(patch) {
    onChange({ ...settings, ...patch })
  }

  return (
    <div className="space-y-3" style={{ '--accent': BRAND.blue }}>
      <p className="text-xs text-neutral-500">
        Estilo de las pantallas /upload y /gallery-control (para que combinen con la invitación).
      </p>

      <div>
        <label className="block text-sm text-neutral-400 mb-1">Tema</label>
        <select value={settings.theme} onChange={(e) => update({ theme: e.target.value })} className={inputClass}>
          {THEMES.map((theme) => (
            <option key={theme} value={theme}>
              {theme}
            </option>
          ))}
        </select>
      </div>

      <div>
        <label className="block text-sm text-neutral-400 mb-1">Tipo de fondo</label>
        <select value={settings.bgType} onChange={(e) => update({ bgType: e.target.value })} className={inputClass}>
          <option value="color">Color sólido</option>
          <option value="image">Imagen</option>
        </select>
      </div>

      <ColorField label="Color de fondo" value={settings.bgColor} onChange={(v) => update({ bgColor: v })} />

      {settings.bgType === 'image' && (
        <>
          <ImageUploadField
            eventId={eventId}
            label="Imagen de fondo"
            value={settings.bgImageUrl || ''}
            onChange={(url) => update({ bgImageUrl: url })}
          />
          <div>
            <label className="block text-sm text-neutral-400 mb-1">Opacidad: {settings.bgOpacity}%</label>
            <input
              type="range"
              min={0}
              max={100}
              step={5}
              value={settings.bgOpacity}
              onChange={(e) => update({ bgOpacity: Number(e.target.value) })}
              className="w-full accent-[var(--accent)]"
            />
          </div>
        </>
      )}
    </div>
  )
}

export default UploadPageStylePanel

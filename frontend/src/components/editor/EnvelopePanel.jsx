import { BG_TYPE_OPTIONS } from '../../sections/sectionDefs'
import ImageUploadField from './ImageUploadField'

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
          className="flex-1 rounded-lg bg-neutral-800 px-3 py-2 text-sm outline-none focus:ring-2 focus:ring-purple-500"
        />
      </div>
    </div>
  )
}

function EnvelopePanel({ eventId, settings, onChange }) {
  function update(patch) {
    onChange({ ...settings, ...patch })
  }

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <span className="text-sm font-medium">Activar sobre de bienvenida</span>
        <button
          type="button"
          role="switch"
          aria-checked={settings.enabled}
          onClick={() => update({ enabled: !settings.enabled })}
          className={`relative w-10 h-6 rounded-full transition-colors ${settings.enabled ? 'bg-purple-600' : 'bg-neutral-700'}`}
        >
          <span
            className={`absolute top-1 left-1 w-4 h-4 rounded-full bg-white transition-transform ${settings.enabled ? 'translate-x-4' : ''}`}
          />
        </button>
      </div>

      {settings.enabled && (
        <div className="space-y-3 pt-2 border-t border-white/10">
          <div>
            <label className="block text-sm text-neutral-400 mb-1">Texto de bienvenida</label>
            <textarea
              value={settings.titleText || ''}
              onChange={(e) => update({ titleText: e.target.value })}
              rows={2}
              className="w-full rounded-lg bg-neutral-800 px-3 py-2 text-sm outline-none focus:ring-2 focus:ring-purple-500 transition"
            />
          </div>

          <div>
            <label className="block text-sm text-neutral-400 mb-1">Texto del botón</label>
            <input
              type="text"
              value={settings.buttonText || ''}
              onChange={(e) => update({ buttonText: e.target.value })}
              className="w-full rounded-lg bg-neutral-800 px-3 py-2 text-sm outline-none focus:ring-2 focus:ring-purple-500 transition"
            />
          </div>

          <div>
            <label className="block text-sm text-neutral-400 mb-1">Tipo de fondo</label>
            <select
              value={settings.bgType}
              onChange={(e) => update({ bgType: e.target.value })}
              className="w-full rounded-lg bg-neutral-800 px-3 py-2 text-sm outline-none focus:ring-2 focus:ring-purple-500 transition"
            >
              {BG_TYPE_OPTIONS.map((opt) => (
                <option key={opt.value} value={opt.value}>
                  {opt.label}
                </option>
              ))}
            </select>
          </div>

          <ColorField
            label={settings.bgType === 'color' ? 'Color de fondo' : 'Color base (detrás de la imagen/video)'}
            value={settings.bgColor || '#0a0a0a'}
            onChange={(v) => update({ bgColor: v })}
          />

          {settings.bgType === 'image' && (
            <ImageUploadField
              eventId={eventId}
              label="Imagen de fondo"
              value={settings.bgUrl || ''}
              onChange={(url) => update({ bgUrl: url })}
            />
          )}

          {settings.bgType === 'video' && (
            <div>
              <label className="block text-sm text-neutral-400 mb-1">URL del video de fondo</label>
              <input
                type="text"
                value={settings.bgUrl || ''}
                onChange={(e) => update({ bgUrl: e.target.value })}
                placeholder="https://..."
                className="w-full rounded-lg bg-neutral-800 px-3 py-2 text-sm outline-none focus:ring-2 focus:ring-purple-500 transition"
              />
            </div>
          )}

          {settings.bgType !== 'color' && (
            <div>
              <label className="block text-sm text-neutral-400 mb-1">Opacidad: {settings.bgOpacity ?? 100}</label>
              <input
                type="range"
                min={0}
                max={100}
                step={5}
                value={settings.bgOpacity ?? 100}
                onChange={(e) => update({ bgOpacity: Number(e.target.value) })}
                className="w-full accent-purple-500"
              />
            </div>
          )}

          <div>
            <label className="block text-sm text-neutral-400 mb-1">Tipografía</label>
            <select
              value={settings.fontFamily || 'sans'}
              onChange={(e) => update({ fontFamily: e.target.value })}
              className="w-full rounded-lg bg-neutral-800 px-3 py-2 text-sm outline-none focus:ring-2 focus:ring-purple-500 transition"
            >
              <option value="sans">Sans-serif</option>
              <option value="serif">Serif</option>
            </select>
          </div>
        </div>
      )}
    </div>
  )
}

export default EnvelopePanel

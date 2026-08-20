import { BG_TYPE_OPTIONS, GRADIENT_PRESETS } from '../../sections/sectionDefs'
import ImageUploadField from './ImageUploadField'

const THEMES = ['minimalista', 'moderno', 'vanguardista', 'romantica']
const FONTS = [
  { value: 'sans', label: 'Sans-serif' },
  { value: 'serif', label: 'Serif' },
]

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

function AppearancePanel({ eventId, appearance, onChange }) {
  function update(patch) {
    onChange({ ...appearance, ...patch })
  }

  return (
    <div className="space-y-4">
      <div>
        <label className="block text-sm text-neutral-400 mb-1">Tema</label>
        <select
          value={appearance.theme}
          onChange={(e) => update({ theme: e.target.value })}
          className="w-full rounded-lg bg-neutral-800 px-3 py-2 text-sm outline-none focus:ring-2 focus:ring-purple-500"
        >
          {THEMES.map((theme) => (
            <option key={theme} value={theme}>
              {theme}
            </option>
          ))}
        </select>
      </div>

      <div>
        <label className="block text-sm text-neutral-400 mb-1">Tipografía</label>
        <select
          value={appearance.fontFamily}
          onChange={(e) => update({ fontFamily: e.target.value })}
          className="w-full rounded-lg bg-neutral-800 px-3 py-2 text-sm outline-none focus:ring-2 focus:ring-purple-500"
        >
          {FONTS.map((font) => (
            <option key={font.value} value={font.value}>
              {font.label}
            </option>
          ))}
        </select>
      </div>

      <ColorField label="Color primario" value={appearance.primaryColor} onChange={(v) => update({ primaryColor: v })} />
      <ColorField label="Color secundario" value={appearance.secondaryColor} onChange={(v) => update({ secondaryColor: v })} />
      <ColorField label="Color de fondo" value={appearance.backgroundColor} onChange={(v) => update({ backgroundColor: v })} />

      <div className="pt-3 border-t border-white/10 space-y-3">
        <div className="flex items-center justify-between">
          <span className="text-sm font-medium">Fondo global único (en vez de por sección)</span>
          <button
            type="button"
            role="switch"
            aria-checked={appearance.useGlobalBackground}
            onClick={() => update({ useGlobalBackground: !appearance.useGlobalBackground })}
            className={`relative w-10 h-6 rounded-full transition-colors ${
              appearance.useGlobalBackground ? 'bg-purple-600' : 'bg-neutral-700'
            }`}
          >
            <span
              className={`absolute top-1 left-1 w-4 h-4 rounded-full bg-white transition-transform ${
                appearance.useGlobalBackground ? 'translate-x-4' : ''
              }`}
            />
          </button>
        </div>

        {appearance.useGlobalBackground && (
          <div className="space-y-3">
            <div>
              <label className="block text-sm text-neutral-400 mb-1">Tipo de fondo global</label>
              <select
                value={appearance.globalBgType}
                onChange={(e) => update({ globalBgType: e.target.value })}
                className="w-full rounded-lg bg-neutral-800 px-3 py-2 text-sm outline-none focus:ring-2 focus:ring-purple-500"
              >
                {BG_TYPE_OPTIONS.map((opt) => (
                  <option key={opt.value} value={opt.value}>
                    {opt.label}
                  </option>
                ))}
              </select>
            </div>

            {appearance.globalBgType === 'image' && (
              <ImageUploadField
                eventId={eventId}
                label="Imagen de fondo global"
                value={appearance.globalBgUrl || ''}
                onChange={(url) => update({ globalBgUrl: url })}
              />
            )}

            {appearance.globalBgType === 'video' && (
              <div>
                <label className="block text-sm text-neutral-400 mb-1">URL del video de fondo</label>
                <input
                  type="text"
                  value={appearance.globalBgUrl || ''}
                  onChange={(e) => update({ globalBgUrl: e.target.value })}
                  placeholder="https://..."
                  className="w-full rounded-lg bg-neutral-800 px-3 py-2 text-sm outline-none focus:ring-2 focus:ring-purple-500"
                />
              </div>
            )}

            {appearance.globalBgType !== 'color' && (
              <div>
                <label className="block text-sm text-neutral-400 mb-1">
                  Opacidad: {appearance.globalBgOpacity ?? 100}
                </label>
                <input
                  type="range"
                  min={0}
                  max={100}
                  step={5}
                  value={appearance.globalBgOpacity ?? 100}
                  onChange={(e) => update({ globalBgOpacity: Number(e.target.value) })}
                  className="w-full accent-purple-500"
                />
              </div>
            )}

            <div>
              <label className="block text-sm text-neutral-400 mb-1">Degradado superpuesto</label>
              <select
                value={appearance.globalBgGradient || ''}
                onChange={(e) => update({ globalBgGradient: e.target.value })}
                className="w-full rounded-lg bg-neutral-800 px-3 py-2 text-sm outline-none focus:ring-2 focus:ring-purple-500"
              >
                {GRADIENT_PRESETS.map((preset) => (
                  <option key={preset.value} value={preset.value}>
                    {preset.label}
                  </option>
                ))}
              </select>
            </div>
          </div>
        )}
      </div>
    </div>
  )
}

export default AppearancePanel

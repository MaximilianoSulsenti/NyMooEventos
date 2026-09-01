import { BG_TYPE_OPTIONS, GRADIENT_PRESETS } from '../../sections/sectionDefs'
import ImageUploadField from './ImageUploadField'
import VideoUploadField from './VideoUploadField'
import { BRAND } from '../../utils/brand'

const THEMES = ['minimalista', 'moderno', 'vanguardista', 'romantica', 'bohemio', 'elegante', 'festivo']
const FONTS = [
  { value: 'sans', label: 'Sans-serif' },
  { value: 'serif', label: 'Serif' },
  { value: 'display', label: 'Elegante (Playfair Display)' },
  { value: 'script', label: 'Manuscrita (Dancing Script)' },
  { value: 'modern', label: 'Moderna (Poppins)' },
  { value: 'greatvibes', label: 'Manuscrita fina (Great Vibes)' },
  { value: 'cormorant', label: 'Clásica elegante (Cormorant Garamond)' },
  { value: 'bebas', label: 'Bold festiva (Bebas Neue)' },
  { value: 'chewy', label: 'Infantil y divertida (Chewy)' },
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
          className="flex-1 rounded-xl bg-neutral-800 border border-white/10 px-3 py-2 text-sm outline-none focus:ring-2 focus:ring-[var(--accent)]"
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
    <div className="space-y-4" style={{ '--accent': BRAND.blue }}>
      <div>
        <label className="block text-sm text-neutral-400 mb-1">Tema</label>
        <select
          value={appearance.theme}
          onChange={(e) => update({ theme: e.target.value, fontFamily: '' })}
          className="w-full rounded-xl bg-neutral-800 border border-white/10 px-3 py-2 text-sm outline-none focus:ring-2 focus:ring-[var(--accent)]"
        >
          {THEMES.map((theme) => (
            <option key={theme} value={theme}>
              {theme}
            </option>
          ))}
        </select>
      </div>

      <div>
        <label className="block text-sm text-neutral-400 mb-1">Tipografía del texto</label>
        <select
          value={appearance.fontFamily || ''}
          onChange={(e) => update({ fontFamily: e.target.value })}
          className="w-full rounded-xl bg-neutral-800 border border-white/10 px-3 py-2 text-sm outline-none focus:ring-2 focus:ring-[var(--accent)]"
        >
          <option value="">Automática (según el tema)</option>
          {FONTS.map((font) => (
            <option key={font.value} value={font.value}>
              {font.label}
            </option>
          ))}
        </select>
      </div>

      <div>
        <label className="block text-sm text-neutral-400 mb-1">Tipografía de los títulos (opcional)</label>
        <select
          value={appearance.titleFontFamily || ''}
          onChange={(e) => update({ titleFontFamily: e.target.value })}
          className="w-full rounded-xl bg-neutral-800 border border-white/10 px-3 py-2 text-sm outline-none focus:ring-2 focus:ring-[var(--accent)]"
        >
          <option value="">Igual que el texto</option>
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
            className="relative w-10 h-6 rounded-full transition-colors"
            style={{ background: appearance.useGlobalBackground ? BRAND.blue : 'rgba(255,255,255,0.12)' }}
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
                className="w-full rounded-xl bg-neutral-800 border border-white/10 px-3 py-2 text-sm outline-none focus:ring-2 focus:ring-[var(--accent)]"
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
              <VideoUploadField
                eventId={eventId}
                label="Video de fondo global"
                value={appearance.globalBgUrl || ''}
                onChange={(url) => update({ globalBgUrl: url })}
              />
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
                  className="w-full accent-[var(--accent)]"
                />
              </div>
            )}

            <div>
              <label className="block text-sm text-neutral-400 mb-1">Degradado superpuesto</label>
              <select
                value={appearance.globalBgGradient || ''}
                onChange={(e) => update({ globalBgGradient: e.target.value })}
                className="w-full rounded-xl bg-neutral-800 border border-white/10 px-3 py-2 text-sm outline-none focus:ring-2 focus:ring-[var(--accent)]"
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

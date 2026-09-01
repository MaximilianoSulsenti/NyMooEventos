import { BG_TYPE_OPTIONS, FONT_SIZE_OPTIONS } from '../../sections/sectionDefs'
import ImageUploadField from './ImageUploadField'
import VideoUploadField from './VideoUploadField'
import { BRAND } from '../../utils/brand'

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

function EnvelopePanel({ eventId, settings, onChange }) {
  function update(patch) {
    onChange({ ...settings, ...patch })
  }

  return (
    <div className="space-y-4" style={{ '--accent': BRAND.blue }}>
      <div className="flex items-center justify-between">
        <span className="text-sm font-medium">Activar sobre de bienvenida</span>
        <button
          type="button"
          role="switch"
          aria-checked={settings.enabled}
          onClick={() => update({ enabled: !settings.enabled })}
          className="relative w-10 h-6 rounded-full transition-colors"
          style={{ background: settings.enabled ? BRAND.blue : 'rgba(255,255,255,0.12)' }}
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
              className="w-full rounded-xl bg-neutral-800 border border-white/10 px-3 py-2 text-sm outline-none focus:ring-2 focus:ring-[var(--accent)] transition"
            />
          </div>

          <div>
            <label className="block text-sm text-neutral-400 mb-1">Subtítulo o mensaje (opcional)</label>
            <textarea
              value={settings.subtitleText || ''}
              onChange={(e) => update({ subtitleText: e.target.value })}
              rows={2}
              placeholder="Ej: fecha del evento, una frase corta..."
              className="w-full rounded-xl bg-neutral-800 border border-white/10 px-3 py-2 text-sm outline-none focus:ring-2 focus:ring-[var(--accent)] transition"
            />
          </div>

          <div>
            <label className="block text-sm text-neutral-400 mb-1">Mensaje que asoma detrás del sobre (opcional)</label>
            <textarea
              value={settings.welcomeMessage || ''}
              onChange={(e) => update({ welcomeMessage: e.target.value })}
              rows={2}
              placeholder="Ej: ¡Nos encantaría que nos acompañes!"
              className="w-full rounded-xl bg-neutral-800 border border-white/10 px-3 py-2 text-sm outline-none focus:ring-2 focus:ring-[var(--accent)] transition"
            />
            <p className="text-xs text-neutral-500 mt-1">
              Para invitados con link personalizado (VIP) se usa el saludo que armaste en la sección Portada, no este mensaje.
            </p>
          </div>

          <div>
            <label className="block text-sm text-neutral-400 mb-1">Texto del botón</label>
            <input
              type="text"
              value={settings.buttonText || ''}
              onChange={(e) => update({ buttonText: e.target.value })}
              className="w-full rounded-xl bg-neutral-800 border border-white/10 px-3 py-2 text-sm outline-none focus:ring-2 focus:ring-[var(--accent)] transition"
            />
          </div>

          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="block text-sm text-neutral-400 mb-1">Tamaño del texto</label>
              <select
                value={settings.fontSizeTitle || 'text-base'}
                onChange={(e) => update({ fontSizeTitle: e.target.value })}
                className="w-full rounded-xl bg-neutral-800 border border-white/10 px-3 py-2 text-sm outline-none focus:ring-2 focus:ring-[var(--accent)] transition"
              >
                {FONT_SIZE_OPTIONS.map((opt) => (
                  <option key={opt.value} value={opt.value}>
                    {opt.label}
                  </option>
                ))}
              </select>
            </div>
            <div>
              <label className="block text-sm text-neutral-400 mb-1">Tamaño del subtítulo</label>
              <select
                value={settings.fontSizeSubtitle || 'text-sm'}
                onChange={(e) => update({ fontSizeSubtitle: e.target.value })}
                className="w-full rounded-xl bg-neutral-800 border border-white/10 px-3 py-2 text-sm outline-none focus:ring-2 focus:ring-[var(--accent)] transition"
              >
                {FONT_SIZE_OPTIONS.map((opt) => (
                  <option key={opt.value} value={opt.value}>
                    {opt.label}
                  </option>
                ))}
              </select>
            </div>
          </div>

          <div>
            <ColorField
              label="Color del texto en la solapa"
              value={settings.textColor || '#ffffff'}
              onChange={(v) => update({ textColor: v })}
            />
            {settings.textColor && (
              <button
                type="button"
                onClick={() => update({ textColor: '' })}
                className="text-xs text-neutral-500 hover:text-white transition mt-1"
              >
                Restaurar color automático
              </button>
            )}
          </div>

          <div>
            <label className="block text-sm text-neutral-400 mb-1">Tipo de fondo</label>
            <select
              value={settings.bgType}
              onChange={(e) => update({ bgType: e.target.value })}
              className="w-full rounded-xl bg-neutral-800 border border-white/10 px-3 py-2 text-sm outline-none focus:ring-2 focus:ring-[var(--accent)] transition"
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
            <div>
              <ImageUploadField
                eventId={eventId}
                label="Imagen de fondo"
                value={settings.bgUrl || ''}
                onChange={(url) => update({ bgUrl: url })}
              />
              <p className="text-xs text-neutral-500 mt-1">
                Para que quede prolijo, usá una foto de sobre visto de frente (no en diagonal), con la solapa
                arriba -- así calza con la animación de apertura.
              </p>
            </div>
          )}

          {settings.bgType === 'video' && (
            <VideoUploadField
              eventId={eventId}
              label="Video de fondo"
              value={settings.bgUrl || ''}
              onChange={(url) => update({ bgUrl: url })}
            />
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
                className="w-full accent-[var(--accent)]"
              />
            </div>
          )}

          <div>
            <label className="block text-sm text-neutral-400 mb-1">Sello de cera</label>
            <select
              value={settings.showWaxSeal || ''}
              onChange={(e) => update({ showWaxSeal: e.target.value })}
              className="w-full rounded-xl bg-neutral-800 border border-white/10 px-3 py-2 text-sm outline-none focus:ring-2 focus:ring-[var(--accent)] transition"
            >
              <option value="">Automático (se oculta si usás imagen/video de fondo)</option>
              <option value="si">Mostrar siempre</option>
              <option value="no">Ocultar siempre</option>
            </select>
            <p className="text-xs text-neutral-500 mt-1">
              Apagalo si tu imagen de fondo ya tiene su propio sello dibujado, para no duplicarlo.
            </p>
          </div>

          <div>
            <label className="block text-sm text-neutral-400 mb-1">Tipografía</label>
            <select
              value={settings.fontFamily || 'sans'}
              onChange={(e) => update({ fontFamily: e.target.value })}
              className="w-full rounded-xl bg-neutral-800 border border-white/10 px-3 py-2 text-sm outline-none focus:ring-2 focus:ring-[var(--accent)] transition"
            >
              <option value="sans">Sans-serif</option>
              <option value="serif">Serif</option>
              <option value="display">Elegante (Playfair Display)</option>
              <option value="script">Manuscrita (Dancing Script)</option>
              <option value="modern">Moderna (Poppins)</option>
              <option value="greatvibes">Manuscrita fina (Great Vibes)</option>
              <option value="cormorant">Clásica elegante (Cormorant Garamond)</option>
              <option value="bebas">Bold festiva (Bebas Neue)</option>
              <option value="chewy">Infantil y divertida (Chewy)</option>
            </select>
          </div>
        </div>
      )}
    </div>
  )
}

export default EnvelopePanel

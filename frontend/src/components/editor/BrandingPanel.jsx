import ImageUploadField from './ImageUploadField'
import { BRAND } from '../../utils/brand'

const POSITIONS = [
  { value: 'top-left', label: 'Arriba izquierda' },
  { value: 'top-right', label: 'Arriba derecha' },
  { value: 'bottom-left', label: 'Abajo izquierda' },
  { value: 'bottom-right', label: 'Abajo derecha' },
]

function BrandBlock({ eventId, label, brand, onChange }) {
  function update(patch) {
    onChange({ ...brand, ...patch })
  }

  return (
    <div className="space-y-3 rounded-xl bg-white/5 border border-white/10 p-3" style={{ '--accent': BRAND.blue }}>
      <div className="flex items-center justify-between">
        <span className="text-sm font-medium">{label}</span>
        <button
          type="button"
          role="switch"
          aria-checked={brand.enabled}
          onClick={() => update({ enabled: !brand.enabled })}
          className="relative w-10 h-6 rounded-full transition-colors"
          style={{ background: brand.enabled ? BRAND.blue : 'rgba(255,255,255,0.12)' }}
        >
          <span
            className={`absolute top-1 left-1 w-4 h-4 rounded-full bg-white transition-transform ${brand.enabled ? 'translate-x-4' : ''}`}
          />
        </button>
      </div>

      {brand.enabled && (
        <div className="space-y-3">
          <ImageUploadField eventId={eventId} label="Logo" value={brand.logoUrl || ''} onChange={(url) => update({ logoUrl: url })} />

          <div>
            <label className="block text-xs text-neutral-400 mb-1">Posición</label>
            <select
              value={brand.position}
              onChange={(e) => update({ position: e.target.value })}
              className="w-full rounded-xl bg-neutral-800 border border-white/10 px-3 py-2 text-sm outline-none focus:ring-2 focus:ring-[var(--accent)]"
            >
              {POSITIONS.map((opt) => (
                <option key={opt.value} value={opt.value}>
                  {opt.label}
                </option>
              ))}
            </select>
          </div>

          <div>
            <label className="block text-xs text-neutral-400 mb-1">Tamaño: {brand.size}px</label>
            <input
              type="range"
              min={24}
              max={200}
              step={4}
              value={brand.size}
              onChange={(e) => update({ size: Number(e.target.value) })}
              className="w-full accent-[var(--accent)]"
            />
          </div>

          <div>
            <label className="block text-xs text-neutral-400 mb-1">Opacidad: {brand.opacity}%</label>
            <input
              type="range"
              min={10}
              max={100}
              step={5}
              value={brand.opacity}
              onChange={(e) => update({ opacity: Number(e.target.value) })}
              className="w-full accent-[var(--accent)]"
            />
          </div>
        </div>
      )}
    </div>
  )
}

function SalonBackgroundBlock({ eventId, imageUrl, opacity, onChange }) {
  return (
    <div className="space-y-3 rounded-xl bg-white/5 border border-white/10 p-3" style={{ '--accent': BRAND.blue }}>
      <span className="text-sm font-medium">Fondo de la pantalla del salón</span>
      <p className="text-xs text-neutral-500">
        Imagen a pantalla completa detrás de las fotos en la Pantalla en Vivo -- para otros organizadores que quieran
        ambientar la proyección con su propio branding.
      </p>
      <ImageUploadField eventId={eventId} label="Imagen de fondo" value={imageUrl || ''} onChange={(url) => onChange({ salonBgImageUrl: url })} />
      {imageUrl && (
        <div>
          <label className="block text-xs text-neutral-400 mb-1">Opacidad: {opacity}%</label>
          <input
            type="range"
            min={0}
            max={100}
            step={5}
            value={opacity}
            onChange={(e) => onChange({ salonBgOpacity: Number(e.target.value) })}
            className="w-full accent-[var(--accent)]"
          />
        </div>
      )}
    </div>
  )
}

function BrandingPanel({ eventId, branding, isAdmin, onChangeMyBrand, onChangeClientBrand, onChangeSalonBg }) {
  return (
    <div className="space-y-3">
      {isAdmin && (
        <BrandBlock eventId={eventId} label="Mi marca (NyMoo)" brand={branding.myBrand} onChange={onChangeMyBrand} />
      )}
      <BrandBlock eventId={eventId} label="Marca del cliente / salón" brand={branding.clientBrand} onChange={onChangeClientBrand} />
      <SalonBackgroundBlock
        eventId={eventId}
        imageUrl={branding.salonBgImageUrl}
        opacity={branding.salonBgOpacity ?? 40}
        onChange={onChangeSalonBg}
      />
    </div>
  )
}

export default BrandingPanel

import {
  SECTION_FIELD_DEFS,
  BACKGROUND_FIELD_DEFS,
  TEXT_FIELD_DEFS,
  TITLE_GRADIENT_FIELD_DEFS,
  GLASS_FIELD_DEFS,
  SECTIONS_WITH_GLASS_CARD,
} from '../../sections/sectionDefs'
import ImageUploadField from './ImageUploadField'
import ImageListField from './ImageListField'
import RepeaterField from './RepeaterField'
import ColorPickerField from './ColorPickerField'
import { BRAND } from '../../utils/brand'

const SECTIONS_WITH_TITLE_COLOR = [
  'Hero',
  'EventDetail',
  'RSVP',
  'Countdown',
  'Story',
  'Gallery',
  'LiveGallery',
  'DigitalAlbumButton',
  'Location',
  'GiftRegistry',
  'SalonCarrousel',
  'Info',
  'MusicPlaylist',
  'InstagramSection',
  'Timeline',
  'Footer',
]

// Subconjunto de SECTIONS_WITH_TITLE_COLOR que además tiene un título
// principal real (<h1>/<h2>) al que aplicarle el degradado -- RSVP y Footer
// no tienen uno (su texto "título" ya es secundario/tenue), así que no
// muestran este control, que ahí no haría nada.
const SECTIONS_WITH_TITLE_GRADIENT = [
  'Hero',
  'EventDetail',
  'Countdown',
  'Story',
  'Gallery',
  'LiveGallery',
  'DigitalAlbumButton',
  'Location',
  'GiftRegistry',
  'SalonCarrousel',
  'Info',
  'MusicPlaylist',
  'InstagramSection',
  'Timeline',
]

function FieldInput({ eventId, field, config, onChange }) {
  const value = config[field.key]

  if (field.type === 'image') {
    return (
      <ImageUploadField
        eventId={eventId}
        label={field.label}
        value={value || ''}
        onChange={(url) => onChange(field.key, url)}
      />
    )
  }

  if (field.type === 'imageList') {
    return (
      <ImageListField
        eventId={eventId}
        label={field.label}
        images={value}
        onChange={(images) => onChange(field.key, images)}
      />
    )
  }

  if (field.type === 'repeater') {
    return (
      <RepeaterField
        label={field.label}
        items={value}
        itemFields={field.itemFields}
        addLabel={field.addLabel}
        onChange={(items) => onChange(field.key, items)}
      />
    )
  }

  if (field.type === 'color') {
    return (
      <ColorPickerField
        label={field.label}
        value={value}
        onChange={(hex) => onChange(field.key, hex)}
        allowReset
      />
    )
  }

  if (field.type === 'textarea') {
    return (
      <div>
        <label className="block text-sm text-neutral-400 mb-1">{field.label}</label>
        <textarea
          value={value || ''}
          onChange={(e) => onChange(field.key, e.target.value)}
          rows={3}
          className="w-full rounded-xl bg-white/5 border border-white/10 px-3 py-2 text-sm outline-none focus:ring-2 focus:ring-[var(--accent)] transition"
        />
      </div>
    )
  }

  if (field.type === 'select') {
    return (
      <div>
        <label className="block text-sm text-neutral-400 mb-1">{field.label}</label>
        <select
          value={value || field.options[0]?.value || ''}
          onChange={(e) => onChange(field.key, e.target.value)}
          className="w-full rounded-xl bg-neutral-800 border border-white/10 px-3 py-2 text-sm outline-none focus:ring-2 focus:ring-[var(--accent)] transition"
        >
          {field.options.map((option) => (
            <option key={option.value} value={option.value}>
              {option.label}
            </option>
          ))}
        </select>
      </div>
    )
  }

  if (field.type === 'range') {
    return (
      <div>
        <label className="block text-sm text-neutral-400 mb-1">
          {field.label}: {value ?? field.min}
        </label>
        <input
          type="range"
          min={field.min}
          max={field.max}
          step={field.step}
          value={value ?? field.min}
          onChange={(e) => onChange(field.key, Number(e.target.value))}
          className="w-full accent-[var(--accent)]"
        />
      </div>
    )
  }

  return (
    <div>
      <label className="block text-sm text-neutral-400 mb-1">{field.label}</label>
      <input
        type="text"
        value={value || ''}
        onChange={(e) => onChange(field.key, e.target.value)}
        className="w-full rounded-xl bg-white/5 border border-white/10 px-3 py-2 text-sm outline-none focus:ring-2 focus:ring-[var(--accent)] transition"
      />
    </div>
  )
}

function SectionFieldEditor({ eventId, sectionId, config, onChange }) {
  const fields = SECTION_FIELD_DEFS[sectionId] || []
  const showTextColor = SECTIONS_WITH_TITLE_COLOR.includes(sectionId)
  const showTitleGradient = SECTIONS_WITH_TITLE_GRADIENT.includes(sectionId)
  const showGlass = SECTIONS_WITH_GLASS_CARD.includes(sectionId)

  function updateField(key, value) {
    onChange({ ...config, [key]: value })
  }

  return (
    <div className="space-y-5" style={{ '--accent': BRAND.blue }}>
      {showTextColor && (
        <div className="space-y-3">
          <p className="text-xs uppercase tracking-widest text-neutral-500">Texto</p>
          {TEXT_FIELD_DEFS.map((field) => (
            <FieldInput key={field.key} eventId={eventId} field={field} config={config} onChange={updateField} />
          ))}
          {showTitleGradient &&
            TITLE_GRADIENT_FIELD_DEFS.filter((field) => !field.showIf || field.showIf(config)).map((field) => (
              <FieldInput key={field.key} eventId={eventId} field={field} config={config} onChange={updateField} />
            ))}
        </div>
      )}

      <div className="space-y-3 pt-3 border-t border-white/10">
        <p className="text-xs uppercase tracking-widest text-neutral-500">Fondo de la sección</p>
        {BACKGROUND_FIELD_DEFS.filter((field) => !field.showIf || field.showIf(config)).map((field) => (
          <FieldInput key={field.key} eventId={eventId} field={field} config={config} onChange={updateField} />
        ))}
      </div>

      {showGlass && (
        <div className="space-y-3 pt-3 border-t border-white/10">
          <p className="text-xs uppercase tracking-widest text-neutral-500">Fondo vidriado de las tarjetas</p>
          {GLASS_FIELD_DEFS.map((field) => (
            <FieldInput key={field.key} eventId={eventId} field={field} config={config} onChange={updateField} />
          ))}
        </div>
      )}

      {fields.length > 0 && (
        <div className="space-y-3 pt-3 border-t border-white/10">
          <p className="text-xs uppercase tracking-widest text-neutral-500">Contenido</p>
          {fields.map((field) => (
            <FieldInput key={field.key} eventId={eventId} field={field} config={config} onChange={updateField} />
          ))}
        </div>
      )}
    </div>
  )
}

export default SectionFieldEditor

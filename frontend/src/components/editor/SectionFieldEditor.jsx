import { SECTION_FIELD_DEFS, BACKGROUND_FIELD_DEFS } from '../../sections/sectionDefs'
import ImageUploadField from './ImageUploadField'

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

  if (field.type === 'textarea') {
    return (
      <div>
        <label className="block text-sm text-neutral-400 mb-1">{field.label}</label>
        <textarea
          value={value || ''}
          onChange={(e) => onChange(field.key, e.target.value)}
          rows={3}
          className="w-full rounded-lg bg-neutral-800 px-3 py-2 text-sm outline-none focus:ring-2 focus:ring-purple-500 transition"
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
          className="w-full rounded-lg bg-neutral-800 px-3 py-2 text-sm outline-none focus:ring-2 focus:ring-purple-500 transition"
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
          className="w-full accent-purple-500"
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
        className="w-full rounded-lg bg-neutral-800 px-3 py-2 text-sm outline-none focus:ring-2 focus:ring-purple-500 transition"
      />
    </div>
  )
}

function SectionFieldEditor({ eventId, sectionId, config, onChange }) {
  const fields = SECTION_FIELD_DEFS[sectionId] || []

  function updateField(key, value) {
    onChange({ ...config, [key]: value })
  }

  return (
    <div className="space-y-5">
      <div className="space-y-3">
        <p className="text-xs uppercase tracking-widest text-neutral-500">Fondo de la sección</p>
        {BACKGROUND_FIELD_DEFS.filter((field) => !field.showIf || field.showIf(config)).map((field) => (
          <FieldInput key={field.key} eventId={eventId} field={field} config={config} onChange={updateField} />
        ))}
      </div>

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

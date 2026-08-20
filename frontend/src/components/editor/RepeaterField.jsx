import { Trash2, Plus } from 'lucide-react'

function ItemInput({ field, value, onChange }) {
  if (field.type === 'select') {
    return (
      <select
        value={value || field.options[0]?.value || ''}
        onChange={(e) => onChange(e.target.value)}
        className="w-full rounded-lg bg-neutral-900 border border-white/10 px-3 py-2 text-sm outline-none focus:ring-2 focus:ring-purple-500 transition"
      >
        {field.options.map((option) => (
          <option key={option.value} value={option.value}>
            {option.label}
          </option>
        ))}
      </select>
    )
  }

  return (
    <input
      type="text"
      placeholder={field.label}
      value={value || ''}
      onChange={(e) => onChange(e.target.value)}
      className="w-full rounded-lg bg-neutral-900 border border-white/10 px-3 py-2 text-sm outline-none focus:ring-2 focus:ring-purple-500 transition"
    />
  )
}

function RepeaterField({ label, items, itemFields, onChange, addLabel = 'Agregar ítem' }) {
  const list = Array.isArray(items) ? items : []

  function updateItem(index, key, value) {
    onChange(list.map((item, i) => (i === index ? { ...item, [key]: value } : item)))
  }

  function addItem() {
    const empty = Object.fromEntries(itemFields.map((field) => [field.key, '']))
    onChange([...list, empty])
  }

  function removeItem(index) {
    onChange(list.filter((_, i) => i !== index))
  }

  return (
    <div>
      <label className="block text-sm text-neutral-400 mb-2">{label}</label>
      <div className="space-y-2">
        {list.map((item, index) => (
          <div key={index} className="rounded-lg bg-neutral-800 border border-white/10 p-3 space-y-2">
            {itemFields.map((field) => (
              <div key={field.key}>
                {field.label && field.type === 'select' && (
                  <p className="text-xs text-neutral-500 mb-1">{field.label}</p>
                )}
                <ItemInput field={field} value={item[field.key]} onChange={(v) => updateItem(index, field.key, v)} />
              </div>
            ))}
            <button
              type="button"
              onClick={() => removeItem(index)}
              className="flex items-center gap-1 text-xs text-red-400 hover:text-red-300 transition"
            >
              <Trash2 className="w-3.5 h-3.5" />
              Eliminar
            </button>
          </div>
        ))}
      </div>
      <button
        type="button"
        onClick={addItem}
        className="mt-2 flex items-center gap-1 text-xs text-purple-400 hover:text-purple-300 transition"
      >
        <Plus className="w-3.5 h-3.5" />
        {addLabel}
      </button>
    </div>
  )
}

export default RepeaterField

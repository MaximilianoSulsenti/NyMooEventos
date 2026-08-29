import { useState } from 'react'
import { Plus } from 'lucide-react'
import Button from '../ui/Button'
import { BRAND } from '../../utils/brand'

const MOMENT_PRESETS = [
  'Recepción / Bienvenida',
  'Cena / Ambiente',
  'Entrada de los Anfitriones',
  'Tanda Cachengue / Comercial',
  'Carnaval Carioca / Cotillón',
  'Hora Loca / Tanda Temática',
  'Música Lenta / Vals',
  'Fin de Fiesta / Cierre',
]

const CUSTOM_VALUE = '__custom__'

function AddMomentForm({ existingMoments, onAddMoment }) {
  const available = MOMENT_PRESETS.filter((preset) => !existingMoments.includes(preset))
  const [selected, setSelected] = useState(available[0] || CUSTOM_VALUE)
  const [customName, setCustomName] = useState('')

  const isCustom = selected === CUSTOM_VALUE

  function handleSubmit(e) {
    e.preventDefault()
    const momentType = isCustom ? customName.trim() : selected
    if (!momentType) return
    onAddMoment(momentType)
    setCustomName('')
    const nextAvailable = MOMENT_PRESETS.filter((preset) => ![...existingMoments, momentType].includes(preset))
    setSelected(nextAvailable[0] || CUSTOM_VALUE)
  }

  return (
    <form onSubmit={handleSubmit} className="rounded-2xl bg-white/5 border border-white/10 p-4 space-y-3">
      <p className="text-sm font-medium">Nuevo momento del evento</p>
      <select
        value={selected}
        onChange={(e) => setSelected(e.target.value)}
        className="w-full rounded-xl bg-white/5 border border-white/10 px-3 py-2.5 text-sm outline-none"
      >
        {available.map((preset) => (
          <option key={preset} value={preset} className="text-white bg-neutral-800">
            {preset}
          </option>
        ))}
        <option value={CUSTOM_VALUE} className="text-white bg-neutral-800">
          Otro (personalizado)
        </option>
      </select>

      {isCustom && (
        <input
          type="text"
          value={customName}
          onChange={(e) => setCustomName(e.target.value)}
          placeholder="Nombre del momento"
          style={{ '--accent': BRAND.violet }}
          className="w-full rounded-xl bg-white/5 border border-white/10 px-3 py-2.5 text-sm outline-none focus:border-[var(--accent)] focus:ring-2 focus:ring-[var(--accent)]/30 transition"
        />
      )}

      <Button type="submit" primaryColor={BRAND.violet} className="w-full py-2.5 text-sm">
        <Plus className="w-4 h-4" />
        Agregar bloque
      </Button>
    </form>
  )
}

export default AddMomentForm

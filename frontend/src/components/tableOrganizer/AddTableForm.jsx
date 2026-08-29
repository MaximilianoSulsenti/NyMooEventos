import { useState } from 'react'
import { Plus } from 'lucide-react'
import Button from '../ui/Button'
import { BRAND } from '../../utils/brand'

const SEAT_OPTIONS = Array.from({ length: 11 }, (_, i) => i + 2) // 2..12

function AddTableForm({ nextTableNumber, onAddTable }) {
  const [tableName, setTableName] = useState('')
  const [maxSeats, setMaxSeats] = useState(8)

  function handleSubmit(e) {
    e.preventDefault()
    onAddTable({ tableName: tableName.trim(), maxSeats })
    setTableName('')
    setMaxSeats(8)
  }

  return (
    <form onSubmit={handleSubmit} className="rounded-2xl bg-white/5 border border-white/10 p-4 space-y-3">
      <p className="text-sm font-medium">Nueva mesa</p>
      <div className="grid grid-cols-[1fr_auto] gap-2">
        <input
          type="text"
          value={tableName}
          onChange={(e) => setTableName(e.target.value)}
          placeholder={`Mesa ${nextTableNumber} (opcional)`}
          style={{ '--accent': BRAND.blue }}
          className="w-full rounded-xl bg-white/5 border border-white/10 px-3 py-2.5 text-sm outline-none focus:border-[var(--accent)] focus:ring-2 focus:ring-[var(--accent)]/30 transition"
        />
        <select
          value={maxSeats}
          onChange={(e) => setMaxSeats(Number(e.target.value))}
          className="rounded-xl bg-white/5 border border-white/10 px-3 py-2.5 text-sm outline-none"
        >
          {SEAT_OPTIONS.map((n) => (
            <option key={n} value={n} className="text-white bg-neutral-800">
              {n} asientos
            </option>
          ))}
        </select>
      </div>
      <Button type="submit" primaryColor={BRAND.blue} className="w-full py-2.5 text-sm">
        <Plus className="w-4 h-4" />
        Agregar mesa
      </Button>
    </form>
  )
}

export default AddTableForm

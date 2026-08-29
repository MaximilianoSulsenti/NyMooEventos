import { Check } from 'lucide-react'
import { cn } from '../../utils/cn'
import { LANDING_PACKS } from '../../utils/landingConfig'

// Multi-selección a propósito: se puede combinar más de un pack, y también
// con herramientas/complementos independientes que se compran sueltos (ver
// items/totalPrice en backend/models/Order.js) -- por eso cada card se
// togglea en vez de comportarse como un radio de selección única. `items`
// default a LANDING_PACKS, pero también se reusa con LANDING_TOOLS (ver
// Checkout.jsx) para no duplicar esta grilla.
function PackPicker({ items = LANDING_PACKS, selectedIds, onToggle }) {
  return (
    <div className="grid sm:grid-cols-2 lg:grid-cols-4 gap-3">
      {items.map((pack) => {
        const isSelected = selectedIds.includes(pack.id)
        return (
          <button
            key={pack.id}
            type="button"
            onClick={() => onToggle(pack.id)}
            aria-pressed={isSelected}
            className={cn(
              'relative text-left rounded-2xl border p-4 transition',
              isSelected ? 'border-transparent bg-white/[0.06]' : 'border-white/10 bg-white/[0.02] hover:bg-white/[0.04]'
            )}
            style={isSelected ? { boxShadow: `0 0 0 2px ${pack.accentColor}` } : undefined}
          >
            <span
              className={cn(
                'absolute top-3 right-3 w-5 h-5 rounded-md flex items-center justify-center border transition',
                isSelected ? 'border-transparent' : 'border-white/20 bg-white/[0.03]'
              )}
              style={isSelected ? { background: pack.accentColor } : undefined}
            >
              {isSelected && <Check className="w-3 h-3 text-white" />}
            </span>
            <p className="font-semibold text-sm pr-6">{pack.name}</p>
            {pack.tagline && <p className="text-white/40 text-[11px] mt-0.5 truncate">{pack.tagline}</p>}
            <p className="text-lg font-extrabold mt-1" style={{ color: pack.accentColor }}>
              {pack.price}
            </p>
          </button>
        )
      })}
    </div>
  )
}

export default PackPicker

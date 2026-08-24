import { Check } from 'lucide-react'
import { cn } from '../../utils/cn'
import { LANDING_PACKS } from '../../utils/landingConfig'

function PackPicker({ selectedId, onSelect }) {
  return (
    <div className="grid sm:grid-cols-2 lg:grid-cols-4 gap-3">
      {LANDING_PACKS.map((pack) => {
        const isSelected = pack.id === selectedId
        return (
          <button
            key={pack.id}
            type="button"
            onClick={() => onSelect(pack.id)}
            className={cn(
              'relative text-left rounded-2xl border p-4 transition',
              isSelected ? 'border-transparent bg-white/[0.06]' : 'border-white/10 bg-white/[0.02] hover:bg-white/[0.04]'
            )}
            style={isSelected ? { boxShadow: `0 0 0 2px ${pack.accentColor}` } : undefined}
          >
            {isSelected && (
              <span
                className="absolute top-3 right-3 w-5 h-5 rounded-full flex items-center justify-center"
                style={{ background: pack.accentColor }}
              >
                <Check className="w-3 h-3 text-white" />
              </span>
            )}
            <p className="font-semibold text-sm">{pack.name}</p>
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

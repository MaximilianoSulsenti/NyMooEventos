import { Zap, Check } from 'lucide-react'
import { cn } from '../../utils/cn'
import { BRAND } from '../../utils/brand'
import { computeDuoAddonPrice } from '../../utils/landingConfig'

// Add-on de la Invitación Dúo -- solo se puede sumar si ya hay un pack
// principal elegido (INVITA/CONECTA/VIVE), y su precio es dinámico: 50% del
// más caro de los packs elegibles seleccionados (ver computeDuoAddonPrice).
// El backend vuelve a calcular este precio de cero, esto es solo preview.
function DuoAddonToggle({ selectedPacks, selected, onToggle }) {
  const duoPrice = computeDuoAddonPrice(selectedPacks)
  const available = duoPrice > 0

  return (
    <button
      type="button"
      disabled={!available}
      onClick={onToggle}
      aria-pressed={selected}
      className={cn(
        'w-full text-left rounded-2xl border p-4 transition flex items-start gap-3',
        !available && 'opacity-40 cursor-not-allowed',
        selected ? 'border-transparent bg-white/[0.06]' : 'border-white/10 bg-white/[0.02] hover:bg-white/[0.04]'
      )}
      style={selected ? { boxShadow: `0 0 0 2px ${BRAND.lime}` } : undefined}
    >
      <span
        className="w-9 h-9 rounded-xl shrink-0 flex items-center justify-center"
        style={{ background: `${BRAND.lime}22`, color: BRAND.lime }}
      >
        <Zap className="w-4 h-4" />
      </span>
      <span className="min-w-0 flex-1">
        <span className="flex items-center justify-between gap-2 flex-wrap">
          <span className="font-semibold text-sm">Invitación Dúo</span>
          {/* Checkbox explícito además del click en toda la card -- mismo
              lenguaje visual que las cards de pack en PackPicker.jsx, para
              que quede claro que se puede tildar como algo aparte. */}
          <span className="flex items-center gap-2 shrink-0">
            {available && (
              <span className="font-extrabold text-sm" style={{ color: BRAND.lime }}>
                +${duoPrice.toLocaleString('es-AR')}
              </span>
            )}
            <span
              className={cn(
                'w-5 h-5 rounded-md flex items-center justify-center border transition',
                selected ? 'border-transparent' : 'border-white/20 bg-white/[0.03]'
              )}
              style={selected ? { background: BRAND.lime } : undefined}
            >
              {selected && <Check className="w-3 h-3 text-neutral-900" />}
            </span>
          </span>
        </span>
        <span className="text-white/50 text-xs block mt-0.5 leading-relaxed">
          {available
            ? 'Una segunda versión de tu invitación (misma estética, datos propios) para separar invitados -- cena vs. post-cena, con/sin tarjeta, ceremonia vs. solo fiesta. 50% off por venir con un pack principal.'
            : 'Elegí Nymoo INVITA, CONECTA o VIVE para desbloquear la Invitación Dúo con 50% off.'}
        </span>
      </span>
    </button>
  )
}

export default DuoAddonToggle

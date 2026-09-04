import { useEffect, useRef, useState } from 'react'
import { Palette } from 'lucide-react'
import { shadeColor } from '../../utils/color'
import { NAMED_COLORS } from '../../utils/colorPalette'

// Selector de color compartido por todo el editor -- además del selector
// nativo + hex de siempre, suma una grilla de colores con nombre y un
// slider para aclarar/oscurecer sin tener que salir a buscar el hex exacto.
function ColorPickerField({ label, value, onChange, placeholder = '#ffffff', allowReset = false, onReset }) {
  const current = value || placeholder
  // El slider siempre recalcula shadeColor(anchor, valor) desde cero, nunca
  // sobre el color actual -- si no, cada arrastre se acumularía sobre el
  // anterior y el tono se iría desviando en vez de quedar relativo al color
  // elegido. `anchor` se resetea al elegir un color nuevo (swatch, hex
  // tipeado, o si el value cambió desde afuera, ej. al pasar a otra
  // sección que reusa el mismo campo `textColor`).
  const lastEmitted = useRef(value)
  const [anchor, setAnchor] = useState(current)
  const [shade, setShade] = useState(0)
  const [showPanel, setShowPanel] = useState(false)

  useEffect(() => {
    if (value !== lastEmitted.current) {
      setAnchor(value || placeholder)
      setShade(0)
    }
  }, [value, placeholder])

  function emit(hex) {
    lastEmitted.current = hex
    onChange(hex)
  }

  function pickNewColor(hex) {
    setAnchor(hex)
    setShade(0)
    emit(hex)
  }

  function dragShade(pct) {
    setShade(pct)
    emit(shadeColor(anchor, pct))
  }

  function handleReset() {
    setAnchor(placeholder)
    setShade(0)
    if (onReset) onReset()
    else emit('')
  }

  return (
    <div>
      <label className="block text-sm text-neutral-400 mb-1">{label}</label>
      <div className="flex items-center gap-2">
        <input
          type="color"
          value={current}
          onChange={(e) => pickNewColor(e.target.value)}
          className="w-10 h-10 rounded cursor-pointer bg-transparent shrink-0"
        />
        <input
          type="text"
          value={current}
          onChange={(e) => pickNewColor(e.target.value)}
          className="flex-1 rounded-xl bg-white/5 border border-white/10 px-3 py-2 text-sm outline-none focus:ring-2 focus:ring-[var(--accent)] transition"
        />
        <button
          type="button"
          onClick={() => setShowPanel((v) => !v)}
          aria-expanded={showPanel}
          aria-label="Elegir por nombre o ajustar tono"
          className={`w-9 h-9 rounded-lg flex items-center justify-center border transition-colors shrink-0 ${
            showPanel
              ? 'bg-[var(--accent)]/20 border-[var(--accent)] text-[var(--accent)]'
              : 'border-white/10 text-neutral-400 hover:text-white hover:border-white/20'
          }`}
        >
          <Palette className="w-4 h-4" />
        </button>
        {allowReset && (
          <button
            type="button"
            onClick={handleReset}
            className="text-xs text-neutral-500 hover:text-white transition shrink-0"
          >
            Restaurar
          </button>
        )}
      </div>

      {showPanel && (
        <div className="mt-2 p-3 rounded-xl bg-white/[0.03] border border-white/10 space-y-3">
          <div className="grid grid-cols-6 gap-1.5">
            {NAMED_COLORS.map((c) => {
              const isActive = current.toLowerCase() === c.hex.toLowerCase()
              return (
                <button
                  key={c.hex}
                  type="button"
                  title={c.name}
                  aria-label={c.name}
                  onClick={() => pickNewColor(c.hex)}
                  className="w-full aspect-square rounded-md border transition-transform hover:scale-110"
                  style={{
                    backgroundColor: c.hex,
                    borderColor: isActive ? 'var(--accent)' : 'rgba(255,255,255,0.15)',
                    boxShadow: isActive ? '0 0 0 2px var(--accent)' : 'none',
                  }}
                />
              )
            })}
          </div>
          <div>
            <div className="flex items-center justify-between text-xs text-neutral-400 mb-1">
              <span>Tono</span>
              <span>{shade === 0 ? 'original' : shade > 0 ? `+${shade} más claro` : `${shade} más oscuro`}</span>
            </div>
            <input
              type="range"
              min={-80}
              max={80}
              step={5}
              value={shade}
              onChange={(e) => dragShade(Number(e.target.value))}
              className="w-full accent-[var(--accent)]"
            />
          </div>
        </div>
      )}
    </div>
  )
}

export default ColorPickerField

import { BRAND } from '../../utils/brand'

function ModuleToggle({ label, description, checked, onChange, disabled }) {
  return (
    <div className="flex items-center justify-between gap-3 rounded-2xl bg-white/5 border border-white/10 p-4">
      <div className="min-w-0">
        <p className="font-medium">{label}</p>
        <p className="text-white/40 text-sm">{description}</p>
      </div>
      <button
        type="button"
        role="switch"
        aria-checked={checked}
        disabled={disabled}
        onClick={() => onChange(!checked)}
        className="relative w-12 h-7 rounded-full transition-colors disabled:opacity-40 shrink-0"
        style={{ background: checked ? BRAND.blue : 'rgba(255,255,255,0.12)' }}
      >
        <span
          className={`absolute top-1 left-1 w-5 h-5 rounded-full bg-white transition-transform ${
            checked ? 'translate-x-5' : 'translate-x-0'
          }`}
        />
      </button>
    </div>
  )
}

export default ModuleToggle

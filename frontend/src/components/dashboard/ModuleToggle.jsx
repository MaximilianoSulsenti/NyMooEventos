function ModuleToggle({ label, description, checked, onChange, disabled }) {
  return (
    <div className="flex items-center justify-between rounded-xl bg-neutral-900 border border-white/10 p-4">
      <div>
        <p className="font-medium">{label}</p>
        <p className="text-neutral-400 text-sm">{description}</p>
      </div>
      <button
        type="button"
        role="switch"
        aria-checked={checked}
        disabled={disabled}
        onClick={() => onChange(!checked)}
        className={`relative w-12 h-7 rounded-full transition-colors disabled:opacity-40 ${
          checked ? 'bg-purple-600' : 'bg-neutral-700'
        }`}
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

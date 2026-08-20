const THEMES = ['minimalista', 'moderno', 'vanguardista', 'romantica']
const FONTS = [
  { value: 'sans', label: 'Sans-serif' },
  { value: 'serif', label: 'Serif' },
]

function ColorField({ label, value, onChange }) {
  return (
    <div>
      <label className="block text-sm text-neutral-400 mb-1">{label}</label>
      <div className="flex items-center gap-2">
        <input
          type="color"
          value={value}
          onChange={(e) => onChange(e.target.value)}
          className="w-10 h-10 rounded cursor-pointer bg-transparent"
        />
        <input
          type="text"
          value={value}
          onChange={(e) => onChange(e.target.value)}
          className="flex-1 rounded-lg bg-neutral-800 px-3 py-2 text-sm outline-none focus:ring-2 focus:ring-purple-500"
        />
      </div>
    </div>
  )
}

function AppearancePanel({ appearance, onChange }) {
  function update(patch) {
    onChange({ ...appearance, ...patch })
  }

  return (
    <div className="space-y-4">
      <div>
        <label className="block text-sm text-neutral-400 mb-1">Tema</label>
        <select
          value={appearance.theme}
          onChange={(e) => update({ theme: e.target.value })}
          className="w-full rounded-lg bg-neutral-800 px-3 py-2 text-sm outline-none focus:ring-2 focus:ring-purple-500"
        >
          {THEMES.map((theme) => (
            <option key={theme} value={theme}>
              {theme}
            </option>
          ))}
        </select>
      </div>

      <div>
        <label className="block text-sm text-neutral-400 mb-1">Tipografía</label>
        <select
          value={appearance.fontFamily}
          onChange={(e) => update({ fontFamily: e.target.value })}
          className="w-full rounded-lg bg-neutral-800 px-3 py-2 text-sm outline-none focus:ring-2 focus:ring-purple-500"
        >
          {FONTS.map((font) => (
            <option key={font.value} value={font.value}>
              {font.label}
            </option>
          ))}
        </select>
      </div>

      <ColorField label="Color primario" value={appearance.primaryColor} onChange={(v) => update({ primaryColor: v })} />
      <ColorField label="Color secundario" value={appearance.secondaryColor} onChange={(v) => update({ secondaryColor: v })} />
      <ColorField label="Color de fondo" value={appearance.backgroundColor} onChange={(v) => update({ backgroundColor: v })} />
    </div>
  )
}

export default AppearancePanel

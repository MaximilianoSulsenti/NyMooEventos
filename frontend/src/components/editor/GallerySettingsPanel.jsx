import { BRAND } from '../../utils/brand'

function GallerySettingsPanel({ settings, onChange }) {
  function update(patch) {
    onChange({ ...settings, ...patch })
  }

  return (
    <div className="space-y-3">
      <div className="flex items-center justify-between gap-3">
        <div>
          <span className="text-sm font-medium">Permitir videos cortos</span>
          <p className="text-xs text-neutral-500 mt-0.5">
            Los invitados podrán subir videos de hasta 15s y 20MB, además de fotos.
          </p>
        </div>
        <button
          type="button"
          role="switch"
          aria-checked={settings.allowVideos}
          onClick={() => update({ allowVideos: !settings.allowVideos })}
          className="relative w-10 h-6 rounded-full transition-colors shrink-0"
          style={{ background: settings.allowVideos ? BRAND.blue : 'rgba(255,255,255,0.12)' }}
        >
          <span
            className={`absolute top-1 left-1 w-4 h-4 rounded-full bg-white transition-transform ${
              settings.allowVideos ? 'translate-x-4' : ''
            }`}
          />
        </button>
      </div>
    </div>
  )
}

export default GallerySettingsPanel

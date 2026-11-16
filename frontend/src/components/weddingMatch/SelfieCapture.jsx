import { useRef, useState } from 'react'
import { Camera, RefreshCw } from 'lucide-react'

// capture="user" abre directo la cámara frontal en el celular -- sin eso,
// casi todos los navegadores móviles muestran la galería primero, un paso
// extra para algo pensado como "la foto de ESTE momento". El input sin
// capture queda como alternativa (ej. alguien que prefiere elegir una foto
// ya sacada), un link de texto chico, no un botón compitiendo en tamaño.
function SelfieCapture({ initialPhotoUrl, onChange, primaryColor }) {
  const cameraInputRef = useRef(null)
  const galleryInputRef = useRef(null)
  const [preview, setPreview] = useState(initialPhotoUrl || null)

  function handleFile(file) {
    if (!file) return
    const url = URL.createObjectURL(file)
    setPreview(url)
    onChange(file)
  }

  function retake() {
    setPreview(null)
    onChange(null)
  }

  if (preview) {
    return (
      <div className="flex flex-col items-center gap-3">
        <img src={preview} alt="Tu selfie" className="w-32 h-32 rounded-full object-cover border-2" style={{ borderColor: primaryColor }} />
        <button
          type="button"
          onClick={retake}
          className="flex items-center gap-1.5 text-sm text-white/60 hover:text-white transition"
        >
          <RefreshCw className="w-3.5 h-3.5" />
          Sacar otra
        </button>
      </div>
    )
  }

  return (
    <div className="flex flex-col items-center gap-3">
      <button
        type="button"
        onClick={() => cameraInputRef.current?.click()}
        className="w-28 h-28 rounded-full flex items-center justify-center border-2 border-dashed transition hover:brightness-110"
        style={{ borderColor: `${primaryColor}80`, background: `${primaryColor}15`, color: primaryColor }}
      >
        <Camera className="w-8 h-8" />
      </button>
      <p className="text-sm text-white/60">Sacate una selfie</p>
      <button type="button" onClick={() => galleryInputRef.current?.click()} className="text-xs text-white/40 underline underline-offset-2">
        o elegí una foto de tu galería
      </button>

      <input
        ref={cameraInputRef}
        type="file"
        accept="image/*"
        capture="user"
        className="hidden"
        onChange={(e) => handleFile(e.target.files?.[0])}
      />
      <input
        ref={galleryInputRef}
        type="file"
        accept="image/*"
        className="hidden"
        onChange={(e) => handleFile(e.target.files?.[0])}
      />
    </div>
  )
}

export default SelfieCapture

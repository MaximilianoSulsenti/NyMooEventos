import { useRef, useState } from 'react'
import { FileVideo } from 'lucide-react'
import api from '../../services/api'
import { BRAND } from '../../utils/brand'

// Mismo mecanismo que ImageUploadField (firma propia + subida directa a
// Cloudinary desde el navegador, sin pasar por nuestro backend), apuntando a
// /video/upload en vez de /image/upload -- la firma no depende del tipo de
// recurso (solo firma timestamp+folder), así que sirve la misma sin tocar
// nada del backend. Además de subir el archivo, deja pegar una URL directa
// a mano (por si el video ya está alojado en otro lado).
function VideoUploadField({ eventId, label, value, onChange }) {
  const fileInputRef = useRef(null)
  const [status, setStatus] = useState('idle') // idle | uploading | error

  async function handleFileChange(event) {
    const file = event.target.files?.[0]
    if (!file) return

    setStatus('uploading')
    try {
      const { data: signData } = await api.get(`/events/${eventId}/appearance/sign`)

      const form = new FormData()
      form.append('file', file)
      form.append('api_key', signData.apiKey)
      form.append('timestamp', signData.timestamp)
      form.append('signature', signData.signature)
      form.append('folder', signData.folder)

      const response = await fetch(`https://api.cloudinary.com/v1_1/${signData.cloudName}/video/upload`, {
        method: 'POST',
        body: form,
      })
      if (!response.ok) throw new Error('Falló la subida')
      const data = await response.json()

      onChange(data.secure_url)
      setStatus('idle')
    } catch {
      setStatus('error')
    } finally {
      event.target.value = ''
    }
  }

  return (
    <div>
      <label className="block text-sm text-neutral-400 mb-1">{label}</label>
      {value && (
        <video src={value} muted loop autoPlay playsInline className="w-full h-24 object-cover rounded-lg mb-2" />
      )}
      <input ref={fileInputRef} type="file" accept="video/*" onChange={handleFileChange} className="hidden" />
      <button
        type="button"
        onClick={() => fileInputRef.current?.click()}
        disabled={status === 'uploading'}
        className="flex items-center gap-2 rounded-lg bg-neutral-800 border border-white/10 px-3 py-2 text-sm text-neutral-300 hover:text-white hover:border-white/20 transition disabled:opacity-50"
      >
        <FileVideo className="w-4 h-4" style={{ color: BRAND.blue }} />
        {status === 'uploading' ? 'Subiendo...' : value ? 'Cambiar video' : 'Subir video'}
      </button>
      {status === 'error' && <p className="text-xs text-red-400 mt-1">No se pudo subir el video</p>}

      <p className="text-xs text-neutral-500 mt-2 mb-1">...o pegá una URL directa (si ya está alojado en otro lado):</p>
      <input
        type="text"
        value={value || ''}
        onChange={(e) => onChange(e.target.value)}
        placeholder="https://..."
        className="w-full rounded-xl bg-neutral-800 border border-white/10 px-3 py-2 text-sm outline-none focus:ring-2 focus:ring-[var(--accent)]"
      />
    </div>
  )
}

export default VideoUploadField

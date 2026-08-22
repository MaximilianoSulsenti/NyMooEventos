import { useRef, useState } from 'react'
import { Music2 } from 'lucide-react'
import api from '../../services/api'
import { BRAND } from '../../utils/brand'

function AudioUploadField({ eventId, label, value, onChange }) {
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

      // Cloudinary maneja los archivos de audio dentro del pipeline de "video".
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
      {value && <audio src={value} controls className="w-full h-9 mb-2" />}
      <input ref={fileInputRef} type="file" accept="audio/*" onChange={handleFileChange} className="hidden" />
      <button
        type="button"
        onClick={() => fileInputRef.current?.click()}
        disabled={status === 'uploading'}
        className="flex items-center gap-2 rounded-lg bg-neutral-800 border border-white/10 px-3 py-2 text-sm text-neutral-300 hover:text-white hover:border-white/20 transition disabled:opacity-50"
      >
        <Music2 className="w-4 h-4" style={{ color: BRAND.blue }} />
        {status === 'uploading' ? 'Subiendo...' : value ? 'Cambiar audio' : 'Elegir audio'}
      </button>
      {status === 'error' && <p className="text-xs text-red-400 mt-1">No se pudo subir el audio</p>}
    </div>
  )
}

export default AudioUploadField

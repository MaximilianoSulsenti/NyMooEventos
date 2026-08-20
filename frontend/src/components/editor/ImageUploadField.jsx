import { useState } from 'react'
import api from '../../services/api'

function ImageUploadField({ eventId, label, value, onChange }) {
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

      const response = await fetch(`https://api.cloudinary.com/v1_1/${signData.cloudName}/image/upload`, {
        method: 'POST',
        body: form,
      })
      if (!response.ok) throw new Error('Falló la subida')
      const data = await response.json()

      onChange(data.secure_url)
      setStatus('idle')
    } catch {
      setStatus('error')
    }
  }

  return (
    <div>
      <label className="block text-sm text-neutral-400 mb-1">{label}</label>
      {value && <img src={value} alt="" className="w-full h-24 object-cover rounded-lg mb-2" />}
      <input
        type="file"
        accept="image/*"
        onChange={handleFileChange}
        className="text-xs text-neutral-400"
      />
      {status === 'uploading' && <p className="text-xs text-neutral-500 mt-1">Subiendo...</p>}
      {status === 'error' && <p className="text-xs text-red-400 mt-1">No se pudo subir la imagen</p>}
    </div>
  )
}

export default ImageUploadField

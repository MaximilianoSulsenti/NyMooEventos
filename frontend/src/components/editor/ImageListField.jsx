import { useRef, useState } from 'react'
import { Trash2, ImagePlus } from 'lucide-react'
import api from '../../services/api'
import { BRAND } from '../../utils/brand'

function ImageListField({ eventId, label, images, onChange }) {
  const fileInputRef = useRef(null)
  const list = Array.isArray(images) ? images : []
  const [status, setStatus] = useState('idle') // idle | uploading | error

  async function handleFileChange(event) {
    const files = Array.from(event.target.files || [])
    if (files.length === 0) return

    setStatus('uploading')
    try {
      const { data: signData } = await api.get(`/events/${eventId}/appearance/sign`)

      const uploadedUrls = []
      for (const file of files) {
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
        uploadedUrls.push(data.secure_url)
      }

      onChange([...list, ...uploadedUrls])
      setStatus('idle')
    } catch {
      setStatus('error')
    } finally {
      event.target.value = ''
    }
  }

  function removeImage(index) {
    onChange(list.filter((_, i) => i !== index))
  }

  return (
    <div>
      <label className="block text-sm text-neutral-400 mb-2">{label}</label>

      {list.length > 0 && (
        <div className="grid grid-cols-4 gap-2 mb-3">
          {list.map((url, index) => (
            <div key={index} className="relative group">
              <img src={url} alt="" className="w-full aspect-square object-cover rounded-lg" />
              <button
                type="button"
                onClick={() => removeImage(index)}
                className="absolute inset-0 bg-black/60 opacity-0 group-hover:opacity-100 flex items-center justify-center rounded-lg transition-opacity"
              >
                <Trash2 className="w-4 h-4 text-red-400" />
              </button>
            </div>
          ))}
        </div>
      )}

      <input ref={fileInputRef} type="file" accept="image/*" multiple onChange={handleFileChange} className="hidden" />
      <button
        type="button"
        onClick={() => fileInputRef.current?.click()}
        disabled={status === 'uploading'}
        className="flex items-center gap-2 rounded-lg bg-neutral-800 border border-white/10 px-3 py-2 text-sm text-neutral-300 hover:text-white hover:border-white/20 transition disabled:opacity-50"
      >
        <ImagePlus className="w-4 h-4" style={{ color: BRAND.blue }} />
        {status === 'uploading' ? 'Subiendo...' : 'Agregar imágenes'}
      </button>
      {status === 'error' && <p className="text-xs text-red-400 mt-1">No se pudo subir alguna imagen</p>}
    </div>
  )
}

export default ImageListField

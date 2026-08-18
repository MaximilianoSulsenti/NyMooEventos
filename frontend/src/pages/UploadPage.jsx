import { useState } from 'react'
import { useParams } from 'react-router-dom'
import api from '../services/api'

function UploadPage() {
  const { eventSlug } = useParams()
  const [file, setFile] = useState(null)
  const [preview, setPreview] = useState(null)
  const [status, setStatus] = useState('idle') // idle | uploading | success | error
  const [errorMessage, setErrorMessage] = useState('')

  function handleFileChange(event) {
    const selected = event.target.files?.[0]
    if (!selected) return
    setFile(selected)
    setPreview(URL.createObjectURL(selected))
    setStatus('idle')
  }

  async function handleUpload() {
    if (!file) return
    setStatus('uploading')
    setErrorMessage('')

    try {
      const { data: signData } = await api.get(`/photos/sign/${eventSlug}`)

      const cloudinaryForm = new FormData()
      cloudinaryForm.append('file', file)
      cloudinaryForm.append('api_key', signData.apiKey)
      cloudinaryForm.append('timestamp', signData.timestamp)
      cloudinaryForm.append('signature', signData.signature)
      cloudinaryForm.append('folder', signData.folder)

      const cloudinaryResponse = await fetch(
        `https://api.cloudinary.com/v1_1/${signData.cloudName}/image/upload`,
        { method: 'POST', body: cloudinaryForm }
      )

      if (!cloudinaryResponse.ok) {
        throw new Error('No se pudo subir la imagen a Cloudinary')
      }

      const cloudinaryData = await cloudinaryResponse.json()

      await api.post('/photos/register', {
        eventId: signData.eventId,
        secure_url: cloudinaryData.secure_url,
      })

      setStatus('success')
      setFile(null)
      setPreview(null)
    } catch (err) {
      setStatus('error')
      setErrorMessage(err.message || 'Ocurrió un error al subir la foto')
    }
  }

  return (
    <div className="min-h-screen flex flex-col items-center justify-center gap-4 p-6 bg-neutral-950 text-white">
      <h1 className="text-2xl font-semibold">Subí tu foto del evento</h1>

      {preview && (
        <img src={preview} alt="Vista previa" className="w-64 h-64 object-cover rounded-xl" />
      )}

      <input
        type="file"
        accept="image/*"
        capture="environment"
        onChange={handleFileChange}
        className="text-sm"
      />

      <button
        type="button"
        onClick={handleUpload}
        disabled={!file || status === 'uploading'}
        className="px-6 py-2 rounded-full bg-purple-600 disabled:opacity-40 disabled:cursor-not-allowed transition"
      >
        {status === 'uploading' ? 'Subiendo...' : 'Subir foto'}
      </button>

      {status === 'success' && (
        <p className="text-green-400">¡Foto subida! Mirá la pantalla del salón.</p>
      )}
      {status === 'error' && <p className="text-red-400">{errorMessage}</p>}
    </div>
  )
}

export default UploadPage

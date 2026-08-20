import { useState } from 'react'
import { useParams } from 'react-router-dom'
import imageCompression from 'browser-image-compression'
import api from '../services/api'

const MAX_PHOTOS = 5
const MAX_SIZE_MB = 4

function UploadPage() {
  const { eventSlug } = useParams()
  const [files, setFiles] = useState([])
  const [comment, setComment] = useState('')
  const [status, setStatus] = useState('idle') // idle | uploading | success | error
  const [progress, setProgress] = useState({ done: 0, total: 0 })
  const [errorMessage, setErrorMessage] = useState('')
  const [warning, setWarning] = useState('')

  function handleFileChange(event) {
    const selected = Array.from(event.target.files || [])
    if (selected.length > MAX_PHOTOS) {
      setWarning(`Podés subir hasta ${MAX_PHOTOS} fotos por tanda, se tomaron las primeras ${MAX_PHOTOS}.`)
    } else {
      setWarning('')
    }
    setFiles(selected.slice(0, MAX_PHOTOS))
    setStatus('idle')
  }

  async function uploadSinglePhoto(file, signData) {
    let compressed = file
    try {
      compressed = await imageCompression(file, {
        maxSizeMB: MAX_SIZE_MB,
        maxWidthOrHeight: 2000,
        useWebWorker: true,
      })
    } catch {
      // Si la compresión falla con un archivo inusual, subimos el original sin comprimir.
    }

    const cloudinaryForm = new FormData()
    cloudinaryForm.append('file', compressed)
    cloudinaryForm.append('api_key', signData.apiKey)
    cloudinaryForm.append('timestamp', signData.timestamp)
    cloudinaryForm.append('signature', signData.signature)
    cloudinaryForm.append('folder', signData.folder)

    const cloudinaryResponse = await fetch(
      `https://api.cloudinary.com/v1_1/${signData.cloudName}/image/upload`,
      { method: 'POST', body: cloudinaryForm }
    )
    if (!cloudinaryResponse.ok) {
      throw new Error('No se pudo subir una de las imágenes a Cloudinary')
    }
    const cloudinaryData = await cloudinaryResponse.json()

    await api.post('/photos/register', {
      eventId: signData.eventId,
      secure_url: cloudinaryData.secure_url,
      comment,
    })
  }

  async function handleUpload() {
    if (files.length === 0) return
    setStatus('uploading')
    setErrorMessage('')
    setProgress({ done: 0, total: files.length })

    try {
      const { data: signData } = await api.get(`/photos/sign/${eventSlug}`)

      for (const file of files) {
        await uploadSinglePhoto(file, signData)
        setProgress((prev) => ({ ...prev, done: prev.done + 1 }))
      }

      setStatus('success')
      setFiles([])
      setComment('')
    } catch (err) {
      setStatus('error')
      setErrorMessage(err.response?.data?.message || err.message || 'Ocurrió un error al subir las fotos')
    }
  }

  return (
    <div className="min-h-screen flex flex-col items-center justify-center gap-4 p-6 bg-neutral-950 text-white">
      <h1 className="text-2xl font-semibold">Subí tus fotos del evento</h1>
      <p className="text-neutral-400 text-sm">Hasta {MAX_PHOTOS} fotos por tanda</p>

      {files.length > 0 && (
        <div className="flex gap-2 flex-wrap justify-center max-w-sm">
          {files.map((file, index) => (
            <img
              key={index}
              src={URL.createObjectURL(file)}
              alt=""
              className="w-16 h-16 object-cover rounded-lg"
            />
          ))}
        </div>
      )}

      <input
        type="file"
        accept="image/*"
        capture="environment"
        multiple
        onChange={handleFileChange}
        className="text-sm"
      />
      {warning && <p className="text-yellow-400 text-xs">{warning}</p>}

      <textarea
        value={comment}
        onChange={(e) => setComment(e.target.value.slice(0, 60))}
        placeholder="Dedicatoria (opcional, máx. 60 caracteres)"
        maxLength={60}
        rows={2}
        className="w-full max-w-sm rounded-lg bg-neutral-800 px-3 py-2 text-sm outline-none focus:ring-2 focus:ring-purple-500"
      />
      <p className="text-neutral-500 text-xs self-end max-w-sm w-full text-right">{comment.length}/60</p>

      <button
        type="button"
        onClick={handleUpload}
        disabled={files.length === 0 || status === 'uploading'}
        className="px-6 py-2 rounded-full bg-purple-600 disabled:opacity-40 disabled:cursor-not-allowed transition"
      >
        {status === 'uploading'
          ? `Subiendo ${progress.done}/${progress.total}...`
          : `Subir ${files.length > 0 ? files.length : ''} foto${files.length === 1 ? '' : 's'}`}
      </button>

      {status === 'success' && (
        <p className="text-green-400">¡Fotos subidas! Mirá la pantalla del salón.</p>
      )}
      {status === 'error' && <p className="text-red-400">{errorMessage}</p>}
    </div>
  )
}

export default UploadPage

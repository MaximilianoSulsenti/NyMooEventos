import { useRef, useState } from 'react'
import imageCompression from 'browser-image-compression'
import { motion, AnimatePresence } from 'motion/react'
import { Camera, X, CheckCircle2, XCircle, Video } from 'lucide-react'
import api from '../services/api'
import Button from './ui/Button'

const MAX_FILES = 5
const MAX_IMAGE_SIZE_MB = 4
const MAX_VIDEO_SIZE_MB = 20
const MAX_VIDEO_SECONDS = 15

function readVideoDuration(file) {
  return new Promise((resolve) => {
    const video = document.createElement('video')
    video.preload = 'metadata'
    video.muted = true
    video.onloadedmetadata = () => {
      URL.revokeObjectURL(video.src)
      resolve(video.duration)
    }
    video.onerror = () => resolve(null)
    video.src = URL.createObjectURL(file)
  })
}

function UploadPhotosForm({ eventSlug, primaryColor = '#a855f7', allowVideos = false }) {
  const fileInputRef = useRef(null)
  const [items, setItems] = useState([]) // { file, type: 'image' | 'video' }
  const [comment, setComment] = useState('')
  const [guestName, setGuestName] = useState(() => {
    try {
      return localStorage.getItem('nymoo_guest_name') || ''
    } catch {
      return ''
    }
  })
  const [status, setStatus] = useState('idle') // idle | uploading | success | error
  const [progress, setProgress] = useState({ done: 0, total: 0 })
  const [errorMessage, setErrorMessage] = useState('')
  const [warning, setWarning] = useState('')

  async function handleFileChange(event) {
    const selected = Array.from(event.target.files || [])
    const warnings = []
    const capped = selected.slice(0, MAX_FILES)
    if (selected.length > MAX_FILES) {
      warnings.push(`Podés subir hasta ${MAX_FILES} archivos por tanda, se tomaron los primeros ${MAX_FILES}.`)
    }

    const accepted = []
    for (const file of capped) {
      const isVideo = file.type.startsWith('video/')
      if (isVideo) {
        if (!allowVideos) continue
        if (file.size > MAX_VIDEO_SIZE_MB * 1024 * 1024) {
          warnings.push(`"${file.name}" supera los ${MAX_VIDEO_SIZE_MB}MB permitidos para videos y no se incluyó.`)
          continue
        }
        const duration = await readVideoDuration(file)
        if (duration && duration > MAX_VIDEO_SECONDS) {
          warnings.push(`"${file.name}" dura más de ${MAX_VIDEO_SECONDS}s y no se incluyó.`)
          continue
        }
        accepted.push({ file, type: 'video' })
      } else {
        accepted.push({ file, type: 'image' })
      }
    }

    setWarning(warnings.join(' '))
    setItems(accepted)
    setStatus('idle')
  }

  function removeItem(index) {
    setItems((prev) => prev.filter((_, i) => i !== index))
  }

  function handleGuestNameChange(e) {
    const value = e.target.value.slice(0, 40)
    setGuestName(value)
    try {
      localStorage.setItem('nymoo_guest_name', value)
    } catch {
      // localStorage puede fallar en modo privado; no es crítico
    }
  }

  async function uploadSingleItem(item, signCache) {
    const isVideo = item.type === 'video'

    if (!signCache[item.type]) {
      const { data } = await api.get(`/photos/sign/${eventSlug}`, { params: { type: item.type } })
      signCache[item.type] = data
    }
    const signData = signCache[item.type]

    let uploadFile = item.file
    if (!isVideo) {
      try {
        uploadFile = await imageCompression(item.file, {
          maxSizeMB: MAX_IMAGE_SIZE_MB,
          maxWidthOrHeight: 2000,
          useWebWorker: true,
        })
      } catch {
        // Si la compresión falla con un archivo inusual, subimos el original sin comprimir.
      }
    }

    const cloudinaryForm = new FormData()
    cloudinaryForm.append('file', uploadFile)
    cloudinaryForm.append('api_key', signData.apiKey)
    cloudinaryForm.append('timestamp', signData.timestamp)
    cloudinaryForm.append('signature', signData.signature)
    cloudinaryForm.append('folder', signData.folder)

    const cloudinaryResponse = await fetch(
      `https://api.cloudinary.com/v1_1/${signData.cloudName}/${isVideo ? 'video' : 'image'}/upload`,
      { method: 'POST', body: cloudinaryForm }
    )
    if (!cloudinaryResponse.ok) {
      throw new Error(isVideo ? 'No se pudo subir uno de los videos' : 'No se pudo subir una de las imágenes')
    }
    const cloudinaryData = await cloudinaryResponse.json()

    await api.post('/photos/register', {
      eventId: signData.eventId,
      secure_url: cloudinaryData.secure_url,
      public_id: cloudinaryData.public_id,
      resourceType: signData.resourceType,
      duration: cloudinaryData.duration,
      bytes: cloudinaryData.bytes,
      comment,
      guestName,
    })
  }

  async function handleUpload() {
    if (items.length === 0) return
    setStatus('uploading')
    setErrorMessage('')
    setProgress({ done: 0, total: items.length })

    try {
      const signCache = {}
      for (const item of items) {
        await uploadSingleItem(item, signCache)
        setProgress((prev) => ({ ...prev, done: prev.done + 1 }))
      }

      setStatus('success')
      setItems([])
      setComment('')
    } catch (err) {
      setStatus('error')
      setErrorMessage(err.response?.data?.message || err.message || 'Ocurrió un error al subir los archivos')
    }
  }

  const progressPercent = progress.total > 0 ? Math.round((progress.done / progress.total) * 100) : 0

  return (
    <div className="flex flex-col items-center gap-4 text-white w-full max-w-md mx-auto" style={{ '--accent': primaryColor }}>
      <p className="text-white/40 text-xs uppercase tracking-wide text-center">
        Hasta {MAX_FILES} archivos por tanda{allowVideos ? ' · fotos o videos de hasta 15s' : ''}
      </p>

      {items.length > 0 && (
        <div className="flex gap-2 flex-wrap justify-center max-w-sm">
          {items.map((item, index) => (
            <motion.div
              key={index}
              initial={{ opacity: 0, scale: 0.8 }}
              animate={{ opacity: 1, scale: 1 }}
              className="relative"
            >
              {item.type === 'video' ? (
                <div className="relative w-16 h-16 rounded-xl overflow-hidden border border-white/10 shadow-lg">
                  <video src={URL.createObjectURL(item.file)} className="w-full h-full object-cover" muted />
                  <div className="absolute inset-0 flex items-center justify-center bg-black/30">
                    <Video className="w-5 h-5 text-white drop-shadow" />
                  </div>
                </div>
              ) : (
                <img
                  src={URL.createObjectURL(item.file)}
                  alt=""
                  className="w-16 h-16 object-cover rounded-xl border border-white/10 shadow-lg"
                />
              )}
              <button
                type="button"
                onClick={() => removeItem(index)}
                aria-label="Quitar archivo"
                className="absolute -top-1.5 -right-1.5 w-5 h-5 rounded-full bg-black/80 border border-white/20 flex items-center justify-center text-white/70 hover:text-white hover:bg-red-500/80 transition"
              >
                <X className="w-3 h-3" />
              </button>
            </motion.div>
          ))}
        </div>
      )}

      <input
        ref={fileInputRef}
        type="file"
        accept={allowVideos ? 'image/*,video/*' : 'image/*'}
        multiple
        onChange={handleFileChange}
        className="hidden"
      />

      <Button
        type="button"
        as="button"
        onClick={() => fileInputRef.current?.click()}
        primaryColor={items.length === 0 ? primaryColor : undefined}
        className={items.length > 0 ? 'bg-white/10' : ''}
      >
        <Camera className="w-4 h-4" />
        {items.length > 0
          ? 'Elegir otros archivos'
          : allowVideos
            ? 'Tomar foto o video, o elegir de la galería'
            : 'Tomar foto o elegir de la galería'}
      </Button>
      {warning && <p className="text-yellow-400 text-xs text-center">{warning}</p>}

      <input
        type="text"
        value={guestName}
        onChange={handleGuestNameChange}
        placeholder="Tu nombre (opcional)"
        maxLength={40}
        className="w-full max-w-sm rounded-xl bg-white/5 border border-white/10 px-3 py-2 text-sm outline-none transition-colors focus:border-[var(--accent)] focus:ring-2 focus:ring-[var(--accent)]/30"
      />

      <textarea
        value={comment}
        onChange={(e) => setComment(e.target.value.slice(0, 60))}
        placeholder="Dedicatoria (opcional, máx. 60 caracteres)"
        maxLength={60}
        rows={2}
        className="w-full max-w-sm rounded-xl bg-white/5 border border-white/10 px-3 py-2 text-sm outline-none transition-colors focus:border-[var(--accent)] focus:ring-2 focus:ring-[var(--accent)]/30"
      />
      <p className="text-white/30 text-xs self-end max-w-sm w-full text-right">{comment.length}/60</p>

      <Button
        type="button"
        onClick={handleUpload}
        disabled={items.length === 0 || status === 'uploading'}
        primaryColor={primaryColor}
        className="disabled:opacity-40 disabled:cursor-not-allowed w-full max-w-sm"
      >
        {status === 'uploading'
          ? `Subiendo ${progress.done}/${progress.total}...`
          : `Subir ${items.length > 0 ? items.length : ''} archivo${items.length === 1 ? '' : 's'}`}
      </Button>

      {status === 'uploading' && (
        <div className="w-full max-w-sm h-1.5 rounded-full bg-white/10 overflow-hidden">
          <motion.div
            className="h-full rounded-full"
            style={{ background: primaryColor }}
            animate={{ width: `${progressPercent}%` }}
            transition={{ duration: 0.3 }}
          />
        </div>
      )}

      <AnimatePresence mode="wait">
        {status === 'success' && (
          <motion.p
            key="success"
            initial={{ opacity: 0, y: 6 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0 }}
            className="flex items-center gap-2 text-green-400 text-sm"
          >
            <CheckCircle2 className="w-4 h-4 shrink-0" />
            ¡Listo! Mirá la pantalla del salón.
          </motion.p>
        )}
        {status === 'error' && (
          <motion.p
            key="error"
            initial={{ opacity: 0, y: 6 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0 }}
            className="flex items-center gap-2 text-red-400 text-sm text-center"
          >
            <XCircle className="w-4 h-4 shrink-0" />
            {errorMessage}
          </motion.p>
        )}
      </AnimatePresence>
    </div>
  )
}

export default UploadPhotosForm

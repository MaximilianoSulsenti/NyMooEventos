import { useEffect, useState } from 'react'
import { useParams } from 'react-router-dom'
import { AnimatePresence, motion } from 'motion/react'
import { X, Images } from 'lucide-react'
import api from '../services/api'
import socket from '../services/socket'
import useLockBodyScroll from '../hooks/useLockBodyScroll'
import { getThemeStyles } from '../sections/theming'
import { BRAND } from '../utils/brand'
import { cloudinaryThumb, cloudinaryLarge } from '../utils/cloudinary'

// Cada tanto una foto ocupa 2 columnas -- simple truco de "bento" sin
// necesidad de librerías de masonry ni medir alturas reales.
function isFeatured(index) {
  return index % 7 === 0
}

function PhotoTile({ photo, index, onOpen }) {
  return (
    <motion.div
      layout
      initial={{ opacity: 0, scale: 0.92 }}
      animate={{ opacity: 1, scale: 1 }}
      transition={{ duration: 0.35 }}
      onClick={() => onOpen(photo)}
      onContextMenu={(e) => e.preventDefault()}
      className={`relative rounded-2xl overflow-hidden border border-white/10 bg-white/5 cursor-pointer group ${
        isFeatured(index) ? 'col-span-2 row-span-2 aspect-square' : 'aspect-square'
      }`}
    >
      {photo.assetType === 'video' ? (
        <video
          src={cloudinaryThumb(photo.cloudinaryUrl, 500)}
          autoPlay
          muted
          loop
          playsInline
          className="w-full h-full object-cover pointer-events-none select-none transition-transform duration-500 group-hover:scale-105"
        />
      ) : (
        <img
          src={cloudinaryThumb(photo.cloudinaryUrl, 500)}
          alt=""
          draggable={false}
          loading="lazy"
          className="w-full h-full object-cover pointer-events-none select-none transition-transform duration-500 group-hover:scale-105"
        />
      )}
      <div className="absolute inset-0 bg-gradient-to-t from-black/40 via-transparent to-transparent opacity-0 group-hover:opacity-100 transition-opacity pointer-events-none" />
    </motion.div>
  )
}

function PhotoModal({ photo, onClose }) {
  useLockBodyScroll()

  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      onClick={onClose}
      onContextMenu={(e) => e.preventDefault()}
      className="fixed inset-0 z-50 bg-black/85 backdrop-blur-sm flex items-center justify-center p-4 sm:p-10"
    >
      <button
        type="button"
        onClick={onClose}
        aria-label="Cerrar"
        className="absolute top-4 right-4 sm:top-6 sm:right-6 w-10 h-10 rounded-full bg-white/10 border border-white/15 flex items-center justify-center text-white hover:bg-white/20 transition"
      >
        <X className="w-5 h-5" />
      </button>

      <motion.div
        initial={{ scale: 0.9 }}
        animate={{ scale: 1 }}
        onClick={(e) => e.stopPropagation()}
        className="max-w-full max-h-full"
      >
        {photo.assetType === 'video' ? (
          <video
            src={cloudinaryLarge(photo.cloudinaryUrl)}
            controls
            autoPlay
            loop
            playsInline
            className="max-w-[90vw] max-h-[85vh] rounded-xl shadow-2xl pointer-events-auto select-none"
            controlsList="nodownload"
            onContextMenu={(e) => e.preventDefault()}
          />
        ) : (
          <img
            src={cloudinaryLarge(photo.cloudinaryUrl)}
            alt=""
            draggable={false}
            className="max-w-[90vw] max-h-[85vh] rounded-xl shadow-2xl pointer-events-none select-none"
          />
        )}
      </motion.div>
    </motion.div>
  )
}

function PublicAlbum() {
  const { eventSlug } = useParams()
  const [event, setEvent] = useState(null)
  const [photos, setPhotos] = useState([])
  const [loadState, setLoadState] = useState('loading') // loading | ready | not-found | disabled
  const [activePhoto, setActivePhoto] = useState(null)

  useEffect(() => {
    let isMounted = true

    Promise.all([api.get(`/events/slug/${eventSlug}`), api.get(`/photos/slug/${eventSlug}`)])
      .then(([eventRes, photosRes]) => {
        if (!isMounted) return
        if (!eventRes.data.activeModules?.liveGallery) {
          setLoadState('disabled')
          return
        }
        setEvent(eventRes.data)
        setPhotos(photosRes.data)
        setLoadState('ready')
      })
      .catch((err) => {
        if (!isMounted) return
        setLoadState(err.response?.status === 404 ? 'not-found' : 'disabled')
      })

    return () => {
      isMounted = false
    }
  }, [eventSlug])

  useEffect(() => {
    if (loadState !== 'ready') return undefined

    socket.connect()
    socket.emit('join-event', eventSlug)

    function handleNewPhoto(photo) {
      setPhotos((prev) => [photo, ...prev])
    }
    function handlePhotoDeleted({ photoId }) {
      setPhotos((prev) => prev.filter((p) => p._id !== photoId))
    }

    socket.on('new-photo', handleNewPhoto)
    socket.on('photo-deleted', handlePhotoDeleted)

    return () => {
      socket.off('new-photo', handleNewPhoto)
      socket.off('photo-deleted', handlePhotoDeleted)
      socket.disconnect()
    }
  }, [loadState, eventSlug])

  if (loadState === 'loading') {
    return (
      <div className="min-h-screen flex items-center justify-center text-white/40" style={{ background: BRAND.night }}>
        Cargando álbum...
      </div>
    )
  }

  if (loadState === 'not-found' || loadState === 'disabled') {
    return (
      <div className="min-h-screen flex items-center justify-center text-white/40 text-center px-6" style={{ background: BRAND.night }}>
        Este álbum no está disponible.
      </div>
    )
  }

  const styles = getThemeStyles(event?.appearance?.theme, event?.appearance?.fontFamily)
  const primaryColor = event?.appearance?.primaryColor || BRAND.blue

  return (
    <div className={`relative min-h-screen w-full overflow-x-hidden text-white ${styles.fontClass}`} style={{ background: BRAND.night }}>
      <div
        className="absolute top-0 inset-x-0 h-64 opacity-20 pointer-events-none"
        style={{ background: `radial-gradient(ellipse at top, ${primaryColor}, transparent 70%)` }}
      />

      <header className="relative text-center px-6 pt-14 pb-10">
        <span
          className="inline-flex items-center gap-2 px-3 py-1 rounded-full text-xs uppercase tracking-[0.2em] mb-4"
          style={{ background: `${primaryColor}22`, color: primaryColor, border: `1px solid ${primaryColor}40` }}
        >
          <Images className="w-3.5 h-3.5" />
          Álbum en vivo
        </span>
        <h1 className="text-2xl sm:text-4xl font-extrabold tracking-tight">{event.eventName}</h1>
        <p className="text-white/50 text-sm mt-2">
          {photos.length} {photos.length === 1 ? 'momento compartido' : 'momentos compartidos'}
        </p>
      </header>

      <main className="relative max-w-5xl mx-auto px-4 sm:px-6 pb-16">
        {photos.length === 0 ? (
          <p className="text-center text-white/40 py-20">Todavía no hay fotos para mostrar.</p>
        ) : (
          <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-3">
            {photos.map((photo, index) => (
              <PhotoTile key={photo._id} photo={photo} index={index} onOpen={setActivePhoto} />
            ))}
          </div>
        )}
      </main>

      <AnimatePresence>
        {activePhoto && <PhotoModal photo={activePhoto} onClose={() => setActivePhoto(null)} />}
      </AnimatePresence>
    </div>
  )
}

export default PublicAlbum

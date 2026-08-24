import { useEffect, useRef, useState } from 'react'
import { useParams } from 'react-router-dom'
import { AnimatePresence, motion } from 'motion/react'
import { Video } from 'lucide-react'
import { QRCodeCanvas } from 'qrcode.react'
import api from '../services/api'
import socket from '../services/socket'
import BrandLogos from '../components/BrandLogos'
import TypewriterText from '../components/TypewriterText'
import Confetti from '../components/Confetti'
import LightBeams from '../components/LightBeams'
import EmojiRain from '../components/EmojiRain'
import ThreeDPhotoCarousel from '../components/ui/ThreeDPhotoCarousel'
import { cloudinaryThumb, cloudinaryLarge } from '../utils/cloudinary'
import { identityColor } from '../utils/identityColor'

const ANNOUNCEMENT_POSITION_CLASSES = {
  top: 'top-8',
  center: 'top-1/2 -translate-y-1/2',
  bottom: 'bottom-8',
}

const MAX_CHAT_ITEMS = 4
const CHAT_BUBBLE_TEXT_LIMIT = 90

// El comentario puede tener hasta 150 caracteres (para que el libro de
// mensajes y la moderación tengan el mensaje completo), pero el globito de
// chat en pantalla es chico -- se recorta ahí nomás, sin tocar el dato real.
function truncateForBubble(text) {
  if (text.length <= CHAT_BUBBLE_TEXT_LIMIT) return text
  return `${text.slice(0, CHAT_BUBBLE_TEXT_LIMIT).trimEnd()}…`
}

// Cada invitado que pone su nombre recibe un color de identidad estable (el
// mismo nombre siempre da el mismo color), para poder reconocerlo de un
// comentario a otro sin necesidad de leer el nombre cada vez.
function PhotoCard({ photo, animationClass, fit }) {
  const mediaClassName = `rounded-lg ${fit === 'contain' ? 'object-contain' : 'w-full h-full object-cover'}`
  const mediaStyle =
    fit === 'contain' ? { maxWidth: '92vw', maxHeight: '85vh', width: 'auto', height: 'auto' } : undefined

  return (
    <div className={`relative inline-block ${animationClass}`} style={{ maxWidth: '92vw', maxHeight: '85vh' }}>
      {photo.assetType === 'video' ? (
        <video
          src={cloudinaryLarge(photo.cloudinaryUrl)}
          autoPlay
          muted
          loop
          playsInline
          className={mediaClassName}
          style={mediaStyle}
        />
      ) : (
        <img src={cloudinaryLarge(photo.cloudinaryUrl)} alt="" className={mediaClassName} style={mediaStyle} />
      )}
    </div>
  )
}

// Feed tipo "chat en vivo" al costado de la foto: los últimos comentarios
// quedan apilados (el más nuevo abajo, con su colita apuntando a la foto,
// efecto de tipeo y un anillo "en vivo" pulsando en su avatar), y los
// anteriores se van desvaneciendo y achicando hacia arriba, como un chat de
// stream, hasta salir de la lista. Quien pone su nombre recibe un color de
// identidad propio (nombre + burbuja + avatar a juego); los anónimos quedan
// en un estilo neutro, más discreto.
function LiveCommentFeed({ items }) {
  if (items.length === 0) return null

  return (
    <div className="fixed right-3 sm:right-10 top-1/2 -translate-y-1/2 z-20 flex flex-col gap-3 sm:gap-3.5 items-end max-w-[80vw] sm:max-w-xs">
      <AnimatePresence initial={false}>
        {items.map((item, index) => {
          const fromNewest = items.length - 1 - index
          const isNewest = fromNewest === 0
          const color = item.guestName ? identityColor(item.guestName) : null
          const borderColor = color ? `${color}80` : 'rgba(255,255,255,0.15)'

          return (
            <motion.div
              key={item.id}
              layout
              initial={{ opacity: 0, scale: 0.3, x: 40, rotate: -8 }}
              animate={{
                opacity: Math.max(0.32, 1 - fromNewest * 0.26),
                scale: Math.max(0.78, 1 - fromNewest * 0.09),
                x: 0,
                rotate: 0,
              }}
              exit={{ opacity: 0, scale: 0.4, x: 30, transition: { duration: 0.2 } }}
              transition={{ type: 'spring', stiffness: 260, damping: 20 }}
              className="flex items-end justify-end gap-2.5 origin-bottom-right"
            >
              <div
                className="relative rounded-2xl rounded-br-md backdrop-blur-md px-3.5 py-2.5 sm:px-4 sm:py-3 shadow-2xl max-w-[210px] sm:max-w-[260px]"
                style={{
                  background: color ? `linear-gradient(135deg, ${color}26, rgba(0,0,0,0.62))` : 'rgba(0,0,0,0.55)',
                  border: `1px solid ${borderColor}`,
                  boxShadow: isNewest && color ? `0 10px 28px -10px ${color}90` : undefined,
                }}
              >
                {item.guestName && (
                  <p className="text-[11px] sm:text-xs font-bold mb-0.5 truncate" style={{ color }}>
                    {item.guestName}
                  </p>
                )}
                {isNewest ? (
                  <TypewriterText
                    text={item.text}
                    className="text-white text-sm sm:text-base font-medium drop-shadow-lg break-words"
                  />
                ) : (
                  <p className="text-white text-sm sm:text-base font-medium drop-shadow-lg break-words">{item.text}</p>
                )}
                <div
                  className="absolute -bottom-1.5 right-6 w-3 h-3 rotate-45"
                  style={{
                    background: color ? color : 'rgba(0,0,0,0.55)',
                    opacity: color ? 0.5 : 1,
                    borderRight: `1px solid ${borderColor}`,
                    borderBottom: `1px solid ${borderColor}`,
                  }}
                />
              </div>

              <div className="relative shrink-0">
                {isNewest && color && (
                  <motion.span
                    className="absolute inset-0 rounded-full"
                    style={{ boxShadow: `0 0 0 2px ${color}` }}
                    animate={{ opacity: [0.7, 0, 0.7], scale: [1, 1.45, 1] }}
                    transition={{ duration: 2, repeat: Infinity, ease: 'easeOut' }}
                  />
                )}
                {item.thumbUrl ? (
                  <img
                    src={cloudinaryThumb(item.thumbUrl, 80)}
                    alt=""
                    className="w-8 h-8 sm:w-10 sm:h-10 rounded-full object-cover shadow-lg"
                    style={{ border: `2px solid ${color || 'rgba(255,255,255,0.25)'}` }}
                  />
                ) : (
                  <span
                    className="w-8 h-8 sm:w-10 sm:h-10 rounded-full flex items-center justify-center bg-white/15 shadow-lg"
                    style={{ border: `2px solid ${color || 'rgba(255,255,255,0.25)'}` }}
                  >
                    <Video className="w-4 h-4 text-white" />
                  </span>
                )}
              </div>
            </motion.div>
          )
        })}
      </AnimatePresence>
    </div>
  )
}

function AnnouncementBanner({ announcement }) {
  if (!announcement?.text) return null

  return (
    <div
      className={`fixed inset-x-0 z-40 flex justify-center px-6 pointer-events-none ${ANNOUNCEMENT_POSITION_CLASSES[announcement.position] || ANNOUNCEMENT_POSITION_CLASSES.bottom}`}
    >
      <motion.div
        initial={{ opacity: 0, y: 10 }}
        animate={{ opacity: 1, y: 0 }}
        className="max-w-[90vw] sm:max-w-3xl rounded-2xl backdrop-blur-md bg-black/50 border border-white/10 px-4 sm:px-8 py-3 sm:py-4 shadow-2xl"
      >
        <p className={`text-white font-semibold text-center drop-shadow-lg break-words ${announcement.fontSize || 'text-xl'}`}>
          {announcement.text}
        </p>
      </motion.div>
    </div>
  )
}

// Fondo de marca a pantalla completa para la pantalla del salón -- distinto
// de BrandLogos (watermarks chicos en una esquina), esto ambienta toda la
// proyección detrás de las fotos.
//
// Para que esto realmente quede DETRÁS del bg-black del contenedor raíz,
// ese contenedor necesita "relative z-0" (que forma su propio stacking
// context). Sin eso, el bg-black del div raíz -- al no estar posicionado --
// pinta en la misma capa que este `-z-10` compite por ganar, y termina
// tapando la imagen por completo sin importar la opacidad configurada.
function SalonBackground({ branding }) {
  if (!branding?.salonBgImageUrl) return null
  return (
    <div
      className="fixed inset-0 -z-10 bg-cover bg-center"
      style={{
        backgroundImage: `url(${branding.salonBgImageUrl})`,
        opacity: (branding.salonBgOpacity ?? 40) / 100,
      }}
    />
  )
}

// Panel de QR fijo para que los invitados escaneen y suban fotos desde la
// pista de baile en cualquier momento -- arriba a la derecha, lejos del
// feed de comentarios (centro derecha) y de donde por defecto caen las
// marcas de agua (abajo derecha).
function LiveQrPanel({ eventSlug, eventName }) {
  const uploadUrl = `${window.location.origin}/evento/${encodeURIComponent(eventSlug)}/upload`
  return (
    <div className="fixed top-4 right-4 sm:top-6 sm:right-6 z-30 flex flex-col items-center gap-2 backdrop-blur-md bg-black/30 border border-white/10 rounded-2xl p-3 sm:p-4 shadow-2xl">
      <div className="bg-white p-2 rounded-xl">
        <QRCodeCanvas value={uploadUrl} size={92} level="M" />
      </div>
      <p className="text-white/70 text-[10px] sm:text-[11px] font-light italic tracking-wide text-center max-w-[100px] leading-tight">
        {eventName}
      </p>
    </div>
  )
}

const DEFAULT_PARTY_CONFIG = { enabled: false, layout: 'grid', confetti: false, lightBeams: false, emojiRain: false }

// Con muchas fotos (maxLivePhotos admite hasta 300) el cilindro 3D se vuelve
// lento e ilegible: caras minúsculas y demasiadas para animar a la vez.
// Este modo se ve mejor -- y rinde mejor -- con un puñado de fotos recientes.
const CAROUSEL_3D_MAX_PHOTOS = 16

function LiveScreen() {
  const { eventSlug } = useParams()
  const [event, setEvent] = useState(null)
  const [photos, setPhotos] = useState([])
  const [party, setParty] = useState(DEFAULT_PARTY_CONFIG)
  const [cursor, setCursor] = useState(0)
  const [speedSeconds, setSpeedSeconds] = useState(null)
  const [isPaused, setIsPaused] = useState(false)
  const [announcement, setAnnouncement] = useState(null)
  const [commentFeed, setCommentFeed] = useState([])
  const maxLivePhotosRef = useRef(60)
  // El handler de sockets se registra una sola vez (deps: [eventSlug]) y
  // por eso su closure queda "congelada" con el `party` de ese momento; sin
  // este ref, el chequeo de "¿estamos en carousel3d?" de más abajo nunca
  // vería un cambio de modo posterior y los comentarios dejarían de sumarse.
  const partyRef = useRef(party)

  useEffect(() => {
    api
      .get(`/events/slug/${eventSlug}`)
      .then(({ data }) => {
        const gallerySettings = data.gallerySettings || {}
        maxLivePhotosRef.current = gallerySettings.maxLivePhotos || 60
        setEvent(data)
        setSpeedSeconds(gallerySettings.playbackSpeed ?? null)
        setParty({
          enabled: Boolean(gallerySettings.partyMode),
          layout: gallerySettings.partyLayout || 'grid',
          confetti: Boolean(gallerySettings.confetti),
          lightBeams: Boolean(gallerySettings.lightBeams),
          emojiRain: Boolean(gallerySettings.emojiRain),
        })
        setIsPaused(Boolean(gallerySettings.isPaused))
      })
      .catch(() => {})
    api
      .get(`/photos/slug/${eventSlug}`)
      .then(({ data }) => setPhotos(data))
      .catch(() => {})
  }, [eventSlug])

  useEffect(() => {
    partyRef.current = party
  }, [party])

  useEffect(() => {
    socket.connect()
    socket.emit('join-event', eventSlug)

    function handleNewPhoto(photo) {
      setPhotos((prev) => [photo, ...prev].slice(0, maxLivePhotosRef.current))

      // En modo grilla cada foto ya muestra su comentario abajo, y en modo
      // foto única el feed se arma solo cuando esa foto pasa a estar en
      // pantalla (más abajo). El carrusel 3D no tiene un "cursor" de foto
      // actual -- todas giran a la vez -- así que acá es donde se entera de
      // que hay un comentario nuevo para mostrar en el feed lateral.
      if (photo.comment && partyRef.current.enabled && partyRef.current.layout === 'carousel3d') {
        setCommentFeed((prev) => {
          const entry = {
            id: photo._id,
            text: truncateForBubble(photo.comment),
            guestName: photo.guestName || '',
            thumbUrl: photo.assetType === 'video' ? null : photo.cloudinaryUrl,
          }
          return [...prev, entry].slice(-MAX_CHAT_ITEMS)
        })
      }
    }
    function handlePartyConfig(config) {
      setParty(config)
      setCursor(0)
      setCommentFeed([])
    }
    function handleSpeedChanged(seconds) {
      setSpeedSeconds(seconds)
    }
    function handlePauseChanged(paused) {
      setIsPaused(paused)
    }
    function handleAnnouncementChanged(data) {
      setAnnouncement(data.text ? data : null)
    }
    function handlePhotoDeleted({ photoId }) {
      setPhotos((prev) => prev.filter((p) => p._id !== photoId))
    }

    socket.on('new-photo', handleNewPhoto)
    socket.on('party-config-changed', handlePartyConfig)
    socket.on('speed-changed', handleSpeedChanged)
    socket.on('pause-changed', handlePauseChanged)
    socket.on('announcement-changed', handleAnnouncementChanged)
    socket.on('photo-deleted', handlePhotoDeleted)

    return () => {
      socket.off('new-photo', handleNewPhoto)
      socket.off('party-config-changed', handlePartyConfig)
      socket.off('speed-changed', handleSpeedChanged)
      socket.off('pause-changed', handlePauseChanged)
      socket.off('announcement-changed', handleAnnouncementChanged)
      socket.off('photo-deleted', handlePhotoDeleted)
      socket.disconnect()
    }
  }, [eventSlug])

  const isGrid = party.enabled && party.layout === 'grid'
  const isCarousel3D = party.enabled && party.layout === 'carousel3d'
  const visibleCount = isGrid ? 6 : 1
  const intervalMs = (speedSeconds ?? (party.enabled ? 3 : 7)) * 1000
  const animationClass = party.enabled ? 'photo-enter-party' : 'photo-enter-elegant'

  useEffect(() => {
    // El carrusel 3D gira solo (rotación propia en ThreeDPhotoCarousel) --
    // no necesita este cursor de "foto actual" que usan grilla y foto única.
    if (photos.length === 0 || isPaused || isCarousel3D) return undefined
    const interval = setInterval(() => {
      setCursor((prev) => prev + visibleCount)
    }, intervalMs)
    return () => clearInterval(interval)
  }, [photos.length, visibleCount, intervalMs, isPaused, isCarousel3D])

  // Modo elegante (foto única): cada vez que cambia la foto en pantalla, si
  // tiene comentario se agrega al feed tipo chat. En modo grilla y carrusel
  // 3D no se usa (no hay un cursor de "foto actual" que avance solo).
  const currentSinglePhoto = !isGrid && !isCarousel3D && photos.length > 0 ? photos[cursor % photos.length] : null
  const currentSingleKey = currentSinglePhoto ? `${currentSinglePhoto._id}-${cursor}` : null

  useEffect(() => {
    if (!currentSinglePhoto?.comment) return
    setCommentFeed((prev) => {
      if (prev.length > 0 && prev[prev.length - 1].id === currentSingleKey) return prev
      const entry = {
        id: currentSingleKey,
        text: truncateForBubble(currentSinglePhoto.comment),
        guestName: currentSinglePhoto.guestName || '',
        thumbUrl: currentSinglePhoto.assetType === 'video' ? null : currentSinglePhoto.cloudinaryUrl,
      }
      return [...prev, entry].slice(-MAX_CHAT_ITEMS)
    })
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [currentSingleKey])

  if (photos.length === 0) {
    return (
      <div className="relative z-0 min-h-screen bg-black flex items-center justify-center text-neutral-600">
        Esperando las primeras fotos...
        {event && <SalonBackground branding={event.brandingSettings} />}
        {event && <BrandLogos branding={event.brandingSettings} />}
        {event?.activeModules?.photoCollection && <LiveQrPanel eventSlug={eventSlug} eventName={event.eventName} />}
      </div>
    )
  }

  const visiblePhotos = Array.from({ length: Math.min(visibleCount, photos.length) }, (_, i) => {
    const index = (cursor + i) % photos.length
    return photos[index]
  })

  return (
    <div
      className={`relative z-0 min-h-screen w-full bg-black p-4 sm:p-6 flex items-center justify-center overflow-hidden ${party.enabled ? 'party-glow' : ''}`}
    >
      {party.enabled && party.lightBeams && <LightBeams />}
      {party.enabled && party.confetti && <Confetti />}
      {party.enabled && party.emojiRain && <EmojiRain />}
      {event && <SalonBackground branding={event.brandingSettings} />}
      {event && <BrandLogos branding={event.brandingSettings} />}
      {event?.activeModules?.photoCollection && <LiveQrPanel eventSlug={eventSlug} eventName={event.eventName} />}
      <AnimatePresence>{announcement && <AnnouncementBanner announcement={announcement} />}</AnimatePresence>
      {!isGrid && <LiveCommentFeed items={commentFeed} />}

      {isGrid ? (
        <div
          className="grid grid-cols-2 md:grid-cols-3 gap-4 w-full"
          style={{ maxWidth: '92vw', maxHeight: '85vh', aspectRatio: '16 / 9' }}
        >
          {visiblePhotos.map((photo, i) => (
            <div key={`${photo._id}-${cursor}-${i}`} className={`relative w-full h-full overflow-hidden rounded-lg ${animationClass}`}>
              {photo.assetType === 'video' ? (
                <video
                  src={cloudinaryThumb(photo.cloudinaryUrl, 800)}
                  autoPlay
                  muted
                  loop
                  playsInline
                  className="w-full h-full object-cover"
                />
              ) : (
                <img src={cloudinaryThumb(photo.cloudinaryUrl, 800)} alt="" className="w-full h-full object-cover" />
              )}
              {photo.comment && (
                <div className="absolute inset-x-0 bottom-2 flex justify-center px-2">
                  {(() => {
                    const gridColor = photo.guestName ? identityColor(photo.guestName) : null
                    return (
                      <div
                        className="max-w-[95%] rounded-xl backdrop-blur-md px-3 py-1.5 shadow-xl"
                        style={{
                          background: gridColor
                            ? `linear-gradient(135deg, ${gridColor}26, rgba(0,0,0,0.6))`
                            : 'rgba(0,0,0,0.4)',
                          border: `1px solid ${gridColor ? `${gridColor}80` : 'rgba(255,255,255,0.1)'}`,
                        }}
                      >
                        {photo.guestName && (
                          <p className="text-[10px] font-bold text-center truncate" style={{ color: gridColor }}>
                            {photo.guestName}
                          </p>
                        )}
                        <p className="text-white text-sm font-medium text-center drop-shadow-lg truncate">{photo.comment}</p>
                      </div>
                    )
                  })()}
                </div>
              )}
            </div>
          ))}
        </div>
      ) : isCarousel3D ? (
        <div className="w-full max-w-5xl">
          <ThreeDPhotoCarousel
            images={photos
              .filter((p) => p.assetType !== 'video')
              .slice(0, CAROUSEL_3D_MAX_PHOTOS)
              .map((p) => cloudinaryThumb(p.cloudinaryUrl, 700))}
          />
        </div>
      ) : (
        <PhotoCard key={`${visiblePhotos[0]._id}-${cursor}`} photo={visiblePhotos[0]} animationClass={animationClass} fit="contain" />
      )}
    </div>
  )
}

export default LiveScreen

import { useEffect, useState } from 'react'
import { useParams } from 'react-router-dom'
import { AnimatePresence, motion } from 'motion/react'
import api from '../services/api'
import socket from '../services/socket'
import BrandLogos from '../components/BrandLogos'
import TypewriterText from '../components/TypewriterText'
import Confetti from '../components/Confetti'
import LightBeams from '../components/LightBeams'
import EmojiRain from '../components/EmojiRain'
import { cloudinaryThumb, cloudinaryLarge } from '../utils/cloudinary'

const ANNOUNCEMENT_POSITION_CLASSES = {
  top: 'top-8',
  center: 'top-1/2 -translate-y-1/2',
  bottom: 'bottom-8',
}

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
      {photo.comment && (
        <div className="absolute inset-x-0 bottom-4 flex justify-center px-4">
          <div className="max-w-[90%] rounded-2xl backdrop-blur-md bg-black/40 border border-white/10 px-5 py-2.5 shadow-2xl">
            <TypewriterText
              text={photo.comment}
              className="text-white text-base md:text-xl font-medium text-center drop-shadow-lg break-words"
            />
          </div>
        </div>
      )}
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

const DEFAULT_PARTY_CONFIG = { enabled: false, layout: 'grid', confetti: false, lightBeams: false, emojiRain: false }

function LiveScreen() {
  const { eventSlug } = useParams()
  const [event, setEvent] = useState(null)
  const [photos, setPhotos] = useState([])
  const [party, setParty] = useState(DEFAULT_PARTY_CONFIG)
  const [cursor, setCursor] = useState(0)
  const [speedSeconds, setSpeedSeconds] = useState(null)
  const [isPaused, setIsPaused] = useState(false)
  const [announcement, setAnnouncement] = useState(null)

  useEffect(() => {
    api
      .get(`/events/slug/${eventSlug}`)
      .then(({ data }) => {
        const gallerySettings = data.gallerySettings || {}
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
    socket.connect()
    socket.emit('join-event', eventSlug)

    function handleNewPhoto(photo) {
      setPhotos((prev) => [photo, ...prev])
    }
    function handlePartyConfig(config) {
      setParty(config)
      setCursor(0)
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
  const visibleCount = isGrid ? 6 : 1
  const intervalMs = (speedSeconds ?? (party.enabled ? 3 : 7)) * 1000
  const animationClass = party.enabled ? 'photo-enter-party' : 'photo-enter-elegant'

  useEffect(() => {
    if (photos.length === 0 || isPaused) return undefined
    const interval = setInterval(() => {
      setCursor((prev) => prev + visibleCount)
    }, intervalMs)
    return () => clearInterval(interval)
  }, [photos.length, visibleCount, intervalMs, isPaused])

  if (photos.length === 0) {
    return (
      <div className="min-h-screen bg-black flex items-center justify-center text-neutral-600">
        Esperando las primeras fotos...
        {event && <BrandLogos branding={event.brandingSettings} />}
      </div>
    )
  }

  const visiblePhotos = Array.from({ length: Math.min(visibleCount, photos.length) }, (_, i) => {
    const index = (cursor + i) % photos.length
    return photos[index]
  })

  return (
    <div className={`min-h-screen w-full bg-black p-4 sm:p-6 flex items-center justify-center overflow-hidden ${party.enabled ? 'party-glow' : ''}`}>
      {party.enabled && party.lightBeams && <LightBeams />}
      {party.enabled && party.confetti && <Confetti />}
      {party.enabled && party.emojiRain && <EmojiRain />}
      {event && <BrandLogos branding={event.brandingSettings} />}
      <AnimatePresence>{announcement && <AnnouncementBanner announcement={announcement} />}</AnimatePresence>

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
                  <div className="max-w-[95%] rounded-xl backdrop-blur-md bg-black/40 border border-white/10 px-3 py-1.5 shadow-xl">
                    <p className="text-white text-sm font-medium text-center drop-shadow-lg truncate">{photo.comment}</p>
                  </div>
                </div>
              )}
            </div>
          ))}
        </div>
      ) : (
        <PhotoCard key={`${visiblePhotos[0]._id}-${cursor}`} photo={visiblePhotos[0]} animationClass={animationClass} fit="contain" />
      )}
    </div>
  )
}

export default LiveScreen

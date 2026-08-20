import { useEffect, useState } from 'react'
import { useParams } from 'react-router-dom'
import api from '../services/api'
import socket from '../services/socket'

function PhotoCard({ photo, animationClass }) {
  return (
    <div className={`relative w-full h-full overflow-hidden rounded-lg ${animationClass}`}>
      <img src={photo.cloudinaryUrl} alt="" className="w-full h-full object-cover" />
      {photo.comment && (
        <div className="absolute inset-x-0 bottom-0 bg-gradient-to-t from-black/80 to-transparent px-4 py-3">
          <p className="text-white text-sm">{photo.comment}</p>
        </div>
      )}
    </div>
  )
}

function LiveScreen() {
  const { eventSlug } = useParams()
  const [photos, setPhotos] = useState([])
  const [partyMode, setPartyMode] = useState(false)
  const [cursor, setCursor] = useState(0)

  useEffect(() => {
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
    function handlePartyMode(enabled) {
      setPartyMode(enabled)
      setCursor(0)
    }

    socket.on('new-photo', handleNewPhoto)
    socket.on('party-mode', handlePartyMode)

    return () => {
      socket.off('new-photo', handleNewPhoto)
      socket.off('party-mode', handlePartyMode)
      socket.disconnect()
    }
  }, [eventSlug])

  const visibleCount = partyMode ? 6 : 1
  const intervalMs = partyMode ? 3000 : 7000

  useEffect(() => {
    if (photos.length === 0) return undefined
    const interval = setInterval(() => {
      setCursor((prev) => prev + visibleCount)
    }, intervalMs)
    return () => clearInterval(interval)
  }, [photos.length, visibleCount, intervalMs])

  if (photos.length === 0) {
    return (
      <div className="min-h-screen bg-black flex items-center justify-center text-neutral-600">
        Esperando las primeras fotos...
      </div>
    )
  }

  const visiblePhotos = Array.from({ length: Math.min(visibleCount, photos.length) }, (_, i) => {
    const index = (cursor + i) % photos.length
    return photos[index]
  })

  return (
    <div className={`min-h-screen bg-black p-6 flex items-center justify-center ${partyMode ? 'party-glow' : ''}`}>
      {partyMode ? (
        <div className="grid grid-cols-2 md:grid-cols-3 gap-4 w-full max-w-5xl aspect-video">
          {visiblePhotos.map((photo, i) => (
            <PhotoCard key={`${photo._id}-${cursor}-${i}`} photo={photo} animationClass="photo-enter-party" />
          ))}
        </div>
      ) : (
        <div className="w-full max-w-2xl aspect-[4/5]">
          <PhotoCard key={`${visiblePhotos[0]._id}-${cursor}`} photo={visiblePhotos[0]} animationClass="photo-enter-elegant" />
        </div>
      )}
    </div>
  )
}

export default LiveScreen

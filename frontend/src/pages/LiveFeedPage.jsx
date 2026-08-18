import { useEffect, useState } from 'react'
import { useParams } from 'react-router-dom'
import socket from '../services/socket'

function LiveFeedPage() {
  const { eventSlug } = useParams()
  const [photos, setPhotos] = useState([])

  useEffect(() => {
    socket.connect()
    socket.emit('join-event', eventSlug)

    function handleNewPhoto(photo) {
      setPhotos((prev) => [photo, ...prev])
    }

    socket.on('new-photo', handleNewPhoto)

    return () => {
      socket.off('new-photo', handleNewPhoto)
      socket.disconnect()
    }
  }, [eventSlug])

  return (
    <div className="min-h-screen bg-black p-6">
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        {photos.map((photo) => (
          <img
            key={photo._id}
            src={photo.cloudinaryUrl}
            alt=""
            className="w-full aspect-square object-cover rounded-lg photo-enter"
          />
        ))}
      </div>
    </div>
  )
}

export default LiveFeedPage

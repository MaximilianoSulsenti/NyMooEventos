import { useEffect, useState } from 'react'
import { useParams, useSearchParams } from 'react-router-dom'
import { Printer, Heart } from 'lucide-react'
import api from '../services/api'
import { cloudinaryThumb } from '../utils/cloudinary'

// Vista de solo lectura, pensada para imprimir/"Guardar como PDF" desde el
// navegador -- por eso el fondo es claro (papel, no la UI oscura del resto
// del sitio) y todo lo que no es contenido lleva la clase "no-print".
function MessageCard({ photo, primaryColor }) {
  return (
    <div
      className="flex gap-4 items-start rounded-2xl border p-4 break-inside-avoid"
      style={{ borderColor: '#e7e1d6', background: '#fffdfa' }}
    >
      {photo.assetType === 'image' ? (
        <img
          src={cloudinaryThumb(photo.cloudinaryUrl, 200)}
          alt=""
          className="w-20 h-20 rounded-xl object-cover shrink-0"
          style={{ border: `2px solid ${primaryColor}30` }}
        />
      ) : (
        <div
          className="w-20 h-20 rounded-xl shrink-0 flex items-center justify-center text-xs text-center px-1"
          style={{ background: `${primaryColor}12`, color: primaryColor, border: `2px solid ${primaryColor}30` }}
        >
          Video
        </div>
      )}
      <div className="min-w-0 flex-1">
        {photo.guestName && (
          <p className="font-script text-2xl leading-none mb-1.5" style={{ color: primaryColor }}>
            {photo.guestName}
          </p>
        )}
        {photo.comment && <p className="text-neutral-700 text-[15px] leading-relaxed break-words">{photo.comment}</p>}
        <p className="text-neutral-400 text-[11px] mt-2 uppercase tracking-wide">
          {new Date(photo.createdAt).toLocaleDateString('es-AR', { day: 'numeric', month: 'long', year: 'numeric' })}
        </p>
      </div>
    </div>
  )
}

function MessageBookPrint() {
  const { eventSlug } = useParams()
  const [searchParams] = useSearchParams()
  const token = searchParams.get('token')

  const [event, setEvent] = useState(null)
  const [messages, setMessages] = useState([])
  const [loadState, setLoadState] = useState('loading') // loading | ready | forbidden | error

  useEffect(() => {
    if (!token) {
      setLoadState('forbidden')
      return
    }

    Promise.all([api.get(`/events/slug/${eventSlug}`), api.get(`/photos/client/${eventSlug}`, { params: { token } })])
      .then(([eventRes, photosRes]) => {
        const sorted = photosRes.data
          .filter((photo) => photo.status === 'aprobada' && (photo.comment || photo.guestName))
          .sort((a, b) => new Date(a.createdAt) - new Date(b.createdAt))
        setEvent(eventRes.data)
        setMessages(sorted)
        setLoadState('ready')
      })
      .catch((err) => setLoadState(err.response?.status === 403 ? 'forbidden' : 'error'))
  }, [eventSlug, token])

  if (loadState === 'loading') {
    return <div className="min-h-screen flex items-center justify-center text-neutral-400">Cargando...</div>
  }

  if (loadState === 'forbidden') {
    return (
      <div className="min-h-screen flex items-center justify-center text-neutral-400 text-center px-6">
        Este link no es válido. Pedile el link correcto a quien organiza el evento.
      </div>
    )
  }

  if (loadState === 'error') {
    return (
      <div className="min-h-screen flex items-center justify-center text-neutral-400 text-center px-6">
        No se pudo cargar el libro de firmas.
      </div>
    )
  }

  const primaryColor = event?.appearance?.primaryColor || '#a855f7'

  return (
    <div className="min-h-screen w-full" style={{ background: '#f7f3ec', color: '#1c1917' }}>
      <style>{`
        @media print {
          .no-print { display: none !important; }
          @page { margin: 1.6cm; }
          body { background: #fff !important; }
        }
      `}</style>

      <button
        type="button"
        onClick={() => window.print()}
        className="no-print fixed top-5 right-5 z-10 flex items-center gap-2 px-5 py-3 rounded-full text-sm font-semibold shadow-xl transition hover:brightness-110"
        style={{ background: primaryColor, color: '#fff' }}
      >
        <Printer className="w-4 h-4" />
        Imprimir / Guardar como PDF
      </button>

      <header className="text-center px-6 pt-16 pb-10 max-w-2xl mx-auto">
        <Heart className="w-6 h-6 mx-auto mb-4" style={{ color: primaryColor }} />
        <p className="uppercase tracking-[0.25em] text-xs text-neutral-500 mb-3">Libro de firmas</p>
        <h1 className="font-display text-4xl sm:text-5xl mb-3" style={{ color: '#1c1917' }}>
          {event.eventName}
        </h1>
        <p className="text-neutral-500 text-sm">
          {messages.length} {messages.length === 1 ? 'mensaje' : 'mensajes'} de quienes te acompañaron
        </p>
        <div className="w-16 h-px mx-auto mt-6" style={{ background: primaryColor }} />
      </header>

      <main className="max-w-3xl mx-auto px-6 pb-20">
        {messages.length === 0 ? (
          <p className="text-center text-neutral-400 py-16">Todavía no hay mensajes para mostrar.</p>
        ) : (
          <div className="grid sm:grid-cols-2 gap-4">
            {messages.map((photo) => (
              <MessageCard key={photo._id} photo={photo} primaryColor={primaryColor} />
            ))}
          </div>
        )}
      </main>
    </div>
  )
}

export default MessageBookPrint

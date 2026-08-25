import { MessageCircle, Video, Printer } from 'lucide-react'
import { cloudinaryThumb } from '../../utils/cloudinary'
import { identityColor } from '../../utils/identityColor'
import { getContrastTextColor } from '../../utils/color'

function MessageBook({ photos, eventSlug, token, primaryColor }) {
  const messages = photos
    .filter((photo) => photo.status === 'aprobada' && (photo.comment || photo.guestName))
    .sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt))

  // Vista aparte, con estética de libro de firmas (fondo claro, tipografía
  // cursiva, foto + mensaje) pensada para imprimir o guardar como PDF --
  // el CSV es un dato crudo para trabajar, esto es para guardar el recuerdo.
  const printUrl = `${window.location.origin}/evento/${encodeURIComponent(eventSlug)}/libro-de-firmas?token=${encodeURIComponent(token)}`

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between flex-wrap gap-3">
        <h2 className="text-lg font-semibold flex items-center gap-2">
          <MessageCircle className="w-5 h-5" style={{ color: primaryColor }} />
          Libro de mensajes
        </h2>
        {messages.length > 0 && (
          <a
            href={printUrl}
            target="_blank"
            rel="noreferrer"
            className="flex items-center gap-2 px-4 py-2 rounded-full text-sm font-medium transition hover:brightness-110 shadow-lg"
            style={{ background: primaryColor, color: getContrastTextColor(primaryColor) }}
          >
            <Printer className="w-4 h-4" />
            Libro de firmas (PDF)
          </a>
        )}
      </div>

      {messages.length === 0 ? (
        <div className="rounded-2xl bg-white/5 border border-white/10 p-6 text-center text-white/50">
          Todavía no hay mensajes de invitados en las fotos.
        </div>
      ) : (
        <div className="grid sm:grid-cols-2 gap-3">
          {messages.map((photo) => {
            const color = photo.guestName ? identityColor(photo.guestName) : null
            return (
              <div
                key={photo._id}
                className="flex gap-3 rounded-2xl bg-white/5 border border-white/10 p-3 min-w-0"
              >
                {photo.assetType === 'image' ? (
                  <img
                    src={cloudinaryThumb(photo.cloudinaryUrl, 96)}
                    alt=""
                    loading="lazy"
                    className="w-16 h-16 rounded-xl object-cover shrink-0"
                  />
                ) : (
                  <div className="w-16 h-16 rounded-xl bg-white/10 flex items-center justify-center shrink-0 text-white/40">
                    <Video className="w-6 h-6" />
                  </div>
                )}
                <div className="min-w-0">
                  {photo.guestName && (
                    <p className="text-sm font-semibold truncate" style={{ color: color || undefined }}>
                      {photo.guestName}
                    </p>
                  )}
                  {photo.comment && <p className="text-white/70 text-sm break-words">{photo.comment}</p>}
                  <p className="text-white/30 text-xs mt-1">{new Date(photo.createdAt).toLocaleString('es-ES')}</p>
                </div>
              </div>
            )
          })}
        </div>
      )}
    </div>
  )
}

export default MessageBook

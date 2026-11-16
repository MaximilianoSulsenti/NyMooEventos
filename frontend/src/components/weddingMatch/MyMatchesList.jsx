import { MessageCircle, HeartHandshake } from 'lucide-react'
import { buildWaLink } from '../../utils/weddingMatch'

function MyMatchesList({ matches, loading, myName, eventName, primaryColor }) {
  if (loading && matches.length === 0) {
    return (
      <div className="space-y-3">
        {Array.from({ length: 2 }).map((_, i) => (
          <div key={i} className="h-20 rounded-2xl bg-white/5 animate-pulse" />
        ))}
      </div>
    )
  }

  if (matches.length === 0) {
    return (
      <div className="text-center py-14 px-4">
        <HeartHandshake className="w-8 h-8 text-white/20 mx-auto mb-2" />
        <p className="text-white/40 text-sm">Todavía no hiciste ningún match -- seguí mirando perfiles en Descubrir.</p>
      </div>
    )
  }

  return (
    <div className="space-y-3">
      {matches.map((match) => (
        <div key={match.matchId} className="flex items-center gap-3 rounded-2xl bg-white/5 border border-white/10 p-3">
          <img src={match.profile.photoUrl} alt={match.profile.name} className="w-14 h-14 rounded-full object-cover shrink-0" />
          <div className="min-w-0 flex-1">
            <p className="text-white font-medium truncate">
              {match.profile.name}, {match.profile.age}
            </p>
            {match.profile.whatsapp ? (
              <a
                href={buildWaLink(match.profile.whatsapp, myName, eventName)}
                target="_blank"
                rel="noreferrer"
                className="inline-flex items-center gap-1 text-xs mt-0.5 hover:underline"
                style={{ color: primaryColor }}
              >
                <MessageCircle className="w-3 h-3" />
                Escribir por WhatsApp
              </a>
            ) : (
              <p className="text-white/40 text-xs mt-0.5">Buscalo/a en la pista o en la barra 🕺💃</p>
            )}
          </div>
        </div>
      ))}
    </div>
  )
}

export default MyMatchesList

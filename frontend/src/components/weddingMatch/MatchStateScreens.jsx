import { Heart, Sparkles, Ban } from 'lucide-react'
import { MATCH_ACCENT } from '../../utils/weddingMatch'

function Shell({ children }) {
  return <div className="min-h-screen w-full flex items-center justify-center px-6 text-center bg-neutral-950">{children}</div>
}

export function MatchLoading() {
  return (
    <Shell>
      <p className="text-white/40">Cargando...</p>
    </Shell>
  )
}

export function MatchModuleOff() {
  return (
    <Shell>
      <div className="flex flex-col items-center gap-3 max-w-xs">
        <Sparkles className="w-8 h-8" style={{ color: MATCH_ACCENT.violet }} />
        <p className="text-white/60">Wedding Match todavía no está activo para este evento.</p>
        <p className="text-white/30 text-sm">Se habilita solo el día de la fiesta -- no tenés que hacer nada.</p>
      </div>
    </Shell>
  )
}

export function MatchBlocked() {
  return (
    <Shell>
      <div className="flex flex-col items-center gap-3 max-w-xs">
        <Ban className="w-8 h-8 text-red-400/70" />
        <p className="text-white/70">Tu perfil fue desactivado por el organizador.</p>
        <p className="text-white/30 text-sm">Si creés que es un error, consultá con quien organiza el evento.</p>
      </div>
    </Shell>
  )
}

export function MatchError() {
  return (
    <Shell>
      <div className="flex flex-col items-center gap-3 max-w-xs">
        <Heart className="w-8 h-8 text-white/30" />
        <p className="text-red-400">Ocurrió un error al cargar Wedding Match.</p>
        <p className="text-white/30 text-sm">Probá recargar la página.</p>
      </div>
    </Shell>
  )
}

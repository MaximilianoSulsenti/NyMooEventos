import { motion } from 'motion/react'
import { MapPin, Timer, Music2, QrCode, Play } from 'lucide-react'
import { InstagramIcon } from '../icons/BrandIcons'
import { cn } from '../../utils/cn'
import { BRAND } from '../../utils/brand'

// Cada visual ilustra LITERALMENTE lo que ese pack hace (no una forma
// abstracta genérica) -- todo con JSX + Tailwind + motion, sin imágenes ni
// librerías nuevas, para que cargue instantáneo. El contenedor de la card
// (h-40, overflow-hidden) es quien blinda contra desbordes; acá adentro
// todo se mide en px fijos para que no dependa de porcentajes frágiles.

// Maqueta de teléfono reutilizada por INVITA/CONECTA/VIVE.
function PhoneFrame({ children, className }) {
  return (
    <div className={cn('relative w-12 h-20 rounded-xl border border-white/20 bg-slate-950 p-1 shrink-0', className)}>
      <div className="absolute left-1/2 top-1 -translate-x-1/2 w-3 h-0.5 rounded-full bg-white/25 z-10" />
      <div className="relative w-full h-full rounded-lg overflow-hidden bg-neutral-900">{children}</div>
    </div>
  )
}

// INVITA -- el sobre (el mismo concepto de Envelope.jsx, en miniatura) se
// abre dentro de la pantalla del celular y revela la tarjeta con mapa +
// cuenta regresiva parpadeando.
function InvitaVisual({ color }) {
  return (
    <div className="relative w-full h-full flex items-center justify-center">
      <PhoneFrame>
        <div className="absolute inset-0" style={{ background: `linear-gradient(160deg, ${color}33, transparent)` }} />
        <motion.div
          className="absolute inset-x-1 bottom-1 h-8 rounded-md bg-white/95 flex items-center justify-center gap-1.5"
          animate={{ y: [3, -2, 3] }}
          transition={{ duration: 3, repeat: Infinity, ease: 'easeInOut' }}
        >
          <motion.span animate={{ opacity: [0.25, 1, 0.25] }} transition={{ duration: 1.6, repeat: Infinity }}>
            <MapPin className="w-2.5 h-2.5" style={{ color }} />
          </motion.span>
          <motion.span animate={{ opacity: [1, 0.25, 1] }} transition={{ duration: 1.6, repeat: Infinity }}>
            <Timer className="w-2.5 h-2.5" style={{ color }} />
          </motion.span>
        </motion.div>
        <motion.div
          className="absolute inset-x-0 top-0 h-8 origin-top"
          style={{
            background: `linear-gradient(160deg, ${color}, ${color}66)`,
            clipPath: 'polygon(0 0, 100% 0, 50% 100%)',
            transformStyle: 'preserve-3d',
          }}
          animate={{ rotateX: [0, -155, -155, 0] }}
          transition={{ duration: 3, repeat: Infinity, ease: 'easeInOut', times: [0, 0.35, 0.75, 1] }}
        />
      </PhoneFrame>
    </div>
  )
}

// CONECTA -- carrusel de fotos deslizando en el celular en primer plano, y
// detrás un panel de estadísticas de vidrio con barras que suben/bajan +
// íconos de playlist e Instagram flotando.
function ConectaVisual({ color }) {
  const frames = [color, BRAND.pink, BRAND.lime, color, BRAND.pink, BRAND.lime]

  return (
    <div className="relative w-full h-full flex items-center justify-center">
      <div className="absolute right-1 top-1 w-12 h-16 rounded-lg bg-white/5 backdrop-blur-md border border-white/10 flex items-end justify-center gap-1 p-1.5">
        {[0.4, 0.7, 0.5, 0.85].map((peak, i) => (
          <motion.div
            key={i}
            className="w-1.5 rounded-t-sm"
            style={{ background: color }}
            animate={{ height: [`${peak * 30}%`, `${peak * 100}%`, `${peak * 30}%`] }}
            transition={{ duration: 2.2, repeat: Infinity, ease: 'easeInOut', delay: i * 0.2 }}
          />
        ))}
      </div>

      <motion.div
        className="absolute left-0 top-3 w-5 h-5 rounded-full flex items-center justify-center bg-white/10 border border-white/15"
        animate={{ rotate: [0, 18, -18, 0], y: [0, -3, 0] }}
        transition={{ duration: 4, repeat: Infinity, ease: 'easeInOut' }}
      >
        <Music2 className="w-3 h-3 text-white/80" />
      </motion.div>
      <motion.div
        className="absolute left-2 bottom-2 w-5 h-5 rounded-full flex items-center justify-center bg-white/10 border border-white/15"
        animate={{ rotate: [0, -18, 18, 0], y: [0, 3, 0] }}
        transition={{ duration: 4.6, repeat: Infinity, ease: 'easeInOut', delay: 0.5 }}
      >
        <InstagramIcon className="w-3 h-3 text-white/80" />
      </motion.div>

      <PhoneFrame className="relative z-10">
        <motion.div
          className="flex h-full w-full"
          animate={{ x: ['0%', '-300%'] }}
          transition={{ duration: 5, repeat: Infinity, ease: 'linear' }}
        >
          {frames.map((c, i) => (
            <div key={i} className="w-full h-full shrink-0" style={{ background: `linear-gradient(160deg, ${c}77, ${c}22)` }} />
          ))}
        </motion.div>
      </PhoneFrame>
    </div>
  )
}

// VIVE -- el celular dispara un destello hacia un QR flotante, un stack de
// mini tarjetas gira simulando el carrusel 3D, y al fondo la pantalla del
// salón "recibe" con destello de bordes en colores (Modo Fiesta) + una
// dedicatoria que emerge.
function ViveVisual({ color }) {
  const neon = [BRAND.blue, BRAND.pink, BRAND.lime]

  return (
    <div className="relative w-full h-full flex items-center justify-center">
      <motion.div
        className="absolute w-24 h-14 rounded-lg border-2"
        style={{ background: `${color}18` }}
        animate={{ borderColor: neon, scale: [0.94, 1, 0.94] }}
        transition={{ duration: 2.6, repeat: Infinity, ease: 'easeInOut' }}
      />

      <PhoneFrame className="absolute left-1 scale-[0.7] origin-left z-10">
        <div className="absolute inset-0 flex items-center justify-center">
          <QrCode className="w-6 h-6 text-white/70" />
        </div>
      </PhoneFrame>
      <motion.div
        className="absolute left-9 top-1/2 -translate-y-1/2 w-1.5 h-1.5 rounded-full"
        style={{ background: color, boxShadow: `0 0 10px 3px ${color}` }}
        animate={{ x: [0, 22, 0], opacity: [0, 1, 0] }}
        transition={{ duration: 2, repeat: Infinity, ease: 'easeOut' }}
      />

      <div className="relative z-10 w-9 h-11" style={{ perspective: 220 }}>
        {[0, 1, 2].map((i) => (
          <motion.div
            key={i}
            className="absolute inset-0 w-7 h-9 rounded-md border border-white/25"
            style={{ background: `${neon[i]}40`, transformStyle: 'preserve-3d' }}
            animate={{ rotateY: [0, 360] }}
            transition={{ duration: 6, repeat: Infinity, ease: 'linear', delay: i * 0.7 }}
          />
        ))}
      </div>

      <motion.div
        className="absolute bottom-1 right-2 px-1.5 py-0.5 rounded-full bg-white/90 text-[8px] font-semibold text-neutral-900 whitespace-nowrap"
        animate={{ opacity: [0, 1, 1, 0], y: [4, 0, 0, -4] }}
        transition={{ duration: 3.2, repeat: Infinity, ease: 'easeInOut' }}
      >
        ❤ ¡Felicidades!
      </motion.div>
    </div>
  )
}

// VISIÓN -- sin celular ni invitación: solo el QR grande (con ondas de
// pulso) y la pantalla del salón, con una foto/video viajando de uno a
// otro y los bordes de la pantalla cambiando de color al ritmo de la
// reproducción.
function VisionVisual({ color }) {
  const neon = [BRAND.orange, BRAND.pink, BRAND.blue]

  return (
    <div className="relative w-full h-full flex items-center justify-center gap-5">
      <div className="relative shrink-0">
        <motion.span
          className="absolute inset-0 rounded-lg"
          style={{ background: color }}
          animate={{ scale: [1, 1.9, 1.9], opacity: [0.4, 0, 0] }}
          transition={{ duration: 2, repeat: Infinity, ease: 'easeOut' }}
        />
        <div className="relative w-10 h-10 rounded-lg bg-white/95 flex items-center justify-center">
          <QrCode className="w-6 h-6 text-neutral-900" />
        </div>
      </div>

      <motion.div
        className="absolute left-10 top-1/2 -translate-y-1/2 w-5 h-4 rounded-sm flex items-center justify-center"
        style={{ background: `${color}55`, border: `1px solid ${color}` }}
        animate={{ x: [0, 30, 30], opacity: [0, 1, 0] }}
        transition={{ duration: 2, repeat: Infinity, ease: 'easeInOut' }}
      >
        <Play className="w-2 h-2 text-white fill-white" />
      </motion.div>

      <motion.div
        className="w-14 h-10 rounded-md shrink-0"
        style={{ background: 'rgba(255,255,255,0.05)', borderWidth: 2, borderStyle: 'solid' }}
        animate={{ borderColor: neon }}
        transition={{ duration: 2.4, repeat: Infinity, ease: 'linear' }}
      />
    </div>
  )
}

export const PACK_VISUALS = {
  invita: InvitaVisual,
  conecta: ConectaVisual,
  vive: ViveVisual,
  vision: VisionVisual,
}

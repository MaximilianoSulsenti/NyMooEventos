import { useState } from 'react'
import { motion } from 'motion/react'
import { cn } from '../utils/cn'
import { shadeColor } from '../utils/color'
import { FONT_FAMILY_CLASSES } from '../sections/theming'
import Button from './ui/Button'

function EnvelopeBackground({ settings }) {
  if (settings.bgType === 'image' && settings.bgUrl) {
    return (
      <div
        className="absolute inset-0 bg-cover bg-center"
        style={{ backgroundImage: `url(${settings.bgUrl})`, opacity: (settings.bgOpacity ?? 100) / 100 }}
      />
    )
  }
  if (settings.bgType === 'video' && settings.bgUrl) {
    return (
      <video
        src={settings.bgUrl}
        autoPlay
        muted
        loop
        playsInline
        className="absolute inset-0 w-full h-full object-cover"
        style={{ opacity: (settings.bgOpacity ?? 100) / 100 }}
      />
    )
  }
  return null
}

// Alto de la solapa como % de la tarjeta -- todo el recorte en punta
// (clip-path) se calcula relativo a la solapa misma, no al viewport, así
// nunca vuelve a distorsionarse en pantallas angostas y altas.
const FLAP_HEIGHT_PERCENT = 54
const FLAP_CLIP_PATH = 'polygon(0 0, 100% 0, 100% 74%, 50% 100%, 0 74%)'
// Punta de la solapa en coordenadas relativas a toda la tarjeta (no a la
// solapa) -- ahí es donde se apoyan las costuras y el sello de cera.
const FLAP_TIP_Y = FLAP_HEIGHT_PERCENT

function Envelope({ settings, appearance, guestName, onOpen }) {
  const [opening, setOpening] = useState(false)
  const fontClass = FONT_FAMILY_CLASSES[settings.fontFamily] || 'font-sans'
  const bgColor = settings.bgColor || '#0a0a0a'
  const flapFrontShade = shadeColor(bgColor, 18)
  const flapBackShade = shadeColor(bgColor, -35)
  const backdrop = shadeColor(bgColor, -25)

  function handleOpen() {
    setOpening(true)
    setTimeout(onOpen, 1200)
  }

  return (
    <motion.div
      className="fixed inset-0 z-50 flex items-center justify-center p-6"
      style={{ backgroundColor: backdrop, pointerEvents: opening ? 'none' : 'auto' }}
      initial={false}
      animate={{ opacity: opening ? 0 : 1 }}
      transition={{ duration: 0.5, delay: opening ? 0.7 : 0 }}
    >
      {/* La tarjeta tiene proporciones fijas (no el viewport crudo), así el
          efecto se ve simétrico en cualquier celular. perspective acá arriba
          es lo que le da profundidad real al giro de la solapa de abajo. */}
      <motion.div
        className="relative w-full max-w-sm aspect-[4/5] max-h-[85vh] rounded-2xl shadow-2xl"
        style={{ perspective: 1400 }}
        initial={false}
        animate={{ scale: opening ? 0.96 : 1 }}
        transition={{ duration: 0.45, delay: opening ? 0.7 : 0 }}
      >
        {/* Cuerpo del sobre: fondo (color/imagen/video) + las costuras +
            el botón, solo y centrado en el bolsillo debajo de la solapa. */}
        <div
          className="absolute inset-0 rounded-2xl overflow-hidden border border-white/10"
          style={{ backgroundColor: bgColor }}
        >
          <EnvelopeBackground settings={settings} />
          <div className="absolute inset-0 bg-gradient-to-t from-black/55 via-black/10 to-transparent" />

          {/* Costuras del bolsillo: las líneas de las solapas laterales que
              se doblan por detrás, como en un sobre de papel real -- se
              calculan en % así quedan perfectas sin importar el tamaño de
              pantalla. */}
          <svg
            className="absolute inset-0 w-full h-full pointer-events-none opacity-40"
            viewBox="0 0 100 100"
            preserveAspectRatio="none"
          >
            <line x1="0" y1="100" x2="50" y2={FLAP_TIP_Y} stroke="rgba(255,255,255,0.35)" strokeWidth="0.5" vectorEffect="non-scaling-stroke" />
            <line x1="100" y1="100" x2="50" y2={FLAP_TIP_Y} stroke="rgba(255,255,255,0.35)" strokeWidth="0.5" vectorEffect="non-scaling-stroke" />
          </svg>

          {/* El botón queda solo, cerca de la punta de la solapa (no
              centrado en todo el bolsillo) para que la composición se
              sienta compacta, como un sobre real -- mismo componente
              Button que se usa en el resto del sitio (borde en degradado,
              brillo al hover), con un flote suave para que invite a
              tocarlo. */}
          <motion.div
            className="absolute inset-x-0 z-10 flex flex-col items-center px-6 pt-8 sm:pt-9"
            style={{ top: `${FLAP_TIP_Y}%`, bottom: 0 }}
            animate={{ opacity: opening ? 0 : 1, y: opening ? 10 : 0 }}
            transition={{ duration: 0.3, delay: opening ? 0 : 0.2 }}
          >
            {/* Invitación VIP: si se resolvió el invitado por ?guest=<passcode>
                (Nymoo VIVE), lo saluda por su nombre en cursiva -- no
                reemplaza el texto de la solapa, se suma arriba del botón. */}
            {guestName && (
              <motion.p
                className="font-script text-xl sm:text-2xl mb-2 text-center drop-shadow-lg"
                style={{ color: appearance.primaryColor }}
                initial={{ opacity: 0, y: -6 }}
                animate={{ opacity: opening ? 0 : 1, y: 0 }}
                transition={{ duration: 0.4, delay: 0.15 }}
              >
                ¡Hola {guestName}!
              </motion.p>
            )}
            <motion.div
              animate={{ y: [0, -5, 0] }}
              transition={{ repeat: Infinity, duration: 2.6, ease: 'easeInOut' }}
            >
              <Button
                type="button"
                onClick={handleOpen}
                primaryColor={appearance.primaryColor}
                className={cn('px-9 sm:px-11 py-3.5 sm:py-4 tracking-wide', fontClass)}
              >
                {settings.buttonText || 'Abrir invitación'}
              </Button>
            </motion.div>
          </motion.div>
        </div>

        {/* Sello de cera sobre la punta de la solapa -- discreto, más marca
            en el papel que botón, para no competirle protagonismo al de
            "Abrir invitación". Se "rompe" (achica, gira un poco y se
            desvanece) apenas se toca el botón real. */}
        <motion.div
          className="absolute z-20 w-9 h-9 sm:w-10 sm:h-10 rounded-full -translate-x-1/2 -translate-y-1/2"
          style={{
            left: '50%',
            top: `${FLAP_TIP_Y}%`,
            opacity: 0.88,
            background: `radial-gradient(circle at 35% 30%, ${shadeColor(appearance.primaryColor, 12)}, ${appearance.primaryColor} 65%, ${shadeColor(appearance.primaryColor, -15)})`,
            boxShadow: 'inset 0 1px 1px rgba(255,255,255,0.2), inset 0 -1px 2px rgba(0,0,0,0.3), 0 2px 6px -2px rgba(0,0,0,0.35)',
          }}
          animate={opening ? { scale: 0, opacity: 0, rotate: 25 } : { scale: 1, opacity: 0.88, rotate: 0 }}
          transition={{ duration: 0.35, ease: 'easeIn' }}
        >
          <div className="absolute inset-1.5 rounded-full border border-white/15" />
        </motion.div>

        {/* Sombra que se profundiza a medida que la solapa se levanta, para
            que el papel de abajo se sienta "adentro" del sobre en vez de
            plano. */}
        <motion.div
          className="absolute inset-x-0 top-0 pointer-events-none rounded-t-2xl"
          style={{ height: `${FLAP_HEIGHT_PERCENT}%`, background: 'radial-gradient(ellipse at top, rgba(0,0,0,0.4), transparent 70%)' }}
          animate={{ opacity: opening ? 1 : 0 }}
          transition={{ duration: 0.5, delay: opening ? 0.1 : 0 }}
        />

        {/* Solapa: bisagra real en 3D (rotateX), no un slide -- se pliega
            hacia atrás como una solapa de papel de verdad. El texto de
            bienvenida vive acá, sutil, como una etiqueta escrita en el
            papel -- se va con la solapa al abrir. */}
        <motion.div
          className="absolute inset-x-0 top-0 origin-top"
          style={{ height: `${FLAP_HEIGHT_PERCENT}%`, transformStyle: 'preserve-3d' }}
          animate={{ rotateX: opening ? -170 : 0 }}
          transition={{ duration: 0.7, ease: [0.45, 0, 0.2, 1] }}
        >
          {/* Cara frontal (lo que se ve mientras está cerrada) -- el texto se
              centra dentro de la franja ancha de la solapa (pb-[26%] reserva
              justo la punta triangular, donde FLAP_CLIP_PATH empieza a
              angostarse) para que quede cerca del botón en vez de pegado
              arriba del todo. */}
          <div
            className={cn(
              'absolute inset-0 rounded-t-2xl flex flex-col items-center justify-center text-center px-8 pb-[26%]',
              fontClass
            )}
            style={{
              clipPath: FLAP_CLIP_PATH,
              backfaceVisibility: 'hidden',
              background: `linear-gradient(160deg, ${flapFrontShade}, ${bgColor})`,
              boxShadow: 'inset 0 -1px 0 rgba(255,255,255,0.15)',
            }}
          >
            {settings.titleText && (
              <p
                className={cn(settings.fontSizeTitle || 'text-base', 'text-white/90 tracking-wide leading-snug drop-shadow')}
                style={settings.textColor ? { color: `${settings.textColor}e6` } : undefined}
              >
                {settings.titleText}
              </p>
            )}
            {settings.subtitleText && (
              <p
                className={cn(settings.fontSizeSubtitle || 'text-sm', 'text-white/55 mt-1.5 tracking-wide')}
                style={settings.textColor ? { color: `${settings.textColor}8c` } : undefined}
              >
                {settings.subtitleText}
              </p>
            )}
          </div>
          {/* Cara trasera (lo que se ve cuando termina de girar hacia atrás) */}
          <div
            className="absolute inset-0"
            style={{
              clipPath: FLAP_CLIP_PATH,
              backfaceVisibility: 'hidden',
              transform: 'rotateX(180deg)',
              background: `linear-gradient(160deg, ${flapBackShade}, ${bgColor})`,
            }}
          />
        </motion.div>
      </motion.div>
    </motion.div>
  )
}

export default Envelope

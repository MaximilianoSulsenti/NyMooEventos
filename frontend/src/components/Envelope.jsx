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
          efecto se ve simétrico en cualquier celular. Proporción apaisada
          (más ancha que alta, aspect-[3/2]) para que se sienta como un
          sobre de verdad apoyado sobre una superficie, no como una tarjeta
          vertical -- referencia: foto de sobre de papel envejecido con
          sello de lacre. perspective acá arriba es lo que le da profundidad
          real al giro de la solapa de abajo. */}
      <motion.div
        className="relative w-full max-w-md aspect-[3/2] max-h-[85vh] rounded-lg shadow-2xl"
        style={{ perspective: 1400 }}
        initial={false}
        animate={{ scale: opening ? 0.96 : 1 }}
        transition={{ duration: 0.45, delay: opening ? 0.7 : 0 }}
      >
        {/* Cuerpo del sobre: fondo (color/imagen/video) + las costuras +
            el botón, solo y centrado en el bolsillo debajo de la solapa. */}
        <div
          className="absolute inset-0 rounded-lg overflow-hidden border border-white/10"
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
            {/* Cada costura es un par de líneas (sombra + brillo) en vez de
                una sola línea plana, para que se lea como un doblez real
                del papel y no como un rayón. */}
            <line x1="0.6" y1="100" x2="50.6" y2={FLAP_TIP_Y} stroke="rgba(0,0,0,0.35)" strokeWidth="0.6" vectorEffect="non-scaling-stroke" />
            <line x1="0" y1="100" x2="50" y2={FLAP_TIP_Y} stroke="rgba(255,255,255,0.4)" strokeWidth="0.5" vectorEffect="non-scaling-stroke" />
            <line x1="99.4" y1="100" x2="49.4" y2={FLAP_TIP_Y} stroke="rgba(0,0,0,0.35)" strokeWidth="0.6" vectorEffect="non-scaling-stroke" />
            <line x1="100" y1="100" x2="50" y2={FLAP_TIP_Y} stroke="rgba(255,255,255,0.4)" strokeWidth="0.5" vectorEffect="non-scaling-stroke" />
          </svg>

          {/* El botón queda solo, cerca de la punta de la solapa (no
              centrado en todo el bolsillo) para que la composición se
              sienta compacta, como un sobre real -- mismo componente
              Button que se usa en el resto del sitio (borde en degradado,
              brillo al hover), con un flote suave para que invite a
              tocarlo. */}
          <motion.div
            className="absolute inset-x-0 z-10 flex flex-col items-center px-6 pt-12 sm:pt-14"
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

        {/* Sello de cera con borde de soga retorcida (referencia: sello de
            lacre clásico sobre sobre envejecido) -- silueta de cera
            irregular hecha a mano, aro de "cordón" trenzado sobre el borde
            (segmentos claro/oscuro alternados, el detalle que más vende que
            es un sello prensado y no un botón), óvalo grabado al centro con
            un pequeño patrón de puntos (sin letras) y una grieta fina, como
            cera envejecida de verdad. Tamaño acotado a propósito para que
            nunca invada el botón real de abajo (ver pt-12/pt-14 del
            contenedor del botón). Se "rompe" (achica, gira un poco y se
            desvanece) apenas se toca ese botón. */}
        <motion.div
          className="absolute z-20 w-16 h-16 sm:w-[4.5rem] sm:h-[4.5rem] -translate-x-1/2 -translate-y-1/2"
          style={{ left: '50%', top: `${FLAP_TIP_Y}%`, filter: 'drop-shadow(0 4px 6px rgba(0,0,0,0.45))' }}
          animate={opening ? { scale: 0, opacity: 0, rotate: 25 } : { scale: 1, opacity: 1, rotate: 0 }}
          transition={{ duration: 0.35, ease: 'easeIn' }}
        >
          <svg viewBox="0 0 100 100" className="w-full h-full">
            <defs>
              <radialGradient id="waxBody" cx="34%" cy="26%" r="78%">
                <stop offset="0%" stopColor={shadeColor(appearance.primaryColor, 30)} />
                <stop offset="45%" stopColor={appearance.primaryColor} />
                <stop offset="100%" stopColor={shadeColor(appearance.primaryColor, -30)} />
              </radialGradient>
              <radialGradient id="waxCenter" cx="50%" cy="42%" r="65%">
                <stop offset="0%" stopColor={shadeColor(appearance.primaryColor, -6)} />
                <stop offset="100%" stopColor={shadeColor(appearance.primaryColor, -24)} />
              </radialGradient>
            </defs>

            {/* Goterones de cera sobre el borde -- el detalle que más vende
                que esto se derramó y se prensó a mano. */}
            <circle cx="12" cy="64" r="5" fill="url(#waxBody)" />
            <circle cx="88" cy="38" r="4.5" fill="url(#waxBody)" />
            <circle cx="58" cy="92" r="4" fill="url(#waxBody)" />

            {/* Cuerpo de cera: silueta orgánica hecha a mano (radio
                irregular en cada punto, suavizado con curvas), no un
                círculo ni un blob genérico de CSS. */}
            <path
              d="M90.75,60.25 Q85.5,70.5 79.5,80.6 Q73.5,90.7 61.75,91.85 Q50,93 38,92.3 Q26,91.6 19.8,81.3 Q13.6,71 8.8,60.5 Q4,50 7.95,39 Q11.9,28 18.7,17.8 Q25.5,7.6 37.75,8.3 Q50,9 61.75,9.15 Q73.5,9.3 80.35,18.9 Q87.2,28.5 91.6,39.25 Q96,50 90.75,60.25 Z"
              fill="url(#waxBody)"
              stroke={shadeColor(appearance.primaryColor, -30)}
              strokeWidth="0.6"
              strokeOpacity="0.5"
            />

            {/* Aro de soga retorcida: segmentos alternados claro/oscuro
                revolviendo el centro, cada uno con su propia inclinación
                para simular el trenzado del cordón -- así se lee como un
                sello prensado con matriz de verdad. */}
            <g>
              {Array.from({ length: 28 }).map((_, i) => {
                const angle = (360 / 28) * i
                return (
                  <rect
                    key={i}
                    x="48.7"
                    y="9.5"
                    width="2.6"
                    height="7.5"
                    rx="1.3"
                    fill={i % 2 === 0 ? shadeColor(appearance.primaryColor, 18) : shadeColor(appearance.primaryColor, -26)}
                    transform={`rotate(${angle} 50 50) rotate(20 50 13.25)`}
                  />
                )
              })}
            </g>

            {/* Óvalo central grabado (recesado, un tono más oscuro) con un
                patrón simétrico de puntos en relieve adentro -- motivo
                abstracto universal, sin ninguna letra. */}
            <ellipse cx="50" cy="50" rx="21" ry="17.5" fill="url(#waxCenter)" stroke={shadeColor(appearance.primaryColor, -36)} strokeWidth="0.5" strokeOpacity="0.5" />
            <g fill={shadeColor(appearance.primaryColor, 22)} fillOpacity="0.85">
              {[0, 45, 90, 135, 180, 225, 270, 315].map((angle) => {
                const rad = (angle * Math.PI) / 180
                return <circle key={angle} cx={50 + 7 * Math.cos(rad)} cy={50 + 6 * Math.sin(rad)} r="1.15" />
              })}
              <circle cx="50" cy="50" r="1.7" />
            </g>

            {/* Grieta fina en la cera -- cera envejecida de verdad rara vez
                queda perfecta. */}
            <path
              d="M 30 22 L 34 30 L 31 36 L 35 44"
              fill="none"
              stroke={shadeColor(appearance.primaryColor, -40)}
              strokeWidth="0.5"
              strokeOpacity="0.4"
              strokeLinecap="round"
            />

            {/* Brillo: uno chico y bien marcado (el "punto caliente" de la
                cera pulida) más uno amplio y suave debajo, para que se
                sienta vidriosa y no plana. */}
            <ellipse cx="36" cy="30" rx="18" ry="12" fill="rgba(255,255,255,0.14)" />
            <ellipse cx="33" cy="24" rx="7" ry="4" fill="rgba(255,255,255,0.4)" />
          </svg>
        </motion.div>

        {/* Sombra que se profundiza a medida que la solapa se levanta, para
            que el papel de abajo se sienta "adentro" del sobre en vez de
            plano. */}
        <motion.div
          className="absolute inset-x-0 top-0 pointer-events-none rounded-t-lg"
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
              'absolute inset-0 rounded-t-lg flex flex-col items-center justify-center text-center px-8 pb-[20%]',
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

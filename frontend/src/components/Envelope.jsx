import { useState } from 'react'
import { motion } from 'motion/react'
import { cn } from '../utils/cn'
import { shadeColor, getContrastTextColor } from '../utils/color'
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

function Envelope({ settings, appearance, guestName, welcomeMessage, onOpen }) {
  const [opening, setOpening] = useState(false)
  const fontClass = FONT_FAMILY_CLASSES[settings.fontFamily] || 'font-sans'
  const bgColor = settings.bgColor || '#0a0a0a'
  const flapFrontShade = shadeColor(bgColor, 18)
  const flapBackShade = shadeColor(bgColor, -35)
  const backdrop = shadeColor(bgColor, -25)
  // Antes el texto de la solapa era blanco fijo -- andaba bien mientras el
  // sobre era casi siempre oscuro, pero con el color de fondo editable (un
  // sobre blanco, como el de la referencia) el texto quedaba invisible.
  // Ahora el color por defecto se calcula según el contraste real contra
  // bgColor, y solo se usa si nadie eligió un color de texto a mano.
  const autoTextColor = getContrastTextColor(bgColor)

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
      {/* Wrapper compartido por el mensaje que asoma y el sobre en sí --
          flex column en flujo normal (no absolute) a propósito: así el
          "items-center" de más arriba centra el GRUPO entero (mensaje +
          sobre) contando su altura real. Con el mensaje en absolute (como
          estaba antes) el centrado solo tenía en cuenta el sobre, y un
          mensaje largo (o una pantalla baja) lo empujaba tan arriba que se
          cortaba contra el borde de la pantalla. */}
      <div className="flex flex-col items-center w-full max-w-md">
        {/* Mensaje que asoma detrás del sobre, como una carta a medio sacar
            -- el margen negativo (-mb-3, 12px) lo mete por detrás del borde
            superior del sobre (que lo tapa, por su z-index más alto), pero
            siempre MENOS que el padding vertical de la tarjeta (py-5, 20px)
            a propósito: así lo que se tapa es aire/padding, nunca el texto
            en sí, sea cual sea el largo del mensaje. */}
        {welcomeMessage && (
          <motion.div
            className="relative z-0 w-[88%] sm:w-[85%] -mb-3 rounded-md shadow-xl px-5 py-5"
            style={{ background: '#fdfbf6', color: '#2a2620' }}
            initial={false}
            animate={{ opacity: opening ? 0 : 1, y: opening ? -12 : 0 }}
            transition={{ duration: 0.4, delay: opening ? 0 : 0.35 }}
          >
            <p className={cn('text-sm sm:text-base text-center leading-snug', fontClass)}>{welcomeMessage}</p>
          </motion.div>
        )}

        {/* La tarjeta tiene proporciones fijas (no el viewport crudo), así el
            efecto se ve simétrico en cualquier celular. Proporción apaisada
            (más ancha que alta, aspect-[3/2]) para que se sienta como un
            sobre de verdad apoyado sobre una superficie, no como una tarjeta
            vertical. perspective acá arriba es lo que le da profundidad
            real al giro de la solapa de abajo. */}
        <motion.div
          className="relative z-10 w-full aspect-[3/2] max-h-[85vh] rounded-lg shadow-2xl"
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
            {/* Este degradado oscuro solo suma cuando hay una imagen/video de
                fondo (para que el texto siga siendo legible encima) -- antes
                se aplicaba siempre, así que un sobre de color plano (blanco,
                por ejemplo) quedaba oscurecido hacia abajo sin que nadie lo
                hubiera pedido. */}
            {settings.bgType !== 'color' && (
              <div className="absolute inset-0 bg-gradient-to-t from-black/55 via-black/10 to-transparent" />
            )}

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

        {/* Sello de cera con fleur-de-lis (referencia: sello de lacre
            clásico, medallón circular prolijo con el motivo grabado al
            centro) -- cera lisa y brillante (no un blob orgánico), con un
            aro fino grabado y la fleur-de-lis en relieve, sin ninguna
            letra. Tamaño acotado a propósito para que nunca invada el botón
            real de abajo (ver pt-12/pt-14 del contenedor del botón). Se
            "rompe" (achica, gira un poco y se desvanece) apenas se toca ese
            botón. */}
        <motion.div
          className="absolute z-20 w-[4.5rem] h-[4.5rem] sm:w-20 sm:h-20 -translate-x-1/2 -translate-y-1/2"
          style={{ left: '50%', top: `${FLAP_TIP_Y}%`, filter: 'drop-shadow(0 4px 6px rgba(0,0,0,0.45))' }}
          animate={opening ? { scale: 0, opacity: 0, rotate: 25 } : { scale: 1, opacity: 1, rotate: 0 }}
          transition={{ duration: 0.35, ease: 'easeIn' }}
        >
          <svg viewBox="0 0 100 100" className="w-full h-full">
            <defs>
              <radialGradient id="waxBody" cx="35%" cy="28%" r="80%">
                <stop offset="0%" stopColor={shadeColor(appearance.primaryColor, 34)} />
                <stop offset="45%" stopColor={appearance.primaryColor} />
                <stop offset="100%" stopColor={shadeColor(appearance.primaryColor, -32)} />
              </radialGradient>
            </defs>

            {/* Pequeños goterones apenas asomando por el borde inferior --
                el único detalle "derramado", el resto es cera prolija. */}
            <circle cx="34" cy="86" r="3" fill="url(#waxBody)" />
            <circle cx="66" cy="87" r="2.6" fill="url(#waxBody)" />

            {/* Cuerpo de cera: medallón circular prolijo, como un sello
                prensado con matriz de verdad, no un blob orgánico. */}
            <circle cx="50" cy="50" r="38" fill="url(#waxBody)" stroke={shadeColor(appearance.primaryColor, -32)} strokeWidth="0.6" strokeOpacity="0.5" />
            {/* Aro grabado, cerca del borde -- el detalle de la matriz del sello. */}
            <circle cx="50" cy="50" r="32" fill="none" stroke={shadeColor(appearance.primaryColor, -30)} strokeOpacity="0.4" strokeWidth="0.8" />

            {/* Fleur-de-lis grabada al centro: pétalo central + dos pétalos
                laterales enroscados + banda + punta inferior. Color dorado
                fijo (no depende del color del evento) a propósito -- contra
                un primaryColor claro (pasteles, colores flúo), aclarar la
                cera de base para el relieve la volvía casi invisible; así
                se lee siempre, sea cual sea el color elegido. */}
            <g fill="#f2e0b0" stroke="#4a2410" strokeWidth="0.6" strokeOpacity="0.55">
              <path d="M50,26 C45,32 43,40 44,48 L44,54 L56,54 L56,48 C57,40 55,32 50,26 Z" />
              <path d="M45,50 C36,44 26,45 22,53 C20,58 23,62 29,60 C36,58 43,53 47,49 Z" />
              <path d="M55,50 C64,44 74,45 78,53 C80,58 77,62 71,60 C64,58 57,53 53,49 Z" />
              <rect x="30" y="52" width="40" height="6" rx="3" />
              <path d="M45,58 L55,58 L50,68 Z" />
            </g>

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
              background: bgColor,
              boxShadow: 'inset 0 -1px 0 rgba(255,255,255,0.15)',
            }}
          >
            {/* Antes la solapa SIEMPRE mostraba un degradado calculado del
                color, ignorando por completo bgUrl -- si alguien elegía
                imagen/video de fondo, se veía en el cuerpo del sobre pero la
                solapa de arriba quedaba igual, como si no hubiera pasado
                nada. Este div interno mide 100%/54% = ~185% de la solapa a
                propósito: la solapa mide el 54% de la tarjeta completa
                (FLAP_HEIGHT_PERCENT), así que agrandarlo a esa proporción
                hace que bg-cover/bg-center calcule el recorte igual que en
                el cuerpo (que sí mide el 100%) -- mismo punto de origen
                (top:0 de la tarjeta), misma imagen, sin que se note la
                costura entre las dos partes. */}
            {settings.bgType !== 'color' && (
              <div className="absolute inset-x-0 top-0" style={{ height: `${10000 / FLAP_HEIGHT_PERCENT}%` }}>
                <EnvelopeBackground settings={settings} />
              </div>
            )}
            {/* Matiz de "doblez" -- degradado sólido para un fondo de color
                plano (como antes), pero semitransparente sobre una imagen
                para no taparla, solo sugerir la sombra del pliegue. */}
            <div
              className="absolute inset-0"
              style={{
                background:
                  settings.bgType === 'color'
                    ? `linear-gradient(160deg, ${flapFrontShade}, ${bgColor})`
                    : `linear-gradient(160deg, ${flapFrontShade}33, ${bgColor}55)`,
              }}
            />
            {settings.titleText && (
              <p
                className={cn(settings.fontSizeTitle || 'text-base', 'tracking-wide leading-snug drop-shadow')}
                style={{ color: `${settings.textColor || autoTextColor}e6` }}
              >
                {settings.titleText}
              </p>
            )}
            {settings.subtitleText && (
              <p
                className={cn(settings.fontSizeSubtitle || 'text-sm', 'mt-1.5 tracking-wide drop-shadow')}
                style={{ color: `${settings.textColor || autoTextColor}d9` }}
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
      </div>
    </motion.div>
  )
}

export default Envelope

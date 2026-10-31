import { useEffect, useState } from 'react'
import { motion, AnimatePresence } from 'motion/react'
import { Sparkles, CalendarDays, ChevronDown } from 'lucide-react'
import usePremiumGuest from '../hooks/usePremiumGuest'
import { secondaryTextColor, titleTextStyle, secondaryGlassStyle, titleGlassColor } from '../utils/color'
import { FONT_FAMILY_CLASSES } from './theming'
import { cn } from '../utils/cn'

function Hero({ event, config, appearance, styles, revealed = true }) {
  // Pista sutil de "seguí bajando" -- aparece recién a los pocos segundos de
  // que la Portada es realmente visible (no desde que carga la página: si
  // hay sobre de bienvenida, Hero ya está montado detrás tapado, así que el
  // conteo arranca cuando se abre, no antes) y desaparece apenas el
  // visitante hace scroll, así no queda pegada arriba de otras secciones.
  const [showScrollHint, setShowScrollHint] = useState(false)
  useEffect(() => {
    if (!revealed) return undefined
    const timer = setTimeout(() => setShowScrollHint(true), 2500)
    function handleScroll() {
      if (window.scrollY > 40) {
        setShowScrollHint(false)
        window.removeEventListener('scroll', handleScroll)
      }
    }
    window.addEventListener('scroll', handleScroll, { passive: true })
    return () => {
      clearTimeout(timer)
      window.removeEventListener('scroll', handleScroll)
    }
  }, [revealed])

  const kicker = config.kicker || 'Te invitamos a celebrar'
  const title = config.title || event.eventName
  const subtitle = config.subtitle || ''
  const titleSize = config.fontSizeTitle || 'text-4xl'
  const subtitleSize = config.fontSizeSubtitle || 'text-base'
  const bodySize = config.fontSizeBody || 'text-sm'
  const secondaryColor = config.textColorSecondary || config.textColor
  const glassBg = config.textGlassBg === 'si'
  const glassBgStyle = glassBg ? secondaryGlassStyle(secondaryColor, config.textGlassOpacity) : null
  const titleGlassBg = config.titleGlassBg === 'si'
  const titleGlassBgStyle = titleGlassBg ? secondaryGlassStyle(titleGlassColor(config), config.textGlassOpacity) : null
  // Tipografía del título propia de la Portada, independiente de la general
  // de la invitación -- se arma desde styles.headingBase (solo peso/tracking,
  // sin font-family) en vez de styles.heading (que ya trae mezclada la
  // tipografía general de títulos), así una pisa a la otra sin que ambas
  // compitan por la misma propiedad CSS en el mismo elemento.
  const titleFontOverride = config.titleFontFamily && FONT_FAMILY_CLASSES[config.titleFontFamily]
  const headingClass = titleFontOverride ? cn(styles.headingBase, titleFontOverride) : styles.heading
  const premiumGuest = usePremiumGuest(event)
  // Fecha/hora sofisticada en la portada -- opcional (config.showDate),
  // apagada por defecto para no cambiarle la cara a ninguna invitación ya
  // armada. A propósito NO es un widget robusto tipo EventDetail (nada de
  // número gigante ni tarjeta propia): es una línea chica, a la altura del
  // subtítulo, como una aclaración más que un elemento aparte.
  const eventDate = new Date(event.date)
  const formattedDate = eventDate.toLocaleDateString('es-AR', { day: 'numeric', month: 'long', year: 'numeric' })
  const formattedTime = eventDate.toLocaleTimeString('es-AR', { hour: '2-digit', minute: '2-digit' })
  // Formato personalizable con marcadores -- siempre calculado a partir de la
  // fecha real del evento (nunca texto suelto), así si más adelante se
  // corrige la fecha/hora del evento, esta línea se actualiza sola sin
  // tener que volver a escribirla a mano. Sin nada cargado, cae al formato
  // de siempre.
  const dateTemplate = (config.dateFormat || '').trim() || '{fecha} · {hora} hs'
  const dateText = dateTemplate.replace(/\{fecha\}/g, formattedDate).replace(/\{hora\}/g, formattedTime)
  const dateAbove = config.datePosition === 'arriba'
  const dateDividers = config.dateDividers === 'si'
  // Línea de fecha reusable: se arma una sola vez y se ubica arriba del
  // título o abajo del subtítulo según config.datePosition, con la
  // posibilidad de agregarle líneas separadoras a los costados (estilo
  // "——— 15.06.2022 ———") en vez del simple renglón de siempre.
  const dateLineText = config.showDate && (
    <p
      className={cn(
        'inline-flex items-center justify-center gap-1.5 whitespace-nowrap',
        bodySize,
        'tracking-wide',
        glassBg && 'backdrop-blur-lg rounded-2xl px-4 py-1.5'
      )}
      style={{ color: secondaryTextColor(secondaryColor, '99'), ...glassBgStyle }}
    >
      <CalendarDays className="w-3.5 h-3.5 shrink-0" style={{ color: appearance.primaryColor }} />
      {dateText}
    </p>
  )
  // Ancho fijo (no flex-1) a propósito -- el contenedor padre (motion.div de
  // arriba) no tiene un ancho propio, se ajusta al contenido, así que un
  // "crecer para llenar el espacio disponible" no tiene de dónde crecer y
  // termina en 0. Con ancho fijo además queda más parecido a la referencia:
  // líneas cortas a los costados, no una barra de punta a punta.
  const dateLine = config.showDate && (
    <div className="flex items-center justify-center gap-3">
      {dateDividers && <span className="h-px w-8 sm:w-12 shrink-0" style={{ background: `${appearance.primaryColor}4d` }} />}
      {dateLineText}
      {dateDividers && <span className="h-px w-8 sm:w-12 shrink-0" style={{ background: `${appearance.primaryColor}4d` }} />}
    </div>
  )
  // {nombre} en el template se reemplaza por el nombre real del invitado VIP.
  const vipGreeting = (config.vipGreeting || '¡Hola, {nombre}! Están cordialmente invitados').replace(
    '{nombre}',
    premiumGuest?.name || ''
  )

  return (
    <section className={`min-h-[70vh] flex flex-col items-center justify-center text-center px-6 ${styles.fontClass}`}>
      <motion.div
        initial={{ opacity: 0, y: 16 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.8, ease: 'easeOut' }}
      >
        {premiumGuest && (
          <motion.p
            initial={{ opacity: 0, y: -10, scale: 0.9 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            transition={{ duration: 0.5, delay: 0.2 }}
            className="inline-flex items-center gap-2 mb-4 px-4 py-1.5 rounded-full text-sm font-medium"
            style={{
              background: `${appearance.primaryColor}22`,
              color: appearance.primaryColor,
              border: `1px solid ${appearance.primaryColor}40`,
            }}
          >
            <Sparkles className="w-3.5 h-3.5" />
            {vipGreeting}
          </motion.p>
        )}
        {kicker && (
          <p className={`uppercase tracking-[0.3em] ${bodySize} mb-4`} style={{ color: appearance.primaryColor }}>
            {kicker}
          </p>
        )}
        {dateAbove && <div className="mb-4">{dateLine}</div>}
        <h1
          className={cn(titleSize, 'mb-3', headingClass, titleGlassBg && 'inline-block backdrop-blur-lg rounded-2xl px-5 py-2')}
          style={{ ...titleTextStyle(config), ...titleGlassBgStyle }}
        >
          {title}
        </h1>
        {subtitle && (
          <p
            className={cn('mt-2', subtitleSize, glassBg && 'inline-block backdrop-blur-lg rounded-2xl px-4 py-1.5')}
            style={{ color: secondaryTextColor(secondaryColor, 'b3'), ...glassBgStyle }}
          >
            {subtitle}
          </p>
        )}
        {!dateAbove && <div className="mt-2">{dateLine}</div>}
        <div className={`${styles.divider} my-6 mx-auto`} style={{ background: appearance.primaryColor }} />
        {config.dedication && (
          <p
            className={cn(
              bodySize,
              'italic mt-2 max-w-sm mx-auto',
              glassBg && 'inline-block backdrop-blur-lg rounded-2xl px-4 py-1.5'
            )}
            style={{ color: secondaryTextColor(secondaryColor, '80'), ...glassBgStyle }}
          >
            {config.dedication}
          </p>
        )}
      </motion.div>

      <AnimatePresence>
        {showScrollHint && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.6 }}
            className="fixed bottom-6 left-1/2 -translate-x-1/2 z-20 pointer-events-none"
          >
            <motion.div animate={{ y: [0, 8, 0] }} transition={{ duration: 1.6, repeat: Infinity, ease: 'easeInOut' }}>
              <ChevronDown className="w-6 h-6" style={{ color: appearance.primaryColor }} />
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </section>
  )
}

export default Hero

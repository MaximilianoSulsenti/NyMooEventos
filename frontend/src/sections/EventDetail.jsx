import { motion } from 'motion/react'
import { Clock } from 'lucide-react'
import { cn } from '../utils/cn'
import { resolveIcon } from './eventIcons'
import AnimatedIcon from '../components/AnimatedIcon'
import { glassStyle, glassBlurClass } from '../utils/glass'
import { CARD_REVEAL } from '../utils/motionPresets'
import { secondaryTextColor } from '../utils/color'

// Un grupo de detalles (ej. "Ceremonia Religiosa" con Fecha/Hora/Lugar) --
// mismo AnimatedIcon/label/text que el bloque de "detalles" de siempre,
// pero agrupado bajo su propio título/subtítulo, con la opción de mostrar
// los ítems en fila (tarjetas, como Fecha/Hora/Lugar lado a lado) o en
// lista vertical.
function DetailGroup({ group, appearance, config, styles, isFirst }) {
  const items = Array.isArray(group.items) ? group.items.filter((i) => i.label || i.text) : []
  if (!group.title && !group.subtitle && items.length === 0) return null
  const isHorizontal = (group.layout || 'horizontal') !== 'vertical'

  return (
    <div className={isFirst ? '' : 'mt-10'}>
      {group.title && (
        <h3 className={`text-xl sm:text-2xl mb-1 ${styles.heading}`} style={{ color: config.textColor || undefined }}>
          {group.title}
        </h3>
      )}
      {group.subtitle && (
        <p
          className="text-[11px] uppercase tracking-[0.2em] mb-6"
          style={{ color: secondaryTextColor(config.textColor, '80') }}
        >
          {group.subtitle}
        </p>
      )}

      {items.length > 0 &&
        (isHorizontal ? (
          <div className="flex flex-wrap items-stretch justify-center gap-4">
            {items.map((item, index) => {
              const Icon = resolveIcon(item.icon, item.label)
              return (
                <div
                  key={index}
                  className={cn('flex flex-col items-center gap-2 min-w-[140px] px-6 py-5 border', glassBlurClass(config), styles.card)}
                  style={glassStyle(config)}
                >
                  <AnimatedIcon
                    icon={Icon}
                    delay={index * 0.05}
                    className="w-9 h-9 rounded-full flex items-center justify-center shrink-0"
                    style={{ background: `${appearance.primaryColor}22`, color: appearance.primaryColor }}
                    iconClassName="w-4 h-4"
                  />
                  {item.label && (
                    <p
                      className="text-[11px] font-semibold uppercase tracking-widest"
                      style={{ color: secondaryTextColor(config.textColor, 'e6') }}
                    >
                      {item.label}
                    </p>
                  )}
                  {item.text && (
                    <p className="text-sm italic text-center" style={{ color: config.textColor || undefined }}>
                      {item.text}
                    </p>
                  )}
                </div>
              )
            })}
          </div>
        ) : (
          <div className="flex flex-col gap-4 max-w-sm mx-auto text-left">
            {items.map((item, index) => {
              const Icon = resolveIcon(item.icon, item.label)
              return (
                <div key={index} className="flex items-start gap-3">
                  <AnimatedIcon
                    icon={Icon}
                    delay={index * 0.05}
                    className="w-8 h-8 rounded-full flex items-center justify-center shrink-0"
                    style={{ background: `${appearance.primaryColor}22`, color: appearance.primaryColor }}
                    iconClassName="w-4 h-4"
                  />
                  <div>
                    {item.label && (
                      <p className="text-sm font-semibold" style={{ color: secondaryTextColor(config.textColor, 'e6') }}>
                        {item.label}
                      </p>
                    )}
                    {item.text && <p style={{ color: secondaryTextColor(config.textColor, '99') }}>{item.text}</p>}
                  </div>
                </div>
              )
            })}
          </div>
        ))}
    </div>
  )
}

function EventDetail({ event, config, appearance, styles }) {
  const eventDate = new Date(event.date)
  const day = eventDate.getDate()
  const month = eventDate.toLocaleDateString('es-ES', { month: 'short' }).replace('.', '')
  const weekday = eventDate.toLocaleDateString('es-ES', { weekday: 'long' })
  const formattedTime = eventDate.toLocaleTimeString('es-ES', { hour: '2-digit', minute: '2-digit' })
  const bodySize = config.fontSizeBody || 'text-base'
  const alignment = config.alignment || 'text-center'
  const titleSize = config.fontSizeTitle || 'text-2xl'
  const subtitleSize = config.fontSizeSubtitle || 'text-base'
  const details = Array.isArray(config.details) ? config.details.filter((d) => d.label || d.text) : []
  // El resto del contenido (fecha, hora, detalles) tiene su propia
  // alineación fija con flex/grid, así que "Alineación" no tiene nada de
  // texto suelto para alinear -- lo que sí hace algo visible es mover la
  // tarjeta entera hacia un lado, que es el efecto real que se espera.
  const cardPosition =
    { 'text-left': 'mr-auto ml-0', 'text-right': 'ml-auto mr-0' }[alignment] || 'mx-auto'
  const groups = Array.isArray(config.groups)
    ? config.groups.filter((g) => g.title || g.subtitle || (Array.isArray(g.items) && g.items.length > 0))
    : []
  // Cargar uno o más grupos reemplaza el bloque simple de fecha/hora + la
  // grilla plana de "detalles" de siempre -- así una invitación que ya usa
  // el modo simple (la gran mayoría hoy) sigue viéndose exactamente igual,
  // sin ningún cambio, mientras nadie cargue un grupo a propósito.
  const useGroups = groups.length > 0

  return (
    <section className={`px-6 ${styles.fontClass} ${alignment}`}>
      {config.title && (
        <h2
          className={`${titleSize} ${config.subtitle ? 'mb-1' : 'mb-5'} ${styles.heading}`}
          style={{ color: config.textColor || undefined }}
        >
          {config.title}
        </h2>
      )}
      {config.subtitle && (
        <p className={`mb-5 ${subtitleSize}`} style={{ color: secondaryTextColor(config.textColor, 'b3') }}>
          {config.subtitle}
        </p>
      )}

      {useGroups ? (
        <div className="max-w-3xl mx-auto">
          {groups.map((group, index) => (
            <DetailGroup key={index} group={group} appearance={appearance} config={config} styles={styles} isFirst={index === 0} />
          ))}
        </div>
      ) : (
        <motion.div
          {...CARD_REVEAL}
          className={cn(
            'relative flex flex-col w-full max-w-lg border overflow-hidden',
            cardPosition,
            glassBlurClass(config),
            styles.card
          )}
          style={{ ...glassStyle(config), boxShadow: 'inset 0 1px 0 rgba(255,255,255,0.06), inset 0 -1px 0 rgba(0,0,0,0.3)' }}
        >
          <div className="absolute top-0 inset-x-0 h-[2px]" style={{ background: appearance.primaryColor }} />

          <div className="flex flex-col sm:flex-row items-center justify-center gap-5 sm:gap-8 px-8 py-7">
            <div className="flex flex-col items-center shrink-0">
              <span className="text-[11px] uppercase tracking-[0.2em] text-white/50">{weekday}</span>
              <span className="text-5xl font-bold leading-none my-1" style={{ color: appearance.primaryColor }}>
                {day}
              </span>
              <span className="text-sm uppercase tracking-widest text-white/70">{month}</span>
            </div>

            <div className="hidden sm:block w-px self-stretch bg-white/10" />
            <div className="sm:hidden w-12 h-px bg-white/10" />

            <div className="flex flex-col items-center sm:items-start text-center sm:text-left gap-1">
              <p className="text-white/90 font-medium flex items-center gap-2">
                <Clock className="w-4 h-4 shrink-0" style={{ color: appearance.primaryColor }} />
                {formattedTime} hs
              </p>
              {config.description && (
                <p className={`mt-1 max-w-sm ${bodySize}`} style={{ color: secondaryTextColor(config.textColor, '99') }}>
                  {config.description}
                </p>
              )}
            </div>
          </div>

          {details.length > 0 && (
            <div className="w-full border-t border-white/10 px-6 sm:px-8 py-5 grid sm:grid-cols-2 gap-x-6 gap-y-4 text-left">
              {details.map((detail, index) => {
                const Icon = resolveIcon(detail.icon, detail.label)
                return (
                  <div key={index} className="flex items-start gap-3">
                    <AnimatedIcon
                      icon={Icon}
                      delay={index * 0.05}
                      className="w-8 h-8 rounded-full flex items-center justify-center shrink-0"
                      style={{ background: `${appearance.primaryColor}22`, color: appearance.primaryColor }}
                      iconClassName="w-4 h-4"
                    />
                    <div>
                      {detail.label && <p className="text-sm font-semibold text-white/90">{detail.label}</p>}
                      {detail.text && (
                        <p className={bodySize} style={{ color: secondaryTextColor(config.textColor, '99') }}>
                          {detail.text}
                        </p>
                      )}
                    </div>
                  </div>
                )
              })}
            </div>
          )}
        </motion.div>
      )}
    </section>
  )
}

export default EventDetail

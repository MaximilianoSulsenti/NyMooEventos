import { motion } from 'motion/react'
import { CalendarHeart } from 'lucide-react'

function EventDetail({ event, config, appearance, styles }) {
  const eventDate = new Date(event.date)
  const formattedDate = eventDate.toLocaleDateString('es-ES', {
    weekday: 'long',
    day: 'numeric',
    month: 'long',
    year: 'numeric',
  })
  const formattedTime = eventDate.toLocaleTimeString('es-ES', { hour: '2-digit', minute: '2-digit' })
  const bodySize = config.fontSizeBody || 'text-base'
  const alignment = config.alignment || 'text-center'

  return (
    <section className={`px-6 ${styles.fontClass} ${alignment}`}>
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        whileInView={{ opacity: 1, y: 0 }}
        viewport={{ once: true }}
        transition={{ duration: 0.5 }}
        className={`inline-flex flex-col items-center gap-2 bg-white/5 border border-white/10 shadow-xl backdrop-blur-sm px-8 py-6 mx-auto ${styles.card}`}
      >
        <CalendarHeart className="w-6 h-6" style={{ color: appearance.primaryColor }} />
        <p className="text-white/90 capitalize font-medium">{formattedDate}</p>
        <p className="text-white/60">{formattedTime} hs</p>
        {config.description && (
          <p className={`text-white/70 mt-2 max-w-md ${bodySize}`}>{config.description}</p>
        )}
      </motion.div>
    </section>
  )
}

export default EventDetail

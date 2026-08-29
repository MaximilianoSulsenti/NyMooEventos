import { motion } from 'motion/react'
import Hero from './Hero'
import Countdown from './Countdown'
import EventDetail from './EventDetail'
import Story from './Story'
import Gallery from './Gallery'
import LiveGallery from './LiveGallery'
import DigitalAlbumButton from './DigitalAlbumButton'
import Location from './Location'
import RSVPSection from './RSVPSection'
import GiftRegistry from './GiftRegistry'
import SalonCarrousel from './SalonCarrousel'
import Info from './Info'
import MusicPlaylist from './MusicPlaylist'
import InstagramSection from './InstagramSection'
import Timeline from './Timeline'
import Footer from './Footer'
import { getThemeStyles } from './theming'

const SECTION_COMPONENTS = {
  Hero,
  Countdown,
  EventDetail,
  Story,
  Gallery,
  LiveGallery,
  DigitalAlbumButton,
  Location,
  RSVP: RSVPSection,
  GiftRegistry,
  SalonCarrousel,
  Info,
  MusicPlaylist,
  InstagramSection,
  Timeline,
  Footer,
}

function SectionRenderer({ event }) {
  const appearance = event.appearance || {}
  const styles = getThemeStyles(appearance.theme, appearance.fontFamily)

  const sections = [...(event.sections || [])]
    .filter((section) => section.enabled)
    .sort((a, b) => a.order - b.order)

  return (
    <>
      {sections.map((section, index) => {
        const Component = SECTION_COMPONENTS[section.id]
        if (!Component) return null

        const config = section.config || {}
        // Antes, con el fondo global activo, el fondo propio de CADA
        // sección se ignoraba sin excepción -- si alguien elegía a
        // propósito una imagen distinta para una sección puntual, no se
        // veía. Ahora el fondo propio de la sección (si lo eligieron) gana
        // siempre, esté o no activo el fondo global -- elegirlo a mano es
        // una señal explícita de querer eso ahí.
        const hasBgImage = config.bgType === 'imagen' && config.bgImageUrl

        return (
          <motion.div
            key={section.id}
            initial={{ opacity: 0, y: 30 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true, margin: '-100px' }}
            transition={{ duration: 0.6 }}
            className={`relative ${index > 0 ? 'bg-black/5' : ''} ${styles.sectionWrapper}`}
          >
            {hasBgImage && (
              <div
                className="absolute inset-0 bg-cover pointer-events-none"
                style={{
                  backgroundImage: `url(${config.bgImageUrl})`,
                  backgroundPosition: config.bgPosition || 'center',
                  opacity: (config.bgOpacity ?? 100) / 100,
                }}
              />
            )}
            <div className="relative z-10">
              <Component event={event} config={config} appearance={appearance} styles={styles} />
            </div>
          </motion.div>
        )
      })}
    </>
  )
}

export default SectionRenderer

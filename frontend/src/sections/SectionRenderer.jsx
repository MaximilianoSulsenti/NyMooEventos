import Hero from './Hero'
import Countdown from './Countdown'
import EventDetail from './EventDetail'
import Story from './Story'
import Gallery from './Gallery'
import Location from './Location'
import RSVPSection from './RSVPSection'
import SalonCarrousel from './SalonCarrousel'
import Info from './Info'
import MusicPlaylist from './MusicPlaylist'
import Timeline from './Timeline'
import Footer from './Footer'
import { getThemeStyles } from './theming'

const SECTION_COMPONENTS = {
  Hero,
  Countdown,
  EventDetail,
  Story,
  Gallery,
  Location,
  RSVP: RSVPSection,
  SalonCarrousel,
  Info,
  MusicPlaylist,
  Timeline,
  Footer,
}

function SectionRenderer({ event }) {
  const appearance = event.appearance || {}
  const styles = getThemeStyles(appearance.theme)

  const sections = [...(event.sections || [])]
    .filter((section) => section.enabled)
    .sort((a, b) => a.order - b.order)

  return (
    <>
      {sections.map((section) => {
        const Component = SECTION_COMPONENTS[section.id]
        if (!Component) return null

        const config = section.config || {}
        const hasBgImage = config.bgType === 'imagen' && config.bgImageUrl

        return (
          <div key={section.id} className={`relative ${styles.sectionWrapper}`}>
            {hasBgImage && (
              <div
                className="absolute inset-0 bg-cover bg-center pointer-events-none"
                style={{ backgroundImage: `url(${config.bgImageUrl})`, opacity: (config.bgOpacity ?? 100) / 100 }}
              />
            )}
            <div className="relative z-10">
              <Component event={event} config={config} appearance={appearance} styles={styles} />
            </div>
          </div>
        )
      })}
    </>
  )
}

export default SectionRenderer

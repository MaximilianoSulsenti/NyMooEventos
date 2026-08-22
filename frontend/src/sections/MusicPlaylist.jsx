import { Music2 } from 'lucide-react'
import { motion } from 'motion/react'
import Button from '../components/ui/Button'
import AnimatedIcon from '../components/AnimatedIcon'
import { glassStyle, glassBlurClass } from '../utils/glass'
import { cn } from '../utils/cn'

function toEmbedUrl(url) {
  try {
    const parsed = new URL(url)
    const host = parsed.hostname

    if (host.includes('spotify.com')) {
      const cleanPath = parsed.pathname.replace(/^\/(intl-\w+\/)?/, '/')
      return { src: `https://open.spotify.com/embed${cleanPath}?utm_source=generator&theme=0`, height: 152 }
    }

    if (host.includes('music.apple.com')) {
      return { src: url.replace('music.apple.com', 'embed.music.apple.com'), height: 175 }
    }

    if (host.includes('youtube.com') || host.includes('youtu.be')) {
      let videoId = parsed.searchParams.get('v')
      const listId = parsed.searchParams.get('list')
      if (host.includes('youtu.be')) videoId = parsed.pathname.slice(1)
      if (videoId) {
        return { src: `https://www.youtube.com/embed/${videoId}`, height: 200 }
      }
      if (listId) {
        return { src: `https://www.youtube.com/embed/videoseries?list=${listId}`, height: 200 }
      }
      return null
    }

    return null
  } catch {
    return null
  }
}

function MusicPlaylist({ config, appearance, styles }) {
  const url = config.playlistUrl
  if (!url) return null
  const embed = toEmbedUrl(url)
  const titleSize = config.fontSizeTitle || 'text-lg'
  const primaryColor = appearance?.primaryColor

  return (
    <section className={`px-6 ${styles.fontClass}`}>
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        whileInView={{ opacity: 1, y: 0 }}
        viewport={{ once: true }}
        transition={{ duration: 0.5 }}
        className={cn(
          'relative flex flex-col items-center gap-4 text-center border overflow-hidden mx-auto max-w-md px-6 py-8',
          glassBlurClass(config),
          styles.card
        )}
        style={{
          ...glassStyle(config),
          boxShadow: 'inset 0 1px 0 rgba(255,255,255,0.06), inset 0 -1px 0 rgba(0,0,0,0.3), 0 12px 30px -12px rgba(0,0,0,0.5)',
        }}
      >
        <div className="absolute top-0 inset-x-0 h-[2px]" style={{ background: primaryColor }} />

        <AnimatedIcon
          icon={Music2}
          className="w-11 h-11 rounded-full flex items-center justify-center"
          style={{ background: `${primaryColor}22`, color: primaryColor }}
          iconClassName="w-5 h-5"
        />

        <h2 className={`${titleSize} ${styles.heading}`} style={{ color: config.textColor || undefined }}>
          {config.title || 'Playlist del evento'}
        </h2>

        {embed ? (
          <div className="w-full overflow-hidden rounded-xl shadow-lg">
            <iframe
              src={embed.src}
              width="100%"
              height={embed.height}
              style={{ border: 0 }}
              allow="autoplay; clipboard-write; encrypted-media; fullscreen; picture-in-picture"
              loading="lazy"
              title="Playlist del evento"
            />
          </div>
        ) : (
          <Button as="a" href={url} target="_blank" rel="noreferrer" primaryColor={primaryColor}>
            Escuchar playlist
          </Button>
        )}
      </motion.div>
    </section>
  )
}

export default MusicPlaylist

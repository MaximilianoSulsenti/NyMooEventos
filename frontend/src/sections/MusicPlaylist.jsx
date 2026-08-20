import { Music2 } from 'lucide-react'
import Button from '../components/ui/Button'

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

  return (
    <section className={`text-center px-6 ${styles.fontClass}`}>
      <h2
        className={`${titleSize} mb-4 flex items-center justify-center gap-2 ${styles.heading}`}
        style={{ color: config.textColor || undefined }}
      >
        <Music2 className="w-5 h-5" />
        {config.title || 'Playlist del evento'}
      </h2>

      {embed ? (
        <div className={`max-w-md mx-auto overflow-hidden shadow-xl ${styles.card}`}>
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
        <Button as="a" href={url} target="_blank" rel="noreferrer" primaryColor={appearance.primaryColor}>
          Escuchar playlist
        </Button>
      )}
    </section>
  )
}

export default MusicPlaylist

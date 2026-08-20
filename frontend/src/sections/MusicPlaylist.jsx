import { Music2 } from 'lucide-react'

function toSpotifyEmbedUrl(url) {
  try {
    const parsed = new URL(url)
    if (!parsed.hostname.includes('spotify.com')) return null
    const cleanPath = parsed.pathname.replace(/^\/(intl-\w+\/)?/, '/')
    return `https://open.spotify.com/embed${cleanPath}?utm_source=generator&theme=0`
  } catch {
    return null
  }
}

function MusicPlaylist({ config, styles }) {
  if (!config.spotifyUrl) return null
  const embedUrl = toSpotifyEmbedUrl(config.spotifyUrl)
  const titleSize = config.fontSizeTitle || 'text-lg'

  return (
    <section className={`text-center px-6 ${styles.fontClass}`}>
      <h2 className={`${titleSize} mb-4 flex items-center justify-center gap-2 ${styles.heading}`}>
        <Music2 className="w-5 h-5" />
        {config.title || 'Playlist del evento'}
      </h2>

      {embedUrl ? (
        <div className={`max-w-md mx-auto overflow-hidden shadow-xl ${styles.card}`}>
          <iframe
            src={embedUrl}
            width="100%"
            height="152"
            style={{ border: 0 }}
            allow="autoplay; clipboard-write; encrypted-media; fullscreen; picture-in-picture"
            loading="lazy"
            title="Playlist de Spotify"
          />
        </div>
      ) : (
        <a
          href={config.spotifyUrl}
          target="_blank"
          rel="noreferrer"
          className={`inline-block px-6 py-3 bg-white/10 font-medium ${styles.card}`}
        >
          Escuchar playlist
        </a>
      )}
    </section>
  )
}

export default MusicPlaylist

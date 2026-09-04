import { useState } from 'react'
import { Music2, Send, CheckCircle2 } from 'lucide-react'
import { motion, AnimatePresence } from 'motion/react'
import api from '../services/api'
import Button from '../components/ui/Button'
import AnimatedIcon from '../components/AnimatedIcon'
import { glassStyle, glassBlurClass } from '../utils/glass'
import { secondaryTextColor } from '../utils/color'
import { cn } from '../utils/cn'
import { CARD_REVEAL } from '../utils/motionPresets'

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

function SongRequestForm({ eventSlug, primaryColor, config }) {
  const [name, setName] = useState('')
  const [song, setSong] = useState('')
  const [status, setStatus] = useState('idle') // idle | sending | success | error
  const [errorMessage, setErrorMessage] = useState('')

  // Antes esta tarjeta usaba bg-white/5 + texto blanco fijo -- se veía bien
  // en la mayoría de los temas (fondo oscuro) pero se volvía casi invisible
  // si el organizador elegía un fondo claro, porque un 5% de blanco sobre
  // blanco no se nota. Derivando el tinte del propio color de texto elegido
  // (en vez de blanco fijo) queda igual que antes cuando nadie lo toca, y
  // se ajusta solo con cualquier color que se elija.
  const textColor = config?.textColor || '#ffffff'
  const inputStyle = { color: textColor, background: `${textColor}0d`, borderColor: `${textColor}26` }

  async function handleSubmit(e) {
    e.preventDefault()
    if (!name.trim() || !song.trim()) return

    setStatus('sending')
    setErrorMessage('')
    try {
      await api.post('/guests/rsvp', {
        eventSlug,
        name: name.trim(),
        songRequest: song.trim(),
      })
      setStatus('success')
      setSong('')
    } catch (err) {
      setStatus('error')
      setErrorMessage(err.response?.data?.message || 'No se pudo enviar tu sugerencia')
    }
  }

  return (
    <div className="w-full pt-5 mt-5 border-t border-white/10" style={{ '--accent': primaryColor }}>
      <p className="text-sm mb-3" style={{ color: secondaryTextColor(textColor, 'b3') }}>
        ¿Qué canción no puede faltar en la fiesta? 🎶
      </p>

      <AnimatePresence mode="wait">
        {status === 'success' ? (
          <motion.p
            key="success"
            initial={{ opacity: 0, y: 6 }}
            animate={{ opacity: 1, y: 0 }}
            className="flex items-center justify-center gap-2 text-green-400 text-sm py-2"
          >
            <CheckCircle2 className="w-4 h-4 shrink-0" />
            ¡Gracias! La sumamos a la lista.
            <button
              type="button"
              onClick={() => setStatus('idle')}
              className="underline underline-offset-2 hover:brightness-125 ml-1"
              style={{ color: primaryColor }}
            >
              Sugerir otra
            </button>
          </motion.p>
        ) : (
          <motion.form
            key="form"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            onSubmit={handleSubmit}
            className="flex flex-col gap-2.5 w-full"
          >
            <input
              type="text"
              value={name}
              onChange={(e) => setName(e.target.value.slice(0, 40))}
              placeholder="Tu nombre"
              required
              style={inputStyle}
              className="w-full rounded-xl border px-3 py-2 text-sm outline-none transition-colors focus:border-[var(--accent)] focus:ring-2 focus:ring-[var(--accent)]/30"
            />
            <input
              type="text"
              value={song}
              onChange={(e) => setSong(e.target.value.slice(0, 150))}
              placeholder="Nombre de la canción o link de Spotify/YouTube"
              required
              style={inputStyle}
              className="w-full rounded-xl border px-3 py-2 text-sm outline-none transition-colors focus:border-[var(--accent)] focus:ring-2 focus:ring-[var(--accent)]/30"
            />
            {status === 'error' && <p className="text-red-400 text-xs">{errorMessage}</p>}
            <Button type="submit" disabled={status === 'sending'} primaryColor={primaryColor} className="w-full disabled:opacity-40">
              <Send className="w-4 h-4" />
              {status === 'sending' ? 'Enviando...' : 'Sugerir canción'}
            </Button>
          </motion.form>
        )}
      </AnimatePresence>
    </div>
  )
}

function MusicPlaylist({ event, config, appearance, styles }) {
  const url = config.playlistUrl
  const embed = url ? toEmbedUrl(url) : null
  const titleSize = config.fontSizeTitle || 'text-lg'
  const primaryColor = appearance?.primaryColor
  const canRequestSongs = Boolean(event?.activeModules?.guestControl)

  if (!url && !canRequestSongs) return null

  return (
    <section className={`px-6 ${styles.fontClass}`}>
      <motion.div
        {...CARD_REVEAL}
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
        {config.subtitle && (
          <p className="text-sm -mt-2" style={{ color: secondaryTextColor(config.textColor, 'b3') }}>
            {config.subtitle}
          </p>
        )}

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
          url && (
            <Button as="a" href={url} target="_blank" rel="noreferrer" primaryColor={primaryColor}>
              Escuchar playlist
            </Button>
          )
        )}

        {canRequestSongs && <SongRequestForm eventSlug={event.eventSlug} primaryColor={primaryColor} config={config} />}
      </motion.div>
    </section>
  )
}

export default MusicPlaylist

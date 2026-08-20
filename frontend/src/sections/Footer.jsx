import { Music2, Share2 } from 'lucide-react'

const ICONS_BY_KEYWORD = [
  { keyword: 'spotify', icon: Music2 },
  { keyword: 'tiktok', icon: Music2 },
]

function pickSocialIcon(label = '') {
  const normalized = label.toLowerCase()
  const match = ICONS_BY_KEYWORD.find((entry) => normalized.includes(entry.keyword))
  return match ? match.icon : Share2
}

function parseSocialLinks(raw = '') {
  return raw
    .split('\n')
    .map((line) => line.trim())
    .filter(Boolean)
    .map((line) => {
      const [label, url] = line.split('|').map((part) => part?.trim())
      return { label: label || 'Link', url: url || '#' }
    })
}

function Footer({ event, config, styles }) {
  const socialLinks = parseSocialLinks(config.socialLinks)

  return (
    <section className={`text-center px-6 py-10 ${styles.fontClass}`}>
      <p className="text-white/50 text-sm italic">
        {config.text || `Con cariño, esperamos verte en ${event.eventName}.`}
      </p>

      {socialLinks.length > 0 && (
        <div className="flex justify-center gap-4 mt-4">
          {socialLinks.map((link, index) => {
            const Icon = pickSocialIcon(link.label)
            return (
              <a
                key={index}
                href={link.url}
                target="_blank"
                rel="noreferrer"
                className="text-white/40 hover:text-white transition-colors"
                aria-label={link.label}
              >
                <Icon className="w-5 h-5" />
              </a>
            )
          })}
        </div>
      )}

      {config.signature && <p className="text-white/30 text-xs mt-6">{config.signature}</p>}
    </section>
  )
}

export default Footer

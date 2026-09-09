// Vercel Serverless Function -- SOLO se activa para rastreadores de redes
// sociales (WhatsApp/Facebook/Twitter/etc, ver vercel.json) leyendo el link
// de un evento (/evento/:slug y sus subpáginas). Antes, compartir CUALQUIER
// link de CUALQUIER evento mostraba siempre la tarjeta genérica de NyMoo
// (index.html tiene meta tags fijos) -- acá se arma una versión con los
// datos reales del evento (nombre, imagen y descripción que cargó el
// organizador en Apariencia), sin tocar en nada la experiencia de un
// visitante real, que sigue recibiendo el index.html de siempre.
//
// Cualquier error acá (backend caído, evento no encontrado, etc.) cae al
// index.html normal -- este archivo NUNCA debe ser la causa de que una
// invitación real deje de andar.

const CRAWLER_USER_AGENTS = [
  'facebookexternalhit',
  'facebot',
  'whatsapp',
  'twitterbot',
  'linkedinbot',
  'slackbot',
  'telegrambot',
  'discordbot',
  'pinterest',
  'redditbot',
  'skypeuripreview',
  'vkshare',
  'whatsapp',
  'googlebot',
  'bingbot',
  'w3c_validator',
]

function isCrawler(userAgent) {
  const ua = String(userAgent || '').toLowerCase()
  return CRAWLER_USER_AGENTS.some((pattern) => ua.includes(pattern))
}

function escapeHtml(value) {
  return String(value ?? '')
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;')
}

async function fetchNormalPage(origin) {
  const res = await fetch(`${origin}/index.html`)
  if (!res.ok) throw new Error(`index.html respondió ${res.status}`)
  return res.text()
}

export default async function handler(req, res) {
  const host = req.headers['x-forwarded-host'] || req.headers.host
  const protocol = req.headers['x-forwarded-proto'] || 'https'
  const origin = `${protocol}://${host}`

  try {
    const userAgent = req.headers['user-agent']

    if (!isCrawler(userAgent)) {
      const html = await fetchNormalPage(origin)
      res.setHeader('Content-Type', 'text/html; charset=utf-8')
      res.status(200).send(html)
      return
    }

    const slug = req.query.slug
    const rest = Array.isArray(req.query.rest) ? req.query.rest.join('/') : req.query.rest || ''
    const apiBase = process.env.VITE_API_URL || 'http://localhost:4000/api'

    let event = null
    try {
      const apiRes = await fetch(`${apiBase}/events/slug/${encodeURIComponent(slug)}`)
      if (apiRes.ok) event = await apiRes.json()
    } catch {
      event = null
    }

    if (!event) {
      const html = await fetchNormalPage(origin)
      res.setHeader('Content-Type', 'text/html; charset=utf-8')
      res.status(200).send(html)
      return
    }

    const eventName = event.eventName || 'Invitación digital'
    const shareImage = event.appearance?.shareImageUrl || `${origin}/img/og-image.png`
    const shareDescription =
      event.appearance?.shareDescription?.trim() ||
      'Los invitamos a celebrar con nosotros -- mirá todos los detalles acá.'
    const pageUrl = `${origin}/evento/${encodeURIComponent(slug)}${rest ? `/${rest}` : ''}`

    const html = `<!doctype html>
<html lang="es-AR">
<head>
<meta charset="UTF-8" />
<meta name="viewport" content="width=device-width, initial-scale=1.0" />
<title>${escapeHtml(eventName)}</title>
<meta name="description" content="${escapeHtml(shareDescription)}" />
<link rel="canonical" href="${escapeHtml(pageUrl)}" />
<meta property="og:type" content="website" />
<meta property="og:locale" content="es_AR" />
<meta property="og:site_name" content="NyMoo" />
<meta property="og:url" content="${escapeHtml(pageUrl)}" />
<meta property="og:title" content="${escapeHtml(eventName)}" />
<meta property="og:description" content="${escapeHtml(shareDescription)}" />
<meta property="og:image" content="${escapeHtml(shareImage)}" />
<meta property="og:image:width" content="1200" />
<meta property="og:image:height" content="630" />
<meta name="twitter:card" content="summary_large_image" />
<meta name="twitter:title" content="${escapeHtml(eventName)}" />
<meta name="twitter:description" content="${escapeHtml(shareDescription)}" />
<meta name="twitter:image" content="${escapeHtml(shareImage)}" />
</head>
<body>
<p>${escapeHtml(eventName)}</p>
</body>
</html>`

    res.setHeader('Content-Type', 'text/html; charset=utf-8')
    res.status(200).send(html)
  } catch {
    try {
      const html = await fetchNormalPage(origin)
      res.setHeader('Content-Type', 'text/html; charset=utf-8')
      res.status(200).send(html)
    } catch {
      res.status(500).send('Error interno')
    }
  }
}

import { siInstagram, siWhatsapp, siFacebook, siTiktok, siSpotify, siYoutube } from 'simple-icons'

// makeIcon se llama una sola vez, al cargar el módulo (no en cada render) --
// cada ícono exportado es una referencia de componente estable, así se
// puede pasar como prop `icon` a AnimatedIcon sin que React lo remonte en
// cada render (eso pasaba si se armara el componente al vuelo adentro de
// una función que se ejecuta durante el render).
function makeIcon(simpleIcon) {
  function BrandIcon({ className }) {
    return (
      <svg role="img" viewBox="0 0 24 24" className={className} fill="currentColor" aria-hidden="true">
        <path d={simpleIcon.path} />
      </svg>
    )
  }
  BrandIcon.displayName = simpleIcon.title
  return BrandIcon
}

export const InstagramIcon = makeIcon(siInstagram)
export const WhatsappIcon = makeIcon(siWhatsapp)
export const FacebookIcon = makeIcon(siFacebook)
export const TiktokIcon = makeIcon(siTiktok)
export const SpotifyIcon = makeIcon(siSpotify)
export const YoutubeIcon = makeIcon(siYoutube)

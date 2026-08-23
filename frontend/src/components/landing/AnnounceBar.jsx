import { BRAND } from '../../utils/brand'

function AnnounceBar() {
  return (
    <div
      className="w-full text-white text-xs md:text-sm py-2 text-center tracking-wide font-medium px-4"
      style={{ background: BRAND.night }}
    >
      ✨ Nymoo Eventos Digitales · Creamos y entregamos tu invitación digital interactiva en menos de 3 días ✨
    </div>
  )
}

export default AnnounceBar

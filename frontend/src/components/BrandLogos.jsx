const POSITION_CLASSES = {
  'top-left': 'top-4 left-4',
  'top-right': 'top-4 right-4',
  'bottom-left': 'bottom-4 left-4',
  'bottom-right': 'bottom-4 right-4',
}

function BrandLogo({ brand }) {
  if (!brand?.enabled || !brand.logoUrl) return null

  return (
    <img
      src={brand.logoUrl}
      alt=""
      // z-10: por encima del fondo (-z-10) y de contenido sin z-index propio
      // (ej. las fotos de la pantalla en vivo, donde sí debe verse encima como
      // una marca de agua), pero por detrás de las tarjetas de contenido
      // (GlassPanel usa z-20), para no tapar botones ni texto en mobile.
      className={`fixed z-10 pointer-events-none drop-shadow-lg ${POSITION_CLASSES[brand.position] || POSITION_CLASSES['bottom-right']}`}
      style={{
        width: brand.size || 64,
        maxWidth: '22vw',
        maxHeight: '22vw',
        opacity: (brand.opacity ?? 60) / 100,
      }}
    />
  )
}

function BrandLogos({ branding }) {
  if (!branding) return null

  return (
    <>
      <BrandLogo brand={branding.myBrand} />
      <BrandLogo brand={branding.clientBrand} />
    </>
  )
}

export default BrandLogos

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
      className={`fixed z-40 pointer-events-none drop-shadow-lg ${POSITION_CLASSES[brand.position] || POSITION_CLASSES['bottom-right']}`}
      style={{ width: brand.size || 64, opacity: (brand.opacity ?? 60) / 100 }}
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

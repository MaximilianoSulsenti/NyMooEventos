import { BRAND } from '../utils/brand'

function PageBackground({ settings }) {
  if (!settings) return null

  return (
    <div className="fixed inset-0 -z-10" style={{ backgroundColor: settings.bgColor || BRAND.night }}>
      {settings.bgType === 'image' && settings.bgImageUrl && (
        <div
          className="absolute inset-0 bg-cover bg-center bg-no-repeat"
          style={{ backgroundImage: `url("${settings.bgImageUrl}")`, opacity: (settings.bgOpacity ?? 100) / 100 }}
        />
      )}
    </div>
  )
}

export default PageBackground

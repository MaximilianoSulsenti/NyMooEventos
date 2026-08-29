function GlobalBackground({ appearance, fixed = true }) {
  const { globalBgType, globalBgUrl, globalBgOpacity, globalBgGradient, backgroundColor } = appearance

  // El z-index negativo solo hace falta en la página pública (fixed=true),
  // donde este div escapa del flujo normal y necesita ir detrás de
  // cualquier otra cosa fija/absoluta que exista en la página. En el
  // editor (fixed=false) esto se renderiza como el primer hijo, ANTES que
  // SectionRenderer, adentro de un panel con su propio scroll -- el orden
  // normal del DOM ya lo deja detrás del contenido sin necesitar z-index,
  // y ese z-index negativo ahí adentro podía terminar escondiéndolo detrás
  // de una capa sin altura definida (el panel de preview usa max-height,
  // no height, así que un min-height:100% ahí no siempre resuelve bien).
  return (
    <div
      className={`${fixed ? 'fixed -z-10' : 'absolute'} inset-0 w-full h-full`}
      style={{ backgroundColor: backgroundColor || '#0a0a0a' }}
    >
      {globalBgType === 'image' && globalBgUrl && (
        <div
          className="absolute inset-0 bg-cover bg-center"
          style={{ backgroundImage: `url(${globalBgUrl})`, opacity: (globalBgOpacity ?? 100) / 100 }}
        />
      )}
      {globalBgType === 'video' && globalBgUrl && (
        <video
          src={globalBgUrl}
          autoPlay
          muted
          loop
          playsInline
          className="absolute inset-0 w-full h-full object-cover"
          style={{ opacity: (globalBgOpacity ?? 100) / 100 }}
        />
      )}
      {globalBgGradient && <div className={`absolute inset-0 bg-gradient-to-b ${globalBgGradient}`} />}
    </div>
  )
}

export default GlobalBackground

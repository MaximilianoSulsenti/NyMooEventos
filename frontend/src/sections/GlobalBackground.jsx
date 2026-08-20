function GlobalBackground({ appearance, fixed = true }) {
  const { globalBgType, globalBgUrl, globalBgOpacity, globalBgGradient, backgroundColor } = appearance

  return (
    <div
      className={`${fixed ? 'fixed' : 'absolute'} inset-0 w-full h-full -z-10`}
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

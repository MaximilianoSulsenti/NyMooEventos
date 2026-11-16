import { useState } from 'react'
import { useParams } from 'react-router-dom'
import { Heart, Sparkles, Grid3x3, Layers } from 'lucide-react'
import PageBackground from '../components/PageBackground'
import GlassPanel from '../components/ui/GlassPanel'
import useWeddingMatch from '../hooks/useWeddingMatch'
import MatchOnboarding from '../components/weddingMatch/MatchOnboarding'
import MatchGrid from '../components/weddingMatch/MatchGrid'
import SwipeDeck from '../components/weddingMatch/SwipeDeck'
import MyMatchesList from '../components/weddingMatch/MyMatchesList'
import MyProfilePanel from '../components/weddingMatch/MyProfilePanel'
import MatchTabBar from '../components/weddingMatch/MatchTabBar'
import MatchCelebration from '../components/weddingMatch/MatchCelebration'
import { MatchLoading, MatchModuleOff, MatchBlocked, MatchError } from '../components/weddingMatch/MatchStateScreens'
import { getThemeStyles } from '../sections/theming'

// Mismo híbrido de tema que UploadPage.jsx: el fondo/tipografía siguen al
// evento real (para que se sienta parte DE esa boda, no una herramienta
// genérica de Nymoo), pero todo el contenido vive dentro del GlassPanel
// oscuro de siempre -- así no hace falta que cada componente nuevo sea
// theme-aware por su cuenta.
function WeddingMatch() {
  const { eventSlug } = useParams()
  const [tab, setTab] = useState('grid')
  const [discoverMode, setDiscoverMode] = useState('swipe')
  const match = useWeddingMatch(eventSlug)

  if (match.phase === 'loading') return <MatchLoading />
  if (match.phase === 'module-off') return <MatchModuleOff />
  if (match.phase === 'error') return <MatchError />

  const styles = getThemeStyles(match.event?.uploadPageSettings?.theme)
  const primaryColor = match.event?.appearance?.primaryColor || '#e8b34f'
  const eventName = match.event?.eventName || 'la boda'

  if (match.phase === 'blocked') {
    return (
      <div className={`relative min-h-screen w-full overflow-x-hidden ${styles.fontClass}`}>
        <PageBackground settings={match.event?.uploadPageSettings} />
        <MatchBlocked />
      </div>
    )
  }

  if (match.phase === 'onboarding') {
    return (
      <div
        className={`relative min-h-screen w-full overflow-x-hidden flex items-center justify-center px-4 sm:px-6 py-10 ${styles.fontClass}`}
      >
        <PageBackground settings={match.event?.uploadPageSettings} />
        <GlassPanel accentColor={primaryColor} className="w-full max-w-md px-6 py-8 sm:px-8 sm:py-9">
          <MatchOnboarding
            eventName={eventName}
            participants={match.stats.participants}
            primaryColor={primaryColor}
            onSubmit={match.createProfile}
          />
        </GlassPanel>
      </div>
    )
  }

  // phase === 'ready'
  return (
    <div className={`relative min-h-screen w-full overflow-x-hidden flex flex-col ${styles.fontClass}`}>
      <PageBackground settings={match.event?.uploadPageSettings} />

      <div className="relative z-10 flex items-center justify-between gap-3 px-4 sm:px-6 py-3 border-b border-white/10 bg-black/20 backdrop-blur-sm">
        <div className="flex items-center gap-2">
          <Heart className="w-4 h-4" style={{ color: primaryColor }} />
          <p className="text-white font-semibold text-sm">Wedding Match</p>
        </div>
        <p className="flex items-center gap-1 text-white/40 text-xs">
          <Sparkles className="w-3 h-3" style={{ color: primaryColor }} />
          {match.stats.participants} participando
        </p>
      </div>

      <div className="relative z-10 flex-1 px-4 sm:px-6 py-5 max-w-lg w-full mx-auto">
        {tab === 'grid' && (
          <div className="flex flex-col gap-4">
            <div className="flex items-center justify-center gap-1 p-1 rounded-full bg-white/5 border border-white/10 w-fit mx-auto">
              <button
                type="button"
                onClick={() => setDiscoverMode('swipe')}
                className="flex items-center gap-1.5 px-3 py-1.5 rounded-full text-xs font-medium transition"
                style={discoverMode === 'swipe' ? { background: primaryColor, color: '#111' } : { color: 'rgba(255,255,255,0.5)' }}
              >
                <Layers className="w-3.5 h-3.5" />
                Swipe
              </button>
              <button
                type="button"
                onClick={() => setDiscoverMode('grid')}
                className="flex items-center gap-1.5 px-3 py-1.5 rounded-full text-xs font-medium transition"
                style={discoverMode === 'grid' ? { background: primaryColor, color: '#111' } : { color: 'rgba(255,255,255,0.5)' }}
              >
                <Grid3x3 className="w-3.5 h-3.5" />
                Grilla
              </button>
            </div>

            {discoverMode === 'swipe' ? (
              <SwipeDeck grid={match.grid} loading={match.gridLoading} primaryColor={primaryColor} onLike={match.likeProfile} onPass={match.passProfile} />
            ) : (
              <MatchGrid grid={match.grid} loading={match.gridLoading} primaryColor={primaryColor} onLike={match.likeProfile} onPass={match.passProfile} />
            )}
          </div>
        )}
        {tab === 'matches' && (
          <MyMatchesList matches={match.matches} loading={match.matchesLoading} myName={match.profile?.name} eventName={eventName} primaryColor={primaryColor} />
        )}
        {tab === 'profile' && match.profile && (
          <MyProfilePanel profile={match.profile} primaryColor={primaryColor} onUpdate={match.updateProfile} onDelete={match.deleteProfile} />
        )}
      </div>

      <div className="relative z-10">
        <MatchTabBar active={tab} onChange={setTab} primaryColor={primaryColor} matchesCount={match.matches.length} />
      </div>

      <MatchCelebration
        myName={match.profile?.name}
        myPhotoUrl={match.profile?.photoUrl}
        eventName={eventName}
        match={match.celebration}
        primaryColor={primaryColor}
        onClose={match.dismissCelebration}
      />
    </div>
  )
}

export default WeddingMatch

import { useState } from 'react'
import { useParams } from 'react-router-dom'
import { Heart, Sparkles, Grid3x3, Layers } from 'lucide-react'
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
import { MATCH_ACCENT } from '../utils/weddingMatch'

const primaryColor = MATCH_ACCENT.violet

// A diferencia de UploadPage.jsx/DigitalCard.jsx (que siguen el tema del
// evento a propósito), acá el fondo/color NUNCA depende del evento: es la
// identidad propia de Wedding Match -- negro con violeta y rosa, como
// cualquier app de citas -- así se lee igual de bien pase lo que pase con
// la temática/paleta que haya elegido la boda (clara, oscura, pastel...).
function MatchBackground() {
  return (
    <>
      <div className="fixed inset-0 -z-20" style={{ background: MATCH_ACCENT.bg }} />
      <div
        className="fixed -top-24 -left-24 w-80 h-80 rounded-full blur-[90px] -z-10"
        style={{ background: MATCH_ACCENT.violet, opacity: 0.22 }}
      />
      <div
        className="fixed -bottom-24 -right-16 w-96 h-96 rounded-full blur-[100px] -z-10"
        style={{ background: MATCH_ACCENT.pink, opacity: 0.2 }}
      />
    </>
  )
}

function WeddingMatch() {
  const { eventSlug } = useParams()
  const [tab, setTab] = useState('grid')
  const [discoverMode, setDiscoverMode] = useState('swipe')
  const match = useWeddingMatch(eventSlug)

  if (match.phase === 'loading') return <MatchLoading />
  if (match.phase === 'module-off') return <MatchModuleOff />
  if (match.phase === 'error') return <MatchError />

  const eventName = match.event?.eventName || 'la boda'

  if (match.phase === 'blocked') {
    return (
      <div className="relative min-h-screen w-full overflow-x-hidden font-sans">
        <MatchBackground />
        <MatchBlocked />
      </div>
    )
  }

  if (match.phase === 'onboarding') {
    return (
      <div className="relative min-h-screen w-full overflow-x-hidden flex items-center justify-center px-4 sm:px-6 py-10 font-sans">
        <MatchBackground />
        <GlassPanel accentColor={MATCH_ACCENT.gradient} className="w-full max-w-md px-6 py-8 sm:px-8 sm:py-9 !bg-neutral-950">
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
    <div className="relative min-h-screen w-full overflow-x-hidden flex flex-col font-sans">
      <MatchBackground />

      <div className="relative z-10 flex items-center justify-between gap-3 px-4 sm:px-6 py-3 border-b border-white/10 bg-black/70 backdrop-blur-md">
        <div className="flex items-center gap-2">
          <Heart className="w-4 h-4" style={{ color: MATCH_ACCENT.pink }} />
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
                style={discoverMode === 'swipe' ? { background: MATCH_ACCENT.gradient, color: '#fff' } : { color: 'rgba(255,255,255,0.5)' }}
              >
                <Layers className="w-3.5 h-3.5" />
                Swipe
              </button>
              <button
                type="button"
                onClick={() => setDiscoverMode('grid')}
                className="flex items-center gap-1.5 px-3 py-1.5 rounded-full text-xs font-medium transition"
                style={discoverMode === 'grid' ? { background: MATCH_ACCENT.gradient, color: '#fff' } : { color: 'rgba(255,255,255,0.5)' }}
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
        onClose={match.dismissCelebration}
      />
    </div>
  )
}

export default WeddingMatch

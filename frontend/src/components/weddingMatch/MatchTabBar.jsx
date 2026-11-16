import { Grid3x3, HeartHandshake, UserCircle2 } from 'lucide-react'

const TABS = [
  { key: 'grid', label: 'Descubrir', icon: Grid3x3 },
  { key: 'matches', label: 'Matches', icon: HeartHandshake },
  { key: 'profile', label: 'Mi perfil', icon: UserCircle2 },
]

function MatchTabBar({ active, onChange, primaryColor, matchesCount }) {
  return (
    <div className="sticky bottom-0 inset-x-0 flex items-stretch bg-black/40 backdrop-blur-lg border-t border-white/10 pb-[env(safe-area-inset-bottom)]">
      {TABS.map(({ key, label, icon: Icon }) => {
        const isActive = active === key
        return (
          <button
            key={key}
            type="button"
            onClick={() => onChange(key)}
            className="relative flex-1 flex flex-col items-center gap-0.5 py-2.5 text-xs transition"
            style={{ color: isActive ? primaryColor : 'rgba(255,255,255,0.45)' }}
          >
            <Icon className="w-5 h-5" />
            {label}
            {key === 'matches' && matchesCount > 0 && (
              <span
                className="absolute top-1.5 right-[calc(50%-22px)] w-4 h-4 rounded-full flex items-center justify-center text-[9px] font-bold text-white"
                style={{ background: primaryColor }}
              >
                {matchesCount}
              </span>
            )}
          </button>
        )
      })}
    </div>
  )
}

export default MatchTabBar

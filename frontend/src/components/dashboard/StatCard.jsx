import { motion } from 'motion/react'

function StatCard({ label, value, accent = 'text-white', icon: Icon, iconColor, delay = 0 }) {
  return (
    <motion.div
      initial={{ opacity: 0, y: 12 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.4, delay }}
      className="rounded-2xl bg-white/5 border border-white/10 p-5 flex items-center gap-4"
    >
      {Icon && (
        <span
          className="w-10 h-10 rounded-full flex items-center justify-center shrink-0"
          style={{ background: `${iconColor}22`, color: iconColor }}
        >
          <Icon className="w-5 h-5" />
        </span>
      )}
      <div>
        <p className="text-white/50 text-sm">{label}</p>
        <p className={`text-3xl font-semibold mt-0.5 ${accent}`}>{value}</p>
      </div>
    </motion.div>
  )
}

export default StatCard

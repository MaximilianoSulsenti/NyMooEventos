function StatCard({ label, value, accent = 'text-white' }) {
  return (
    <div className="rounded-xl bg-neutral-900 border border-white/10 p-5">
      <p className="text-neutral-400 text-sm">{label}</p>
      <p className={`text-3xl font-semibold mt-1 ${accent}`}>{value}</p>
    </div>
  )
}

export default StatCard

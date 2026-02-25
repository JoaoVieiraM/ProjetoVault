import { MOMENT_CONFIG } from '../hooks/useMarketMoment'

export function MarketBadge({ status }) {
  const config = MOMENT_CONFIG[status]
  if (!config) return null

  return (
    <span className={`inline-flex items-center gap-2 px-3 py-1 rounded-full border text-sm font-semibold ${config.color}`}>
      {config.emoji} {config.label}
    </span>
  )
}

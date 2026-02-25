import { useState, useEffect } from 'react'
import { supabase } from '../lib/supabase'
import { getAporteConfig } from '../lib/api'

export const MOMENT_CONFIG = {
  ÓTIMO:   { emoji: '🟢', label: 'ÓTIMO',   color: 'text-green-400  bg-green-400/10  border-green-400/30' },
  BOM:     { emoji: '🟡', label: 'BOM',     color: 'text-yellow-400 bg-yellow-400/10 border-yellow-400/30' },
  OK:      { emoji: '🟠', label: 'OK',      color: 'text-orange-400 bg-orange-400/10 border-orange-400/30' },
  RUIM:    { emoji: '🔴', label: 'RUIM',    color: 'text-red-400    bg-red-400/10    border-red-400/30' },
  PÉSSIMO: { emoji: '⚫', label: 'PÉSSIMO', color: 'text-zinc-400   bg-zinc-400/10   border-zinc-400/30' },
}

export function useMarketMoment() {
  const [moment, setMoment] = useState(null)
  const [aporteConfig, setAporteConfig] = useState({})
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    // Fetch initial moment and config
    Promise.all([
      supabase.from('market_moment').select('*').single(),
      getAporteConfig(),
    ]).then(([{ data: momentData }, configData]) => {
      if (momentData) setMoment(momentData)
      if (configData) {
        const map = {}
        configData.forEach(row => { map[row.moment_status] = row.percentage_increase })
        setAporteConfig(map)
      }
      setLoading(false)
    })

    // Realtime subscription for market_moment changes
    const channel = supabase
      .channel('market_moment_changes')
      .on('postgres_changes', { event: 'UPDATE', schema: 'public', table: 'market_moment' }, payload => {
        setMoment(payload.new)
      })
      .subscribe()

    return () => supabase.removeChannel(channel)
  }, [])

  const percentageIncrease = moment ? (aporteConfig[moment.status] ?? 0) : 0

  return { moment, aporteConfig, percentageIncrease, loading }
}

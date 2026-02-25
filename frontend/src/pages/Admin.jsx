import { useState, useEffect } from 'react'
import { useNavigate } from 'react-router-dom'
import { useAuth } from '../hooks/useAuth'
import { MarketBadge } from '../components/MarketBadge'
import { getAporteConfig, updateMarketMoment, updateAporteConfig } from '../lib/api'
import { supabase } from '../lib/supabase'

const STATUSES = ['ÓTIMO', 'BOM', 'OK', 'RUIM', 'PÉSSIMO']

export function Admin() {
  const { session, signOut } = useAuth()
  const navigate = useNavigate()

  const [currentMoment, setCurrentMoment] = useState(null)
  const [configs, setConfigs] = useState({})
  const [saving, setSaving] = useState(false)
  const [message, setMessage] = useState('')

  useEffect(() => {
    Promise.all([
      supabase.from('market_moment').select('*').single(),
      getAporteConfig(),
    ]).then(([{ data: momentData }, configData]) => {
      if (momentData) setCurrentMoment(momentData.status)
      if (configData) {
        const map = {}
        configData.forEach(row => { map[row.moment_status] = row.percentage_increase })
        setConfigs(map)
      }
    })
  }, [])

  async function handleSetMoment(status) {
    setSaving(true)
    setMessage('')
    try {
      await updateMarketMoment(session.access_token, status)
      setCurrentMoment(status)
      setMessage(`Momento atualizado para ${status}`)
    } catch (e) {
      setMessage(`Erro: ${e.message}`)
    } finally {
      setSaving(false)
    }
  }

  async function handleSaveConfigs() {
    setSaving(true)
    setMessage('')
    try {
      const list = STATUSES.map(s => ({
        moment_status: s,
        percentage_increase: Number(configs[s] ?? 0),
      }))
      await updateAporteConfig(session.access_token, list)
      setMessage('Percentuais salvos com sucesso!')
    } catch (e) {
      setMessage(`Erro: ${e.message}`)
    } finally {
      setSaving(false)
    }
  }

  return (
    <div className="min-h-screen bg-[#0a0a0a]">
      <header className="border-b border-[#1a1a1a] px-4 py-3 flex items-center justify-between">
        <div className="flex items-center gap-3">
          <button onClick={() => navigate('/')} className="text-zinc-500 hover:text-white transition-colors">
            ← Voltar
          </button>
          <span className="text-white font-semibold">Painel Admin</span>
        </div>
        <button onClick={signOut} className="text-zinc-500 text-sm hover:text-zinc-300">
          Sair
        </button>
      </header>

      <main className="max-w-lg mx-auto px-4 py-6 space-y-6">
        {/* Momento atual */}
        <div className="bg-[#111] border border-[#222] rounded-2xl p-5 space-y-4">
          <h2 className="text-white font-semibold">Momento de Mercado</h2>
          <div className="flex items-center gap-2 flex-wrap">
            <span className="text-zinc-400 text-sm">Atual:</span>
            {currentMoment && <MarketBadge status={currentMoment} />}
          </div>
          <div className="grid grid-cols-1 gap-2">
            {STATUSES.map(status => (
              <button
                key={status}
                disabled={saving || currentMoment === status}
                onClick={() => handleSetMoment(status)}
                className={`flex items-center gap-3 px-4 py-3 rounded-xl border text-sm font-medium transition-colors ${
                  currentMoment === status
                    ? 'border-[#f7931a] text-[#f7931a] bg-[#f7931a]/10'
                    : 'border-[#333] text-zinc-400 hover:border-[#555] hover:text-white'
                } disabled:opacity-50 disabled:cursor-not-allowed`}
              >
                <MarketBadge status={status} />
                {currentMoment === status && <span className="ml-auto text-xs text-zinc-500">atual</span>}
              </button>
            ))}
          </div>
        </div>

        {/* Percentuais por momento */}
        <div className="bg-[#111] border border-[#222] rounded-2xl p-5 space-y-4">
          <div>
            <h2 className="text-white font-semibold">Percentuais de Aporte</h2>
            <p className="text-zinc-500 text-xs mt-1">
              % de aumento sobre o valor base do usuário em cada momento.
            </p>
          </div>
          <div className="space-y-3">
            {STATUSES.map(status => (
              <div key={status} className="flex items-center gap-3">
                <MarketBadge status={status} />
                <div className="flex items-center gap-2 ml-auto">
                  <input
                    type="number"
                    min="-100"
                    max="500"
                    step="0.5"
                    value={configs[status] ?? 0}
                    onChange={e => setConfigs(c => ({ ...c, [status]: e.target.value }))}
                    className="w-20 bg-[#1a1a1a] border border-[#333] rounded-lg px-3 py-1.5 text-white text-sm text-right outline-none focus:border-[#f7931a]"
                  />
                  <span className="text-zinc-400 text-sm">%</span>
                </div>
              </div>
            ))}
          </div>
          <button
            onClick={handleSaveConfigs}
            disabled={saving}
            className="w-full bg-[#f7931a] text-black font-bold py-3 rounded-xl hover:bg-[#ffa733] disabled:opacity-50 transition-colors"
          >
            {saving ? 'Salvando...' : 'Salvar Percentuais'}
          </button>
        </div>

        {message && (
          <div className={`px-4 py-3 rounded-xl text-sm ${
            message.startsWith('Erro')
              ? 'bg-red-500/10 border border-red-500/30 text-red-400'
              : 'bg-green-500/10 border border-green-500/30 text-green-400'
          }`}>
            {message}
          </div>
        )}
      </main>
    </div>
  )
}

import { useState, useEffect } from 'react'
import { useAuth } from '../hooks/useAuth'
import { useBtcData } from '../hooks/useBtcData'
import { useMarketMoment } from '../hooks/useMarketMoment'
import { MarketBadge } from '../components/MarketBadge'
import { BalanceCard } from '../components/BalanceCard'
import { PlanCard } from '../components/PlanCard'
import { getUserSettings, updateUserSettings } from '../lib/api'

const WHATSAPP_NUMBER = '5500000000000' // ⚠️ PENDENTE: substituir pelo número real do p2p (formato: 55 + DDD + número)

function formatTime(date) {
  if (!date) return '--:--'
  return date.toLocaleTimeString('pt-BR', { hour: '2-digit', minute: '2-digit' })
}

function formatCurrency(value, currency) {
  if (value == null) return '---'
  return new Intl.NumberFormat('pt-BR', { style: 'currency', currency }).format(value)
}

export function Home() {
  const { user, session, signOut } = useAuth()
  const [settings, setSettings] = useState(null)
  const [loadingSettings, setLoadingSettings] = useState(true)

  const { btcPrice, brlRate, btcAmount, balanceBrl, balanceUsd, lastUpdated, error } =
    useBtcData(settings?.btc_public_key)
  const { moment, percentageIncrease } = useMarketMoment()

  // Load user settings on mount
  useEffect(() => {
    if (!session?.access_token) return
    getUserSettings(session.access_token)
      .then(setSettings)
      .catch(console.error)
      .finally(() => setLoadingSettings(false))
  }, [session])

  async function handleAddressChange(newAddress) {
    const updated = { ...settings, btc_public_key: newAddress }
    setSettings(updated)
    await updateUserSettings(session.access_token, { btc_public_key: newAddress })
  }

  async function handlePlanSave(newPlan) {
    const updated = { ...settings, ...newPlan }
    setSettings(updated)
    await updateUserSettings(session.access_token, {
      plan_frequency: newPlan.frequency,
      plan_day: newPlan.day,
      plan_amount: newPlan.amount,
    })
  }

  const plan = settings
    ? { frequency: settings.plan_frequency, day: settings.plan_day, amount: Number(settings.plan_amount) }
    : null

  const whatsappUrl = WHATSAPP_NUMBER
    ? `https://wa.me/${WHATSAPP_NUMBER.replace(/\D/g, '')}`
    : '#'

  return (
    <div className="min-h-screen bg-[#0a0a0a]">
      {/* Header */}
      <header className="border-b border-[#1a1a1a] px-4 py-3 flex items-center justify-between">
        <div>
          <span className="text-[#f7931a] font-bold text-lg">₿</span>
          <span className="text-white font-semibold ml-2">Bitcoin DCA</span>
        </div>
        <div className="flex items-center gap-3">
          {lastUpdated && (
            <span className="text-zinc-600 text-xs hidden sm:block">
              Atualizado às {formatTime(lastUpdated)}
            </span>
          )}
          <button
            onClick={signOut}
            className="text-zinc-500 text-sm hover:text-zinc-300 transition-colors"
          >
            Sair
          </button>
        </div>
      </header>

      {/* Main content */}
      <main className="max-w-lg mx-auto px-4 py-6 space-y-4">
        {error && (
          <div className="bg-red-500/10 border border-red-500/30 rounded-xl px-4 py-3 text-red-400 text-sm">
            Erro ao buscar dados: {error}
          </div>
        )}

        {/* BTC Price strip */}
        <div className="flex items-center justify-between text-sm px-1">
          <span className="text-zinc-500">Preço BTC</span>
          <div className="text-right">
            <span className="text-white font-medium">
              {formatCurrency(btcPrice, 'USD')}
            </span>
            {brlRate && btcPrice && (
              <span className="text-zinc-500 ml-2 text-xs">
                {formatCurrency(btcPrice * brlRate, 'BRL')}
              </span>
            )}
          </div>
        </div>

        {/* Momento atual */}
        <div className="bg-[#111] border border-[#222] rounded-2xl p-5 flex items-center justify-between">
          <div>
            <p className="text-zinc-400 text-sm mb-2">Momento Atual</p>
            {moment ? (
              <MarketBadge status={moment.status} />
            ) : (
              <span className="text-zinc-600 text-sm">Carregando...</span>
            )}
          </div>
          {moment?.updated_at && (
            <span className="text-zinc-600 text-xs text-right">
              Atualizado em<br />
              {new Date(moment.updated_at).toLocaleDateString('pt-BR')}
            </span>
          )}
        </div>

        {/* Saldo BTC */}
        {!loadingSettings && (
          <BalanceCard
            btcAmount={btcAmount}
            balanceBrl={balanceBrl}
            balanceUsd={balanceUsd}
            btcAddress={settings?.btc_public_key}
            onAddressChange={handleAddressChange}
          />
        )}

        {/* Plano de aporte */}
        {!loadingSettings && plan && (
          <PlanCard
            plan={plan}
            percentageIncrease={percentageIncrease}
            onSave={handlePlanSave}
          />
        )}

        {/* Botão COMPRAR AGORA */}
        <a
          href={whatsappUrl}
          target="_blank"
          rel="noopener noreferrer"
          className="flex items-center justify-center gap-3 w-full bg-green-500 hover:bg-green-400 text-white font-bold py-4 rounded-2xl transition-colors text-lg"
        >
          <svg viewBox="0 0 24 24" className="w-6 h-6 fill-current">
            <path d="M17.472 14.382c-.297-.149-1.758-.867-2.03-.967-.273-.099-.471-.148-.67.15-.197.297-.767.966-.94 1.164-.173.199-.347.223-.644.075-.297-.15-1.255-.463-2.39-1.475-.883-.788-1.48-1.761-1.653-2.059-.173-.297-.018-.458.13-.606.134-.133.298-.347.446-.52.149-.174.198-.298.298-.497.099-.198.05-.371-.025-.52-.075-.149-.669-1.612-.916-2.207-.242-.579-.487-.5-.669-.51-.173-.008-.371-.01-.57-.01-.198 0-.52.074-.792.372-.272.297-1.04 1.016-1.04 2.479 0 1.462 1.065 2.875 1.213 3.074.149.198 2.096 3.2 5.077 4.487.709.306 1.262.489 1.694.625.712.227 1.36.195 1.871.118.571-.085 1.758-.719 2.006-1.413.248-.694.248-1.289.173-1.413-.074-.124-.272-.198-.57-.347z"/>
            <path d="M12 0C5.373 0 0 5.373 0 12c0 2.127.558 4.121 1.529 5.847L.057 23.882l6.235-1.635A11.945 11.945 0 0012 24c6.627 0 12-5.373 12-12S18.627 0 12 0zm0 21.818a9.793 9.793 0 01-5.001-1.374l-.358-.214-3.714.974.991-3.624-.234-.373A9.796 9.796 0 012.182 12C2.182 6.573 6.573 2.182 12 2.182c5.427 0 9.818 4.391 9.818 9.818 0 5.427-4.391 9.818-9.818 9.818z"/>
          </svg>
          COMPRAR AGORA
        </a>
      </main>
    </div>
  )
}

import { useState } from 'react'

function fmt(value, currency) {
  if (value == null) return '---'
  return new Intl.NumberFormat('pt-BR', { style: 'currency', currency }).format(value)
}

export function BalanceCard({ btcAmount, balanceBrl, balanceUsd, btcAddress, onAddressChange }) {
  const [editing, setEditing] = useState(false)
  const [draft, setDraft] = useState(btcAddress || '')
  const [currency, setCurrency] = useState('BRL')

  function handleSave() {
    onAddressChange(draft.trim())
    setEditing(false)
  }

  return (
    <div className="bg-[#111] border border-[#222] rounded-2xl p-5 space-y-4">
      <div className="flex items-center justify-between">
        <span className="text-zinc-400 text-sm">Saldo BTC</span>
        <button
          onClick={() => setCurrency(c => c === 'BRL' ? 'USD' : 'BRL')}
          className="text-xs text-zinc-500 border border-[#333] px-2 py-0.5 rounded-full hover:border-[#555] transition-colors"
        >
          {currency === 'BRL' ? 'BRL → USD' : 'USD → BRL'}
        </button>
      </div>

      <div>
        <div className="text-3xl font-bold text-white">
          {currency === 'BRL' ? fmt(balanceBrl, 'BRL') : fmt(balanceUsd, 'USD')}
        </div>
        <div className="text-zinc-500 text-sm mt-1">
          {btcAmount != null ? `₿ ${btcAmount.toFixed(8)}` : '₿ ---'}
        </div>
      </div>

      <div className="flex items-center gap-2 text-sm">
        {editing ? (
          <>
            <input
              className="flex-1 bg-[#1a1a1a] border border-[#333] rounded-lg px-3 py-1.5 text-white text-xs outline-none focus:border-[#f7931a]"
              value={draft}
              onChange={e => setDraft(e.target.value)}
              placeholder="Endereço ou xpub BTC"
              autoFocus
            />
            <button onClick={handleSave} className="text-[#f7931a] font-medium hover:text-[#ffa733]">Salvar</button>
            <button onClick={() => setEditing(false)} className="text-zinc-500 hover:text-zinc-300">✕</button>
          </>
        ) : (
          <>
            <span className="text-zinc-500 truncate max-w-[200px]">
              {btcAddress || <span className="italic">Nenhum endereço</span>}
            </span>
            <button onClick={() => { setDraft(btcAddress || ''); setEditing(true) }} className="text-zinc-400 hover:text-white ml-1">
              ✏️
            </button>
          </>
        )}
      </div>
    </div>
  )
}

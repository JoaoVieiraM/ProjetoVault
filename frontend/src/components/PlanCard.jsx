import { useState } from 'react'

const FREQUENCIES = [
  { value: 'semanal',    label: 'Semanal',    timesPerMonth: 4 },
  { value: 'quinzenal',  label: 'Quinzenal',  timesPerMonth: 2 },
  { value: 'mensal',     label: 'Mensal',     timesPerMonth: 1 },
]

const DAYS = ['Segunda', 'Terça', 'Quarta', 'Quinta', 'Sexta', 'Sábado', 'Domingo']

export function calculateNextDate(frequency, day) {
  const dayIndex = DAYS.indexOf(day)
  if (dayIndex === -1) return null
  const today = new Date()
  const todayIndex = today.getDay() === 0 ? 6 : today.getDay() - 1 // Mon=0
  let diff = dayIndex - todayIndex
  if (diff <= 0) diff += frequency === 'semanal' ? 7 : frequency === 'quinzenal' ? 14 : 30
  const next = new Date(today)
  next.setDate(today.getDate() + diff)
  return next
}

export function calculateMonthlyAmount(baseAmount, percentageIncrease, frequency) {
  const freq = FREQUENCIES.find(f => f.value === frequency)
  if (!freq) return 0
  const perAporte = baseAmount * (1 + percentageIncrease / 100)
  return perAporte * freq.timesPerMonth
}

export function PlanCard({ plan, percentageIncrease, onSave }) {
  const [editing, setEditing] = useState(false)
  const [draft, setDraft] = useState(plan || { frequency: 'mensal', day: 'Segunda', amount: 100 })

  const freq = FREQUENCIES.find(f => f.value === draft.frequency) || FREQUENCIES[2]
  const perAporte = draft.amount * (1 + percentageIncrease / 100)
  const monthly = perAporte * freq.timesPerMonth
  const nextDate = calculateNextDate(draft.frequency, draft.day)

  function handleSave() {
    onSave(draft)
    setEditing(false)
  }

  return (
    <div className="bg-[#111] border border-[#222] rounded-2xl p-5 space-y-5">
      <div className="flex items-center justify-between">
        <h2 className="text-white font-semibold">Seu Plano</h2>
        {!editing && (
          <button onClick={() => setEditing(true)} className="text-zinc-400 hover:text-white text-sm">
            Editar ✏️
          </button>
        )}
      </div>

      {editing ? (
        <div className="space-y-4">
          <div>
            <label className="text-zinc-400 text-xs mb-1 block">⏰ Frequência</label>
            <div className="flex gap-2">
              {FREQUENCIES.map(f => (
                <button
                  key={f.value}
                  onClick={() => setDraft(d => ({ ...d, frequency: f.value }))}
                  className={`flex-1 py-2 rounded-lg text-sm border transition-colors ${
                    draft.frequency === f.value
                      ? 'border-[#f7931a] text-[#f7931a] bg-[#f7931a]/10'
                      : 'border-[#333] text-zinc-400 hover:border-[#555]'
                  }`}
                >
                  {f.label}
                </button>
              ))}
            </div>
          </div>

          <div>
            <label className="text-zinc-400 text-xs mb-1 block">🗓️ Dia</label>
            <select
              value={draft.day}
              onChange={e => setDraft(d => ({ ...d, day: e.target.value }))}
              className="w-full bg-[#1a1a1a] border border-[#333] rounded-lg px-3 py-2 text-white text-sm outline-none focus:border-[#f7931a]"
            >
              {DAYS.map(d => <option key={d}>{d}</option>)}
            </select>
          </div>

          <div>
            <label className="text-zinc-400 text-xs mb-1 block">💰 Valor base (R$)</label>
            <input
              type="number"
              min="1"
              value={draft.amount}
              onChange={e => setDraft(d => ({ ...d, amount: Number(e.target.value) }))}
              className="w-full bg-[#1a1a1a] border border-[#333] rounded-lg px-3 py-2 text-white text-sm outline-none focus:border-[#f7931a]"
            />
          </div>

          <div className="flex gap-3 pt-1">
            <button
              onClick={handleSave}
              className="flex-1 bg-[#f7931a] text-black font-semibold py-2 rounded-lg hover:bg-[#ffa733] transition-colors"
            >
              Salvar
            </button>
            <button
              onClick={() => { setDraft(plan); setEditing(false) }}
              className="flex-1 border border-[#333] text-zinc-400 py-2 rounded-lg hover:border-[#555] transition-colors"
            >
              Cancelar
            </button>
          </div>
        </div>
      ) : (
        <div className="space-y-3 text-sm">
          <Row label="⏰ Frequência" value={freq.label} />
          <Row label="🗓️ Dia" value={draft.day} />
          <Row label="💰 Valor base" value={`R$ ${draft.amount.toFixed(2)}`} />
          {percentageIncrease !== 0 && (
            <Row label="📈 Ajuste do momento" value={`+${percentageIncrease}%`} highlight />
          )}
          <div className="border-t border-[#222] pt-3">
            <Row label="Próximo aporte" value={nextDate ? nextDate.toLocaleDateString('pt-BR') : '---'} />
            <Row label="Por aporte" value={`R$ ${perAporte.toFixed(2)}`} />
            <Row label="Projeção 30 dias" value={`R$ ${monthly.toFixed(2)}`} highlight />
          </div>
        </div>
      )}
    </div>
  )
}

function Row({ label, value, highlight }) {
  return (
    <div className="flex justify-between items-center">
      <span className="text-zinc-500">{label}</span>
      <span className={highlight ? 'text-[#f7931a] font-semibold' : 'text-white'}>{value}</span>
    </div>
  )
}

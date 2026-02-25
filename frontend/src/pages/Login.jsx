import { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { useAuth } from '../hooks/useAuth'

export function Login() {
  const [mode, setMode] = useState('signin') // 'signin' | 'signup'
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [error, setError] = useState('')
  const [loading, setLoading] = useState('')
  const [message, setMessage] = useState('')
  const { signIn, signUp } = useAuth()
  const navigate = useNavigate()

  async function handleSubmit(e) {
    e.preventDefault()
    setError('')
    setMessage('')
    setLoading(true)

    try {
      if (mode === 'signin') {
        const { error } = await signIn(email, password)
        if (error) throw error
        navigate('/')
      } else {
        const { error } = await signUp(email, password)
        if (error) throw error
        setMessage('Verifique seu e-mail para confirmar o cadastro.')
      }
    } catch (err) {
      setError(err.message)
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="min-h-screen bg-[#0a0a0a] flex items-center justify-center p-4">
      <div className="w-full max-w-sm space-y-8">
        {/* Logo / Header */}
        <div className="text-center">
          <div className="text-5xl mb-3">₿</div>
          <h1 className="text-2xl font-bold text-white">Bitcoin DCA</h1>
          <p className="text-zinc-500 text-sm mt-1">Invista com disciplina</p>
        </div>

        {/* Card */}
        <div className="bg-[#111] border border-[#222] rounded-2xl p-6 space-y-5">
          <div className="flex gap-1 bg-[#1a1a1a] rounded-xl p-1">
            {['signin', 'signup'].map(m => (
              <button
                key={m}
                onClick={() => { setMode(m); setError(''); setMessage('') }}
                className={`flex-1 py-2 rounded-lg text-sm font-medium transition-colors ${
                  mode === m ? 'bg-[#f7931a] text-black' : 'text-zinc-400 hover:text-white'
                }`}
              >
                {m === 'signin' ? 'Entrar' : 'Cadastrar'}
              </button>
            ))}
          </div>

          <form onSubmit={handleSubmit} className="space-y-4">
            <div>
              <label className="text-zinc-400 text-xs block mb-1.5">E-mail</label>
              <input
                type="email"
                required
                value={email}
                onChange={e => setEmail(e.target.value)}
                className="w-full bg-[#1a1a1a] border border-[#333] rounded-xl px-4 py-3 text-white text-sm outline-none focus:border-[#f7931a] transition-colors"
                placeholder="seu@email.com"
              />
            </div>
            <div>
              <label className="text-zinc-400 text-xs block mb-1.5">Senha</label>
              <input
                type="password"
                required
                value={password}
                onChange={e => setPassword(e.target.value)}
                className="w-full bg-[#1a1a1a] border border-[#333] rounded-xl px-4 py-3 text-white text-sm outline-none focus:border-[#f7931a] transition-colors"
                placeholder="••••••••"
              />
            </div>

            {error && <p className="text-red-400 text-sm">{error}</p>}
            {message && <p className="text-green-400 text-sm">{message}</p>}

            <button
              type="submit"
              disabled={!!loading}
              className="w-full bg-[#f7931a] text-black font-bold py-3 rounded-xl hover:bg-[#ffa733] disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
            >
              {loading ? 'Aguarde...' : mode === 'signin' ? 'Entrar' : 'Criar conta'}
            </button>
          </form>
        </div>
      </div>
    </div>
  )
}

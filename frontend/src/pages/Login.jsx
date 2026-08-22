import { useState } from 'react'
import { Navigate, useNavigate } from 'react-router-dom'
import { Mail, Lock, ArrowRight } from 'lucide-react'
import api from '../services/api'
import { getToken, setSession } from '../services/auth'
import BrandBackground from '../components/BrandBackground'
import GlassPanel from '../components/ui/GlassPanel'
import Button from '../components/ui/Button'
import { BRAND } from '../utils/brand'

const inputClass =
  'w-full rounded-xl bg-white/5 border border-white/10 pl-10 pr-3 py-2.5 text-sm outline-none transition-colors focus:border-[var(--accent)] focus:ring-2 focus:ring-[var(--accent)]/30'

function Login() {
  const navigate = useNavigate()
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [status, setStatus] = useState('idle') // idle | sending | error
  const [errorMessage, setErrorMessage] = useState('')

  if (getToken()) {
    return <Navigate to="/eventos" replace />
  }

  async function handleSubmit(event) {
    event.preventDefault()
    setStatus('sending')
    setErrorMessage('')

    try {
      const { data } = await api.post('/auth/login', { email, password })
      setSession(data.token, data.user)
      navigate('/eventos')
    } catch (err) {
      setStatus('error')
      setErrorMessage(err.response?.data?.message || 'Ocurrió un error')
    }
  }

  return (
    <div className="relative min-h-screen w-full flex flex-col items-center justify-center gap-6 px-6 py-10 text-white">
      <BrandBackground />

      <div className="text-center">
        <h1
          className="text-4xl font-extrabold tracking-tight"
          style={{
            backgroundImage: `linear-gradient(90deg, ${BRAND.blue}, ${BRAND.violet}, ${BRAND.pink})`,
            WebkitBackgroundClip: 'text',
            backgroundClip: 'text',
            color: 'transparent',
          }}
        >
          NyMoo
        </h1>
        <p className="text-white/50 mt-1">Plataforma de eventos memorables</p>
      </div>

      <GlassPanel accentColor={BRAND.blue} className="w-full max-w-sm px-6 py-8 sm:px-8">
        <h2 className="text-center text-sm text-white/50 mb-6 uppercase tracking-widest">Acceso privado</h2>

        <form onSubmit={handleSubmit} className="flex flex-col gap-3" style={{ '--accent': BRAND.blue }}>
          <div className="relative">
            <Mail className="w-4 h-4 absolute left-3.5 top-1/2 -translate-y-1/2 text-white/30" />
            <input
              type="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              placeholder="Email"
              required
              className={inputClass}
            />
          </div>
          <div className="relative">
            <Lock className="w-4 h-4 absolute left-3.5 top-1/2 -translate-y-1/2 text-white/30" />
            <input
              type="password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              placeholder="Contraseña"
              required
              minLength={8}
              className={inputClass}
            />
          </div>

          {status === 'error' && <p className="text-red-400 text-sm">{errorMessage}</p>}

          <Button
            type="submit"
            disabled={status === 'sending'}
            primaryColor={BRAND.blue}
            className="w-full mt-2 disabled:opacity-40"
          >
            {status === 'sending' ? 'Enviando...' : 'Entrar'}
            {status !== 'sending' && <ArrowRight className="w-4 h-4" />}
          </Button>
        </form>
      </GlassPanel>
    </div>
  )
}

export default Login

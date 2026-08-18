import { useState } from 'react'
import { Navigate, useNavigate } from 'react-router-dom'
import api from '../services/api'
import { getToken, setSession } from '../services/auth'

function Login() {
  const navigate = useNavigate()
  const [mode, setMode] = useState('login') // login | register
  const [name, setName] = useState('')
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
      const endpoint = mode === 'login' ? '/auth/login' : '/auth/register'
      const payload = mode === 'login' ? { email, password } : { name, email, password }
      const { data } = await api.post(endpoint, payload)
      setSession(data.token, data.user)
      navigate('/eventos')
    } catch (err) {
      setStatus('error')
      setErrorMessage(err.response?.data?.message || 'Ocurrió un error')
    }
  }

  return (
    <div className="min-h-screen flex flex-col items-center justify-center gap-6 bg-neutral-950 text-white px-6">
      <div className="text-center space-y-2">
        <h1 className="text-3xl font-semibold">Plataforma de Eventos</h1>
        <p className="text-neutral-400">
          {mode === 'login' ? 'Iniciá sesión para acceder a tus eventos.' : 'Creá tu cuenta de organizador.'}
        </p>
      </div>

      <form onSubmit={handleSubmit} className="w-full max-w-sm flex flex-col gap-3">
        {mode === 'register' && (
          <input
            type="text"
            value={name}
            onChange={(e) => setName(e.target.value)}
            placeholder="Nombre"
            required
            className="w-full rounded-lg bg-neutral-800 px-3 py-2 outline-none focus:ring-2 focus:ring-purple-500"
          />
        )}
        <input
          type="email"
          value={email}
          onChange={(e) => setEmail(e.target.value)}
          placeholder="Email"
          required
          className="w-full rounded-lg bg-neutral-800 px-3 py-2 outline-none focus:ring-2 focus:ring-purple-500"
        />
        <input
          type="password"
          value={password}
          onChange={(e) => setPassword(e.target.value)}
          placeholder="Contraseña"
          required
          minLength={8}
          className="w-full rounded-lg bg-neutral-800 px-3 py-2 outline-none focus:ring-2 focus:ring-purple-500"
        />

        {status === 'error' && <p className="text-red-400 text-sm">{errorMessage}</p>}

        <button
          type="submit"
          disabled={status === 'sending'}
          className="w-full py-2 rounded-full bg-purple-600 hover:bg-purple-500 disabled:opacity-40 transition font-medium"
        >
          {status === 'sending' ? 'Enviando...' : mode === 'login' ? 'Entrar' : 'Crear cuenta'}
        </button>
      </form>

      <button
        type="button"
        onClick={() => setMode(mode === 'login' ? 'register' : 'login')}
        className="text-neutral-400 text-sm hover:text-white transition"
      >
        {mode === 'login' ? '¿No tenés cuenta? Registrate' : '¿Ya tenés cuenta? Iniciá sesión'}
      </button>
    </div>
  )
}

export default Login

import { useEffect } from 'react'
import { Navigate } from 'react-router-dom'
import api from '../services/api'
import { getToken, getStoredUser, setSession } from '../services/auth'

function ProtectedRoute({ children }) {
  const token = getToken()

  useEffect(() => {
    if (!token) return

    api
      .get('/auth/me')
      .then(({ data }) => {
        const current = getStoredUser()
        if (JSON.stringify(current) !== JSON.stringify(data.user)) {
          setSession(token, data.user)
        }
      })
      .catch(() => {})
  }, [token])

  if (!token) {
    return <Navigate to="/" replace />
  }
  return children
}

export default ProtectedRoute

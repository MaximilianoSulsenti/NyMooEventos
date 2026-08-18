import { Routes, Route } from 'react-router-dom'
import ProtectedRoute from './components/ProtectedRoute'
import Login from './pages/Login'
import EventsList from './pages/EventsList'
import Dashboard from './pages/Dashboard'
import DigitalCard from './pages/DigitalCard'
import UploadPage from './pages/UploadPage'
import LiveFeedPage from './pages/LiveFeedPage'

function NotFound() {
  return (
    <div className="min-h-screen flex items-center justify-center bg-neutral-950 text-white">
      <p className="text-neutral-400">Página no encontrada.</p>
    </div>
  )
}

function App() {
  return (
    <Routes>
      <Route path="/" element={<Login />} />
      <Route
        path="/eventos"
        element={
          <ProtectedRoute>
            <EventsList />
          </ProtectedRoute>
        }
      />
      <Route
        path="/dashboard/:eventId"
        element={
          <ProtectedRoute>
            <Dashboard />
          </ProtectedRoute>
        }
      />
      <Route path="/evento/:eventSlug" element={<DigitalCard />} />
      <Route path="/evento/:eventSlug/upload" element={<UploadPage />} />
      <Route path="/evento/:eventSlug/live-feed" element={<LiveFeedPage />} />
      <Route path="*" element={<NotFound />} />
    </Routes>
  )
}

export default App

import { Routes, Route } from 'react-router-dom'
import ProtectedRoute from './components/ProtectedRoute'
import LandingPage from './pages/LandingPage'
import Login from './pages/Login'
import EventsList from './pages/EventsList'
import Dashboard from './pages/Dashboard'
import EventEditor from './pages/EventEditor'
import DigitalCard from './pages/DigitalCard'
import UploadPage from './pages/UploadPage'
import LiveScreen from './pages/LiveScreen'
import StatsDashboard from './pages/StatsDashboard'
import GalleryControl from './pages/GalleryControl'

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
      <Route path="/" element={<LandingPage />} />
      {/* Acceso oculto al login del panel interno: sin enlaces públicos desde
          la landing, navbar ni footer -- solo ingresando esta URL exacta a
          mano en el navegador. */}
      <Route path="/nymoo-portal-interno-login" element={<Login />} />
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
      <Route
        path="/dashboard/:eventId/editor"
        element={
          <ProtectedRoute>
            <EventEditor />
          </ProtectedRoute>
        }
      />
      <Route path="/evento/:eventSlug" element={<DigitalCard />} />
      <Route path="/evento/:eventSlug/upload" element={<UploadPage />} />
      <Route path="/evento/:eventSlug/live-feed" element={<LiveScreen />} />
      <Route path="/evento/:eventSlug/stats-dashboard" element={<StatsDashboard />} />
      <Route path="/evento/:eventSlug/gallery-control" element={<GalleryControl />} />
      <Route path="*" element={<NotFound />} />
    </Routes>
  )
}

export default App

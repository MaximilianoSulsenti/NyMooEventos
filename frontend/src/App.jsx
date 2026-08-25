import { lazy, Suspense } from 'react'
import { Routes, Route } from 'react-router-dom'
import ProtectedRoute from './components/ProtectedRoute'
import LandingPage from './pages/LandingPage'
import { BRAND } from './utils/brand'

// Todo lo que no sea la landing se carga bajo demanda (React.lazy): así
// quien entra a nymoo.com.ar para mirar los packs no descarga de yapa el
// editor, el dashboard, el checkout, etc. -- cada ruta pasa a tener su
// propio "paquete" de JS que el navegador solo pide cuando hace falta.
// LandingPage queda como import normal a propósito: es la puerta de
// entrada del sitio, no tiene sentido que pase por el estado de carga.
const Login = lazy(() => import('./pages/Login'))
const EventsList = lazy(() => import('./pages/EventsList'))
const Dashboard = lazy(() => import('./pages/Dashboard'))
const EventEditor = lazy(() => import('./pages/EventEditor'))
const DigitalCard = lazy(() => import('./pages/DigitalCard'))
const UploadPage = lazy(() => import('./pages/UploadPage'))
const LiveScreen = lazy(() => import('./pages/LiveScreen'))
const StatsDashboard = lazy(() => import('./pages/StatsDashboard'))
const GalleryControl = lazy(() => import('./pages/GalleryControl'))
const PublicAlbum = lazy(() => import('./pages/PublicAlbum'))
const MessageBookPrint = lazy(() => import('./pages/MessageBookPrint'))
const Checkout = lazy(() => import('./pages/Checkout'))
const CheckoutSuccess = lazy(() => import('./pages/CheckoutSuccess'))
const SharedOrderForm = lazy(() => import('./pages/SharedOrderForm'))
const OrdersDashboard = lazy(() => import('./pages/OrdersDashboard'))

function NotFound() {
  return (
    <div className="min-h-screen flex items-center justify-center bg-neutral-950 text-white">
      <p className="text-neutral-400">Página no encontrada.</p>
    </div>
  )
}

// Se ve una fracción de segundo mientras el navegador termina de bajar el
// paquete de la ruta pedida (normalmente ni se alcanza a notar, y casi nunca
// aparece en visitas siguientes porque el navegador ya lo tiene en caché).
function PageFallback() {
  return <div className="min-h-screen w-full" style={{ background: BRAND.night }} />
}

function App() {
  return (
    <Suspense fallback={<PageFallback />}>
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
        <Route path="/evento/:eventSlug/album-publico" element={<PublicAlbum />} />
        <Route path="/evento/:eventSlug/libro-de-firmas" element={<MessageBookPrint />} />
        <Route path="/checkout" element={<Checkout />} />
        <Route path="/checkout/success" element={<CheckoutSuccess />} />
        <Route path="/completar-pedido" element={<SharedOrderForm />} />
        <Route
          path="/pedidos"
          element={
            <ProtectedRoute>
              <OrdersDashboard />
            </ProtectedRoute>
          }
        />
        <Route path="*" element={<NotFound />} />
      </Routes>
    </Suspense>
  )
}

export default App

import { useEffect, useState } from 'react'
import { Link, useNavigate, useParams } from 'react-router-dom'
import { Copy } from 'lucide-react'
import api from '../services/api'
import { getStoredUser } from '../services/auth'
import AppearancePanel from '../components/editor/AppearancePanel'
import EnvelopePanel from '../components/editor/EnvelopePanel'
import BrandingPanel from '../components/editor/BrandingPanel'
import UploadPageStylePanel from '../components/editor/UploadPageStylePanel'
import GallerySettingsPanel from '../components/editor/GallerySettingsPanel'
import MusicSettingsPanel from '../components/editor/MusicSettingsPanel'
import RsvpSettingsPanel from '../components/editor/RsvpSettingsPanel'
import DuoLabelModal from '../components/editor/DuoLabelModal'
import SectionsPanel from '../components/editor/SectionsPanel'
import SectionRenderer from '../sections/SectionRenderer'
import GlobalBackground from '../sections/GlobalBackground'
import { getThemeStyles } from '../sections/theming'
import GlassPanel from '../components/ui/GlassPanel'
import Button from '../components/ui/Button'
import { BRAND } from '../utils/brand'

function snapshotOf(state) {
  return JSON.stringify(state)
}

function EventEditor() {
  const { eventId } = useParams()
  const navigate = useNavigate()
  const isAdmin = Boolean(getStoredUser()?.isAdmin)
  const [duoState, setDuoState] = useState('idle') // idle | creating | error
  const [duoModalOpen, setDuoModalOpen] = useState(false)
  const [event, setEvent] = useState(null)
  const [appearance, setAppearance] = useState(null)
  const [envelopeSettings, setEnvelopeSettings] = useState(null)
  const [branding, setBranding] = useState(null)
  const [uploadPageSettings, setUploadPageSettings] = useState(null)
  const [gallerySettings, setGallerySettings] = useState(null)
  const [musicSettings, setMusicSettings] = useState(null)
  const [rsvpSettings, setRsvpSettings] = useState(null)
  const [sections, setSections] = useState(null)
  const [savedSnapshot, setSavedSnapshot] = useState(null)
  const [loadState, setLoadState] = useState('loading') // loading | ready | error
  const [saveState, setSaveState] = useState('idle') // idle | saving | saved | error
  const [sectionSaveState, setSectionSaveState] = useState('idle')

  useEffect(() => {
    api
      .get(`/events/${eventId}`)
      .then(({ data }) => {
        setEvent(data)
        setAppearance(data.appearance)
        setEnvelopeSettings(data.envelopeSettings)
        setBranding(data.brandingSettings)
        setUploadPageSettings(data.uploadPageSettings)
        setGallerySettings(data.gallerySettings)
        setMusicSettings(data.musicSettings)
        setRsvpSettings(data.rsvpSettings)
        setSections(data.sections)
        setSavedSnapshot(
          snapshotOf({
            appearance: data.appearance,
            envelopeSettings: data.envelopeSettings,
            branding: data.brandingSettings,
            uploadPageSettings: data.uploadPageSettings,
            gallerySettings: data.gallerySettings,
            musicSettings: data.musicSettings,
            rsvpSettings: data.rsvpSettings,
            sections: data.sections,
          })
        )
        setLoadState('ready')
      })
      .catch(() => setLoadState('error'))
  }, [eventId])

  const hasUnsavedChanges =
    savedSnapshot !== null &&
    snapshotOf({
      appearance,
      envelopeSettings,
      branding,
      uploadPageSettings,
      gallerySettings,
      musicSettings,
      rsvpSettings,
      sections,
    }) !== savedSnapshot

  useEffect(() => {
    function handleBeforeUnload(event) {
      if (!hasUnsavedChanges) return
      event.preventDefault()
      event.returnValue = ''
    }
    window.addEventListener('beforeunload', handleBeforeUnload)
    return () => window.removeEventListener('beforeunload', handleBeforeUnload)
  }, [hasUnsavedChanges])

  async function handleSave() {
    setSaveState('saving')
    try {
      const calls = [
        api.patch(`/events/${eventId}/appearance`, appearance),
        api.patch(`/events/${eventId}/envelope`, envelopeSettings),
        api.patch(`/events/${eventId}/branding/client`, {
          ...branding.clientBrand,
          salonBgImageUrl: branding.salonBgImageUrl,
          salonBgOpacity: branding.salonBgOpacity,
        }),
        api.patch(`/events/${eventId}/upload-page`, uploadPageSettings),
        api.patch(`/events/${eventId}/gallery-settings`, gallerySettings),
        api.patch(`/events/${eventId}/music`, musicSettings),
        api.patch(`/events/${eventId}/rsvp-settings`, rsvpSettings),
        api.patch(`/events/${eventId}/sections`, { sections }),
      ]
      if (isAdmin) {
        calls.push(api.patch(`/events/${eventId}/branding/mine`, branding.myBrand))
      }
      await Promise.all(calls)
      setSavedSnapshot(
        snapshotOf({
          appearance,
          envelopeSettings,
          branding,
          uploadPageSettings,
          gallerySettings,
          musicSettings,
          rsvpSettings,
          sections,
        })
      )
      setSaveState('saved')
      setTimeout(() => setSaveState('idle'), 1500)
    } catch {
      setSaveState('error')
    }
  }

  // Invitación Dúo: clona este evento completo (diseño, fondos, playlist,
  // secciones) bajo un slug propio y lleva directo a su editor, para armar
  // la segunda versión (cena vs. fiesta, con/sin tarjeta, etc.) sin
  // rehacer nada de cero. Antes de crearla se pregunta para qué es (brindis,
  // fiesta, u otro texto propio) -- ver DuoLabelModal.
  async function handleCreateDuo(label) {
    setDuoState('creating')
    try {
      const { data } = await api.post(`/events/${eventId}/duplicate-duo`, { label })
      navigate(`/dashboard/${data._id}/editor`)
    } catch {
      setDuoState('error')
      setDuoModalOpen(false)
      setTimeout(() => setDuoState('idle'), 2000)
    }
  }

  async function handleSaveSections() {
    setSectionSaveState('saving')
    try {
      await api.patch(`/events/${eventId}/sections`, { sections })
      setSavedSnapshot(
        snapshotOf({
          appearance,
          envelopeSettings,
          branding,
          uploadPageSettings,
          gallerySettings,
          musicSettings,
          rsvpSettings,
          sections,
        })
      )
      setSectionSaveState('saved')
      setTimeout(() => setSectionSaveState('idle'), 1500)
    } catch {
      setSectionSaveState('error')
    }
  }

  if (loadState === 'loading') {
    return (
      <div className="min-h-screen flex items-center justify-center text-white/50" style={{ background: BRAND.night }}>
        Cargando editor...
      </div>
    )
  }

  if (loadState === 'error') {
    return (
      <div className="min-h-screen flex items-center justify-center text-white/50" style={{ background: BRAND.night }}>
        No se pudo cargar el evento.
      </div>
    )
  }

  // Antes solo appearance/sections se reflejaban acá -- el resto (RSVP,
  // galería, música, sobre, marca, página de subida) se editaba en estado
  // local pero la vista previa seguía mostrando el `event` original tal
  // como se cargó, así que un cambio (ej. activar "Ver valor de la
  // tarjeta") no se veía hasta guardar y recargar. Ahora la preview usa
  // siempre el estado local editado, guardado o no.
  const previewEvent = {
    ...event,
    appearance,
    envelopeSettings,
    brandingSettings: branding,
    uploadPageSettings,
    gallerySettings,
    musicSettings,
    rsvpSettings,
    sections,
  }
  const previewStyles = getThemeStyles(appearance.theme, appearance.fontFamily)

  return (
    <div className="min-h-screen flex flex-col lg:flex-row gap-4 p-4 text-white" style={{ background: BRAND.night }}>
      <GlassPanel
        as="aside"
        accentColor={BRAND.blue}
        // order-2 en pantallas angostas (celular/tablet/laptop chica, donde
        // el layout se apila en vez de ir lado a lado) -- sin esto, este
        // panel largo (7+ secciones) quedaba primero y la vista previa
        // recién aparecía después de scrollear todo, dando la sensación de
        // que un cambio (ej. subir una imagen de fondo) "no se mostraba".
        className="w-full lg:w-96 shrink-0 order-2 lg:order-1 p-6 space-y-8 overflow-y-auto lg:max-h-[calc(100vh-2rem)]"
      >
        <div className="flex items-center justify-between">
          <Link to={`/dashboard/${eventId}`} className="text-white/40 text-xs uppercase tracking-widest hover:text-white transition">
            ← Volver al panel
          </Link>
        </div>
        <h1 className="text-lg font-semibold">Editor de invitación</h1>

        <button
          type="button"
          onClick={() => setDuoModalOpen(true)}
          disabled={duoState === 'creating'}
          className="w-full flex items-center justify-center gap-2 rounded-xl bg-white/5 border border-white/10 hover:bg-white/10 px-3 py-2.5 text-sm text-neutral-300 hover:text-white transition disabled:opacity-40"
        >
          <Copy className="w-4 h-4" />
          {duoState === 'creating'
            ? 'Creando versión Dúo...'
            : duoState === 'error'
              ? 'No se pudo crear, reintentá'
              : 'Crear versión Dúo (clonar este evento)'}
        </button>

        {hasUnsavedChanges && (
          <p className="text-xs text-yellow-400 bg-yellow-400/10 border border-yellow-400/20 rounded-lg px-3 py-2">
            Tenés cambios sin guardar. Si salís de esta página sin guardar, se pierden.
          </p>
        )}

        <div>
          <h2 className="text-sm uppercase tracking-widest text-neutral-500 mb-3">Apariencia</h2>
          <AppearancePanel eventId={eventId} appearance={appearance} onChange={setAppearance} />
        </div>

        <div>
          <h2 className="text-sm uppercase tracking-widest text-neutral-500 mb-3">Sobre de bienvenida</h2>
          <EnvelopePanel eventId={eventId} settings={envelopeSettings} onChange={setEnvelopeSettings} />
        </div>

        <div>
          <h2 className="text-sm uppercase tracking-widest text-neutral-500 mb-3">Marcas de agua (pantalla del salón)</h2>
          <BrandingPanel
            eventId={eventId}
            branding={branding}
            isAdmin={isAdmin}
            onChangeMyBrand={(myBrand) => setBranding((prev) => ({ ...prev, myBrand }))}
            onChangeClientBrand={(clientBrand) => setBranding((prev) => ({ ...prev, clientBrand }))}
            onChangeSalonBg={(patch) => setBranding((prev) => ({ ...prev, ...patch }))}
          />
        </div>

        <div>
          <h2 className="text-sm uppercase tracking-widest text-neutral-500 mb-3">Estilo de Upload / Moderación</h2>
          <UploadPageStylePanel eventId={eventId} settings={uploadPageSettings} onChange={setUploadPageSettings} />
        </div>

        <div>
          <h2 className="text-sm uppercase tracking-widest text-neutral-500 mb-3">Galería multimedia</h2>
          <GallerySettingsPanel settings={gallerySettings} onChange={setGallerySettings} />
        </div>

        <div>
          <h2 className="text-sm uppercase tracking-widest text-neutral-500 mb-3">Música de fondo</h2>
          <MusicSettingsPanel eventId={eventId} settings={musicSettings} onChange={setMusicSettings} />
        </div>

        <div>
          <h2 className="text-sm uppercase tracking-widest text-neutral-500 mb-3">Plan de confirmación (RSVP)</h2>
          <RsvpSettingsPanel eventId={eventId} event={event} settings={rsvpSettings} onChange={setRsvpSettings} />
        </div>

        <div>
          <div className="flex items-center justify-between mb-3">
            <h2 className="text-sm uppercase tracking-widest text-neutral-500">Secciones</h2>
            <button
              type="button"
              onClick={handleSaveSections}
              disabled={sectionSaveState === 'saving'}
              className="text-xs hover:brightness-125 disabled:opacity-40 transition"
              style={{ color: BRAND.blue }}
            >
              {sectionSaveState === 'saving'
                ? 'Guardando...'
                : sectionSaveState === 'saved'
                  ? 'Guardado ✓'
                  : 'Guardar solo secciones'}
            </button>
          </div>
          <SectionsPanel eventId={eventId} sections={sections} onChange={setSections} />
        </div>

        <Button
          type="button"
          onClick={handleSave}
          disabled={saveState === 'saving'}
          primaryColor={BRAND.blue}
          className="w-full disabled:opacity-40"
        >
          {saveState === 'saving' ? 'Guardando...' : saveState === 'saved' ? 'Guardado ✓' : 'Guardar todo'}
        </Button>
        {saveState === 'error' && <p className="text-red-400 text-sm text-center">No se pudo guardar</p>}
      </GlassPanel>

      <main className="flex-1 rounded-3xl border border-white/10 overflow-y-auto relative order-1 lg:order-2 lg:max-h-[calc(100vh-2rem)] shadow-2xl">
        <div className={`min-h-full relative ${previewStyles.fontClass}`}>
          {appearance.useGlobalBackground ? (
            <GlobalBackground appearance={appearance} fixed={false} />
          ) : (
            <div className="absolute inset-0" style={{ backgroundColor: appearance.backgroundColor }} />
          )}
          <SectionRenderer event={previewEvent} />
        </div>
      </main>

      {duoModalOpen && (
        <DuoLabelModal
          onClose={() => setDuoModalOpen(false)}
          onConfirm={handleCreateDuo}
          submitting={duoState === 'creating'}
        />
      )}
    </div>
  )
}

export default EventEditor

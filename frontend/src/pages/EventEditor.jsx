import { useEffect, useState } from 'react'
import { Link, useParams } from 'react-router-dom'
import api from '../services/api'
import AppearancePanel from '../components/editor/AppearancePanel'
import EnvelopePanel from '../components/editor/EnvelopePanel'
import SectionsPanel from '../components/editor/SectionsPanel'
import SectionRenderer from '../sections/SectionRenderer'
import GlobalBackground from '../sections/GlobalBackground'
import { getThemeStyles } from '../sections/theming'

function snapshotOf(appearance, envelopeSettings, sections) {
  return JSON.stringify({ appearance, envelopeSettings, sections })
}

function EventEditor() {
  const { eventId } = useParams()
  const [event, setEvent] = useState(null)
  const [appearance, setAppearance] = useState(null)
  const [envelopeSettings, setEnvelopeSettings] = useState(null)
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
        setSections(data.sections)
        setSavedSnapshot(snapshotOf(data.appearance, data.envelopeSettings, data.sections))
        setLoadState('ready')
      })
      .catch(() => setLoadState('error'))
  }, [eventId])

  const hasUnsavedChanges =
    savedSnapshot !== null && snapshotOf(appearance, envelopeSettings, sections) !== savedSnapshot

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
      await Promise.all([
        api.patch(`/events/${eventId}/appearance`, appearance),
        api.patch(`/events/${eventId}/envelope`, envelopeSettings),
        api.patch(`/events/${eventId}/sections`, { sections }),
      ])
      setSavedSnapshot(snapshotOf(appearance, envelopeSettings, sections))
      setSaveState('saved')
      setTimeout(() => setSaveState('idle'), 1500)
    } catch {
      setSaveState('error')
    }
  }

  async function handleSaveSections() {
    setSectionSaveState('saving')
    try {
      await api.patch(`/events/${eventId}/sections`, { sections })
      setSavedSnapshot(snapshotOf(appearance, envelopeSettings, sections))
      setSectionSaveState('saved')
      setTimeout(() => setSectionSaveState('idle'), 1500)
    } catch {
      setSectionSaveState('error')
    }
  }

  if (loadState === 'loading') {
    return (
      <div className="min-h-screen flex items-center justify-center bg-neutral-950 text-neutral-400">
        Cargando editor...
      </div>
    )
  }

  if (loadState === 'error') {
    return (
      <div className="min-h-screen flex items-center justify-center bg-neutral-950 text-neutral-400">
        No se pudo cargar el evento.
      </div>
    )
  }

  const previewEvent = { ...event, appearance, sections }
  const previewStyles = getThemeStyles(appearance.theme)

  return (
    <div className="min-h-screen flex bg-neutral-950 text-white">
      <aside className="w-96 shrink-0 border-r border-white/10 p-6 space-y-8 overflow-y-auto">
        <div className="flex items-center justify-between">
          <Link to={`/dashboard/${eventId}`} className="text-neutral-400 text-xs uppercase tracking-widest hover:text-white transition">
            ← Volver al panel
          </Link>
        </div>
        <h1 className="text-lg font-semibold">Editor de invitación</h1>

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
          <div className="flex items-center justify-between mb-3">
            <h2 className="text-sm uppercase tracking-widest text-neutral-500">Secciones</h2>
            <button
              type="button"
              onClick={handleSaveSections}
              disabled={sectionSaveState === 'saving'}
              className="text-xs text-purple-400 hover:text-purple-300 disabled:opacity-40 transition"
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

        <button
          type="button"
          onClick={handleSave}
          disabled={saveState === 'saving'}
          className="w-full py-2 rounded-full bg-purple-600 hover:bg-purple-500 disabled:opacity-40 transition font-medium"
        >
          {saveState === 'saving' ? 'Guardando...' : saveState === 'saved' ? 'Guardado ✓' : 'Guardar todo'}
        </button>
        {saveState === 'error' && <p className="text-red-400 text-sm text-center">No se pudo guardar</p>}
      </aside>

      <main className="flex-1 overflow-y-auto relative">
        <div className={`min-h-screen relative ${previewStyles.fontClass}`}>
          {appearance.useGlobalBackground ? (
            <GlobalBackground appearance={appearance} fixed={false} />
          ) : (
            <div className="absolute inset-0 -z-10" style={{ backgroundColor: appearance.backgroundColor }} />
          )}
          <SectionRenderer event={previewEvent} />
        </div>
      </main>
    </div>
  )
}

export default EventEditor

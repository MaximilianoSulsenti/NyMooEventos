import { useEffect, useState } from 'react'
import { Link, useParams } from 'react-router-dom'
import api from '../services/api'
import AppearancePanel from '../components/editor/AppearancePanel'
import SectionsPanel from '../components/editor/SectionsPanel'
import SectionRenderer from '../sections/SectionRenderer'
import { getThemeStyles } from '../sections/theming'

function EventEditor() {
  const { eventId } = useParams()
  const [event, setEvent] = useState(null)
  const [appearance, setAppearance] = useState(null)
  const [sections, setSections] = useState(null)
  const [loadState, setLoadState] = useState('loading') // loading | ready | error
  const [saveState, setSaveState] = useState('idle') // idle | saving | saved | error

  useEffect(() => {
    api
      .get(`/events/${eventId}`)
      .then(({ data }) => {
        setEvent(data)
        setAppearance(data.appearance)
        setSections(data.sections)
        setLoadState('ready')
      })
      .catch(() => setLoadState('error'))
  }, [eventId])

  async function handleSave() {
    setSaveState('saving')
    try {
      await Promise.all([
        api.patch(`/events/${eventId}/appearance`, appearance),
        api.patch(`/events/${eventId}/sections`, { sections }),
      ])
      setSaveState('saved')
      setTimeout(() => setSaveState('idle'), 1500)
    } catch {
      setSaveState('error')
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

        <div>
          <h2 className="text-sm uppercase tracking-widest text-neutral-500 mb-3">Apariencia</h2>
          <AppearancePanel appearance={appearance} onChange={setAppearance} />
        </div>

        <div>
          <h2 className="text-sm uppercase tracking-widest text-neutral-500 mb-3">Secciones</h2>
          <SectionsPanel eventId={eventId} sections={sections} onChange={setSections} />
        </div>

        <button
          type="button"
          onClick={handleSave}
          disabled={saveState === 'saving'}
          className="w-full py-2 rounded-full bg-purple-600 hover:bg-purple-500 disabled:opacity-40 transition font-medium"
        >
          {saveState === 'saving' ? 'Guardando...' : saveState === 'saved' ? 'Guardado ✓' : 'Guardar cambios'}
        </button>
        {saveState === 'error' && <p className="text-red-400 text-sm text-center">No se pudo guardar</p>}
      </aside>

      <main className="flex-1 overflow-y-auto">
        <div
          className={`min-h-screen ${previewStyles.fontClass}`}
          style={{ backgroundColor: appearance.backgroundColor }}
        >
          <SectionRenderer event={previewEvent} />
        </div>
      </main>
    </div>
  )
}

export default EventEditor

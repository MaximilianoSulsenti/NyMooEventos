import { Link } from 'react-router-dom'
import { motion } from 'motion/react'
import { Check, ShoppingCart, Table2, ListMusic, CalendarClock, Bell, Tag } from 'lucide-react'
import Button from '../ui/Button'
import ComboPromoBanner from './ComboPromoBanner'
import { shadeColor } from '../../utils/color'
import { BRAND } from '../../utils/brand'
import { LANDING_TOOLS } from '../../utils/landingConfig'

const GOLD_GRADIENT = 'linear-gradient(90deg, #F2C94C, #F2994A, #F2C94C)'

// Mesas y etiquetas de invitados de mentira, solo para la animación de la
// cabecera de la card -- entran deslizándose desde afuera del cuadro y se
// asientan en su mesa, en loop, para ilustrar "arrastrar y organizar" sin
// necesidad de datos reales.
const DEMO_TABLES = [
  { x: '22%', y: '32%' },
  { x: '52%', y: '68%' },
  { x: '80%', y: '30%' },
]
const DEMO_TAGS = [
  { name: 'Juan', table: 0, delay: 0 },
  { name: 'Caro', table: 1, delay: 0.7 },
  { name: 'Ana', table: 2, delay: 1.4 },
  { name: 'Leo', table: 0, delay: 2.1 },
]

function TableAnimationPreview({ color }) {
  return (
    <div className="relative w-full h-full overflow-hidden">
      {DEMO_TABLES.map((pos, i) => (
        <span
          key={i}
          className="absolute w-11 h-11 rounded-full border-2"
          style={{
            left: pos.x,
            top: pos.y,
            transform: 'translate(-50%, -50%)',
            borderColor: `${color}55`,
            background: `${color}14`,
          }}
        />
      ))}
      {DEMO_TAGS.map((tag, i) => {
        const target = DEMO_TABLES[tag.table]
        return (
          <motion.span
            key={i}
            className="absolute px-2.5 py-1 rounded-full text-[11px] font-bold whitespace-nowrap shadow-lg"
            style={{ background: color, color: '#0a0a0a' }}
            initial={{ left: '-15%', top: `${18 + i * 16}%`, opacity: 0, scale: 0.8 }}
            animate={{
              left: ['-15%', target.x, target.x],
              top: [`${18 + i * 16}%`, target.y, target.y],
              opacity: [0, 1, 1, 0],
              scale: [0.8, 1, 1, 0.8],
            }}
            transition={{
              duration: 3.2,
              times: [0, 0.45, 0.85, 1],
              repeat: Infinity,
              repeatDelay: 1.6,
              delay: tag.delay,
              ease: 'easeInOut',
            }}
          >
            {tag.name}
          </motion.span>
        )
      })}
    </div>
  )
}

// Cabecera de sonido: una onda de barras parpadeando a la izquierda de la
// cual se desprenden notas musicales que entran de forma fluida en los
// bloques rotulados de la derecha, en loop -- mismo criterio de animación
// "de mentira" que TableAnimationPreview, sin datos reales de por medio.
const WAVE_BAR_HEIGHTS = [35, 65, 45, 85, 55, 70, 40]
const MUSIC_BLOCKS = [
  { label: 'Cena', x: '80%', y: '20%' },
  { label: 'Cachengue', x: '84%', y: '55%' },
  { label: 'Hora Loca', x: '76%', y: '86%' },
]
const MUSIC_NOTES = [
  { block: 0, delay: 0 },
  { block: 1, delay: 0.8 },
  { block: 2, delay: 1.6 },
  { block: 0, delay: 2.4 },
]

function PlaylistAnimationPreview({ color }) {
  return (
    <div className="relative w-full h-full overflow-hidden">
      <div className="absolute left-[8%] top-1/2 -translate-y-1/2 flex items-end gap-1 h-12">
        {WAVE_BAR_HEIGHTS.map((h, i) => (
          <motion.span
            key={i}
            className="w-1.5 rounded-full"
            style={{ background: color }}
            animate={{ height: [`${h}%`, '100%', `${h}%`] }}
            transition={{ duration: 1 + (i % 3) * 0.2, repeat: Infinity, ease: 'easeInOut', delay: i * 0.08 }}
          />
        ))}
      </div>

      {MUSIC_BLOCKS.map((block) => (
        <span
          key={block.label}
          className="absolute px-2.5 py-1 rounded-full text-[10px] font-bold whitespace-nowrap border"
          style={{
            left: block.x,
            top: block.y,
            transform: 'translate(-50%, -50%)',
            borderColor: `${color}55`,
            background: `${color}14`,
            color: '#fff',
          }}
        >
          {block.label}
        </span>
      ))}

      {MUSIC_NOTES.map((note, i) => {
        const target = MUSIC_BLOCKS[note.block]
        return (
          <motion.span
            key={i}
            className="absolute text-sm font-bold"
            style={{ color }}
            initial={{ left: '12%', top: '50%', opacity: 0, scale: 0.6 }}
            animate={{
              left: ['12%', target.x, target.x],
              top: ['50%', target.y, target.y],
              opacity: [0, 1, 1, 0],
              scale: [0.6, 1, 1, 0.6],
            }}
            transition={{
              duration: 3,
              times: [0, 0.5, 0.85, 1],
              repeat: Infinity,
              repeatDelay: 1.4,
              delay: note.delay,
              ease: 'easeInOut',
            }}
          >
            ♪
          </motion.span>
        )
      })}
    </div>
  )
}

// Grilla mini-calendario con el día de "hoy" pulsando + un globito estilo
// WhatsApp con la campana de Nymoo que aparece y desaparece en loop, como
// pidió el cliente ("día de hoy se ilumina" + "mensaje entrante con campana
// parpadeando") -- sin armar un mockup de celular literal, que a este
// tamaño de card se vería recargado; el lenguaje visual queda igual de
// claro con formas simples, mismo criterio que las otras dos previews.
const AGENDA_CELL_COUNT = 12
const AGENDA_TODAY_INDEX = 6

function AgendaAnimationPreview({ color }) {
  return (
    <div className="relative w-full h-full overflow-hidden flex items-center justify-center">
      <div className="grid grid-cols-4 gap-1.5">
        {Array.from({ length: AGENDA_CELL_COUNT }).map((_, i) =>
          i === AGENDA_TODAY_INDEX ? (
            <motion.span
              key={i}
              className="w-5 h-5 rounded-md"
              style={{ background: color }}
              animate={{ scale: [1, 1.15, 1], boxShadow: [`0 0 0 0px ${color}80`, `0 0 6px 2px ${color}00`] }}
              transition={{ duration: 1.8, repeat: Infinity, ease: 'easeInOut' }}
            />
          ) : (
            <span key={i} className="w-5 h-5 rounded-md" style={{ background: `${color}14`, border: `1px solid ${color}30` }} />
          )
        )}
      </div>

      <motion.div
        className="absolute bottom-3 right-3 flex items-center gap-1.5 px-2.5 py-1.5 rounded-xl rounded-br-sm shadow-lg"
        style={{ background: '#111827', border: `1px solid ${color}50` }}
        initial={{ opacity: 0, scale: 0.6, y: 10 }}
        animate={{ opacity: [0, 1, 1, 0], scale: [0.6, 1, 1, 0.6], y: [10, 0, 0, 10] }}
        transition={{ duration: 3.4, times: [0, 0.25, 0.8, 1], repeat: Infinity, repeatDelay: 1.2, ease: 'easeInOut' }}
      >
        <Bell className="w-3.5 h-3.5" style={{ color }} />
        <span className="text-[10px] font-bold text-white">Nymoo</span>
      </motion.div>
    </div>
  )
}

const TOOL_PREVIEWS = {
  tables: { Component: TableAnimationPreview, Icon: Table2 },
  playlist: { Component: PlaylistAnimationPreview, Icon: ListMusic },
  agenda: { Component: AgendaAnimationPreview, Icon: CalendarClock },
}

function ToolCard({ tool }) {
  const { Component: Preview, Icon: TaglineIcon } = TOOL_PREVIEWS[tool.preview] || TOOL_PREVIEWS.tables
  const light = shadeColor(tool.accentColor, 20)
  const borderGradient = tool.badge
    ? GOLD_GRADIENT
    : `linear-gradient(160deg, ${light}80, transparent 45%, ${tool.accentColor}30)`

  return (
    <motion.div
      initial={{ opacity: 0, y: 24 }}
      whileInView={{ opacity: 1, y: 0 }}
      viewport={{ once: true }}
      transition={{ duration: 0.5 }}
      whileHover={{ y: -6 }}
      className="relative rounded-3xl p-px h-full"
      style={{ background: borderGradient }}
    >
      {tool.badge && (
        <motion.div
          className="absolute -top-3.5 left-1/2 -translate-x-1/2 z-10 px-4 py-1.5 rounded-full text-xs font-bold tracking-wide text-white shadow-lg whitespace-nowrap"
          style={{ backgroundImage: GOLD_GRADIENT, backgroundSize: '200% 100%' }}
          animate={{ backgroundPosition: ['0% 50%', '100% 50%', '0% 50%'] }}
          transition={{ duration: 3.5, repeat: Infinity, ease: 'easeInOut' }}
        >
          {tool.badge.emoji} {tool.badge.label}
        </motion.div>
      )}

      <div className="h-full rounded-[calc(1.5rem-1px)] bg-neutral-950/80 backdrop-blur-xl border border-white/5 p-6 md:p-7 flex flex-col">
        <div
          className="h-40 rounded-2xl mb-6 relative overflow-hidden shrink-0"
          style={{ background: `linear-gradient(135deg, ${tool.accentColor}33, transparent)` }}
        >
          <div className="absolute w-40 h-40 rounded-full blur-2xl opacity-40" style={{ background: tool.accentColor }} />
          <Preview color={tool.accentColor} />
        </div>

        <div className="flex items-center gap-2 mb-1.5">
          <TaglineIcon className="w-4 h-4" style={{ color: tool.accentColor }} />
          <p className="text-xs uppercase tracking-widest text-white/40">{tool.tagline}</p>
        </div>
        <h3 className="text-lg font-bold mb-1.5">{tool.name}</h3>
        <p className="text-3xl font-extrabold" style={{ color: tool.accentColor }}>
          {tool.price}
        </p>
        <p className="text-white/50 text-[11px] mt-1.5 mb-2.5 leading-snug">{tool.paymentNote}</p>

        {/* Insignia de combo: aviso de que esta herramienta suma descuento
            si se combina con un pack o con las otras herramientas (ver
            ComboPromoBanner.jsx, arriba de esta grilla, para el detalle
            exacto de los porcentajes). */}
        <motion.div
          className="inline-flex items-center gap-1.5 self-start px-2.5 py-1 rounded-full text-[10px] font-semibold mb-5"
          style={{ background: `${tool.accentColor}18`, color: tool.accentColor, border: `1px solid ${tool.accentColor}40` }}
          animate={{ opacity: [0.7, 1, 0.7] }}
          transition={{ duration: 2.2, repeat: Infinity, ease: 'easeInOut' }}
        >
          <Tag className="w-3 h-3" />
          Aplica para descuento en Combo
        </motion.div>

        <ul className="space-y-2.5 mb-7 flex-1">
          {tool.features.map((feature) => (
            <li key={feature} className="flex items-start gap-2.5 text-sm text-white/70">
              <Check className="w-4 h-4 shrink-0 mt-0.5" style={{ color: tool.accentColor }} />
              <span className="min-w-0">{feature}</span>
            </li>
          ))}
        </ul>

        <Button as={Link} to={`/checkout?pack=${tool.id}`} primaryColor={tool.accentColor} className="w-full py-3.5 shadow-lg">
          <ShoppingCart className="w-4 h-4" />
          Comprar ahora
        </Button>
      </div>
    </motion.div>
  )
}

// Separado a propósito de ServicesSection.jsx: estos no arman una
// invitación nueva, son complementos que se compran solos o junto a un
// pack (ver LANDING_TOOL_IDS / isToolOnlyOrder en Checkout.jsx), así que
// visualmente van en su propio bloque con encabezado distinto.
function ToolsSection() {
  return (
    <section className="relative py-16 md:py-20 px-4 md:px-8">
      <div className="max-w-6xl mx-auto text-center mb-12">
        <div className="flex items-center gap-4 max-w-xs mx-auto mb-4">
          <span className="h-px flex-1" style={{ background: `linear-gradient(90deg, transparent, ${BRAND.lime}60)` }} />
          <p className="uppercase tracking-[0.3em] text-xs shrink-0" style={{ color: BRAND.lime }}>
            Nuestras herramientas
          </p>
          <span className="h-px flex-1" style={{ background: `linear-gradient(90deg, ${BRAND.lime}60, transparent)` }} />
        </div>
        <h2 className="font-extrabold tracking-tight" style={{ fontSize: 'clamp(1.5rem, 3.5vw, 2.1rem)' }}>
          Complementos que se suman solos o con tu pack
        </h2>
      </div>

      <ComboPromoBanner />

      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6 max-w-6xl mx-auto items-stretch">
        {LANDING_TOOLS.map((tool) => (
          <ToolCard key={tool.id} tool={tool} />
        ))}
      </div>
    </section>
  )
}

export default ToolsSection

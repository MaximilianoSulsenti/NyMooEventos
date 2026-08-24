import { motion, AnimatePresence } from 'motion/react'
import { BRAND } from '../../utils/brand'
import { EVENT_TYPE_OPTIONS, THEME_OPTIONS, TYPOGRAPHY_OPTIONS } from '../../utils/orderForm'

const inputClass =
  'w-full rounded-xl bg-white/5 border border-white/10 px-3 py-2.5 text-sm outline-none transition-colors focus:border-[var(--accent)] focus:ring-2 focus:ring-[var(--accent)]/30'
const labelClass = 'block text-sm text-white/60 mb-1.5'

function Field({ label, children }) {
  return (
    <div>
      <label className={labelClass}>{label}</label>
      {children}
    </div>
  )
}

function SectionCard({ title, subtitle, children }) {
  return (
    <div className="rounded-2xl bg-white/[0.03] border border-white/10 p-5 sm:p-6 space-y-4">
      <div>
        <h3 className="text-base font-semibold">{title}</h3>
        {subtitle && <p className="text-white/40 text-xs mt-0.5">{subtitle}</p>}
      </div>
      {children}
    </div>
  )
}

function ColorInput({ label, value, onChange }) {
  return (
    <div>
      <label className={labelClass}>{label}</label>
      <div className="flex items-center gap-2">
        <input
          type="color"
          value={value}
          onChange={(e) => onChange(e.target.value)}
          className="w-11 h-11 rounded-lg cursor-pointer bg-transparent border border-white/10 shrink-0"
        />
        <input type="text" value={value} onChange={(e) => onChange(e.target.value)} className={inputClass} />
      </div>
    </div>
  )
}

// Formulario compartido entre el checkout público (Checkout.jsx) y la carga
// manual del admin (OrdersDashboard.jsx) -- misma data, dos contextos. El
// que llama maneja el estado (`form`) y recibe los cambios por `onField`.
function OrderForm({ form, onField }) {
  function update(section, field, val) {
    onField(section, field, val)
  }

  return (
    <div className="space-y-5" style={{ '--accent': BRAND.blue }}>
      <SectionCard title="Datos básicos">
        <div className="grid sm:grid-cols-2 gap-4">
          <Field label="Nombre(s) de quien organiza *">
            <input
              type="text"
              required
              value={form.clientData.name}
              onChange={(e) => update('clientData', 'name', e.target.value)}
              placeholder="Ej: Sofía y Martín"
              className={inputClass}
            />
          </Field>
          <Field label="Teléfono">
            <input
              type="tel"
              value={form.clientData.phone}
              onChange={(e) => update('clientData', 'phone', e.target.value)}
              placeholder="011 1234 5678"
              className={inputClass}
            />
          </Field>
          <Field label="Email">
            <input
              type="email"
              value={form.clientData.email}
              onChange={(e) => update('clientData', 'email', e.target.value)}
              placeholder="tuemail@ejemplo.com"
              className={inputClass}
            />
          </Field>
          <Field label="Tipo de evento">
            <select
              value={form.eventData.eventType}
              onChange={(e) => update('eventData', 'eventType', e.target.value)}
              className={inputClass}
            >
              <option value="">Elegir...</option>
              {EVENT_TYPE_OPTIONS.map((opt) => (
                <option key={opt} value={opt}>
                  {opt}
                </option>
              ))}
            </select>
          </Field>
          <Field label="Protagonistas (nombres para la invitación)">
            <input
              type="text"
              value={form.eventData.protagonists}
              onChange={(e) => update('eventData', 'protagonists', e.target.value)}
              placeholder="Ej: Sofía & Martín"
              className={inputClass}
            />
          </Field>
          <Field label="Fecha del evento">
            <input
              type="date"
              value={form.eventData.date}
              onChange={(e) => update('eventData', 'date', e.target.value)}
              className={inputClass}
            />
          </Field>
          <Field label="Hora">
            <input
              type="time"
              value={form.eventData.time}
              onChange={(e) => update('eventData', 'time', e.target.value)}
              className={inputClass}
            />
          </Field>
          <Field label="Lugar o lugares (ceremonia, fiesta)">
            <input
              type="text"
              value={form.eventData.locations}
              onChange={(e) => update('eventData', 'locations', e.target.value)}
              placeholder="Ej: Iglesia San José / Salón Los Robles"
              className={inputClass}
            />
          </Field>
        </div>
      </SectionCard>

      <SectionCard title="Estética" subtitle="Un punto de partida -- lo terminamos de definir juntos por WhatsApp.">
        <div className="grid sm:grid-cols-2 gap-4">
          <Field label="Tema">
            <select
              value={form.designPresets.theme}
              onChange={(e) => update('designPresets', 'theme', e.target.value)}
              className={inputClass}
            >
              <option value="">Elegir...</option>
              {THEME_OPTIONS.map((opt) => (
                <option key={opt} value={opt}>
                  {opt}
                </option>
              ))}
            </select>
          </Field>
          <Field label="Tipografía sugerida">
            <select
              value={form.designPresets.typography}
              onChange={(e) => update('designPresets', 'typography', e.target.value)}
              className={inputClass}
            >
              <option value="">Elegir...</option>
              {TYPOGRAPHY_OPTIONS.map((opt) => (
                <option key={opt} value={opt}>
                  {opt}
                </option>
              ))}
            </select>
          </Field>
        </div>
        <div className="grid sm:grid-cols-3 gap-4">
          <ColorInput
            label="Color primario"
            value={form.designPresets.primaryColor}
            onChange={(v) => update('designPresets', 'primaryColor', v)}
          />
          <ColorInput
            label="Color secundario"
            value={form.designPresets.secondaryColor}
            onChange={(v) => update('designPresets', 'secondaryColor', v)}
          />
          <ColorInput
            label="Color terciario"
            value={form.designPresets.tertiaryColor}
            onChange={(v) => update('designPresets', 'tertiaryColor', v)}
          />
        </div>
        <Field label="Instrucciones de fondo particular (opcional)">
          <textarea
            rows={2}
            value={form.designPresets.customBgInstructions}
            onChange={(e) => update('designPresets', 'customBgInstructions', e.target.value)}
            placeholder="Ej: nos gustaría un fondo con flores secas, tonos tierra"
            className={inputClass}
          />
        </Field>
      </SectionCard>

      <SectionCard title="¿La tarjeta de tu fiesta tiene costo para los invitados?">
        <div className="flex items-center gap-3">
          <button
            type="button"
            role="switch"
            aria-checked={form.guestCardDetails.hasCost}
            onClick={() => update('guestCardDetails', 'hasCost', !form.guestCardDetails.hasCost)}
            className="relative w-11 h-6 rounded-full transition-colors shrink-0"
            style={{ background: form.guestCardDetails.hasCost ? BRAND.blue : 'rgba(255,255,255,0.12)' }}
          >
            <span
              className={`absolute top-1 left-1 w-4 h-4 rounded-full bg-white transition-transform ${
                form.guestCardDetails.hasCost ? 'translate-x-5' : ''
              }`}
            />
          </button>
          <span className="text-sm text-white/70">{form.guestCardDetails.hasCost ? 'Sí, tiene costo' : 'No, es gratuita'}</span>
        </div>

        <AnimatePresence initial={false}>
          {form.guestCardDetails.hasCost && (
            <motion.div
              initial={{ height: 0, opacity: 0 }}
              animate={{ height: 'auto', opacity: 1 }}
              exit={{ height: 0, opacity: 0 }}
              transition={{ duration: 0.25 }}
              className="overflow-hidden"
            >
              <div className="grid sm:grid-cols-2 gap-4 pt-4">
                <Field label="Precio por tarjeta">
                  <input
                    type="number"
                    min={0}
                    value={form.guestCardDetails.pricePerCard}
                    onChange={(e) => update('guestCardDetails', 'pricePerCard', e.target.value)}
                    placeholder="$"
                    className={inputClass}
                  />
                </Field>
                <Field label="Detalles del menú / qué incluye">
                  <input
                    type="text"
                    value={form.guestCardDetails.includesMenuDetails}
                    onChange={(e) => update('guestCardDetails', 'includesMenuDetails', e.target.value)}
                    placeholder="Ej: recepción, plato principal y barra libre"
                    className={inputClass}
                  />
                </Field>
                <div className="sm:col-span-2">
                  <Field label="Instrucciones de pago para tus invitados">
                    <textarea
                      rows={2}
                      value={form.guestCardDetails.paymentInstructions}
                      onChange={(e) => update('guestCardDetails', 'paymentInstructions', e.target.value)}
                      placeholder="Ej: colocar nuestro alias para que transfieran directo"
                      className={inputClass}
                    />
                  </Field>
                </div>
              </div>
            </motion.div>
          )}
        </AnimatePresence>
      </SectionCard>

      <SectionCard title="Información extra">
        <div className="grid sm:grid-cols-2 gap-4">
          <Field label="Dress code">
            <input
              type="text"
              value={form.additionalInfo.dressCode}
              onChange={(e) => update('additionalInfo', 'dressCode', e.target.value)}
              placeholder="Ej: Formal, colores tierra"
              className={inputClass}
            />
          </Field>
          <Field label="Datos bancarios (alias/CBU para regalos)">
            <input
              type="text"
              value={form.additionalInfo.bankDetails}
              onChange={(e) => update('additionalInfo', 'bankDetails', e.target.value)}
              placeholder="alias.banco"
              className={inputClass}
            />
          </Field>
          <div className="sm:col-span-2">
            <Field label="Otros tips importantes">
              <textarea
                rows={2}
                value={form.additionalInfo.importantTips}
                onChange={(e) => update('additionalInfo', 'importantTips', e.target.value)}
                placeholder="Cualquier otro detalle que nos quieras contar"
                className={inputClass}
              />
            </Field>
          </div>
        </div>
      </SectionCard>
    </div>
  )
}

export default OrderForm

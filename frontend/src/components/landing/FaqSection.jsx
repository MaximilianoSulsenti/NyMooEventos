import { useState } from 'react'
import { motion, AnimatePresence } from 'motion/react'
import { ChevronDown } from 'lucide-react'
import { BRAND } from '../../utils/brand'

const FAQS = [
  {
    question: '¿Cómo elijo los modelos de invitación?',
    answer:
      'Cada invitación se arma sobre uno de nuestros temas base (minimalista, moderno, romántico, bohemio, elegante, festivo y más), pero la personalización es total: elegís colores, tipografía, imágenes y qué secciones mostrar. No es una plantilla fija, es tu invitación.',
  },
  {
    question: '¿Cómo funciona la confirmación de invitados (RSVP)?',
    answer:
      'Vos elegís el sistema que mejor se adapte a tu evento: confirmación directa por WhatsApp, un formulario que guarda las respuestas en una base de datos con estadísticas en vivo, o un sistema de cupos VIP personalizado con pase individual por invitado.',
  },
  {
    question: '¿Cómo funciona el Álbum Digital y la Pantalla en Vivo?',
    answer:
      'Generamos un código QR único para tu evento: cada invitado lo escanea y sube sus fotos y videos desde el celular, sin instalar nada. Las imágenes se comprimen automáticamente a 4MB para que la subida sea rápida incluso con mal wifi, y vos controlás el Modo Fiesta (moderación de fotos, efectos de confetti, luces y más) desde un panel en tiempo real.',
  },
  {
    question: '¿Cuánto tiempo demoran en entregar la invitación?',
    answer: 'El plazo estándar de entrega es de menos de 3 días desde que confirmamos todos los datos de tu evento.',
  },
  {
    question: '¿Cuáles son los métodos de pago disponibles?',
    answer: 'Aceptamos transferencia bancaria, Mercado Pago y efectivo. Coordinamos el método que te resulte más cómodo por WhatsApp.',
  },
]

function FaqItem({ faq, isOpen, onToggle }) {
  return (
    <div className="border border-white/10 rounded-2xl overflow-hidden bg-white/[0.02]">
      <button
        type="button"
        onClick={onToggle}
        className="w-full flex items-center justify-between gap-4 px-5 py-4 text-left"
      >
        <span className="font-medium text-sm md:text-base">{faq.question}</span>
        <motion.span
          animate={{ rotate: isOpen ? 180 : 0 }}
          transition={{ duration: 0.25 }}
          className="shrink-0"
          style={{ color: BRAND.blue }}
        >
          <ChevronDown className="w-5 h-5" />
        </motion.span>
      </button>
      <AnimatePresence initial={false}>
        {isOpen && (
          <motion.div
            initial={{ height: 0, opacity: 0 }}
            animate={{ height: 'auto', opacity: 1 }}
            exit={{ height: 0, opacity: 0 }}
            transition={{ duration: 0.25 }}
            className="overflow-hidden"
          >
            <p className="px-5 pb-4 text-sm text-white/60 leading-relaxed">{faq.answer}</p>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  )
}

function FaqSection() {
  const [openIndex, setOpenIndex] = useState(0)

  return (
    <section id="faq" className="relative py-16 md:py-24 px-4 md:px-8">
      <div className="max-w-3xl mx-auto text-center mb-12">
        <p className="uppercase tracking-[0.3em] text-xs mb-3 text-white/40">Preguntas frecuentes</p>
        <h2 className="font-extrabold tracking-tight" style={{ fontSize: 'clamp(1.75rem, 4vw, 2.5rem)' }}>
          Todo lo que necesitás saber
        </h2>
      </div>

      <div className="max-w-2xl mx-auto flex flex-col gap-3">
        {FAQS.map((faq, index) => (
          <FaqItem
            key={faq.question}
            faq={faq}
            isOpen={openIndex === index}
            onToggle={() => setOpenIndex(openIndex === index ? -1 : index)}
          />
        ))}
      </div>
    </section>
  )
}

export default FaqSection

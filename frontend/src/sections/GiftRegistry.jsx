import { useState } from 'react'
import { motion } from 'motion/react'
import { Gift } from 'lucide-react'
import Button from '../components/ui/Button'
import GiftModal from '../components/GiftModal'
import AnimatedIcon from '../components/AnimatedIcon'
import { glassStyle, glassBlurClass } from '../utils/glass'
import { cn } from '../utils/cn'
import { CARD_REVEAL } from '../utils/motionPresets'
import { secondaryTextColor, titleTextStyle } from '../utils/color'

function GiftRegistry({ config, appearance, styles }) {
  const [isOpen, setIsOpen] = useState(false)
  const primaryColor = appearance?.primaryColor
  const titleSize = config.fontSizeTitle || 'text-2xl'
  const subtitleSize = config.fontSizeSubtitle || 'text-base'

  if (!config.cbuAlias && !config.holderName) return null

  return (
    <section className={`px-6 ${styles.fontClass}`}>
      <motion.div
        {...CARD_REVEAL}
        className={cn(
          'relative flex flex-col items-center gap-4 text-center border overflow-hidden mx-auto max-w-md px-8 py-10',
          glassBlurClass(config),
          styles.card
        )}
        style={{
          ...glassStyle(config),
          boxShadow: 'inset 0 1px 0 rgba(255,255,255,0.06), inset 0 -1px 0 rgba(0,0,0,0.3), 0 12px 30px -12px rgba(0,0,0,0.5)',
        }}
      >
        <div className="absolute top-0 inset-x-0 h-[2px]" style={{ background: primaryColor }} />

        <AnimatedIcon
          icon={Gift}
          className="w-12 h-12 rounded-full flex items-center justify-center"
          style={{ background: `${primaryColor}22`, color: primaryColor }}
          iconClassName="w-6 h-6"
        />

        <h2 className={`${titleSize} ${styles.heading}`} style={titleTextStyle(config)}>
          {config.title || 'Lista de regalos'}
        </h2>

        <p className={`max-w-sm ${subtitleSize}`} style={{ color: secondaryTextColor(config.textColor, 'b3') }}>
          {config.subtitle || 'Tu presencia ya es un regalo, pero si querés sumar un detalle para nuestra nueva etapa, esto te va a servir.'}
        </p>

        <Button type="button" onClick={() => setIsOpen(true)} primaryColor={primaryColor}>
          <Gift className="w-4 h-4" />
          {config.buttonText || 'Regalar un detalle'}
        </Button>
      </motion.div>

      {isOpen && <GiftModal config={config} primaryColor={primaryColor} onClose={() => setIsOpen(false)} />}
    </section>
  )
}

export default GiftRegistry

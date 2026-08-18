import { QRCodeSVG } from 'qrcode.react'

function QrCode({ value, size = 144 }) {
  return (
    <div className="inline-flex flex-col items-center gap-2">
      <div className="bg-white p-3 rounded-lg">
        <QRCodeSVG value={value} size={size} level="M" />
      </div>
      <p className="text-neutral-500 text-xs">Escaneá para subir fotos</p>
    </div>
  )
}

export default QrCode

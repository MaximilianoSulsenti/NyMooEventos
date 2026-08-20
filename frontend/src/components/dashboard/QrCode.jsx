import { useRef } from 'react'
import { QRCodeCanvas } from 'qrcode.react'

function QrCode({ value, size = 160, filename = 'qr-subir-fotos.png' }) {
  const canvasRef = useRef(null)

  function handleDownload() {
    const canvas = canvasRef.current
    if (!canvas) return

    const url = canvas.toDataURL('image/png')
    const link = document.createElement('a')
    link.href = url
    link.download = filename
    document.body.appendChild(link)
    link.click()
    document.body.removeChild(link)
  }

  return (
    <div className="inline-flex flex-col items-center gap-2">
      <div className="bg-white p-3 rounded-lg">
        <QRCodeCanvas ref={canvasRef} value={value} size={size} level="M" />
      </div>
      <button
        type="button"
        onClick={handleDownload}
        className="text-xs text-purple-400 hover:text-purple-300 transition underline underline-offset-2"
      >
        Descargar QR
      </button>
    </div>
  )
}

export default QrCode

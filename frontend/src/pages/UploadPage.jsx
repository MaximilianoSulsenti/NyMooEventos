import { useParams } from 'react-router-dom'
import UploadPhotosForm from '../components/UploadPhotosForm'

function UploadPage() {
  const { eventSlug } = useParams()

  return (
    <div className="min-h-screen flex flex-col items-center justify-center gap-4 p-6 bg-neutral-950">
      <h1 className="text-2xl font-semibold text-white">Subí tus fotos del evento</h1>
      <UploadPhotosForm eventSlug={eventSlug} />
    </div>
  )
}

export default UploadPage

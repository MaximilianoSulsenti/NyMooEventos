import imageCompression from 'browser-image-compression'
import api from '../services/api'

// Mismo flujo que UploadPhotosForm.jsx: firma -> comprimir del lado del
// cliente -> subir directo a Cloudinary -> devolver la URL ya confiable
// (el backend la vuelve a validar igual al crear/editar el perfil, ver
// matchController.js). 1400px alcanza de sobra para una selfie en una
// tarjeta -- más chico que el 2000px de fotos de galería porque acá el
// objetivo es que suba rápido con la wifi del salón, no imprimir la foto.
export async function uploadMatchSelfie(eventSlug, file) {
  const { data: signData } = await api.get(`/match/${eventSlug}/sign-photo`)

  let uploadFile = file
  try {
    uploadFile = await imageCompression(file, {
      maxSizeMB: 4,
      maxWidthOrHeight: 1400,
      useWebWorker: true,
    })
  } catch {
    // Si la compresión falla con un archivo inusual, se sube el original.
  }

  const form = new FormData()
  form.append('file', uploadFile)
  form.append('api_key', signData.apiKey)
  form.append('timestamp', signData.timestamp)
  form.append('signature', signData.signature)
  form.append('folder', signData.folder)

  const res = await fetch(`https://api.cloudinary.com/v1_1/${signData.cloudName}/image/upload`, {
    method: 'POST',
    body: form,
  })
  if (!res.ok) {
    throw new Error('No se pudo subir la foto')
  }
  const data = await res.json()
  return { photoUrl: data.secure_url, photoPublicId: data.public_id }
}

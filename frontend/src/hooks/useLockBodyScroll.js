import { useEffect } from 'react'

// Bloquea el scroll de la página de fondo mientras un modal está montado.
// Sin esto, en mobile se puede seguir deslizando el contenido de atrás
// mientras el modal está abierto, y queda todo superpuesto/mezclado.
function useLockBodyScroll() {
  useEffect(() => {
    const previous = document.body.style.overflow
    document.body.style.overflow = 'hidden'
    return () => {
      document.body.style.overflow = previous
    }
  }, [])
}

export default useLockBodyScroll

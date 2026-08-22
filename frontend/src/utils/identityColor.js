import { BRAND } from './brand'

const IDENTITY_COLORS = [BRAND.blue, BRAND.pink, BRAND.lime, BRAND.orange, BRAND.violet]

// Hash simple y determinístico: la misma persona (mismo nombre) siempre cae
// en el mismo color, tanto en la pantalla en vivo como en el libro de
// mensajes, para que se sienta como la misma identidad en todos lados.
export function identityColor(name) {
  let hash = 0
  for (let i = 0; i < name.length; i++) hash = (hash * 31 + name.charCodeAt(i)) >>> 0
  return IDENTITY_COLORS[hash % IDENTITY_COLORS.length]
}

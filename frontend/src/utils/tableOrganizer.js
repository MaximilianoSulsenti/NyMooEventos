import * as XLSX from 'xlsx'

const HEADER_WORDS = new Set(['nombre', 'nombres', 'invitado', 'invitados', 'apellido y nombre', 'guest', 'name', 'apellido'])

// Lee la primera hoja de un Excel/CSV y devuelve los nombres de la primera
// columna -- si la primera fila parece un encabezado (ej. "Nombre"), se
// descarta en vez de importarla como si fuera un invitado más.
export async function parseGuestNamesFromFile(file) {
  const buffer = await file.arrayBuffer()
  const workbook = XLSX.read(buffer, { type: 'array' })
  const firstSheetName = workbook.SheetNames[0]
  if (!firstSheetName) return []

  const sheet = workbook.Sheets[firstSheetName]
  const rows = XLSX.utils.sheet_to_json(sheet, { header: 1, blankrows: false })

  const names = rows
    .map((row) => (row[0] !== undefined && row[0] !== null ? String(row[0]).trim() : ''))
    .filter(Boolean)

  if (names.length > 0 && HEADER_WORDS.has(names[0].toLowerCase())) {
    names.shift()
  }

  return names
}

// Verde con lugar, amarillo por llenarse, rojo al límite -- mismo criterio
// en la barra de ocupación de la card y en el modal de asignación.
export function occupancyColor(occupied, maxSeats) {
  if (maxSeats <= 0) return '#f87171'
  const ratio = occupied / maxSeats
  if (ratio >= 1) return '#f87171'
  if (ratio >= 0.7) return '#facc15'
  return '#4ade80'
}

export function sortNamesEs(names) {
  return [...names].sort((a, b) => a.localeCompare(b, 'es', { sensitivity: 'base' }))
}

// Arma y descarga el Excel con la distribución de mesas -- una sección por
// mesa, invitados ordenados alfabéticamente, lista para imprimir o mandarle
// al salón el día del evento.
export function downloadTablesExcel(eventName, tables) {
  const rows = []
  const sortedTables = [...tables].sort((a, b) => a.tableNumber - b.tableNumber)

  sortedTables.forEach((table, index) => {
    if (index > 0) rows.push([])
    rows.push([`${table.tableName} (Mesa ${table.tableNumber}) · ${table.assignedGuests.length}/${table.maxSeats}`])
    const sortedGuests = sortNamesEs(table.assignedGuests)
    if (sortedGuests.length === 0) {
      rows.push(['(sin invitados asignados)'])
    } else {
      sortedGuests.forEach((name) => rows.push([name]))
    }
  })

  const sheet = XLSX.utils.aoa_to_sheet(rows)
  sheet['!cols'] = [{ wch: 42 }]
  const workbook = XLSX.utils.book_new()
  XLSX.utils.book_append_sheet(workbook, sheet, 'Distribución de mesas')
  const safeName = (eventName || 'evento').toLowerCase().replace(/[^a-z0-9]+/g, '-')
  XLSX.writeFile(workbook, `distribucion-mesas-${safeName}.xlsx`)
}

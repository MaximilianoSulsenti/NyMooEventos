import * as XLSX from 'xlsx'

// Antes esto era un CSV armado a mano (guestsToCsv en csv.js) -- se veía
// "desordenado" al abrirlo porque Excel no siempre respeta bien el
// delimitador/las comillas de un CSV, y la columna de acompañantes solo
// mostraba un número (companionsCount) sin los nombres reales
// (companionNames, que el RSVP sí guarda). Un .xlsx real como el que ya se
// arma para el cronograma musical (ver playlistOrganizer.js) evita todos los
// problemas de formato y deja lugar para las dos columnas de acompañantes.
export function downloadGuestsExcel(eventName, guests) {
  const extraQuestions = [...new Set(guests.flatMap((guest) => Object.keys(guest.extraAnswers || {})))]

  const header = [
    'Nombre',
    'Estado',
    'Cantidad de acompañantes',
    'Nombres de los acompañantes',
    'Restricciones alimentarias',
    'Canción sugerida',
    ...extraQuestions,
  ]

  const rows = guests.map((guest) => [
    guest.name,
    guest.rsvpCompleted === false ? 'Solo canción (sin RSVP)' : guest.status,
    guest.companionsCount || 0,
    (guest.companionNames || []).filter(Boolean).join(', '),
    guest.dietaryRestrictions || '',
    guest.songRequest || '',
    ...extraQuestions.map((question) => guest.extraAnswers?.[question] || ''),
  ])

  const sheet = XLSX.utils.aoa_to_sheet([header, ...rows])
  sheet['!cols'] = [
    { wch: 26 },
    { wch: 16 },
    { wch: 14 },
    { wch: 32 },
    { wch: 26 },
    { wch: 30 },
    ...extraQuestions.map(() => ({ wch: 24 })),
  ]

  const workbook = XLSX.utils.book_new()
  XLSX.utils.book_append_sheet(workbook, sheet, 'Confirmados')
  const safeName = (eventName || 'evento').toLowerCase().replace(/[^a-z0-9]+/g, '-')
  XLSX.writeFile(workbook, `confirmados-${safeName}.xlsx`)
}

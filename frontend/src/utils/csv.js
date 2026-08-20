function escapeCsvValue(value) {
  return `"${String(value ?? '').replace(/"/g, '""')}"`
}

export function guestsToCsv(guests) {
  const header = ['Nombre', 'Estado', 'Acompañantes', 'Restricciones alimentarias']
  const rows = guests.map((guest) => [
    guest.name,
    guest.status,
    guest.companionsCount,
    guest.dietaryRestrictions,
  ])
  return [header, ...rows].map((row) => row.map(escapeCsvValue).join(',')).join('\n')
}

export function downloadCsv(csvContent, filename) {
  const blob = new Blob(['﻿' + csvContent], { type: 'text/csv;charset=utf-8;' })
  const url = URL.createObjectURL(blob)
  const link = document.createElement('a')
  link.href = url
  link.download = filename
  document.body.appendChild(link)
  link.click()
  document.body.removeChild(link)
  URL.revokeObjectURL(url)
}

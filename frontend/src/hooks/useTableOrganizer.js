import { useMemo, useState } from 'react'

// Todas las mutaciones acá son inmutables (spread, no push/splice en el
// array existente) para que React detecte los cambios sin sorpresas, y los
// "pendientes" se derivan de un Set armado una sola vez por render en vez
// de hacer un .some() por invitado contra todas las mesas -- con listas de
// cientos de nombres, eso es la diferencia entre O(n) y O(n*m).
function useTableOrganizer(initialGuests = [], initialTables = []) {
  const [guests, setGuests] = useState(initialGuests)
  const [tables, setTables] = useState(initialTables)

  const assignedSet = useMemo(() => {
    const set = new Set()
    tables.forEach((table) => table.assignedGuests.forEach((name) => set.add(name)))
    return set
  }, [tables])

  const pendingGuests = useMemo(() => guests.filter((name) => !assignedSet.has(name)), [guests, assignedSet])

  function loadFromServer(nextGuests, nextTables) {
    setGuests(nextGuests)
    setTables(nextTables)
  }

  function addGuests(names) {
    setGuests((prev) => {
      const existing = new Set(prev)
      const additions = names.map((n) => n.trim()).filter((n) => n && !existing.has(n))
      return additions.length > 0 ? [...prev, ...additions] : prev
    })
  }

  function removeGuest(name) {
    setGuests((prev) => prev.filter((g) => g !== name))
    // Si estaba sentado en alguna mesa, lo saca de ahí también -- de otra
    // forma quedaría un nombre "fantasma" asignado que ya no existe en el
    // banco general (el backend además lo rechazaría al guardar).
    setTables((prev) => prev.map((t) => (t.assignedGuests.includes(name) ? { ...t, assignedGuests: t.assignedGuests.filter((g) => g !== name) } : t)))
  }

  function addTable({ tableName, maxSeats }) {
    setTables((prev) => {
      const nextNumber = prev.reduce((max, t) => Math.max(max, t.tableNumber), 0) + 1
      return [...prev, { tableNumber: nextNumber, tableName: tableName.trim() || `Mesa ${nextNumber}`, maxSeats, assignedGuests: [] }]
    })
  }

  function deleteTable(tableNumber) {
    setTables((prev) => prev.filter((t) => t.tableNumber !== tableNumber))
  }

  function renameTable(tableNumber, tableName) {
    setTables((prev) => prev.map((t) => (t.tableNumber === tableNumber ? { ...t, tableName } : t)))
  }

  function assignGuestsToTable(tableNumber, names) {
    setTables((prev) =>
      prev.map((t) => {
        if (t.tableNumber !== tableNumber) return t
        const merged = [...new Set([...t.assignedGuests, ...names])]
        return { ...t, assignedGuests: merged.slice(0, t.maxSeats) }
      })
    )
  }

  function unassignGuest(tableNumber, name) {
    setTables((prev) =>
      prev.map((t) => (t.tableNumber === tableNumber ? { ...t, assignedGuests: t.assignedGuests.filter((g) => g !== name) } : t))
    )
  }

  return {
    guests,
    tables,
    pendingGuests,
    loadFromServer,
    addGuests,
    removeGuest,
    addTable,
    deleteTable,
    renameTable,
    assignGuestsToTable,
    unassignGuest,
  }
}

export default useTableOrganizer

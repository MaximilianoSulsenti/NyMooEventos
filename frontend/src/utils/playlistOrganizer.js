import * as XLSX from 'xlsx'

// Alias de encabezados aceptados por columna -- si el Excel trae una fila de
// título que coincide con alguno de estos, se usa esa columna. "title" y
// "artist" incluyen también los nombres que usa Exportify (la herramienta
// gratis para bajar una playlist de Spotify a Excel, ver SongBankPanel.jsx),
// así un archivo bajado de ahí se reconoce igual que uno armado a mano.
const HEADER_ALIASES = {
  title: ['titulo', 'título', 'cancion', 'canción', 'tema', 'song', 'title', 'track name', 'track_name'],
  artist: ['artista', 'interprete', 'intérprete', 'artist', 'artist name', 'artist name(s)', 'artist_name'],
  notes: ['notas', 'nota', 'comentario', 'comentarios', 'notes'],
  moment: ['momento', 'momento del evento', 'tanda', 'bloque', 'moment'],
}

// Orden fijo Título/Artista/Notas/Momento -- el que está documentado en el
// hint de la UI ("Columnas: Título, Artista, Notas y Momento (opcional)")
// para cuando alguien arma el Excel a mano SIN fila de encabezado.
const DEFAULT_COLUMNS = { title: 0, artist: 1, notes: 2, moment: 3 }
const NO_COLUMNS = { title: -1, artist: -1, notes: -1, moment: -1 }

// Si NO se reconoce ningún encabezado en la primera fila, se asume el
// formato propio sin encabezado (orden fijo de arriba). Pero si se
// reconoce AL MENOS UNO, ya sabemos que el archivo tiene su propio layout
// de columnas -- puede venir de otra fuente, como Exportify (la
// herramienta gratis para bajar una playlist de Spotify a Excel, ver
// SongBankPanel.jsx) -- y ahí ningún campo puede asumir una posición fija:
// antes acá "momento" siempre caía en la columna D pasara lo que pasara, y
// un archivo de Exportify tiene OTRA cosa ahí (el álbum), así que cada
// canción se leía como si fuera un momento del evento distinto, creando un
// bloque nuevo por cada tema. Ahora, en un archivo con layout propio, un
// campo sin encabezado reconocido queda sin columna (-1) en vez de adivinar.
function detectColumns(headerRow) {
  const normalized = (headerRow || []).map((h) => String(h || '').trim().toLowerCase())
  const found = {}
  let matched = false

  Object.keys(HEADER_ALIASES).forEach((key) => {
    const idx = normalized.findIndex((h) => HEADER_ALIASES[key].includes(h))
    if (idx !== -1) {
      found[key] = idx
      matched = true
    }
  })

  const columns = matched ? { ...NO_COLUMNS, ...found } : { ...DEFAULT_COLUMNS, ...found }
  return { columns, matched }
}

function cellToString(row, index) {
  if (index < 0) return ''
  const value = row[index]
  return value !== undefined && value !== null ? String(value).trim() : ''
}

// Lee la primera hoja de un Excel/CSV y devuelve las canciones con Título,
// Artista, Notas y (si la columna existe) el Momento del evento al que
// pertenecen -- el hook usePlaylistOrganizer.addTracks() distribuye cada
// una al banco general o directo al bloque según traiga momento o no.
export async function parsePlaylistFromFile(file) {
  const buffer = await file.arrayBuffer()
  const workbook = XLSX.read(buffer, { type: 'array' })
  const firstSheetName = workbook.SheetNames[0]
  if (!firstSheetName) return []

  const sheet = workbook.Sheets[firstSheetName]
  const rows = XLSX.utils.sheet_to_json(sheet, { header: 1, blankrows: false })
  if (rows.length === 0) return []

  const { columns, matched } = detectColumns(rows[0])
  const dataRows = matched ? rows.slice(1) : rows

  return dataRows
    .map((row) => {
      const title = cellToString(row, columns.title)
      if (!title) return null
      return {
        title,
        artist: cellToString(row, columns.artist),
        notes: cellToString(row, columns.notes),
        momentType: cellToString(row, columns.moment),
      }
    })
    .filter(Boolean)
}

// Reconoce links públicos de playlist de Spotify (open.spotify.com/playlist/<id>,
// con o sin "intl-xx/" en el medio, con o sin query string tipo ?si=...) y
// devuelve la URL del iframe de embed oficial -- o null si no matchea, para
// que MomentCard.jsx sepa cuándo mostrar el reproductor y cuándo no.
const SPOTIFY_PLAYLIST_REGEX = /open\.spotify\.com\/(?:intl-\w+\/)?playlist\/([a-zA-Z0-9]+)/

export function getSpotifyEmbedUrl(spotifyUrl) {
  const match = String(spotifyUrl || '').match(SPOTIFY_PLAYLIST_REGEX)
  if (!match) return null
  return `https://open.spotify.com/embed/playlist/${match[1]}`
}

// Arma y descarga el Excel con el cronograma musical -- una sección por
// momento del evento, en el orden en que se armaron los bloques, lista para
// entregarle al DJ o imprimir.
export function downloadPlaylistExcel(eventName, moments) {
  const rows = []

  moments.forEach((moment, index) => {
    if (index > 0) rows.push([])
    rows.push([`${index + 1}. ${moment.momentType} (${moment.tracks.length} tema${moment.tracks.length === 1 ? '' : 's'})`])
    if (moment.tracks.length === 0) {
      rows.push(['(sin canciones asignadas)'])
    } else {
      rows.push(['Título', 'Artista', 'Notas'])
      moment.tracks.forEach((track) => {
        rows.push([track.title, track.artist || '', track.notes || ''])
      })
    }
  })

  const sheet = XLSX.utils.aoa_to_sheet(rows)
  sheet['!cols'] = [{ wch: 32 }, { wch: 22 }, { wch: 40 }]
  const workbook = XLSX.utils.book_new()
  XLSX.utils.book_append_sheet(workbook, sheet, 'Cronograma musical')
  const safeName = (eventName || 'evento').toLowerCase().replace(/[^a-z0-9]+/g, '-')
  XLSX.writeFile(workbook, `cronograma-musical-${safeName}.xlsx`)
}

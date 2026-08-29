// Checklists pre-armados por tipo de evento -- cada tarea define
// `daysBefore` (días antes de la fecha del evento) en vez de una fecha fija,
// así la plantilla sirve para cualquier evento sin importar cuándo sea; la
// fecha real se calcula en el momento de cargarla (ver TemplatePickerModal.jsx)
// restando esos días a event.date.
export const AGENDA_TEMPLATES = [
  {
    id: 'boda',
    label: 'Boda / Casamiento',
    tasks: [
      { title: 'Reservar salón o locación', category: 'Proveedor', daysBefore: 180 },
      { title: 'Pagar seña del salón', category: 'Pago/Presupuesto', daysBefore: 150 },
      { title: 'Contratar fotógrafo y video', category: 'Proveedor', daysBefore: 150 },
      { title: 'Definir lista de invitados', category: 'Otros', daysBefore: 120 },
      { title: 'Contratar DJ o banda', category: 'Proveedor', daysBefore: 100 },
      { title: 'Prueba de vestido/traje', category: 'Cita/Reunión', daysBefore: 90 },
      { title: 'Enviar invitaciones', category: 'Otros', daysBefore: 60 },
      { title: 'Prueba de maquillaje y peinado', category: 'Cita/Reunión', daysBefore: 45 },
      { title: 'Confirmar catering y menú', category: 'Proveedor', daysBefore: 45 },
      { title: 'Coordinar cronograma con el DJ', category: 'Proveedor', daysBefore: 14 },
      { title: 'Confirmar número final de invitados', category: 'Otros', daysBefore: 10 },
      { title: 'Prueba final de vestido/traje', category: 'Cita/Reunión', daysBefore: 7 },
    ],
  },
  {
    id: 'xv',
    label: 'Cumpleaños de 15',
    tasks: [
      { title: 'Reservar salón', category: 'Proveedor', daysBefore: 150 },
      { title: 'Contratar DJ o banda', category: 'Proveedor', daysBefore: 120 },
      { title: 'Elegir y probar el vestido', category: 'Cita/Reunión', daysBefore: 60 },
      { title: 'Ensayar la coreografía del vals', category: 'Cita/Reunión', daysBefore: 45 },
      { title: 'Enviar invitaciones', category: 'Otros', daysBefore: 45 },
      { title: 'Confirmar catering', category: 'Proveedor', daysBefore: 30 },
      { title: 'Prueba de maquillaje y peinado', category: 'Cita/Reunión', daysBefore: 14 },
      { title: 'Confirmar número final de invitados', category: 'Otros', daysBefore: 7 },
    ],
  },
  {
    id: 'cumple',
    label: 'Cumpleaños',
    tasks: [
      { title: 'Reservar salón o locación', category: 'Proveedor', daysBefore: 30 },
      { title: 'Contratar catering', category: 'Proveedor', daysBefore: 21 },
      { title: 'Encargar la torta', category: 'Proveedor', daysBefore: 14 },
      { title: 'Enviar invitaciones', category: 'Otros', daysBefore: 14 },
      { title: 'Confirmar número final de invitados', category: 'Otros', daysBefore: 5 },
    ],
  },
  {
    id: 'corporativo',
    label: 'Evento corporativo',
    tasks: [
      { title: 'Reservar salón o locación', category: 'Proveedor', daysBefore: 90 },
      { title: 'Definir agenda y oradores', category: 'Otros', daysBefore: 60 },
      { title: 'Contratar catering', category: 'Proveedor', daysBefore: 30 },
      { title: 'Enviar invitaciones y confirmaciones', category: 'Otros', daysBefore: 30 },
      { title: 'Coordinar audio y proyección', category: 'Proveedor', daysBefore: 14 },
      { title: 'Confirmar número final de asistentes', category: 'Otros', daysBefore: 5 },
    ],
  },
]

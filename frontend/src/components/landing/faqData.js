import { BRAND } from '../../utils/brand'
import { LANDING_PACKS, LANDING_TOOLS } from '../../utils/landingConfig'

// Colores de cada pack/herramienta tomados de LANDING_PACKS/LANDING_TOOLS
// (una sola fuente de verdad) en vez de repetir hex sueltos acá -- si el
// color de un pack o herramienta cambia en ServicesSection/ToolsSection, el
// FAQ se actualiza solo.
const PACK_COLOR = Object.fromEntries(LANDING_PACKS.map((p) => [p.id, p.accentColor]))
const TOOL_COLOR = Object.fromEntries(LANDING_TOOLS.map((t) => [t.id, t.accentColor]))

// Los textos usan **negrita** y *cursiva* estilo markdown liviano -- los
// parsea <FaqAnswer> en FaqSection.jsx, así el contenido queda como texto
// plano acá (fácil de editar) sin mezclar JSX en la data.
export const FAQ_CATEGORIES = [
  {
    title: 'Modelos, diseños y fotos',
    color: BRAND.blue,
    items: [
      {
        question: '¿Cuál es la diferencia entre los 3 modelos de invitación y cuál es el más elegido?',
        blocks: [
          {
            type: 'list',
            items: [
              {
                label: 'Nymoo INVITA ($50.000)',
                color: PACK_COLOR.invita,
                text: 'Es la invitación base digital interactiva. Perfecta para quienes buscan elegancia y practicidad con confirmación directa al WhatsApp.',
              },
              {
                label: 'Nymoo CONECTA ($70.000) · 🌟 El más elegido',
                color: PACK_COLOR.conecta,
                text: 'Es nuestro plan estrella porque introduce la interactividad total con los invitados mediante el Álbum Digital Colaborativo con FOTOS ILIMITADAS por QR e integra las confirmaciones en nuestra base de datos con estadísticas en vivo.',
              },
              {
                label: 'Nymoo VIVE ($100.000) · La experiencia premium',
                color: PACK_COLOR.vive,
                text: 'Diseñado para quienes no quieren dejar ningún detalle al azar. Incluye invitaciones VIP con pases individuales personalizados por nombre/familia, el álbum multimedia completo (fotos y videos cortos en el QR), el Libro de Firmas digital y la proyección en Pantalla en Vivo con el Modo Fiesta y el espectacular Carrusel 3D tridimensional.',
              },
            ],
          },
        ],
      },
      {
        question: '¿Las invitaciones pueden incluir fotos de los anfitriones?',
        blocks: [
          {
            type: 'text',
            text: '¡Por supuesto! Todos los planes permiten cargar fotografías. Para garantizar que la invitación mantenga una estética limpia, equilibrada y cargue al instante en teléfonos móviles, te recomendamos la siguiente distribución:',
          },
          {
            type: 'list',
            items: [
              {
                label: 'Nymoo INVITA',
                color: PACK_COLOR.invita,
                text: 'Un máximo recomendado de **10 a 15 fotos** distribuidas estratégicamente entre la Portada (Hero), la sección de Nuestra Historia y una pequeña Galería estática.',
              },
              {
                label: 'Nymoo CONECTA y VIVE',
                color: PACK_COLOR.conecta,
                text: 'Permiten fotos de los anfitriones en secciones y carruseles premium, sumando además la carga masiva y colectiva de los invitados por QR el día de la fiesta con FOTOS ILIMITADAS.',
              },
            ],
          },
        ],
      },
      {
        question: '¿Puedo elegir cualquier diseño estético con cualquier plan?',
        blocks: [
          {
            type: 'text',
            text: 'Sí. El estilo estético (Minimalista, Moderno, Vanguardista, Romántica, etc.) es completamente independiente del paquete de funciones que contrates. Adaptamos y maquetamos visualmente cualquier diseño que te guste sobre el plan tecnológico que elijas.',
          },
        ],
      },
    ],
  },
  {
    title: 'Confirmación de invitados (RSVP) y acceso personalizado',
    color: BRAND.violet,
    items: [
      {
        question: '¿Cuál es la diferencia entre confirmar por WhatsApp y usar el Sistema de Confirmación Propia?',
        blocks: [
          {
            type: 'list',
            items: [
              {
                label: 'Confirmación por WhatsApp (Nymoo INVITA)',
                color: PACK_COLOR.invita,
                text: 'Cuando el invitado hace clic en confirmar, la plataforma abre automáticamente su aplicación de WhatsApp con un mensaje pre-armado que te envía directamente a tu chat privado.',
              },
              {
                label: 'Sistema de Confirmación Propia (Nymoo CONECTA y VIVE)',
                color: PACK_COLOR.conecta,
                text: 'Es un software inteligente integrado en la invitación. El invitado rellena sus datos (asistencia, menú especial, acompañantes) desde la misma web. La información viaja de forma invisible a tu base de datos y actualiza tus estadísticas de organización al instante.',
              },
            ],
          },
        ],
      },
      {
        question: '¿Cómo funciona la Invitación Personalizada VIP de Nymoo VIVE?',
        blocks: [
          {
            type: 'text',
            text: 'Es el control de accesos más exclusivo del mercado. Cada invitado o grupo familiar recibe un enlace único con su nombre. Al abrirlo, la invitación les da la bienvenida de forma personalizada (ej: *¡Bienvenidos Familia Pérez!*). Cuando van a confirmar asistencia, el sistema reconoce cuántos pases/cupos tienen permitidos exactamente, impidiendo que agreguen acompañantes de más por su cuenta y asegurando el control estricto de tus banquetes.',
          },
        ],
      },
      {
        question: '¿Puedo ver en tiempo real quién confirmó su asistencia?',
        blocks: [
          {
            type: 'text',
            text: 'Sí, en los planes Nymoo CONECTA y Nymoo VIVE tenés acceso exclusivo a un panel de control con estadísticas vivas de confirmados, pendientes y declinados. Lo mejor de todo es que podés **descargar la lista completa en un archivo Excel** con todas las respuestas, menús especiales y acompañantes consolidados con un solo clic en el momento que quieras.',
          },
        ],
      },
    ],
  },
  {
    title: 'Tiempos de entrega y cambios post-activación',
    color: BRAND.pink,
    items: [
      {
        question: '¿Cuáles son los tiempos de entrega de la invitación?',
        blocks: [
          {
            type: 'text',
            text: 'Nuestro compromiso estándar es entregar tu invitación lista y funcional en **menos de 3 días hábiles**. En caso de una urgencia máxima donde la necesites de inmediato, contamos con un servicio exprés de **entrega en menos de 24 horas** con un costo adicional.',
          },
        ],
      },
      {
        question: '¿Se pueden realizar ajustes en la invitación una vez activada y compartida?',
        blocks: [
          {
            type: 'text',
            text: '¡Por supuesto que sí! Al tratarse de una invitación digital web viva, podés realizar cualquier ajuste siempre que lo necesites sin preocuparte. Si requerís actualizar el precio de la tarjeta del salón, modificar el alias/CBU de regalos, corregir un horario, cambiar una ubicación o cualquier otro detalle, se puede hacer en cualquier momento. Al estar ya activada y en circulación, estos cambios conllevan un pequeño costo administrativo, pero se actualizan automáticamente en segundos: todos tus invitados verán la versión más reciente al instante sin necesidad de reenviar enlaces nuevos.',
          },
        ],
      },
    ],
  },
  {
    title: 'Envíos, formas de pago y congelamiento de precios',
    color: BRAND.lime,
    items: [
      {
        question: '¿Debo abonar un costo extra por cada invitación enviada?',
        blocks: [
          {
            type: 'text',
            text: 'No. Solo abonás el monto único fijo dependiendo del modelo que elijas (INVITA, CONECTA o VIVE). Podés enviar, difundir y compartir el enlace de tu invitación web con la cantidad de personas que desees; **los envíos son 100% ilimitados**.',
          },
        ],
      },
      {
        question: '¿Cuáles son las formas de pago de los servicios?',
        blocks: [
          {
            type: 'text',
            text: 'Podés pagar con tarjeta de débito o crédito **hasta en 3 cuotas**. Para comenzar a diseñar y trabajar en tu invitación, requerimos una seña del 50% o el pago completo del paquete. El saldo restante se abona convenientemente al momento de la entrega final del software listo. Podemos coordinar por WhatsApp la alternativa de pago que más cómoda te quede.',
          },
        ],
      },
      {
        question: '¿Se puede congelar el precio actual si mi evento es más adelante?',
        blocks: [
          {
            type: 'text',
            text: 'Sí, totalmente. Si querés asegurar los precios vigentes ante cualquier ajuste futuro, podés reservar tu cupo ahora y comenzar con el diseño más adelante. El precio actual **se congela por completo trabajando con una seña del 50%**, y el saldo restante se mantendrá intacto al momento de la entrega final, sin importar la fecha de tu celebración.',
          },
        ],
      },
    ],
  },
  {
    title: 'Herramientas complementarias: ORGANIZA, RITMO y AGENDA',
    color: BRAND.orange,
    items: [
      {
        question: '¿Qué hace cada una de las herramientas Nymoo ORGANIZA, RITMO y AGENDA?',
        blocks: [
          {
            type: 'list',
            items: [
              {
                label: 'Nymoo ORGANIZA ($30.000) · Organizador de mesas',
                color: TOOL_COLOR.mesas,
                text: 'Importás tu lista de invitados desde Excel y armás la distribución de mesas con control de capacidad y estadísticas en vivo. Al terminar, descargás el reporte final listo para imprimir y entregar en el salón.',
              },
              {
                label: 'Nymoo RITMO ($30.000) · Cronograma musical',
                color: TOOL_COLOR.playlist,
                text: 'Armás el cronograma musical del evento por bloques (Recepción, Cena, Hora Loca, Cierre, etc.). Podés importar canciones desde Excel -- incluso exportando tu propia playlist de Spotify -- y escuchar cada bloque con el reproductor de Spotify embebido, sin salir de la app.',
              },
              {
                label: 'Nymoo AGENDA ($30.000) · Agenda inteligente',
                color: TOOL_COLOR.agenda,
                text: 'Un calendario con todas las tareas y vencimientos previos al evento (pruebas, pagos, proveedores), organizado por urgencia. Te manda un **recordatorio automático por WhatsApp** en la fecha y hora que elijas para cada pendiente, así no se te pasa nada.',
              },
            ],
          },
        ],
      },
      {
        question: '¿Puedo comprar las herramientas solas, sin contratar un pack de invitación?',
        blocks: [
          {
            type: 'text',
            text: 'Sí, las tres se venden por separado y funcionan de forma independiente a la invitación. Además tenés descuentos por combo: si las combinás con cualquier Pack de Invitación (Nymoo INVITA, CONECTA o VIVE), cada herramienta extra suma descuento hasta **30% OFF en la suite completa**. Si comprás solo las herramientas sin pack, el descuento es **10% OFF llevando dos** y **20% OFF llevando las tres**.',
          },
        ],
      },
      {
        question: '¿Los recordatorios de Nymoo AGENDA me llegan a mí o al invitado?',
        blocks: [
          {
            type: 'text',
            text: 'Te llegan a vos (o al número de WhatsApp que cargues como responsable de cada tarea) -- son para que el organizador del evento no se olvide de sus propios pendientes, no una notificación para los invitados.',
          },
        ],
      },
    ],
  },
]

export const DUO_INFO = {
  title: 'Invitación Dúo: el complemento perfecto',
  intro:
    'La **Invitación Dúo** es la posibilidad de clonar tu invitación web para tener dos versiones con información diferenciada pero manteniendo la misma estética. Es la solución ideal en los siguientes escenarios:',
  scenarios: [
    {
      label: 'Cena vs. Post-Cena',
      text: 'Cuando tenés un grupo de invitados que asisten desde el inicio del banquete y otro grupo que se suma más tarde al baile.',
    },
    {
      label: 'Invitados con Tarjeta Pagada vs. Invitados Especiales',
      text: 'Ideal si algunos asistentes deben abonar el costo de la tarjeta del salón y otros no.',
    },
    {
      label: 'Ceremonia y Fiesta vs. Solo Fiesta',
      text: 'Para separar a los invitados que presenciarán la ceremonia religiosa/civil de los que van directo a la celebración en el salón.',
    },
  ],
  outro:
    'Es sumamente accesible: al contratar cualquiera de nuestros modelos principales (Nymoo INVITA, CONECTA o VIVE), la segunda versión de tu invitación (la versión Dúo con los datos modificados) cuenta de manera automática con un **50% de descuento** sobre el valor de la lista. Centralizás la organización y mantenés la armonía visual de tu día por una fracción del costo.',
}

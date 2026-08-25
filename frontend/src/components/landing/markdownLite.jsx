// Parser de markdown livianito: **negrita** y *cursiva*, nada más -- así el
// contenido de faqData.js queda como texto plano fácil de editar, sin
// mezclar JSX en la data. Compartido entre FaqSection.jsx y DuoPromo.jsx.
export function renderInline(text) {
  return text.split(/(\*\*[^*]+\*\*|\*[^*]+\*)/g).map((part, i) => {
    if (part.startsWith('**') && part.endsWith('**')) {
      return (
        <strong key={i} className="text-white font-semibold">
          {part.slice(2, -2)}
        </strong>
      )
    }
    if (part.startsWith('*') && part.endsWith('*')) {
      return <em key={i}>{part.slice(1, -1)}</em>
    }
    return part
  })
}

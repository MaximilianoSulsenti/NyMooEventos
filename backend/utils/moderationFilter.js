const BANNED_WORDS = [
  'puto',
  'puta',
  'mierda',
  'boludo',
  'idiota',
  'imbecil',
  'imbécil',
  'pelotudo',
  'estupido',
  'estúpido',
];

function containsBannedWord(text = '') {
  const normalized = text.toLowerCase();
  return BANNED_WORDS.some((word) => normalized.includes(word));
}

module.exports = { containsBannedWord };

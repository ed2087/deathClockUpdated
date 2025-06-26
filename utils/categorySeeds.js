// utils/categorySeeds.js
const genres = [
  {
    name: { en: 'Psychological Horror', es: 'Terror Psicológico' },
    slug: 'psychological-horror',
    type: 'genre',
    icon: '🧠',
    color: '#8b0000',
    legacyNames: ['Psychological Horror', 'Madness, Paranoia, and Mental Illness'],
    displayOrder: 1
  },
  {
    name: { en: 'Supernatural Horror', es: 'Terror Sobrenatural' },
    slug: 'supernatural-horror',
    type: 'genre',
    icon: '👻',
    color: '#4b0082',
    legacyNames: ['Supernatural Horror', 'Ghost Stories', 'Haunted House'],
    displayOrder: 2
  },
  {
    name: { en: 'Body Horror', es: 'Terror Corporal' },
    slug: 'body-horror',
    type: 'genre',
    icon: '🩸',
    color: '#dc143c',
    legacyNames: ['Body Horror', 'Body Snatcher Horror'],
    displayOrder: 3
  },
  {
    name: { en: 'Folk Horror', es: 'Terror Folklórico' },
    slug: 'folk-horror',
    type: 'genre',
    icon: '🌲',
    color: '#228b22',
    legacyNames: ['Folk Horror', 'Urban Legends', 'Myths and Legends'],
    displayOrder: 4
  },
  {
    name: { en: 'Sci-Fi Horror', es: 'Terror de Ciencia Ficción' },
    slug: 'scifi-horror',
    type: 'genre',
    icon: '🚀',
    color: '#1e90ff',
    legacyNames: ['Sci-Fi Horror', 'Alien Invasion', 'Technology, the Internet, and the Deep Web'],
    displayOrder: 5
  },
  {
    name: { en: 'Slasher', es: 'Slasher' },
    slug: 'slasher',
    type: 'genre',
    icon: '🔪',
    color: '#ff0000',
    legacyNames: ['Slasher', 'True Crime'],
    displayOrder: 6
  }
];

const formats = [
  {
    name: { en: 'Creepypasta', es: 'Creepypasta' },
    slug: 'creepypasta',
    type: 'format',
    icon: '📜',
    color: '#000000',
    legacyNames: ['Creepypasta'],
    displayOrder: 1
  },
  {
    name: { en: 'Short Stories', es: 'Cuentos Cortos' },
    slug: 'short-stories',
    type: 'format',
    icon: '📖',
    color: '#8b4513',
    legacyNames: ['Short Horror Stories', '2 sentence horror stories'],
    displayOrder: 2
  },
  {
    name: { en: 'True Stories', es: 'Historias Reales' },
    slug: 'true-stories',
    type: 'format',
    icon: '📰',
    color: '#2f4f4f',
    legacyNames: ['True Crime'],
    displayOrder: 3
  },
  {
    name: { en: 'Found Footage', es: 'Metraje Encontrado' },
    slug: 'found-footage',
    type: 'format',
    icon: '📹',
    color: '#696969',
    legacyNames: ['Found Footage'],
    displayOrder: 4
  }
];

const themes = [
  {
    name: { en: 'Monsters', es: 'Monstruos' },
    slug: 'monsters',
    type: 'theme',
    icon: '👹',
    color: '#8b0000',
    legacyNames: ['Monster Horror'],
    displayOrder: 1
  },
  {
    name: { en: 'Occult & Witchcraft', es: 'Ocultismo y Brujería' },
    slug: 'occult-witchcraft',
    type: 'theme',
    icon: '🔮',
    color: '#4b0082',
    legacyNames: ['Occult Horror', 'Witchcraft and Witches'],
    displayOrder: 2
  },
  {
    name: { en: 'Cursed Objects', es: 'Objetos Malditos' },
    slug: 'cursed-objects',
    type: 'theme',
    icon: '🪬',
    color: '#800080',
    legacyNames: ['Cursed Objects', 'Toys and Dolls'],
    displayOrder: 3
  },
  {
    name: { en: 'Conspiracies', es: 'Conspiraciones' },
    slug: 'conspiracies',
    type: 'theme',
    icon: '🕵️',
    color: '#2f4f4f',
    legacyNames: ['Conspiracies and Government'],
    displayOrder: 4
  }
];

module.exports = { genres, formats, themes };
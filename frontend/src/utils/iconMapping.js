// Icon mapping utility to convert text names to emojis
const iconMap = {
  // Transportation
  bike: '🚴',
  bus: '🚌',
  walking: '🚶',
  car: '🚗',

  // Energy
  lightbulb: '💡',
  plug: '🔌',
  sun: '☀️',
  shirt: '👕',

  // Water
  shower: '🚿',
  wrench: '🔧',
  rain: '🌧️',
  plate: '🍽️',

  // Waste
  recycle: '♻️',
  bag: '🛍️',
  straw: '🥤',
  seedling: '🌱',

  // Food
  salad: '🥗',
  apple: '🍎',
  bread: '🍞',
  herb: '🌿',

  // Nature
  tree: '🌳',
  evergreen: '🌲',
  wastebasket: '🗑️',
  bird: '🐦',

  // Achievements
  seedling: '🌱',
  herb: '🌿',
  deciduous_tree: '🌳',
  trophy: '🏆',
  earth_americas: '🌍',
  crown: '👑',
  fire: '🔥',
  zap: '⚡',
  gem: '💎',
  star2: '🌟',
  moneybag: '💰'
};

/**
 * Get emoji for a given icon name
 * @param {string} iconName - The text name of the icon
 * @returns {string} - The corresponding emoji or default seedling emoji
 */
export const getIconEmoji = (iconName) => {
  return iconMap[iconName] || '🌱';
};

export default iconMap;
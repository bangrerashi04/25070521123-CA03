/**
 * Small presentation helpers shared across the app.
 */

export function formatDuration(seconds = 0) {
  const safe = Math.max(0, Number(seconds) || 0);
  const minutes = Math.floor(safe / 60);
  const rest = Math.round(safe % 60);
  return `${minutes}:${String(rest).padStart(2, '0')}`;
}

export function formatTotalDuration(seconds = 0) {
  const safe = Math.max(0, Number(seconds) || 0);
  const hours = Math.floor(safe / 3600);
  const minutes = Math.round((safe % 3600) / 60);

  if (!safe) return '0 min';
  if (!hours) return `${minutes} min`;
  return `${hours}h ${minutes}m`;
}

export function initials(text = '') {
  return String(text)
    .trim()
    .split(/\s+/)
    .slice(0, 2)
    .map((word) => word[0] || '')
    .join('')
    .toUpperCase();
}

export function greeting(date = new Date()) {
  const hour = date.getHours();
  if (hour < 12) return 'Good morning';
  if (hour < 18) return 'Good afternoon';
  return 'Good evening';
}

const COVER_GRADIENTS = [
  'linear-gradient(135deg, #7c5cff 0%, #ff5ca8 100%)',
  'linear-gradient(135deg, #00c6ff 0%, #7c5cff 100%)',
  'linear-gradient(135deg, #ff9a44 0%, #ff5c7a 100%)',
  'linear-gradient(135deg, #33d69f 0%, #00a3ff 100%)',
  'linear-gradient(135deg, #f857a6 0%, #ff5858 100%)',
  'linear-gradient(135deg, #5b7cfa 0%, #33d69f 100%)',
  'linear-gradient(135deg, #b06ab3 0%, #4568dc 100%)',
  'linear-gradient(135deg, #ffb347 0%, #ffcc33 100%)',
];

/** Deterministic gradient so a song always keeps the same cover. */
export function coverGradient(seed = '') {
  let hash = 0;
  for (let i = 0; i < seed.length; i += 1) {
    hash = (hash * 31 + seed.charCodeAt(i)) % 100000;
  }
  return COVER_GRADIENTS[hash % COVER_GRADIENTS.length];
}

export function ratingStars(rating = 0) {
  return Array.from({ length: 5 }, (_, index) => index < Math.round(Number(rating) || 0));
}

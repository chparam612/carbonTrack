/**
 * Shared UI constants used across multiple components.
 * Import from here instead of re-defining locally.
 */

/** Tailwind class sets for tip difficulty badges. */
export const DIFFICULTY_COLORS = {
  easy:   'bg-green-100 text-green-700 dark:bg-green-900/30 dark:text-green-400',
  medium: 'bg-yellow-100 text-yellow-700 dark:bg-yellow-900/30 dark:text-yellow-400',
  hard:   'bg-red-100 text-red-700 dark:bg-red-900/30 dark:text-red-400',
};

/** Hex colours for AI score ratings (Insights page). */
export const RATING_COLORS = {
  excellent: '#2d5016',
  good:      '#3d6b1f',
  average:   '#DAA520',
  high:      '#D2691E',
  critical:  '#ef4444',
};

/** Human-readable labels for tip time-to-impact values. */
export const TIME_LABELS = {
  immediate: '⚡ Immediate',
  weeks:     '📅 Weeks',
  months:    '🗓️ Months',
};

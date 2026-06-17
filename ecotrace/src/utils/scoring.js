/**
 * Centralised scoring helpers.
 * Single source of truth for score colours, labels, and thresholds
 * used across Dashboard, Quiz, Tracker, and any future pages.
 */
import { BENCHMARKS } from '../data/emissionFactors.js';

/**
 * Colour for an annual footprint total (kg CO₂/yr).
 */
export function getScoreColor(total) {
  if (total < BENCHMARKS.india)  return '#2d5016';   // eco champion — forest green
  if (total < BENCHMARKS.target) return '#DAA520';   // on track — gold
  if (total < BENCHMARKS.global) return '#D2691E';   // average — amber
  return '#ef4444';                                   // high impact — red
}

/**
 * Label for an annual footprint total.
 * @returns {{ text: string, emoji: string }}
 */
export function getScoreLabel(total) {
  if (total < BENCHMARKS.india)  return { text: 'Eco Champion',      emoji: '🌟' };
  if (total < BENCHMARKS.target) return { text: 'On Track',          emoji: '👍' };
  if (total < BENCHMARKS.global) return { text: 'Room to Improve',   emoji: '📈' };
  return                                { text: 'High Impact',        emoji: '⚠️' };
}

/**
 * Colour for a running daily log total (kg CO₂ so far today).
 * Thresholds are lower because this is a partial-day tally.
 */
export function getDailyColor(kg) {
  if (kg < 5)  return '#2d5016';
  if (kg < 12) return '#DAA520';
  return '#ef4444';
}

/**
 * Colour for a completed day's log total (kg CO₂ for the whole day).
 * Slightly higher thresholds than getDailyColor.
 */
export function getLogColor(kg) {
  if (kg < 8)  return '#2d5016';
  if (kg < 15) return '#DAA520';
  return '#ef4444';
}

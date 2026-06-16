/**
 * Progress analysis engine.
 * Computes moving averages, linear regression trends, streaks, and summaries.
 *
 * All functions accept logs of shape: [{ date: 'YYYY-MM-DD', total: number }]
 */

// ── calculateMovingAverage ────────────────────────────────────────────────────

/**
 * Trailing moving average over a sorted log.
 * @param {Array} logs         - [{ date, total }]
 * @param {number} windowSize  - number of preceding + current points to average
 * @returns {number[]}         - array of averaged values, same length as input
 */
export function calculateMovingAverage(logs, windowSize = 7) {
  if (!logs || logs.length === 0) return [];

  const sorted = [...logs].sort((a, b) => new Date(a.date) - new Date(b.date));

  return sorted.map((_, i) => {
    const start = Math.max(0, i - windowSize + 1);
    const slice = sorted.slice(start, i + 1);
    return slice.reduce((s, l) => s + l.total, 0) / slice.length;
  });
}

// ── calculateTrend ────────────────────────────────────────────────────────────

/**
 * Linear regression over log totals.
 * @param {Array} logs
 * @returns {{ slope: number, direction: 'improving'|'worsening'|'stable' }}
 *   slope < 0 → emissions falling (improving)
 *   slope > 0 → emissions rising  (worsening)
 */
export function calculateTrend(logs) {
  if (!logs || logs.length <= 1) return { slope: 0, direction: 'stable' };

  const sorted = [...logs].sort((a, b) => new Date(a.date) - new Date(b.date));
  const totals = sorted.map((l) => l.total);
  const n = totals.length;
  const xMean = (n - 1) / 2;
  const yMean = totals.reduce((s, v) => s + v, 0) / n;

  let num = 0;
  let den = 0;
  totals.forEach((y, x) => {
    num += (x - xMean) * (y - yMean);
    den += (x - xMean) ** 2;
  });

  const slope = den !== 0 ? num / den : 0;

  let direction;
  if (slope < -0.1) direction = 'improving';
  else if (slope > 0.1) direction = 'worsening';
  else direction = 'stable';

  return { slope, direction };
}

// ── calculateStreak ───────────────────────────────────────────────────────────

/**
 * Count consecutive low-emission days at the tail of the log.
 * A day is "good" if its total ≤ the personal average of the whole log.
 * @param {Array} logs
 * @returns {number} number of consecutive good days ending at the most recent entry
 */
export function calculateStreak(logs) {
  if (!logs || logs.length === 0) return 0;

  const sorted = [...logs].sort((a, b) => new Date(a.date) - new Date(b.date));
  const avg = sorted.reduce((s, l) => s + l.total, 0) / sorted.length;

  let streak = 0;
  for (let i = sorted.length - 1; i >= 0; i--) {
    if (sorted[i].total <= avg) {
      streak++;
    } else {
      break;
    }
  }
  return streak;
}

// ── getProgressSummary ────────────────────────────────────────────────────────

/**
 * High-level summary of a daily-log series.
 * @param {Array} logs
 * @returns {{ trend: string, streak: number, weeklyAverage: number, bestDay: Object|null }}
 */
export function getProgressSummary(logs) {
  if (!logs || logs.length === 0) {
    return { trend: 'stable', streak: 0, weeklyAverage: 0, bestDay: null };
  }

  const sorted = [...logs].sort((a, b) => new Date(a.date) - new Date(b.date));
  const totals = sorted.map((l) => l.total);

  const weeklyAverage = totals.reduce((s, v) => s + v, 0) / totals.length;
  const { direction } = calculateTrend(sorted);
  const streak = calculateStreak(sorted);

  const minTotal = Math.min(...totals);
  const bestDay = sorted.find((l) => l.total === minTotal) || null;

  return { trend: direction, streak, weeklyAverage, bestDay };
}

// ── analyzeProgress (full legacy API) ────────────────────────────────────────

/**
 * Full analytics object — kept for backward compatibility with existing pages.
 * @param {Array} logs
 * @returns {Object}
 */
export function analyzeProgress(logs) {
  if (!logs || logs.length === 0) {
    return {
      movingAvg: [],
      trend: 0,
      streak: 0,
      momChange: null,
      projectedAnnual: null,
      bestDay: null,
      worstDay: null,
      personalAvg: null,
    };
  }

  const sorted = [...logs].sort((a, b) => new Date(a.date) - new Date(b.date));
  const totals = sorted.map((l) => l.total);

  const movingAvgValues = calculateMovingAverage(sorted, 7);
  const movingAvg = sorted.map((log, i) => ({
    date: log.date,
    avg: Math.round(movingAvgValues[i] * 100) / 100,
  }));

  const personalAvg = totals.reduce((s, v) => s + v, 0) / totals.length;
  const { slope } = calculateTrend(sorted);
  const streak = calculateStreak(sorted);

  let momChange = null;
  if (sorted.length >= 30) {
    const recent30 = totals.slice(-30);
    const prev30 = totals.slice(-60, -30);
    if (prev30.length > 0) {
      const recentAvg = recent30.reduce((s, v) => s + v, 0) / recent30.length;
      const prevAvg = prev30.reduce((s, v) => s + v, 0) / prev30.length;
      momChange = Math.round(((recentAvg - prevAvg) / prevAvg) * 100);
    }
  }

  const recentSlice = totals.slice(-30);
  const recentAvgForProjection = recentSlice.reduce((s, v) => s + v, 0) / recentSlice.length;
  const projectedAnnual = Math.round(recentAvgForProjection * 365);

  const minIdx = totals.indexOf(Math.min(...totals));
  const maxIdx = totals.indexOf(Math.max(...totals));
  const bestDay = { date: sorted[minIdx].date, value: sorted[minIdx].total };
  const worstDay = { date: sorted[maxIdx].date, value: sorted[maxIdx].total };

  return {
    movingAvg,
    trend: Math.round(slope * 100) / 100,
    streak,
    momChange,
    projectedAnnual,
    bestDay,
    worstDay,
    personalAvg: Math.round(personalAvg * 100) / 100,
  };
}

/**
 * Progress analysis engine.
 * Computes moving averages, regression trends, streaks, and projections.
 */

/**
 * @param {Array} logs - [{ date: 'YYYY-MM-DD', total: number, breakdown: {} }]
 * @returns {Object} Full analytics
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

  // Sort chronologically
  const sorted = [...logs].sort((a, b) => new Date(a.date) - new Date(b.date));
  const totals = sorted.map((l) => l.total);

  // ── 7-day moving average ──────────────────────────────────
  const movingAvg = sorted.map((log, i) => {
    const window = totals.slice(Math.max(0, i - 6), i + 1);
    const avg = window.reduce((s, v) => s + v, 0) / window.length;
    return { date: log.date, avg: Math.round(avg * 100) / 100 };
  });

  // ── Personal average ──────────────────────────────────────
  const personalAvg = totals.reduce((s, v) => s + v, 0) / totals.length;

  // ── Linear regression slope ───────────────────────────────
  // positive = worsening (CO₂ rising), negative = improving
  const n = totals.length;
  const xMean = (n - 1) / 2;
  const yMean = personalAvg;
  let num = 0, den = 0;
  totals.forEach((y, x) => {
    num += (x - xMean) * (y - yMean);
    den += (x - xMean) ** 2;
  });
  const slope = den !== 0 ? num / den : 0;

  // ── Current streak (consecutive days below personal avg) ──
  let streak = 0;
  for (let i = sorted.length - 1; i >= 0; i--) {
    if (sorted[i].total < personalAvg) streak++;
    else break;
  }

  // ── Month-over-month change ───────────────────────────────
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

  // ── Projected annual total ────────────────────────────────
  // Based on last 30 days (or all data if < 30 days)
  const recentSlice = totals.slice(-30);
  const recentAvgForProjection = recentSlice.reduce((s, v) => s + v, 0) / recentSlice.length;
  const projectedAnnual = Math.round(recentAvgForProjection * 365);

  // ── Best and worst day ────────────────────────────────────
  const minIdx = totals.indexOf(Math.min(...totals));
  const maxIdx = totals.indexOf(Math.max(...totals));
  const bestDay = { date: sorted[minIdx].date, value: sorted[minIdx].total };
  const worstDay = { date: sorted[maxIdx].date, value: sorted[maxIdx].total };

  return {
    movingAvg,
    trend: Math.round(slope * 100) / 100, // kg CO₂ change per day
    streak,
    momChange,
    projectedAnnual,
    bestDay,
    worstDay,
    personalAvg: Math.round(personalAvg * 100) / 100,
  };
}

import { describe, it, expect } from 'vitest';
import {
  calculateMovingAverage,
  calculateTrend,
  calculateStreak,
  getProgressSummary,
} from '../algorithms/progressAnalyzer.js';

const FLAT_LOGS = [
  { date: '2024-01-01', total: 5.0 },
  { date: '2024-01-02', total: 5.0 },
  { date: '2024-01-03', total: 5.0 },
  { date: '2024-01-04', total: 5.0 },
  { date: '2024-01-05', total: 5.0 },
  { date: '2024-01-06', total: 5.0 },
  { date: '2024-01-07', total: 5.0 },
];

const DOWNWARD_LOGS = [
  { date: '2024-01-01', total: 10.0 },
  { date: '2024-01-02', total: 9.0 },
  { date: '2024-01-03', total: 8.0 },
  { date: '2024-01-04', total: 7.0 },
  { date: '2024-01-05', total: 6.0 },
  { date: '2024-01-06', total: 5.0 },
  { date: '2024-01-07', total: 4.0 },
];

const UPWARD_LOGS = [
  { date: '2024-01-01', total: 3.0 },
  { date: '2024-01-02', total: 4.5 },
  { date: '2024-01-03', total: 6.0 },
  { date: '2024-01-04', total: 7.5 },
  { date: '2024-01-05', total: 9.0 },
];

const STREAK_LOGS = [
  { date: '2024-01-01', total: 8.0 },
  { date: '2024-01-02', total: 3.0 },
  { date: '2024-01-03', total: 2.5 },
  { date: '2024-01-04', total: 2.0 },
  { date: '2024-01-05', total: 1.8 },
];

describe('calculateMovingAverage', () => {
  it('returns same length array as input', () => {
    const result = calculateMovingAverage(FLAT_LOGS, 3);
    expect(result.length).toBe(FLAT_LOGS.length);
  });

  it('returns 5.0 for all points on flat data', () => {
    const result = calculateMovingAverage(FLAT_LOGS, 3);
    result.forEach(v => expect(Math.abs(v - 5.0)).toBeLessThan(0.01));
  });

  it('smooths a noisy signal (output variance < input variance)', () => {
    const noisy = [
      { date: '2024-01-01', total: 1 },
      { date: '2024-01-02', total: 9 },
      { date: '2024-01-03', total: 2 },
      { date: '2024-01-04', total: 8 },
      { date: '2024-01-05', total: 3 },
      { date: '2024-01-06', total: 7 },
      { date: '2024-01-07', total: 4 },
    ];
    const smoothed = calculateMovingAverage(noisy, 3);
    const inputVariance = noisy.reduce((s, p) => s + Math.pow(p.total - 5, 2), 0);
    const mean = smoothed.reduce((s, v) => s + v, 0) / smoothed.length;
    const outputVariance = smoothed.reduce((s, v) => s + Math.pow(v - mean, 2), 0);
    expect(outputVariance).toBeLessThan(inputVariance);
  });

  it('returns empty array for empty input', () => {
    expect(calculateMovingAverage([], 3)).toHaveLength(0);
  });

  it('handles window larger than data length gracefully', () => {
    const result = calculateMovingAverage(FLAT_LOGS.slice(0, 2), 7);
    expect(result.length).toBe(2);
    result.forEach(v => expect(Number.isFinite(v)).toBe(true));
  });
});

describe('calculateTrend', () => {
  it('returns an object with slope and direction', () => {
    const result = calculateTrend(FLAT_LOGS);
    expect(result).toHaveProperty('slope');
    expect(result).toHaveProperty('direction');
  });

  it('slope is ~0 for flat data', () => {
    const result = calculateTrend(FLAT_LOGS);
    expect(Math.abs(result.slope)).toBeLessThan(0.1);
  });

  it('slope is negative for downward trend', () => {
    const result = calculateTrend(DOWNWARD_LOGS);
    expect(result.slope).toBeLessThan(0);
  });

  it('slope is positive for upward trend', () => {
    const result = calculateTrend(UPWARD_LOGS);
    expect(result.slope).toBeGreaterThan(0);
  });

  it('direction is "improving" for downward trend', () => {
    const result = calculateTrend(DOWNWARD_LOGS);
    expect(result.direction).toBe('improving');
  });

  it('direction is "worsening" for upward trend', () => {
    const result = calculateTrend(UPWARD_LOGS);
    expect(result.direction).toBe('worsening');
  });

  it('direction is "stable" for flat data', () => {
    const result = calculateTrend(FLAT_LOGS);
    expect(result.direction).toBe('stable');
  });

  it('handles single data point without throwing', () => {
    expect(() => calculateTrend([{ date: '2024-01-01', total: 5 }])).not.toThrow();
  });

  it('returns finite slope for all real inputs', () => {
    [FLAT_LOGS, DOWNWARD_LOGS, UPWARD_LOGS].forEach(logs => {
      expect(Number.isFinite(calculateTrend(logs).slope)).toBe(true);
    });
  });
});

describe('calculateStreak', () => {
  it('returns a non-negative integer', () => {
    const result = calculateStreak(STREAK_LOGS);
    expect(Number.isInteger(result)).toBe(true);
    expect(result).toBeGreaterThanOrEqual(0);
  });

  it('returns 0 for empty logs', () => {
    expect(calculateStreak([])).toBe(0);
  });

  it('counts consecutive low-emission days at end of log', () => {
    const result = calculateStreak(STREAK_LOGS);
    expect(result).toBeGreaterThanOrEqual(4);
  });

  it('streak resets when a high-emission day appears', () => {
    const logs = [
      { date: '2024-01-01', total: 2.0 },
      { date: '2024-01-02', total: 2.0 },
      { date: '2024-01-03', total: 15.0 },
      { date: '2024-01-04', total: 2.0 },
      { date: '2024-01-05', total: 2.0 },
    ];
    const result = calculateStreak(logs);
    expect(result).toBeLessThanOrEqual(2);
  });

  it('perfect streak across all days returns total day count', () => {
    const allGood = Array.from({ length: 10 }, (_, i) => ({
      date: `2024-01-${String(i + 1).padStart(2, '0')}`,
      total: 1.5,
    }));
    expect(calculateStreak(allGood)).toBe(10);
  });
});

describe('getProgressSummary', () => {
  it('returns an object with expected keys', () => {
    const result = getProgressSummary(DOWNWARD_LOGS);
    expect(result).toHaveProperty('trend');
    expect(result).toHaveProperty('streak');
    expect(result).toHaveProperty('weeklyAverage');
    expect(result).toHaveProperty('bestDay');
  });

  it('weeklyAverage is the mean of totals', () => {
    const result = getProgressSummary(FLAT_LOGS);
    expect(Math.abs(result.weeklyAverage - 5.0)).toBeLessThan(0.01);
  });

  it('bestDay is the entry with the lowest total', () => {
    const result = getProgressSummary(DOWNWARD_LOGS);
    expect(result.bestDay.total).toBe(4.0);
  });

  it('handles single day without throwing', () => {
    expect(() => getProgressSummary([{ date: '2024-01-01', total: 3.0 }])).not.toThrow();
  });
});

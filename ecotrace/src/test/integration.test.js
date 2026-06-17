/**
 * Integration tests — full pipeline: quiz → footprint → tips → progress.
 * These tests exercise multiple algorithm modules working together,
 * catching cross-module regressions that unit tests miss.
 */
import { describe, it, expect } from 'vitest';
import { calculateFootprint } from '../algorithms/carbonCalculator.js';
import { rankTips, getTopTips } from '../algorithms/tipRanker.js';
import { getProgressSummary, analyzeProgress } from '../algorithms/progressAnalyzer.js';

const TYPICAL_ANSWERS = {
  vehicle_type: 'car_petrol',
  km_per_day: 25,
  flights_per_year: 2,
  avg_flight_duration: 'short',
  diet_type: 'meat_regular',
  meals_out_per_week: 5,
  monthly_kwh: 300,
  energy_source: 'india_grid',
  ac_months: 6,
  shopping_frequency: 'moderate',
  online_orders_month: 8,
  recycling_habit: 'recycles_some',
  composting: 'no',
};

const HIGH_TRANSPORT_ANSWERS = {
  vehicle_type: 'car_petrol',
  km_per_day: 80,
  flights_per_year: 8,
  avg_flight_duration: 'long',
  diet_type: 'vegetarian',
  meals_out_per_week: 3,
  monthly_kwh: 150,
  energy_source: 'india_grid',
  ac_months: 4,
  shopping_frequency: 'minimal',
  online_orders_month: 2,
  recycling_habit: 'recycles_most',
  composting: 'yes',
};

describe('Full pipeline: quiz → footprint → tips → progress', () => {
  it('produces a valid footprint from typical answers', () => {
    const footprint = calculateFootprint(TYPICAL_ANSWERS);
    expect(footprint.total).toBeGreaterThan(0);
    expect(footprint.transport).toBeGreaterThanOrEqual(0);
    expect(footprint.diet).toBeGreaterThanOrEqual(0);
    expect(footprint.energy).toBeGreaterThanOrEqual(0);
    expect(footprint.shopping).toBeGreaterThanOrEqual(0);
    expect(footprint.waste).toBeGreaterThanOrEqual(0);
    expect(footprint.transport + footprint.diet + footprint.energy + footprint.shopping + footprint.waste)
      .toBe(footprint.total);
  });

  it('ranks tips from a footprint and returns actionable results', () => {
    const footprint = calculateFootprint(TYPICAL_ANSWERS);
    const tips = rankTips(footprint);
    expect(tips.length).toBeGreaterThan(0);
    expect(tips[0]).toHaveProperty('annualSavingKg');
    expect(tips[0].annualSavingKg).toBeGreaterThan(0);
    // Tips should be sorted descending by saving
    for (let i = 1; i < tips.length; i++) {
      expect(tips[i].annualSavingKg).toBeLessThanOrEqual(tips[i - 1].annualSavingKg);
    }
  });

  it('getTopTips(n) returns at most n tips', () => {
    const footprint = calculateFootprint(TYPICAL_ANSWERS);
    const top3 = getTopTips(footprint, 3);
    expect(top3.length).toBeLessThanOrEqual(3);
    const top5 = getTopTips(footprint, 5);
    expect(top5.length).toBeLessThanOrEqual(5);
  });

  it('simulates 7 log days and returns progress summary', () => {
    const footprint = calculateFootprint(TYPICAL_ANSWERS);
    const dailyKg = footprint.total / 365;
    const logs = Array.from({ length: 7 }, (_, i) => ({
      date: `2024-01-${String(i + 1).padStart(2, '0')}`,
      total: dailyKg + (i % 2 === 0 ? 1 : -1), // alternating above/below
    }));

    const summary = getProgressSummary(logs);
    expect(summary).toHaveProperty('trend');
    expect(summary).toHaveProperty('weeklyAverage');
    expect(summary).toHaveProperty('streak');
    expect(['improving', 'worsening', 'stable']).toContain(summary.trend);
    expect(summary.weeklyAverage).toBeGreaterThan(0);
  });

  it('analyzeProgress returns movingAvg and projectedAnnual', () => {
    const logs = Array.from({ length: 10 }, (_, i) => ({
      date: `2024-01-${String(i + 1).padStart(2, '0')}`,
      total: 8 + Math.sin(i) * 2,
    }));
    const analytics = analyzeProgress(logs);
    expect(analytics.movingAvg.length).toBe(logs.length);
    expect(analytics.projectedAnnual).toBeGreaterThan(0);
    expect(typeof analytics.streak).toBe('number');
  });
});

describe('Top tip category matches highest-emission category', () => {
  it('transport-heavy profile gets transport tips first', () => {
    const footprint = calculateFootprint(HIGH_TRANSPORT_ANSWERS);
    expect(footprint.transport).toBeGreaterThan(footprint.diet);
    expect(footprint.transport).toBeGreaterThan(footprint.energy);

    const tips = rankTips(footprint);
    expect(tips.length).toBeGreaterThan(0);
    expect(tips[0].category).toBe('transport');
  });

  it('eco-friendly profile returns fewer high-impact tips', () => {
    const ecoAnswers = {
      vehicle_type: 'metro_train',
      km_per_day: 5,
      flights_per_year: 0,
      avg_flight_duration: 'short',
      diet_type: 'vegan',
      meals_out_per_week: 1,
      monthly_kwh: 50,
      energy_source: 'solar',
      ac_months: 0,
      shopping_frequency: 'minimal',
      online_orders_month: 1,
      recycling_habit: 'recycles_most',
      composting: 'yes',
    };
    const ecoFootprint = calculateFootprint(ecoAnswers);
    const heavyFootprint = calculateFootprint(HIGH_TRANSPORT_ANSWERS);

    expect(ecoFootprint.total).toBeLessThan(heavyFootprint.total);

    const ecoTips = rankTips(ecoFootprint);
    const heavyTips = rankTips(heavyFootprint);
    // High-transport profile should have higher max savings potential
    expect(heavyTips[0].annualSavingKg).toBeGreaterThanOrEqual(ecoTips[0].annualSavingKg);
  });
});

describe('Edge cases across the pipeline', () => {
  it('handles zero logs gracefully', () => {
    const summary = getProgressSummary([]);
    expect(summary.streak).toBe(0);
    expect(summary.trend).toBe('stable');
    expect(summary.weeklyAverage).toBe(0);
  });

  it('handles single log entry', () => {
    const logs = [{ date: '2024-01-01', total: 10 }];
    const summary = getProgressSummary(logs);
    expect(summary).toHaveProperty('trend');
    expect(summary.streak).toBeGreaterThanOrEqual(0);
  });

  it('footprint breakdown sums to total', () => {
    const answers = { ...TYPICAL_ANSWERS, diet_type: 'vegan', vehicle_type: 'metro_train' };
    const fp = calculateFootprint(answers);
    expect(fp.transport + fp.diet + fp.energy + fp.shopping + fp.waste).toBe(fp.total);
  });

  it('trees value is a positive integer', () => {
    const fp = calculateFootprint(TYPICAL_ANSWERS);
    expect(fp.trees).toBeGreaterThan(0);
    expect(Number.isInteger(fp.trees)).toBe(true);
  });
});

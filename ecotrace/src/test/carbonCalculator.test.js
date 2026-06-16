import { describe, it, expect } from 'vitest';
import { calculateFootprint, calculateDailyLog } from '../algorithms/carbonCalculator.js';

describe('calculateFootprint', () => {
  it('returns a number greater than 0 for a typical Indian user', () => {
    const result = calculateFootprint({
      vehicle_type: 'car_petrol',
      km_per_day: 20,
      flights_per_year: 2,
      avg_flight_duration: 'short',
      diet_type: 'meat_regular',
      meals_out_per_week: 5,
      monthly_kwh: 250,
      energy_source: 'india_grid',
      ac_months: 6,
      shopping_frequency: 'moderate',
      online_orders_month: 8,
      recycling_habit: 'recycles_some',
      composting: 'no',
    });
    expect(result.total).toBeGreaterThan(0);
  });

  it('vegan with metro travel has lower footprint than meat-eater with petrol car', () => {
    const low = calculateFootprint({
      vehicle_type: 'metro_train', km_per_day: 10, flights_per_year: 0,
      avg_flight_duration: 'short', diet_type: 'vegan', meals_out_per_week: 2,
      monthly_kwh: 100, energy_source: 'solar', ac_months: 2,
      shopping_frequency: 'minimal', online_orders_month: 1,
      recycling_habit: 'recycles_most', composting: 'yes',
    });
    const high = calculateFootprint({
      vehicle_type: 'car_petrol', km_per_day: 40, flights_per_year: 6,
      avg_flight_duration: 'long', diet_type: 'meat_heavy', meals_out_per_week: 14,
      monthly_kwh: 600, energy_source: 'india_grid', ac_months: 10,
      shopping_frequency: 'excessive', online_orders_month: 30,
      recycling_habit: 'no_recycling', composting: 'no',
    });
    expect(low.total).toBeLessThan(high.total);
  });

  it('returns breakdown with all 5 categories', () => {
    const result = calculateFootprint({
      vehicle_type: 'bus', km_per_day: 15, flights_per_year: 1,
      avg_flight_duration: 'short', diet_type: 'vegetarian', meals_out_per_week: 3,
      monthly_kwh: 200, energy_source: 'india_grid', ac_months: 4,
      shopping_frequency: 'moderate', online_orders_month: 5,
      recycling_habit: 'recycles_some', composting: 'sometimes',
    });
    expect(result.breakdown).toHaveProperty('transport');
    expect(result.breakdown).toHaveProperty('diet');
    expect(result.breakdown).toHaveProperty('energy');
    expect(result.breakdown).toHaveProperty('shopping');
    expect(result.breakdown).toHaveProperty('waste');
  });

  it('work from home user has near-zero transport emissions', () => {
    const result = calculateFootprint({
      vehicle_type: 'work_from_home', km_per_day: 0, flights_per_year: 0,
      avg_flight_duration: 'short', diet_type: 'vegetarian', meals_out_per_week: 3,
      monthly_kwh: 200, energy_source: 'india_grid', ac_months: 4,
      shopping_frequency: 'moderate', online_orders_month: 5,
      recycling_habit: 'recycles_some', composting: 'no',
    });
    expect(result.breakdown.transport).toBeLessThan(50);
  });
});

describe('calculateDailyLog', () => {
  it('sums CO2 across multiple entries', () => {
    const entries = [
      { category: 'transport', type: 'car_petrol', value: 10 },
      { category: 'diet', type: 'vegetarian', value: 1 },
    ];
    const result = calculateDailyLog(entries);
    expect(result.total).toBeGreaterThan(0);
  });

  it('returns 0 for empty log', () => {
    const result = calculateDailyLog([]);
    expect(result.total).toBe(0);
  });
});

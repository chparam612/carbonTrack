import { describe, it, expect } from 'vitest';
import { calculateFootprint, calculateDailyLog } from '../algorithms/carbonCalculator.js';

const BASE_INPUT = {
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
};

const LOW_IMPACT_INPUT = {
  vehicle_type: 'metro_train',
  km_per_day: 5,
  flights_per_year: 0,
  avg_flight_duration: 'short',
  diet_type: 'vegan',
  meals_out_per_week: 1,
  monthly_kwh: 80,
  energy_source: 'solar',
  ac_months: 1,
  shopping_frequency: 'minimal',
  online_orders_month: 1,
  recycling_habit: 'recycles_most',
  composting: 'yes',
};

const HIGH_IMPACT_INPUT = {
  vehicle_type: 'car_petrol',
  km_per_day: 60,
  flights_per_year: 10,
  avg_flight_duration: 'long',
  diet_type: 'meat_heavy',
  meals_out_per_week: 21,
  monthly_kwh: 800,
  energy_source: 'india_grid',
  ac_months: 12,
  shopping_frequency: 'excessive',
  online_orders_month: 40,
  recycling_habit: 'no_recycling',
  composting: 'no',
};

describe('calculateFootprint — return shape', () => {
  it('returns an object with total and all 5 category keys', () => {
    const result = calculateFootprint(BASE_INPUT);
    expect(result).toHaveProperty('total');
    expect(result).toHaveProperty('transport');
    expect(result).toHaveProperty('diet');
    expect(result).toHaveProperty('energy');
    expect(result).toHaveProperty('shopping');
    expect(result).toHaveProperty('waste');
  });

  it('total equals sum of all category values', () => {
    const r = calculateFootprint(BASE_INPUT);
    const sum = r.transport + r.diet + r.energy + r.shopping + r.waste;
    expect(Math.abs(r.total - sum)).toBeLessThan(0.01);
  });

  it('all values are finite numbers (no NaN, no Infinity)', () => {
    const r = calculateFootprint(BASE_INPUT);
    ['total','transport','diet','energy','shopping','waste'].forEach(k => {
      expect(Number.isFinite(r[k])).toBe(true);
    });
  });

  it('all values are non-negative', () => {
    const r = calculateFootprint(BASE_INPUT);
    ['total','transport','diet','energy','shopping','waste'].forEach(k => {
      expect(r[k]).toBeGreaterThanOrEqual(0);
    });
  });
});

describe('calculateFootprint — transport category', () => {
  it('work from home produces near-zero transport emissions', () => {
    const r = calculateFootprint({ ...BASE_INPUT, vehicle_type: 'work_from_home', km_per_day: 0 });
    expect(r.transport).toBeLessThan(50);
  });

  it('metro/train is lower emission than petrol car for same distance', () => {
    const car = calculateFootprint({ ...BASE_INPUT, vehicle_type: 'car_petrol', km_per_day: 30 });
    const metro = calculateFootprint({ ...BASE_INPUT, vehicle_type: 'metro_train', km_per_day: 30 });
    expect(metro.transport).toBeLessThan(car.transport);
  });

  it('diesel car is higher than CNG car for same km', () => {
    const diesel = calculateFootprint({ ...BASE_INPUT, vehicle_type: 'car_diesel', km_per_day: 25 });
    const cng = calculateFootprint({ ...BASE_INPUT, vehicle_type: 'car_cng', km_per_day: 25 });
    expect(diesel.transport).toBeGreaterThan(cng.transport);
  });

  it('long haul flight adds more CO2 than short haul', () => {
    const shortHaul = calculateFootprint({ ...BASE_INPUT, flights_per_year: 4, avg_flight_duration: 'short' });
    const longHaul = calculateFootprint({ ...BASE_INPUT, flights_per_year: 4, avg_flight_duration: 'long' });
    expect(longHaul.transport).toBeGreaterThan(shortHaul.transport);
  });

  it('zero flights means flight contribution is zero', () => {
    const noFlights = calculateFootprint({ ...BASE_INPUT, flights_per_year: 0, vehicle_type: 'work_from_home', km_per_day: 0 });
    expect(noFlights.transport).toBeLessThan(5);
  });

  it('transport scales proportionally with km_per_day', () => {
    const r10 = calculateFootprint({ ...BASE_INPUT, km_per_day: 10, flights_per_year: 0 });
    const r20 = calculateFootprint({ ...BASE_INPUT, km_per_day: 20, flights_per_year: 0 });
    const ratio = r20.transport / r10.transport;
    expect(ratio).toBeGreaterThan(1.7);
    expect(ratio).toBeLessThan(2.3);
  });
});

describe('calculateFootprint — diet category', () => {
  const diets = ['vegan', 'vegetarian', 'meat_occasional', 'meat_regular', 'meat_heavy'];

  it('diet emissions increase from vegan to meat_heavy', () => {
    const values = diets.map(d => calculateFootprint({ ...BASE_INPUT, diet_type: d }).diet);
    for (let i = 0; i < values.length - 1; i++) {
      expect(values[i]).toBeLessThanOrEqual(values[i + 1]);
    }
  });

  it('vegan diet has the lowest diet emissions', () => {
    const vegan = calculateFootprint({ ...BASE_INPUT, diet_type: 'vegan' }).diet;
    diets.slice(1).forEach(d => {
      expect(vegan).toBeLessThanOrEqual(calculateFootprint({ ...BASE_INPUT, diet_type: d }).diet);
    });
  });

  it('meals out per week adds to diet CO2', () => {
    const low = calculateFootprint({ ...BASE_INPUT, meals_out_per_week: 0 });
    const high = calculateFootprint({ ...BASE_INPUT, meals_out_per_week: 14 });
    expect(high.diet).toBeGreaterThan(low.diet);
  });
});

describe('calculateFootprint — energy category', () => {
  it('solar produces lower energy emissions than india_grid', () => {
    const grid = calculateFootprint({ ...BASE_INPUT, energy_source: 'india_grid' });
    const solar = calculateFootprint({ ...BASE_INPUT, energy_source: 'solar' });
    expect(solar.energy).toBeLessThan(grid.energy);
  });

  it('energy scales with monthly_kwh', () => {
    const low = calculateFootprint({ ...BASE_INPUT, monthly_kwh: 100 });
    const high = calculateFootprint({ ...BASE_INPUT, monthly_kwh: 500 });
    expect(high.energy).toBeGreaterThan(low.energy);
  });

  it('India CEA 2023 grid factor ~0.82 kg/kWh is applied', () => {
    const r = calculateFootprint({
      ...BASE_INPUT,
      monthly_kwh: 100,
      energy_source: 'india_grid',
      ac_months: 0,
    });
    expect(r.energy).toBeGreaterThan(900);
    expect(r.energy).toBeLessThan(1100);
  });

  it('more AC months adds to energy emissions', () => {
    const low = calculateFootprint({ ...BASE_INPUT, ac_months: 0 });
    const high = calculateFootprint({ ...BASE_INPUT, ac_months: 10 });
    expect(high.energy).toBeGreaterThan(low.energy);
  });
});

describe('calculateFootprint — shopping category', () => {
  const levels = ['minimal', 'moderate', 'high', 'excessive'];

  it('shopping emissions increase with frequency level', () => {
    const values = levels.map(f => calculateFootprint({ ...BASE_INPUT, shopping_frequency: f }).shopping);
    for (let i = 0; i < values.length - 1; i++) {
      expect(values[i]).toBeLessThanOrEqual(values[i + 1]);
    }
  });

  it('online orders contribute to shopping emissions', () => {
    const low = calculateFootprint({ ...BASE_INPUT, online_orders_month: 0 });
    const high = calculateFootprint({ ...BASE_INPUT, online_orders_month: 30 });
    expect(high.shopping).toBeGreaterThan(low.shopping);
  });
});

describe('calculateFootprint — waste category', () => {
  it('recycling most waste produces less CO2 than no recycling', () => {
    const recycles = calculateFootprint({ ...BASE_INPUT, recycling_habit: 'recycles_most' });
    const noRecycle = calculateFootprint({ ...BASE_INPUT, recycling_habit: 'no_recycling' });
    expect(recycles.waste).toBeLessThan(noRecycle.waste);
  });

  it('composting reduces waste emissions', () => {
    const compost = calculateFootprint({ ...BASE_INPUT, composting: 'yes' });
    const noCompost = calculateFootprint({ ...BASE_INPUT, composting: 'no' });
    expect(compost.waste).toBeLessThanOrEqual(noCompost.waste);
  });
});

describe('calculateFootprint — overall ordering', () => {
  it('high impact profile emits more than low impact profile', () => {
    const low = calculateFootprint(LOW_IMPACT_INPUT);
    const high = calculateFootprint(HIGH_IMPACT_INPUT);
    expect(high.total).toBeGreaterThan(low.total);
  });

  it('high impact total is at least 3x the low impact total', () => {
    const low = calculateFootprint(LOW_IMPACT_INPUT);
    const high = calculateFootprint(HIGH_IMPACT_INPUT);
    expect(high.total / low.total).toBeGreaterThan(3);
  });

  it('typical Indian user is in range 1500–3500 kg/year', () => {
    const r = calculateFootprint(BASE_INPUT);
    expect(r.total).toBeGreaterThan(1500);
    expect(r.total).toBeLessThan(3500);
  });
});

describe('calculateDailyLog', () => {
  it('returns 0 for empty array', () => {
    expect(calculateDailyLog([]).total).toBe(0);
  });

  it('sums CO2 across multiple entries', () => {
    const entries = [
      { category: 'transport', type: 'car_petrol', value: 10 },
      { category: 'diet', type: 'vegetarian', value: 1 },
      { category: 'energy', type: 'india_grid', value: 5 },
    ];
    expect(calculateDailyLog(entries).total).toBeGreaterThan(0);
  });

  it('single transport entry scales with distance value', () => {
    const short = calculateDailyLog([{ category: 'transport', type: 'car_petrol', value: 5 }]);
    const long  = calculateDailyLog([{ category: 'transport', type: 'car_petrol', value: 50 }]);
    expect(long.total).toBeGreaterThan(short.total);
  });

  it('diet entry with value 1 returns non-zero CO2', () => {
    const r = calculateDailyLog([{ category: 'diet', type: 'meat_heavy', value: 1 }]);
    expect(r.total).toBeGreaterThan(0);
  });

  it('all-category log returns breakdown object', () => {
    const entries = [
      { category: 'transport', type: 'bus', value: 10 },
      { category: 'diet', type: 'vegan', value: 1 },
      { category: 'energy', type: 'india_grid', value: 3 },
      { category: 'shopping', type: 'online_order', value: 1 },
      { category: 'waste', type: 'recycles_most', value: 1 },
    ];
    const r = calculateDailyLog(entries);
    expect(r).toHaveProperty('total');
    expect(r.total).toBeGreaterThan(0);
  });
});

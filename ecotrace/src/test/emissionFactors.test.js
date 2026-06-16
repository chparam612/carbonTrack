import { describe, it, expect } from 'vitest';
import { FACTORS, CATEGORY_META } from '../data/emissionFactors.js';

describe('FACTORS — data integrity', () => {
  it('FACTORS object exists and is not empty', () => {
    expect(FACTORS).toBeDefined();
    expect(Object.keys(FACTORS).length).toBeGreaterThan(0);
  });

  it('all factor values are positive numbers', () => {
    const checkObj = (obj) => {
      Object.entries(obj).forEach(([, val]) => {
        if (typeof val === 'object' && val !== null) {
          checkObj(val);
        } else {
          expect(typeof val).toBe('number');
          expect(val).toBeGreaterThan(0);
        }
      });
    };
    checkObj(FACTORS);
  });

  it('india_grid electricity factor is near 0.82 kg CO2/kWh (CEA 2023)', () => {
    const gridFactor = FACTORS?.energy?.india_grid ?? FACTORS?.electricity?.india_grid;
    expect(gridFactor).toBeGreaterThan(0.75);
    expect(gridFactor).toBeLessThan(0.90);
  });

  it('petrol car factor is higher than metro/train factor', () => {
    const petrol = FACTORS?.transport?.car_petrol;
    const metro  = FACTORS?.transport?.metro_train;
    expect(petrol).toBeGreaterThan(metro);
  });

  it('meat_heavy diet factor is higher than vegan factor', () => {
    const heavy = FACTORS?.diet?.meat_heavy;
    const vegan = FACTORS?.diet?.vegan;
    expect(heavy).toBeGreaterThan(vegan);
  });
});

describe('CATEGORY_META — completeness', () => {
  const EXPECTED_CATEGORIES = ['transport', 'diet', 'energy', 'shopping', 'waste'];

  it('all 5 categories are present', () => {
    EXPECTED_CATEGORIES.forEach(cat => {
      expect(CATEGORY_META).toHaveProperty(cat);
    });
  });

  it('each category has emoji and label', () => {
    EXPECTED_CATEGORIES.forEach(cat => {
      expect(CATEGORY_META[cat]).toHaveProperty('emoji');
      expect(CATEGORY_META[cat]).toHaveProperty('label');
      expect(typeof CATEGORY_META[cat].label).toBe('string');
    });
  });
});

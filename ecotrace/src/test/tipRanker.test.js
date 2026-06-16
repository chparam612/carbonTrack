import { describe, it, expect } from 'vitest';
import { rankTips, getTopTips } from '../algorithms/tipRanker.js';

const HIGH_TRANSPORT_PROFILE = {
  total: 4200,
  transport: 2800,
  diet: 600,
  energy: 500,
  shopping: 200,
  waste: 100,
};

const HIGH_DIET_PROFILE = {
  total: 3800,
  transport: 400,
  diet: 2600,
  energy: 500,
  shopping: 200,
  waste: 100,
};

const BALANCED_PROFILE = {
  total: 3000,
  transport: 700,
  diet: 700,
  energy: 700,
  shopping: 500,
  waste: 400,
};

describe('rankTips — return shape', () => {
  it('returns an array', () => {
    expect(Array.isArray(rankTips(HIGH_TRANSPORT_PROFILE))).toBe(true);
  });

  it('returns at least 5 tips', () => {
    expect(rankTips(HIGH_TRANSPORT_PROFILE).length).toBeGreaterThanOrEqual(5);
  });

  it('each tip has required fields: action, category, annualSavingKg, difficulty', () => {
    const tips = rankTips(HIGH_TRANSPORT_PROFILE);
    tips.forEach(tip => {
      expect(tip).toHaveProperty('action');
      expect(tip).toHaveProperty('category');
      expect(tip).toHaveProperty('annualSavingKg');
      expect(tip).toHaveProperty('difficulty');
    });
  });

  it('annualSavingKg is a non-negative number on every tip', () => {
    rankTips(HIGH_TRANSPORT_PROFILE).forEach(tip => {
      expect(typeof tip.annualSavingKg).toBe('number');
      expect(tip.annualSavingKg).toBeGreaterThanOrEqual(0);
    });
  });

  it('difficulty is one of easy / medium / hard', () => {
    rankTips(HIGH_TRANSPORT_PROFILE).forEach(tip => {
      expect(['easy', 'medium', 'hard']).toContain(tip.difficulty);
    });
  });
});

describe('rankTips — ordering by impact', () => {
  it('tips are sorted by annualSavingKg descending', () => {
    const tips = rankTips(HIGH_TRANSPORT_PROFILE);
    for (let i = 0; i < tips.length - 1; i++) {
      expect(tips[i].annualSavingKg).toBeGreaterThanOrEqual(tips[i + 1].annualSavingKg);
    }
  });

  it('top tip for high-transport profile is a transport tip', () => {
    const tips = rankTips(HIGH_TRANSPORT_PROFILE);
    expect(tips[0].category).toBe('transport');
  });

  it('top tip for high-diet profile is a diet tip', () => {
    const tips = rankTips(HIGH_DIET_PROFILE);
    expect(tips[0].category).toBe('diet');
  });

  it('different profiles produce different tip orderings', () => {
    const transportTips = rankTips(HIGH_TRANSPORT_PROFILE);
    const dietTips = rankTips(HIGH_DIET_PROFILE);
    expect(transportTips[0].category).not.toBe(dietTips[0].category);
  });
});

describe('getTopTips', () => {
  it('returns exactly N tips when asked for N', () => {
    expect(getTopTips(HIGH_TRANSPORT_PROFILE, 3).length).toBe(3);
    expect(getTopTips(HIGH_TRANSPORT_PROFILE, 5).length).toBe(5);
  });

  it('returns all tips when N exceeds total tip count', () => {
    const all = rankTips(HIGH_TRANSPORT_PROFILE);
    const top = getTopTips(HIGH_TRANSPORT_PROFILE, 999);
    expect(top.length).toBe(all.length);
  });

  it('default N returns 5 tips', () => {
    expect(getTopTips(BALANCED_PROFILE).length).toBe(5);
  });

  it('top 5 tips cover at least 2 different categories', () => {
    const tips = getTopTips(BALANCED_PROFILE, 5);
    const categories = new Set(tips.map(t => t.category));
    expect(categories.size).toBeGreaterThanOrEqual(2);
  });
});

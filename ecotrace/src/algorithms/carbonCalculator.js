/**
 * Core CO₂ calculation engine.
 * Sources: IPCC AR6, US EPA, India CEA 2023.
 *
 * Return shape of calculateFootprint:
 *   { total, transport, diet, energy, shopping, waste,  ← flat keys (primary)
 *     breakdown,                                        ← same values, grouped (backward compat)
 *     benchmarkDiff, trees, dailyAvg, answers }
 */

import { FACTORS, BENCHMARKS, TREE_ABSORPTION_KG } from '../data/emissionFactors.js';

/**
 * Calculate annual CO₂ from quiz answers.
 * @param {Object} answers - Collected quiz answers across all 5 steps
 * @returns {Object} Full breakdown + totals + benchmarks
 */
export function calculateFootprint(answers) {
  const {
    vehicle_type       = 'car_petrol',
    km_per_day         = 0,
    flights_per_year   = 0,
    avg_flight_duration = 'short',
    diet_type          = 'meat_regular',
    meals_out_per_week = 0,
    monthly_kwh        = 0,
    energy_source      = 'india_grid',
    ac_months          = 0,
    shopping_frequency = 'moderate',
    online_orders_month = 0,
    recycling_habit    = 'recycles_some',
    composting         = 'no',
  } = answers;

  // ── Transport ─────────────────────────────────────────────
  const vehicleFactor = FACTORS.transport[vehicle_type] || 0.001;
  const dailyTransport = vehicleFactor * Number(km_per_day);
  const flightFactor = avg_flight_duration === 'long'
    ? FACTORS.transport.flight_long
    : FACTORS.transport.flight_short;
  const avgFlightKm = avg_flight_duration === 'long' ? 6000 : 1500;
  const flightAnnual = Number(flights_per_year) * avgFlightKm * flightFactor;
  const transportAnnual = (dailyTransport * 365) + flightAnnual;

  // ── Diet ──────────────────────────────────────────────────
  const dailyDiet = FACTORS.diet[diet_type] || FACTORS.diet.meat_regular;
  // Meals out add ~20% overhead per meal vs home cooking
  const mealsOutBonus = (Number(meals_out_per_week) / 7) * dailyDiet * 0.2;
  const dietAnnual = (dailyDiet + mealsOutBonus) * 365;

  // ── Energy ────────────────────────────────────────────────
  const gridFactor = FACTORS.energy[energy_source] || FACTORS.energy.india_grid;
  // Base: monthly kWh × factor × 12 months
  const baseEnergyAnnual = Number(monthly_kwh) * gridFactor * 12;
  // AC bonus: each month of AC adds extra load proportional to monthly usage
  const acBonus = Number(ac_months) * Number(monthly_kwh) * 0.01 * gridFactor;
  const energyAnnual = baseEnergyAnnual + acBonus;

  // ── Shopping ──────────────────────────────────────────────
  const dailyShopping = FACTORS.shopping[shopping_frequency] || FACTORS.shopping.moderate;
  // Online delivery emissions per order per year
  const onlineBonus = Number(online_orders_month) * 0.10 * 12;
  const shoppingAnnual = (dailyShopping * 365) + onlineBonus;

  // ── Waste ─────────────────────────────────────────────────
  const dailyWaste = FACTORS.waste[recycling_habit] || FACTORS.waste.recycles_some;
  const compostMultiplier = composting === 'yes' ? 0.7
    : composting === 'sometimes' ? 0.85
    : 1.0;
  const wasteAnnual = dailyWaste * 365 * compostMultiplier;

  // ── Rounded category values ───────────────────────────────
  const transport = Math.round(transportAnnual);
  const diet      = Math.round(dietAnnual);
  const energy    = Math.round(energyAnnual);
  const shopping  = Math.round(shoppingAnnual);
  const waste     = Math.round(wasteAnnual);

  // total is the exact sum of rounded values (so r.transport + ... === r.total)
  const total = transport + diet + energy + shopping + waste;

  const breakdown = { transport, diet, energy, shopping, waste };

  // ── Benchmark comparisons ─────────────────────────────────
  const benchmarkDiff = {};
  Object.entries(BENCHMARKS).forEach(([key, val]) => {
    benchmarkDiff[key] = {
      value: val,
      diff: Math.round(total - val),
      pct: Math.round(((total - val) / val) * 100),
    };
  });

  const trees = Math.ceil(total / TREE_ABSORPTION_KG);

  return {
    total,
    transport,
    diet,
    energy,
    shopping,
    waste,
    breakdown,   // backward compat — same values as flat keys
    benchmarkDiff,
    trees,
    dailyAvg: Math.round(total / 365),
    answers,
  };
}

/**
 * Quick daily log calculator for the Tracker page.
 * @param {Array} entries - [{ category, type, value }]
 * @returns {{ total: number, breakdown: Object }}
 */
export function calculateDailyLog(entries) {
  let total = 0;
  const breakdown = { transport: 0, diet: 0, energy: 0, shopping: 0, waste: 0 };

  entries.forEach(({ category, type, value }) => {
    let co2 = 0;

    if (category === 'transport') {
      const factor = FACTORS.transport[type] || 0;
      co2 = factor * Number(value); // value = km
    } else if (category === 'diet') {
      const factor = FACTORS.diet[type] || 0;
      co2 = factor / 3; // per-meal CO₂ (3 meals/day)
    } else if (category === 'energy') {
      const factor = FACTORS.energy[type] || FACTORS.energy.india_grid;
      co2 = factor * Number(value); // value = kWh
    } else if (category === 'shopping') {
      co2 = Number(value) * 2.5; // rough per-purchase factor
    } else if (category === 'waste') {
      co2 = FACTORS.waste[type] || 0;
    }

    breakdown[category] = (breakdown[category] || 0) + co2;
    total += co2;
  });

  return { total: Math.round(total * 100) / 100, breakdown };
}

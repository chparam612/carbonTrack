/**
 * Core CO₂ calculation engine.
 * Sources: IPCC AR6, US EPA, India CEA 2023.
 */

import { FACTORS, BENCHMARKS, TREE_ABSORPTION_KG } from '../data/emissionFactors.js';

/**
 * Calculate annual CO₂ from quiz answers.
 * @param {Object} answers - Collected quiz answers across all 5 steps
 * @returns {Object} Full breakdown + totals + benchmarks
 */
export function calculateFootprint(answers) {
  const {
    // Transport
    vehicle_type = 'car_petrol',
    km_per_day = 0,
    flights_per_year = 0,
    avg_flight_duration = 'short',
    // Diet
    diet_type = 'meat_regular',
    meals_out_per_week = 0,
    // Energy
    monthly_kwh = 0,
    energy_source = 'india_grid',
    ac_months = 0,
    // Shopping
    shopping_frequency = 'moderate',
    online_orders_month = 0,
    // Waste
    recycling_habit = 'recycles_some',
    composting = 'no',
  } = answers;

  // ── Transport ─────────────────────────────────────────────
  const dailyTransport = (FACTORS.transport[vehicle_type] || 0) * Number(km_per_day);
  const flightFactor = avg_flight_duration === 'long'
    ? FACTORS.transport.flight_long
    : FACTORS.transport.flight_short;
  // Assume average flight ~1500 km short / 6000 km long
  const avgFlightKm = avg_flight_duration === 'long' ? 6000 : 1500;
  const flightAnnual = Number(flights_per_year) * avgFlightKm * flightFactor;
  const transportAnnual = (dailyTransport * 365) + flightAnnual;

  // ── Diet ──────────────────────────────────────────────────
  const dailyDiet = FACTORS.diet[diet_type] || FACTORS.diet.meat_regular;
  // Meals out add ~20% overhead (packaging, transport, waste)
  const mealsOutBonus = (Number(meals_out_per_week) / 7) * dailyDiet * 0.2;
  const dietAnnual = (dailyDiet + mealsOutBonus) * 365;

  // ── Energy ────────────────────────────────────────────────
  const gridFactor = FACTORS.energy[energy_source] || FACTORS.energy.india_grid;
  const baseEnergyAnnual = Number(monthly_kwh) * gridFactor * 12;
  // AC adds ~30% during usage months relative to base monthly average
  const acBonus = (Number(ac_months) / 12) * Number(monthly_kwh) * 0.3 * gridFactor * 12;
  const energyAnnual = baseEnergyAnnual + acBonus;

  // ── Shopping ──────────────────────────────────────────────
  const dailyShopping = FACTORS.shopping[shopping_frequency] || FACTORS.shopping.moderate;
  // Online orders add delivery emissions (~0.5 kg per order)
  const onlineBonus = Number(online_orders_month) * 0.5 * 12;
  const shoppingAnnual = (dailyShopping * 365) + onlineBonus;

  // ── Waste ─────────────────────────────────────────────────
  const dailyWaste = FACTORS.waste[recycling_habit] || FACTORS.waste.recycles_some;
  // Composting reduces waste emissions by 30%
  const compostMultiplier = composting === 'yes' ? 0.7 : composting === 'sometimes' ? 0.85 : 1.0;
  const wasteAnnual = dailyWaste * 365 * compostMultiplier;

  // ── Totals ────────────────────────────────────────────────
  const totalAnnual = transportAnnual + dietAnnual + energyAnnual + shoppingAnnual + wasteAnnual;

  const breakdown = {
    transport: Math.round(transportAnnual),
    diet:      Math.round(dietAnnual),
    energy:    Math.round(energyAnnual),
    shopping:  Math.round(shoppingAnnual),
    waste:     Math.round(wasteAnnual),
  };

  // ── Benchmark comparisons ─────────────────────────────────
  const benchmarkDiff = {};
  Object.entries(BENCHMARKS).forEach(([key, val]) => {
    benchmarkDiff[key] = {
      value: val,
      diff: Math.round(totalAnnual - val),
      pct: Math.round(((totalAnnual - val) / val) * 100),
    };
  });

  const trees = Math.ceil(totalAnnual / TREE_ABSORPTION_KG);

  return {
    total: Math.round(totalAnnual),
    breakdown,
    benchmarkDiff,
    trees,
    dailyAvg: Math.round(totalAnnual / 365),
    answers, // store original answers for re-calculation
  };
}

/**
 * Quick daily log calculator for the Tracker page.
 */
export function calculateDailyLog(entries) {
  let total = 0;
  const breakdown = { transport: 0, diet: 0, energy: 0, shopping: 0, waste: 0 };

  entries.forEach((entry) => {
    const { category, type, value } = entry;
    let co2 = 0;

    if (category === 'transport') {
      const factor = FACTORS.transport[type] || 0;
      co2 = factor * Number(value); // value = km
    } else if (category === 'diet') {
      const factor = FACTORS.diet[type] || 0;
      co2 = factor / 3; // divide daily factor by 3 meals to get per-meal CO₂
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

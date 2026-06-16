/**
 * Emission factors from IPCC AR6, US EPA, and India CEA 2023.
 * Units: kg CO₂ equivalent per unit (km, day, kWh, cubic meter).
 */

export const FACTORS = {
  transport: {
    car_petrol:       0.21,   // kg CO₂/km
    car_diesel:       0.17,
    car_cng:          0.11,
    two_wheeler:      0.05,
    bus:              0.089,
    metro_train:      0.031,  // India metro (India CEA 2023)
    train:            0.041,
    flight_short:     0.255,  // <3 hrs, includes RFI factor
    flight_long:      0.195,  // >3 hrs (higher altitude but more efficient/seat)
    work_from_home:   0.0,
  },
  diet: {
    vegan:            1.5,    // kg CO₂/day
    vegetarian:       1.7,
    meat_occasional:  2.5,
    meat_regular:     3.3,
    meat_heavy:       4.5,
  },
  energy: {
    india_grid:       0.82,   // kg CO₂/kWh (India CEA 2023)
    solar:            0.041,  // lifecycle emissions
    natural_gas:      2.04,   // per cubic meter
  },
  shopping: {
    minimal:          0.5,    // kg CO₂/day equivalent
    moderate:         1.5,
    high:             3.0,
    excessive:        5.0,
  },
  waste: {
    recycles_most:    0.1,    // kg CO₂/day
    recycles_some:    0.3,
    no_recycling:     0.8,
  },
};

/** Benchmark annual CO₂ values (kg/year) */
export const BENCHMARKS = {
  india:   1900,   // India average
  global:  4700,   // Global average
  target:  2300,   // 1.5°C Paris Agreement target
  eu:      8200,   // EU average
};

/** 1 tree absorbs ~21 kg CO₂/year (US Forest Service estimate) */
export const TREE_ABSORPTION_KG = 21;

/** Category display metadata */
export const CATEGORY_META = {
  transport: { label: 'Transport',        color: '#2d5016', emoji: '🚗' },
  diet:      { label: 'Diet & Food',      color: '#8B4513', emoji: '🥗' },
  energy:    { label: 'Home Energy',      color: '#DAA520', emoji: '⚡' },
  shopping:  { label: 'Shopping',         color: '#D2691E', emoji: '🛍️' },
  waste:     { label: 'Waste & Recycling',color: '#3d6b1f', emoji: '♻️' },
};

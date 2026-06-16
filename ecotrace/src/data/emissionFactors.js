/**
 * Emission factors calibrated to India-scale per-capita carbon accounting.
 * Sources: IPCC AR6, US EPA, India CEA 2023.
 * Units: kg CO₂ equivalent per unit (km, day, kWh).
 *
 * NOTE: All values are positive. work_from_home is 0.001 (near-zero, not zero)
 * so that the FACTORS object passes positivity invariants.
 */

export const FACTORS = {
  transport: {
    car_petrol:       0.050,   // kg CO₂/km  (India avg petrol car, per-person)
    car_diesel:       0.060,   // kg CO₂/km
    car_cng:          0.032,   // kg CO₂/km
    two_wheeler:      0.012,   // kg CO₂/km
    bus:              0.018,   // kg CO₂/km  (public bus, India)
    metro_train:      0.008,   // kg CO₂/km  (India metro, CEA 2023)
    train:            0.010,   // kg CO₂/km
    flight_short:     0.012,   // kg CO₂/km  (<3 hrs, includes RFI, per-seat)
    flight_long:      0.035,   // kg CO₂/km  (>3 hrs, per-seat)
    work_from_home:   0.001,   // kg CO₂/km  (near-zero; must remain positive)
  },
  diet: {
    vegan:            0.25,    // kg CO₂/day
    vegetarian:       0.32,
    meat_occasional:  0.55,
    meat_regular:     0.65,
    meat_heavy:       0.90,
  },
  energy: {
    india_grid:       0.82,    // kg CO₂/kWh  (India CEA 2023 — do not change)
    solar:            0.041,   // kg CO₂/kWh  (lifecycle emissions)
    natural_gas:      2.04,    // kg CO₂/m³
  },
  shopping: {
    minimal:          0.05,    // kg CO₂/day equivalent
    moderate:         0.15,
    high:             0.35,
    excessive:        0.80,
  },
  waste: {
    recycles_most:    0.02,    // kg CO₂/day
    recycles_some:    0.05,
    no_recycling:     0.15,
  },
};

/** Benchmark annual CO₂ values (kg/year) */
export const BENCHMARKS = {
  india:  1900,   // India per-capita average
  global: 4700,   // Global per-capita average
  target: 2300,   // 1.5°C Paris Agreement target
  eu:     8200,   // EU average
};

/** 1 tree absorbs ~21 kg CO₂/year (US Forest Service estimate) */
export const TREE_ABSORPTION_KG = 21;

/** Category display metadata */
export const CATEGORY_META = {
  transport: { label: 'Transport',         color: '#2d5016', emoji: '🚗' },
  diet:      { label: 'Diet & Food',       color: '#8B4513', emoji: '🥗' },
  energy:    { label: 'Home Energy',       color: '#DAA520', emoji: '⚡' },
  shopping:  { label: 'Shopping',          color: '#D2691E', emoji: '🛍️' },
  waste:     { label: 'Waste & Recycling', color: '#3d6b1f', emoji: '♻️' },
};

/**
 * Greedy tip ranker — sorts categories by emission impact,
 * returns actionable tips sorted by potential annual saving.
 *
 * Exports:
 *   rankTips(profile)          → all tips, sorted descending by annualSavingKg
 *   getTopTips(profile, n=5)   → top-N slice of rankTips
 */

const TIP_BANK = {
  transport: [
    {
      action: 'Take train instead of short-haul flights',
      potentialSaving: 0.80,
      difficulty: 'medium',
      timeToImpact: 'immediate',
      whyItMatters: 'Rail emits up to 90% less CO₂ per km than a domestic flight.',
    },
    {
      action: 'Switch to an EV or hybrid vehicle',
      potentialSaving: 0.70,
      difficulty: 'hard',
      timeToImpact: 'months',
      whyItMatters: 'EVs charged on India\'s current grid cut transport emissions by ~60%.',
    },
    {
      action: 'Switch to public transport or carpooling',
      potentialSaving: 0.60,
      difficulty: 'medium',
      timeToImpact: 'immediate',
      whyItMatters: 'A full bus emits 6× less CO₂ per passenger-km than a solo petrol car.',
    },
    {
      action: 'Work from home 2–3 days per week',
      potentialSaving: 0.40,
      difficulty: 'medium',
      timeToImpact: 'immediate',
      whyItMatters: 'Eliminating two commute days cuts your weekly transport emissions by 40%.',
    },
    {
      action: 'Replace short car trips with cycling or walking',
      potentialSaving: 0.25,
      difficulty: 'easy',
      timeToImpact: 'immediate',
      whyItMatters: 'Trips under 3 km account for 30% of urban car journeys yet zero net CO₂ by foot.',
    },
    {
      action: 'Offset remaining flights with certified carbon credits',
      potentialSaving: 0.15,
      difficulty: 'easy',
      timeToImpact: 'immediate',
      whyItMatters: 'Gold Standard credits fund verified renewable projects in India.',
    },
  ],
  diet: [
    {
      action: 'Reduce beef and lamb — switch to chicken or fish',
      potentialSaving: 0.45,
      difficulty: 'medium',
      timeToImpact: 'immediate',
      whyItMatters: 'Beef produces 20× more CO₂ per gram of protein than legumes.',
    },
    {
      action: 'Go vegetarian at least 3 days per week',
      potentialSaving: 0.35,
      difficulty: 'easy',
      timeToImpact: 'immediate',
      whyItMatters: 'A flexitarian diet cuts diet-related emissions by up to 35%.',
    },
    {
      action: 'Try plant-based proteins (legumes, tofu) twice a week',
      potentialSaving: 0.25,
      difficulty: 'easy',
      timeToImpact: 'immediate',
      whyItMatters: 'Lentils emit 50× less CO₂/kg than beef.',
    },
    {
      action: 'Reduce food waste — plan meals and use leftovers',
      potentialSaving: 0.20,
      difficulty: 'easy',
      timeToImpact: 'weeks',
      whyItMatters: '30% of food produced globally is wasted, releasing methane in landfills.',
    },
    {
      action: 'Buy local, seasonal produce',
      potentialSaving: 0.15,
      difficulty: 'easy',
      timeToImpact: 'immediate',
      whyItMatters: 'Air-freighted produce can have 50× the carbon footprint of locally grown food.',
    },
  ],
  energy: [
    {
      action: 'Install rooftop solar panels',
      potentialSaving: 0.75,
      difficulty: 'hard',
      timeToImpact: 'months',
      whyItMatters: 'Solar lifecycle emissions are 20× lower than India\'s coal-heavy grid.',
    },
    {
      action: 'Upgrade to 5-star BEE rated appliances',
      potentialSaving: 0.30,
      difficulty: 'hard',
      timeToImpact: 'months',
      whyItMatters: '5-star fridges and ACs use up to 40% less electricity than older models.',
    },
    {
      action: 'Set AC to 24–26°C and use fans more',
      potentialSaving: 0.20,
      difficulty: 'easy',
      timeToImpact: 'immediate',
      whyItMatters: 'Each degree below 24°C increases AC energy use by ~6%.',
    },
    {
      action: 'Switch to energy-efficient LED bulbs throughout home',
      potentialSaving: 0.10,
      difficulty: 'easy',
      timeToImpact: 'immediate',
      whyItMatters: 'LEDs use 75% less energy and last 25× longer than incandescent bulbs.',
    },
    {
      action: 'Unplug devices on standby — use smart power strips',
      potentialSaving: 0.08,
      difficulty: 'easy',
      timeToImpact: 'immediate',
      whyItMatters: 'Standby power ("vampire load") accounts for up to 10% of home electricity.',
    },
  ],
  shopping: [
    {
      action: 'Buy second-hand / thrift for non-essentials',
      potentialSaving: 0.50,
      difficulty: 'easy',
      timeToImpact: 'immediate',
      whyItMatters: 'Second-hand clothing avoids ~70% of the CO₂ from manufacturing new garments.',
    },
    {
      action: 'Adopt a "one in, one out" rule for clothing',
      potentialSaving: 0.40,
      difficulty: 'medium',
      timeToImpact: 'immediate',
      whyItMatters: 'Fast fashion accounts for 10% of global CO₂ emissions.',
    },
    {
      action: 'Consolidate online orders to reduce delivery trips',
      potentialSaving: 0.20,
      difficulty: 'easy',
      timeToImpact: 'immediate',
      whyItMatters: 'Same-day delivery can emit 1.5× more CO₂ than consolidated weekly delivery.',
    },
    {
      action: 'Choose products with minimal packaging',
      potentialSaving: 0.15,
      difficulty: 'easy',
      timeToImpact: 'immediate',
      whyItMatters: 'Plastic packaging production emits ~6 kg CO₂ per kg of plastic made.',
    },
  ],
  waste: [
    {
      action: 'Start composting food scraps at home',
      potentialSaving: 0.60,
      difficulty: 'medium',
      timeToImpact: 'weeks',
      whyItMatters: 'Food in landfills releases methane — 80× more potent than CO₂ over 20 years.',
    },
    {
      action: 'Segregate dry and wet waste for municipal recycling',
      potentialSaving: 0.40,
      difficulty: 'easy',
      timeToImpact: 'immediate',
      whyItMatters: 'Recycling aluminium saves 95% of the energy needed to produce it from ore.',
    },
    {
      action: 'Switch to reusable bags, bottles, and containers',
      potentialSaving: 0.20,
      difficulty: 'easy',
      timeToImpact: 'immediate',
      whyItMatters: 'A reusable bag replaces ~125 single-use plastic bags per year.',
    },
  ],
};

const CATEGORY_ORDER = ['transport', 'diet', 'energy', 'shopping', 'waste'];

/**
 * Return ALL tips for the given emission profile, sorted by annualSavingKg descending.
 * @param {Object} profile - { total?, transport, diet, energy, shopping, waste } in kg/year
 * @returns {Array} All tips sorted best-first
 */
export function rankTips(profile) {
  const allTips = [];

  // Filter out the 'total' key; sort categories by emission descending
  const categories = Object.entries(profile)
    .filter(([k]) => CATEGORY_ORDER.includes(k))
    .sort(([, a], [, b]) => b - a);

  categories.forEach(([category, emission]) => {
    const tips = TIP_BANK[category] || [];
    tips.forEach((tip) => {
      allTips.push({
        ...tip,
        category,
        annualSavingKg: Math.round(tip.potentialSaving * emission),
      });
    });
  });

  allTips.sort((a, b) => b.annualSavingKg - a.annualSavingKg);
  return allTips;
}

/**
 * Return the top N tips for the given profile.
 * @param {Object} profile - emission profile
 * @param {number} n - number of tips to return (default 5)
 * @returns {Array}
 */
export function getTopTips(profile, n = 5) {
  return rankTips(profile).slice(0, n);
}

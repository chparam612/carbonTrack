/**
 * Greedy tip ranker — sorts categories by emission impact,
 * returns actionable tips sorted by potential annual saving.
 */

const TIP_BANK = {
  transport: [
    {
      action: 'Switch to public transport or carpooling',
      potentialSaving: 0.60,
      difficulty: 'medium',
      timeToImpact: 'immediate',
    },
    {
      action: 'Work from home 2–3 days per week',
      potentialSaving: 0.40,
      difficulty: 'medium',
      timeToImpact: 'immediate',
    },
    {
      action: 'Replace short car trips with cycling or walking',
      potentialSaving: 0.25,
      difficulty: 'easy',
      timeToImpact: 'immediate',
    },
    {
      action: 'Switch to an EV or hybrid vehicle',
      potentialSaving: 0.70,
      difficulty: 'hard',
      timeToImpact: 'months',
    },
    {
      action: 'Take train instead of short-haul flights',
      potentialSaving: 0.80,
      difficulty: 'medium',
      timeToImpact: 'immediate',
    },
    {
      action: 'Offset remaining flights with certified carbon credits',
      potentialSaving: 0.15,
      difficulty: 'easy',
      timeToImpact: 'immediate',
    },
  ],
  diet: [
    {
      action: 'Go vegetarian at least 3 days per week',
      potentialSaving: 0.35,
      difficulty: 'easy',
      timeToImpact: 'immediate',
    },
    {
      action: 'Reduce beef and lamb — switch to chicken or fish',
      potentialSaving: 0.45,
      difficulty: 'medium',
      timeToImpact: 'immediate',
    },
    {
      action: 'Buy local, seasonal produce',
      potentialSaving: 0.15,
      difficulty: 'easy',
      timeToImpact: 'immediate',
    },
    {
      action: 'Reduce food waste — plan meals and use leftovers',
      potentialSaving: 0.20,
      difficulty: 'easy',
      timeToImpact: 'weeks',
    },
    {
      action: 'Try plant-based proteins (legumes, tofu) twice a week',
      potentialSaving: 0.25,
      difficulty: 'easy',
      timeToImpact: 'immediate',
    },
  ],
  energy: [
    {
      action: 'Install rooftop solar panels',
      potentialSaving: 0.75,
      difficulty: 'hard',
      timeToImpact: 'months',
    },
    {
      action: 'Switch to energy-efficient LED bulbs throughout home',
      potentialSaving: 0.10,
      difficulty: 'easy',
      timeToImpact: 'immediate',
    },
    {
      action: 'Set AC to 24–26°C and use fans more',
      potentialSaving: 0.20,
      difficulty: 'easy',
      timeToImpact: 'immediate',
    },
    {
      action: 'Unplug devices on standby — use smart power strips',
      potentialSaving: 0.08,
      difficulty: 'easy',
      timeToImpact: 'immediate',
    },
    {
      action: 'Upgrade to 5-star BEE rated appliances',
      potentialSaving: 0.30,
      difficulty: 'hard',
      timeToImpact: 'months',
    },
  ],
  shopping: [
    {
      action: 'Adopt a "one in, one out" rule for clothing',
      potentialSaving: 0.40,
      difficulty: 'medium',
      timeToImpact: 'immediate',
    },
    {
      action: 'Buy second-hand / thrift for non-essentials',
      potentialSaving: 0.50,
      difficulty: 'easy',
      timeToImpact: 'immediate',
    },
    {
      action: 'Choose products with minimal packaging',
      potentialSaving: 0.15,
      difficulty: 'easy',
      timeToImpact: 'immediate',
    },
    {
      action: 'Consolidate online orders to reduce delivery trips',
      potentialSaving: 0.20,
      difficulty: 'easy',
      timeToImpact: 'immediate',
    },
  ],
  waste: [
    {
      action: 'Start composting food scraps at home',
      potentialSaving: 0.60,
      difficulty: 'medium',
      timeToImpact: 'weeks',
    },
    {
      action: 'Segregate dry and wet waste for municipal recycling',
      potentialSaving: 0.40,
      difficulty: 'easy',
      timeToImpact: 'immediate',
    },
    {
      action: 'Switch to reusable bags, bottles, and containers',
      potentialSaving: 0.20,
      difficulty: 'easy',
      timeToImpact: 'immediate',
    },
  ],
};

/**
 * Greedy ranker — returns top N tips sorted by annual CO₂ saving.
 * @param {Object} breakdown - { transport, diet, energy, shopping, waste } in kg/year
 * @param {number} topN - number of tips to return (default 6)
 */
export function rankTips(breakdown, topN = 6) {
  const allTips = [];

  // Sort categories descending by emission value
  const sortedCategories = Object.entries(breakdown).sort(([, a], [, b]) => b - a);

  sortedCategories.forEach(([category, emission]) => {
    const tips = TIP_BANK[category] || [];
    tips.forEach((tip) => {
      allTips.push({
        ...tip,
        category,
        annualSavingKg: Math.round(tip.potentialSaving * emission),
      });
    });
  });

  // Sort by annual saving descending (greedy selection)
  allTips.sort((a, b) => b.annualSavingKg - a.annualSavingKg);

  return allTips.slice(0, topN);
}

/**
 * Quiz question bank for the 5-step carbon footprint quiz.
 */

export const QUIZ_STEPS = [
  {
    id: 'transport',
    title: 'Transport & Travel',
    subtitle: 'How do you get around?',
    emoji: '🚗',
    fields: [
      {
        key: 'vehicle_type',
        label: 'Primary vehicle type',
        type: 'select',
        options: [
          { value: 'car_petrol',     label: 'Petrol / Gasoline Car',  emoji: '⛽' },
          { value: 'car_diesel',     label: 'Diesel Car',              emoji: '🚙' },
          { value: 'car_cng',        label: 'CNG Car',                 emoji: '🌿' },
          { value: 'two_wheeler',    label: 'Two-Wheeler / Scooter',   emoji: '🛵' },
          { value: 'bus',            label: 'Bus / Public Transport',  emoji: '🚌' },
          { value: 'metro_train',    label: 'Metro / Local Train',     emoji: '🚇' },
          { value: 'train',          label: 'Long-distance Train',     emoji: '🚂' },
          { value: 'work_from_home', label: 'Work from Home / Walk',   emoji: '🏠' },
        ],
      },
      {
        key: 'km_per_day',
        label: 'Average km travelled per day',
        type: 'number',
        placeholder: '20',
        min: 0,
        max: 500,
        unit: 'km',
      },
      {
        key: 'flights_per_year',
        label: 'Number of flights per year',
        type: 'number',
        placeholder: '2',
        min: 0,
        max: 100,
        unit: 'flights',
      },
      {
        key: 'avg_flight_duration',
        label: 'Average flight duration',
        type: 'select',
        options: [
          { value: 'short', label: 'Short haul (under 3 hours)', emoji: '✈️' },
          { value: 'long',  label: 'Long haul (over 3 hours)',   emoji: '🌍' },
        ],
      },
    ],
  },
  {
    id: 'diet',
    title: 'Diet & Food',
    subtitle: 'What\'s on your plate?',
    emoji: '🥗',
    fields: [
      {
        key: 'diet_type',
        label: 'Best describes your diet',
        type: 'select',
        options: [
          { value: 'vegan',          label: 'Vegan',            emoji: '🌱' },
          { value: 'vegetarian',     label: 'Vegetarian',       emoji: '🥦' },
          { value: 'meat_occasional',label: 'Occasional Meat',  emoji: '🐟' },
          { value: 'meat_regular',   label: 'Regular Meat',     emoji: '🍗' },
          { value: 'meat_heavy',     label: 'Heavy Meat Eater', emoji: '🥩' },
        ],
      },
      {
        key: 'meals_out_per_week',
        label: 'Meals eaten out / ordered per week',
        type: 'number',
        placeholder: '3',
        min: 0,
        max: 21,
        unit: 'meals',
      },
    ],
  },
  {
    id: 'energy',
    title: 'Home Energy',
    subtitle: 'Power your lifestyle',
    emoji: '⚡',
    fields: [
      {
        key: 'monthly_kwh',
        label: 'Monthly electricity usage',
        type: 'number',
        placeholder: '200',
        min: 0,
        max: 5000,
        unit: 'kWh',
      },
      {
        key: 'energy_source',
        label: 'Primary energy source',
        type: 'select',
        options: [
          { value: 'india_grid',   label: 'City Grid (Coal-heavy)',  emoji: '🔌' },
          { value: 'solar',        label: 'Solar / Renewable',       emoji: '☀️' },
          { value: 'natural_gas',  label: 'Natural Gas',             emoji: '🔥' },
        ],
      },
      {
        key: 'ac_months',
        label: 'Months per year you use AC / heating',
        type: 'number',
        placeholder: '4',
        min: 0,
        max: 12,
        unit: 'months',
      },
    ],
  },
  {
    id: 'shopping',
    title: 'Shopping & Lifestyle',
    subtitle: 'Your consumption habits',
    emoji: '🛍️',
    fields: [
      {
        key: 'shopping_frequency',
        label: 'Shopping habits (clothes, electronics, etc.)',
        type: 'select',
        options: [
          { value: 'minimal',   label: 'Minimal — buy only essentials',   emoji: '✅' },
          { value: 'moderate',  label: 'Moderate — some non-essentials',  emoji: '🛒' },
          { value: 'high',      label: 'High — frequent shopping',        emoji: '💳' },
          { value: 'excessive', label: 'Excessive — love shopping',       emoji: '🛍️' },
        ],
      },
      {
        key: 'online_orders_month',
        label: 'Online orders per month',
        type: 'number',
        placeholder: '5',
        min: 0,
        max: 100,
        unit: 'orders',
      },
    ],
  },
  {
    id: 'waste',
    title: 'Waste & Recycling',
    subtitle: 'What happens to your waste?',
    emoji: '♻️',
    fields: [
      {
        key: 'recycling_habit',
        label: 'Recycling habits',
        type: 'select',
        options: [
          { value: 'recycles_most', label: 'Recycle most things + compost', emoji: '♻️' },
          { value: 'recycles_some', label: 'Recycle some items',            emoji: '📦' },
          { value: 'no_recycling',  label: 'Don\'t really recycle',         emoji: '🗑️' },
        ],
      },
      {
        key: 'composting',
        label: 'Do you compost food waste?',
        type: 'select',
        options: [
          { value: 'yes',       label: 'Yes, regularly',   emoji: '🌱' },
          { value: 'sometimes', label: 'Sometimes',        emoji: '🤔' },
          { value: 'no',        label: 'No',               emoji: '❌' },
        ],
      },
    ],
  },
];

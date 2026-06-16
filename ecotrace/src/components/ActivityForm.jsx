import React, { useState } from 'react';
import { motion } from 'framer-motion';
import { FACTORS } from '../data/emissionFactors.js';

const TRANSPORT_OPTIONS = [
  { value: 'car_petrol', label: 'Petrol Car', emoji: '⛽' },
  { value: 'car_diesel', label: 'Diesel Car', emoji: '🚙' },
  { value: 'car_cng',    label: 'CNG Car',    emoji: '🌿' },
  { value: 'two_wheeler',label: 'Two-Wheeler',emoji: '🛵' },
  { value: 'bus',        label: 'Bus',        emoji: '🚌' },
  { value: 'metro_train',label: 'Metro',      emoji: '🚇' },
  { value: 'train',      label: 'Train',      emoji: '🚂' },
];

const DIET_OPTIONS = [
  { value: 'vegan',          label: 'Vegan meal',      emoji: '🌱', factor: FACTORS.diet.vegan / 3 },
  { value: 'vegetarian',     label: 'Vegetarian meal', emoji: '🥦', factor: FACTORS.diet.vegetarian / 3 },
  { value: 'meat_occasional',label: 'Light meat meal', emoji: '🐟', factor: FACTORS.diet.meat_occasional / 3 },
  { value: 'meat_regular',   label: 'Regular meal',    emoji: '🍗', factor: FACTORS.diet.meat_regular / 3 },
  { value: 'meat_heavy',     label: 'Heavy meat meal', emoji: '🥩', factor: FACTORS.diet.meat_heavy / 3 },
];

const ENERGY_OPTIONS = [
  { value: 'india_grid', label: 'Grid electricity', emoji: '🔌', factor: FACTORS.energy.india_grid },
  { value: 'solar',      label: 'Solar power',      emoji: '☀️', factor: FACTORS.energy.solar },
];

export default function ActivityForm({ onAdd, category }) {
  const [type, setType] = useState('');
  const [value, setValue] = useState('');
  const [note, setNote] = useState('');

  const getEmission = () => {
    if (category === 'transport' && type && value) {
      return ((FACTORS.transport[type] || 0) * Number(value)).toFixed(2);
    }
    if (category === 'diet' && type) {
      const opt = DIET_OPTIONS.find((o) => o.value === type);
      return opt ? opt.factor.toFixed(2) : '0';
    }
    if (category === 'energy' && type && value) {
      const opt = ENERGY_OPTIONS.find((o) => o.value === type);
      return opt ? (opt.factor * Number(value)).toFixed(2) : '0';
    }
    if (category === 'shopping' && value) {
      return (Number(value) * 2.5).toFixed(2);
    }
    return '0';
  };

  const handleAdd = () => {
    const co2 = parseFloat(getEmission());
    if (category !== 'diet' && !value) return;
    if ((category === 'transport' || category === 'diet' || category === 'energy') && !type) return;

    onAdd({
      category,
      type: type || category,
      value: value || '1',
      note,
      co2,
    });
    setType('');
    setValue('');
    setNote('');
  };

  return (
    <motion.div
      initial={{ opacity: 0, y: 8 }}
      animate={{ opacity: 1, y: 0 }}
      className="glass-card p-4 space-y-3"
    >
      {/* Transport */}
      {category === 'transport' && (
        <>
          <select
            value={type} onChange={(e) => setType(e.target.value)}
            className="w-full px-3 py-2 rounded-xl border border-forest-800/20 dark:border-forest-600/40 bg-white dark:bg-forest-800/50 text-forest-900 dark:text-cream-100 text-sm focus:outline-none focus:ring-2 focus:ring-forest-700"
          >
            <option value="">Select vehicle type</option>
            {TRANSPORT_OPTIONS.map((o) => (
              <option key={o.value} value={o.value}>{o.emoji} {o.label}</option>
            ))}
          </select>
          <input
            type="number" min="0" max="500" value={value}
            onChange={(e) => setValue(e.target.value)}
            placeholder="Distance in km"
            className="w-full px-3 py-2 rounded-xl border border-forest-800/20 dark:border-forest-600/40 bg-white dark:bg-forest-800/50 text-forest-900 dark:text-cream-100 text-sm focus:outline-none focus:ring-2 focus:ring-forest-700"
          />
        </>
      )}

      {/* Diet */}
      {category === 'diet' && (
        <select
          value={type} onChange={(e) => setType(e.target.value)}
          className="w-full px-3 py-2 rounded-xl border border-forest-800/20 dark:border-forest-600/40 bg-white dark:bg-forest-800/50 text-forest-900 dark:text-cream-100 text-sm focus:outline-none focus:ring-2 focus:ring-forest-700"
        >
          <option value="">Select meal type</option>
          {DIET_OPTIONS.map((o) => (
            <option key={o.value} value={o.value}>{o.emoji} {o.label}</option>
          ))}
        </select>
      )}

      {/* Energy */}
      {category === 'energy' && (
        <>
          <select
            value={type} onChange={(e) => setType(e.target.value)}
            className="w-full px-3 py-2 rounded-xl border border-forest-800/20 dark:border-forest-600/40 bg-white dark:bg-forest-800/50 text-forest-900 dark:text-cream-100 text-sm focus:outline-none focus:ring-2 focus:ring-forest-700"
          >
            <option value="">Select energy source</option>
            {ENERGY_OPTIONS.map((o) => (
              <option key={o.value} value={o.value}>{o.emoji} {o.label}</option>
            ))}
          </select>
          <input
            type="number" min="0" value={value}
            onChange={(e) => setValue(e.target.value)}
            placeholder="kWh used today"
            className="w-full px-3 py-2 rounded-xl border border-forest-800/20 dark:border-forest-600/40 bg-white dark:bg-forest-800/50 text-forest-900 dark:text-cream-100 text-sm focus:outline-none focus:ring-2 focus:ring-forest-700"
          />
        </>
      )}

      {/* Shopping */}
      {category === 'shopping' && (
        <input
          type="number" min="0" value={value}
          onChange={(e) => setValue(e.target.value)}
          placeholder="Amount spent (₹ × 100 ≈ kg CO₂)"
          className="w-full px-3 py-2 rounded-xl border border-forest-800/20 dark:border-forest-600/40 bg-white dark:bg-forest-800/50 text-forest-900 dark:text-cream-100 text-sm focus:outline-none focus:ring-2 focus:ring-forest-700"
        />
      )}

      {/* Note */}
      <input
        type="text" value={note} onChange={(e) => setNote(e.target.value)}
        placeholder="Optional note..."
        className="w-full px-3 py-2 rounded-xl border border-forest-800/20 dark:border-forest-600/40 bg-white dark:bg-forest-800/50 text-forest-900 dark:text-cream-100 text-sm focus:outline-none focus:ring-2 focus:ring-forest-700"
      />

      {/* Preview + Add */}
      <div className="flex items-center justify-between">
        <span className="text-sm text-forest-700/70 dark:text-cream-200/60">
          ≈ <strong className="text-forest-800 dark:text-gold-400">{getEmission()} kg CO₂</strong>
        </span>
        <button onClick={handleAdd} className="btn-primary py-2 px-4 text-sm">
          + Add Entry
        </button>
      </div>
    </motion.div>
  );
}

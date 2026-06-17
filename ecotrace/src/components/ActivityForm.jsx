import React, { useState } from 'react';
import PropTypes from 'prop-types';
import DOMPurify from 'dompurify';
import { calculateDailyLog } from '../algorithms/carbonCalculator.js';

const ACTIVITY_OPTIONS = {
  transport: [
    { value: 'car_petrol',    label: 'Petrol Car',    emoji: '🚗', unit: 'km' },
    { value: 'car_diesel',    label: 'Diesel Car',    emoji: '🚙', unit: 'km' },
    { value: 'car_cng',       label: 'CNG Car',       emoji: '🌿', unit: 'km' },
    { value: 'two_wheeler',   label: 'Two Wheeler',   emoji: '🏍️', unit: 'km' },
    { value: 'bus',           label: 'Bus',           emoji: '🚌', unit: 'km' },
    { value: 'metro_train',   label: 'Metro/Train',   emoji: '🚇', unit: 'km' },
  ],
  diet: [
    { value: 'vegan',           label: 'Vegan Meal',          emoji: '🌱', unit: 'meal' },
    { value: 'vegetarian',      label: 'Vegetarian Meal',     emoji: '🥦', unit: 'meal' },
    { value: 'meat_occasional', label: 'Meat Meal (light)',   emoji: '🍗', unit: 'meal' },
    { value: 'meat_regular',    label: 'Meat Meal (regular)', emoji: '🥩', unit: 'meal' },
    { value: 'meat_heavy',      label: 'Heavy Meat Meal',     emoji: '🍖', unit: 'meal' },
  ],
  energy: [
    { value: 'india_grid', label: 'Electricity (India Grid)', emoji: '🔌', unit: 'kWh' },
    { value: 'solar',      label: 'Solar Energy',             emoji: '☀️', unit: 'kWh' },
  ],
  shopping: [
    { value: 'clothing',      label: 'Clothing Item',  emoji: '👕', unit: 'item' },
    { value: 'electronics',   label: 'Electronics',    emoji: '📱', unit: 'item' },
    { value: 'groceries',     label: 'Grocery Run',    emoji: '🛒', unit: 'trip' },
    { value: 'online_order',  label: 'Online Order',   emoji: '📦', unit: 'order' },
  ],
  waste: [
    { value: 'recycles_most', label: 'Recycled Waste', emoji: '♻️', unit: 'bag' },
    { value: 'recycles_some', label: 'Mixed Waste',    emoji: '🗑️', unit: 'bag' },
    { value: 'no_recycling',  label: 'Landfill Waste', emoji: '❌', unit: 'bag' },
  ],
};

export default function ActivityForm({ onAdd, category }) {
  const options = ACTIVITY_OPTIONS[category] || [];
  const [selected, setSelected] = useState(options[0]?.value || '');
  const [value, setValue] = useState('');
  const [note, setNote] = useState('');

  const selectedOpt = options.find(o => o.value === selected);
  const needsValue = ['transport', 'energy'].includes(category);

  const getPreviewCO2 = () => {
    if (!selected) return 0;
    const entries = [{ category, type: selected, value: needsValue ? Number(value) || 1 : 1, note }];
    return calculateDailyLog(entries).total;
  };

  const handleAdd = () => {
    if (!selected) return;
    if (needsValue && (!value || Number(value) <= 0)) return;
    const co2 = getPreviewCO2();
    // Sanitize note — strip all HTML tags, keep plain text only
    const cleanNote = DOMPurify.sanitize(note.trim(), { ALLOWED_TAGS: [] });
    onAdd({ category, type: selected, value: needsValue ? Number(value) : 1, note: cleanNote, co2 });
    setValue('');
    setNote('');
  };

  return (
    <div className="glass-card p-5 space-y-4">
      <div className="grid grid-cols-2 sm:grid-cols-3 gap-2" role="group" aria-label={`${category} activity options`}>
        {options.map(opt => (
          <button
            key={opt.value}
            type="button"
            onClick={() => setSelected(opt.value)}
            aria-pressed={selected === opt.value}
            className={`flex items-center gap-2 p-3 rounded-xl border-2 text-sm font-medium text-left transition-all
              ${selected === opt.value
                ? 'border-forest-700 bg-forest-800/10 dark:bg-forest-700/30 text-forest-900 dark:text-cream-100'
                : 'border-forest-800/15 dark:border-cream-100/15 text-forest-700 dark:text-cream-200/70 hover:border-forest-700/40'
              }`}
          >
            <span aria-hidden="true">{opt.emoji}</span>
            <span className="truncate">{opt.label}</span>
          </button>
        ))}
      </div>

      {needsValue && (
        <div>
          <label
            htmlFor="activity-value"
            className="block text-sm font-semibold text-forest-800 dark:text-cream-100 mb-1"
          >
            {selectedOpt?.unit === 'km' ? 'Distance (km)' : 'Amount (kWh)'}
          </label>
          <input
            id="activity-value"
            type="number"
            min="0"
            value={value}
            onChange={e => setValue(e.target.value)}
            placeholder={selectedOpt?.unit === 'km' ? 'e.g. 15' : 'e.g. 5'}
            aria-label={selectedOpt?.unit === 'km' ? 'Distance in km' : 'Amount in kWh'}
            className="w-full px-4 py-3 rounded-xl border-2 border-forest-800/15 dark:border-cream-100/15
                       bg-white dark:bg-forest-800/50 text-forest-900 dark:text-cream-100
                       focus:outline-none focus:border-forest-700"
          />
        </div>
      )}

      <div>
        <label
          htmlFor="activity-note"
          className="block text-sm font-semibold text-forest-800 dark:text-cream-100 mb-1"
        >
          Note (optional)
        </label>
        <input
          id="activity-note"
          type="text"
          value={note}
          onChange={e => setNote(e.target.value)}
          placeholder="e.g. Morning commute"
          className="w-full px-4 py-3 rounded-xl border-2 border-forest-800/15 dark:border-cream-100/15
                     bg-white dark:bg-forest-800/50 text-forest-900 dark:text-cream-100
                     focus:outline-none focus:border-forest-700 text-sm"
        />
      </div>

      {selected && (
        <div className="flex items-center justify-between">
          <span className="text-xs text-forest-700/60 dark:text-cream-200/50">
            CO₂ impact: <strong className="text-forest-800 dark:text-gold-400">{getPreviewCO2().toFixed(3)} kg</strong>
          </span>
          <button type="button" onClick={handleAdd} className="btn-primary py-2 px-6 text-sm">
            + Add Entry
          </button>
        </div>
      )}
    </div>
  );
}

ActivityForm.propTypes = {
  onAdd: PropTypes.func.isRequired,
  category: PropTypes.oneOf(['transport', 'diet', 'energy', 'shopping', 'waste']).isRequired,
};

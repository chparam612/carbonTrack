import React from 'react';
import { motion } from 'framer-motion';
import { CATEGORY_META } from '../data/emissionFactors.js';
import { DIFFICULTY_COLORS, TIME_LABELS } from '../utils/constants.js';

/**
 * @param {{ tip: Object, index: number, showSaving?: boolean }} props
 */
export default function TipCard({ tip, index, showSaving = false }) {
  const meta = CATEGORY_META[tip.category];
  const action = tip.action || tip.tip;
  const saving = tip.annualSavingKg;
  const whyItMatters = tip.whyItMatters;

  return (
    <motion.div
      initial={{ opacity: 0, x: -16 }}
      animate={{ opacity: 1, x: 0 }}
      transition={{ delay: index * 0.08 }}
      className="flex items-start gap-3 p-3 rounded-xl bg-forest-800/5 dark:bg-cream-100/5
                 border border-forest-800/10 dark:border-cream-100/10"
    >
      <div className="w-8 h-8 rounded-lg bg-forest-800/10 dark:bg-cream-100/10
                      flex items-center justify-center text-base shrink-0 mt-0.5">
        {meta?.emoji || '💡'}
      </div>
      <div className="flex-1 min-w-0">
        <p className="text-sm font-medium text-forest-900 dark:text-cream-100 leading-snug">
          {action}
        </p>
        {whyItMatters && (
          <p className="text-xs text-forest-700/60 dark:text-cream-200/50 mt-1 leading-relaxed">
            {whyItMatters}
          </p>
        )}
        <div className="flex flex-wrap items-center gap-2 mt-2">
          {tip.difficulty && (
            <span className={`text-xs px-2 py-0.5 rounded-full font-medium ${DIFFICULTY_COLORS[tip.difficulty]}`}>
              {tip.difficulty}
            </span>
          )}
          {tip.timeToImpact && (
            <span className="text-xs text-forest-700/60 dark:text-cream-200/40">
              {TIME_LABELS[tip.timeToImpact] || tip.timeToImpact}
            </span>
          )}
          {showSaving && saving > 0 && (
            <span className="text-xs font-semibold text-green-600 dark:text-green-400">
              Saves ~{saving} kg CO₂/yr
            </span>
          )}
        </div>
      </div>
      {!showSaving && saving > 0 && (
        <div className="text-right shrink-0">
          <div className="text-sm font-bold text-forest-800 dark:text-gold-400">
            -{saving}kg
          </div>
          <div className="text-xs text-forest-700/50 dark:text-cream-200/40">CO₂/yr</div>
        </div>
      )}
    </motion.div>
  );
}

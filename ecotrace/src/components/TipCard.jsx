import React from 'react';
import { motion } from 'framer-motion';
import { CATEGORY_META } from '../data/emissionFactors.js';

const DIFFICULTY_COLORS = {
  easy:   'bg-green-100 text-green-800 dark:bg-green-900/40 dark:text-green-300',
  medium: 'bg-yellow-100 text-yellow-800 dark:bg-yellow-900/40 dark:text-yellow-300',
  hard:   'bg-red-100 text-red-800 dark:bg-red-900/40 dark:text-red-300',
};

const TIME_COLORS = {
  immediate: 'bg-blue-100 text-blue-800 dark:bg-blue-900/40 dark:text-blue-300',
  weeks:     'bg-purple-100 text-purple-800 dark:bg-purple-900/40 dark:text-purple-300',
  months:    'bg-orange-100 text-orange-800 dark:bg-orange-900/40 dark:text-orange-300',
};

export default function TipCard({ tip, index = 0, showSaving = true }) {
  const meta = CATEGORY_META[tip.category] || { label: tip.category, emoji: '💡' };

  return (
    <motion.div
      initial={{ opacity: 0, y: 16 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ delay: index * 0.08 }}
      className="glass-card p-4 hover:shadow-xl transition-shadow duration-200 group"
    >
      <div className="flex items-start gap-3">
        {/* Category icon */}
        <div
          className="w-10 h-10 rounded-xl flex items-center justify-center text-xl shrink-0 mt-0.5"
          style={{ backgroundColor: meta.color + '20' }}
        >
          {meta.emoji}
        </div>

        <div className="flex-1 min-w-0">
          {/* Action */}
          <p className="text-sm font-medium text-forest-900 dark:text-cream-100 leading-snug mb-2">
            {tip.action || tip.tip}
          </p>

          {/* Why it matters */}
          {tip.whyItMatters && (
            <p className="text-xs text-forest-700/70 dark:text-cream-200/60 mb-2 leading-relaxed">
              {tip.whyItMatters}
            </p>
          )}

          {/* Tags row */}
          <div className="flex flex-wrap gap-1.5">
            <span className={`badge ${DIFFICULTY_COLORS[tip.difficulty]}`}>
              {tip.difficulty}
            </span>
            {tip.timeToImpact && (
              <span className={`badge ${TIME_COLORS[tip.timeToImpact]}`}>
                {tip.timeToImpact}
              </span>
            )}
            <span className="badge bg-forest-800/10 dark:bg-cream-100/10 text-forest-700 dark:text-cream-200">
              {meta.label}
            </span>
          </div>
        </div>

        {/* Saving */}
        {showSaving && tip.annualSavingKg > 0 && (
          <div className="shrink-0 text-right">
            <div className="text-lg font-bold font-display text-forest-800 dark:text-gold-400">
              -{tip.annualSavingKg}
            </div>
            <div className="text-xs text-forest-700/60 dark:text-cream-200/50">kg/yr</div>
          </div>
        )}
      </div>
    </motion.div>
  );
}

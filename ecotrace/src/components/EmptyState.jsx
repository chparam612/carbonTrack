import React from 'react';
import { motion } from 'framer-motion';

/**
 * Reusable full-page empty state card.
 *
 * Props:
 *   icon        — emoji string
 *   title       — heading text
 *   description — body text
 *   children    — optional action slot (buttons, links, etc.)
 */
export default function EmptyState({ icon, title, description, children }) {
  return (
    <div className="min-h-screen pt-24 pb-16 px-4 bg-cream-100 dark:bg-forest-900 flex items-center justify-center">
      <motion.div
        initial={{ opacity: 0, scale: 0.95 }}
        animate={{ opacity: 1, scale: 1 }}
        className="text-center glass-card p-10 max-w-sm mx-auto"
      >
        <span className="text-6xl block mb-4" aria-hidden="true">{icon}</span>
        <h2 className="font-display text-2xl font-bold text-forest-800 dark:text-cream-100 mb-2">
          {title}
        </h2>
        <p className="text-forest-700/70 dark:text-cream-200/60 text-sm leading-relaxed mb-6">
          {description}
        </p>
        {children}
      </motion.div>
    </div>
  );
}

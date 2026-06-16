import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';

const NAV_ITEMS = [
  { id: 'home',      label: 'Home',     emoji: '🏠' },
  { id: 'quiz',      label: 'Quiz',     emoji: '📋' },
  { id: 'dashboard', label: 'Dashboard',emoji: '📊' },
  { id: 'tracker',   label: 'Tracker',  emoji: '📅' },
  { id: 'insights',  label: 'Insights', emoji: '🤖' },
  { id: 'map',       label: 'Map',      emoji: '🗺️' },
];

export default function Navbar({ currentPage, setCurrentPage, darkMode, setDarkMode, setShowSetup }) {
  const [mobileOpen, setMobileOpen] = useState(false);

  return (
    <nav className="fixed top-0 left-0 right-0 z-50 backdrop-blur-md bg-white/70 dark:bg-forest-900/80 border-b border-white/30 dark:border-forest-700/40 shadow-sm">
      <div className="max-w-7xl mx-auto px-4 flex items-center justify-between h-16">
        {/* Logo */}
        <button
          onClick={() => setCurrentPage('home')}
          className="flex items-center gap-2 group"
          aria-label="Go to home page"
        >
          <span className="text-2xl group-hover:rotate-12 transition-transform duration-200" aria-hidden="true">🌿</span>
          <span className="font-display font-bold text-xl text-forest-800 dark:text-cream-100">
            EcoTrace
          </span>
        </button>

        {/* Desktop nav */}
        <div className="hidden md:flex items-center gap-1">
          {NAV_ITEMS.map((item) => (
            <button
              key={item.id}
              onClick={() => setCurrentPage(item.id)}
              aria-current={currentPage === item.id ? 'page' : undefined}
              className={`relative px-3 py-2 rounded-lg text-sm font-medium transition-all duration-200
                ${currentPage === item.id
                  ? 'text-forest-800 dark:text-cream-100'
                  : 'text-forest-700/70 dark:text-cream-200/60 hover:text-forest-800 dark:hover:text-cream-100'
                }`}
            >
              {currentPage === item.id && (
                <motion.span
                  layoutId="nav-pill"
                  className="absolute inset-0 bg-forest-800/10 dark:bg-cream-100/10 rounded-lg"
                  aria-hidden="true"
                />
              )}
              <span className="relative">
                <span aria-hidden="true">{item.emoji}</span> {item.label}
              </span>
            </button>
          ))}
        </div>

        {/* Right controls */}
        <div className="flex items-center gap-2">
          {/* Dark mode toggle */}
          <button
            onClick={() => setDarkMode(!darkMode)}
            className="p-2 rounded-lg hover:bg-forest-800/10 dark:hover:bg-cream-100/10 transition-colors"
            aria-label="Toggle dark mode"
          >
            <span className="text-lg" aria-hidden="true">{darkMode ? '☀️' : '🌙'}</span>
          </button>

          {/* Settings */}
          <button
            onClick={() => setShowSetup(true)}
            className="p-2 rounded-lg hover:bg-forest-800/10 dark:hover:bg-cream-100/10 transition-colors"
            aria-label="Open settings"
          >
            <span className="text-lg" aria-hidden="true">⚙️</span>
          </button>

          {/* Mobile hamburger */}
          <button
            onClick={() => setMobileOpen(!mobileOpen)}
            className="md:hidden p-2 rounded-lg hover:bg-forest-800/10 dark:hover:bg-cream-100/10 transition-colors"
            aria-label="Open navigation menu"
            aria-expanded={mobileOpen}
          >
            <span className="text-lg" aria-hidden="true">{mobileOpen ? '✕' : '☰'}</span>
          </button>
        </div>
      </div>

      {/* Mobile menu */}
      <AnimatePresence>
        {mobileOpen && (
          <motion.div
            initial={{ opacity: 0, height: 0 }}
            animate={{ opacity: 1, height: 'auto' }}
            exit={{ opacity: 0, height: 0 }}
            className="md:hidden border-t border-white/30 dark:border-forest-700/40 bg-white/80 dark:bg-forest-900/90 backdrop-blur-md"
          >
            <div className="px-4 py-3 flex flex-col gap-1">
              {NAV_ITEMS.map((item) => (
                <button
                  key={item.id}
                  onClick={() => { setCurrentPage(item.id); setMobileOpen(false); }}
                  aria-current={currentPage === item.id ? 'page' : undefined}
                  className={`w-full text-left px-4 py-3 rounded-xl text-sm font-medium transition-all
                    ${currentPage === item.id
                      ? 'bg-forest-800 text-cream-100'
                      : 'text-forest-800 dark:text-cream-100 hover:bg-forest-800/10'
                    }`}
                >
                  <span aria-hidden="true">{item.emoji}</span> {item.label}
                </button>
              ))}
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </nav>
  );
}

import React, { useState, useEffect } from 'react';
import { AnimatePresence, motion } from 'framer-motion';
import PropTypes from 'prop-types';

import Navbar from './components/Navbar.jsx';
import SetupModal from './components/SetupModal.jsx';
import ErrorBoundary from './components/ErrorBoundary.jsx';

import Home from './pages/Home.jsx';
import Quiz from './pages/Quiz.jsx';
import Dashboard from './pages/Dashboard.jsx';
import Tracker from './pages/Tracker.jsx';
import Insights from './pages/Insights.jsx';
import Map from './pages/Map.jsx';

import { hasAllKeys, getGeminiKey } from './config/keys.js';
import { initFirebase } from './config/firebase.js';

const PAGE_VARIANTS = {
  initial:   { opacity: 0, y: 16 },
  animate:   { opacity: 1, y: 0, transition: { duration: 0.35, ease: 'easeOut' } },
  exit:      { opacity: 0, y: -12, transition: { duration: 0.2 } },
};

export default function App() {
  const [currentPage, setCurrentPage] = useState('home');
  const [darkMode, setDarkMode] = useState(() => localStorage.getItem('ecotrace_dark') === 'true');
  const [showSetup, setShowSetup] = useState(false);
  const [firstLaunch, setFirstLaunch] = useState(() => !getGeminiKey());

  const [footprintData, setFootprintData] = useState(() => {
    try {
      const saved = localStorage.getItem('ecotrace_footprint');
      return saved ? JSON.parse(saved) : null;
    } catch { return null; }
  });

  const [logs, setLogs] = useState([]);

  // Dark mode class on <html>
  useEffect(() => {
    document.documentElement.classList.toggle('dark', darkMode);
    localStorage.setItem('ecotrace_dark', darkMode);
  }, [darkMode]);

  // Persist footprint data
  useEffect(() => {
    if (footprintData) {
      localStorage.setItem('ecotrace_footprint', JSON.stringify(footprintData));
    }
  }, [footprintData]);

  // Init Firebase once on mount if keys are present
  useEffect(() => {
    if (hasAllKeys()) initFirebase();
  }, []); // eslint-disable-line react-hooks/exhaustive-deps

  const handleSetupComplete = () => {
    setFirstLaunch(false);
    setShowSetup(false);
    if (hasAllKeys()) initFirebase();
  };

  const renderPage = () => {
    switch (currentPage) {
      case 'home':
        return (
          <ErrorBoundary>
            <Home setCurrentPage={setCurrentPage} />
          </ErrorBoundary>
        );
      case 'quiz':
        return (
          <ErrorBoundary>
            <Quiz setCurrentPage={setCurrentPage} setFootprintData={setFootprintData} />
          </ErrorBoundary>
        );
      case 'dashboard':
        return (
          <ErrorBoundary>
            <Dashboard footprintData={footprintData} logs={logs} setCurrentPage={setCurrentPage} />
          </ErrorBoundary>
        );
      case 'tracker':
        return (
          <ErrorBoundary>
            <Tracker onLogsUpdate={setLogs} />
          </ErrorBoundary>
        );
      case 'insights':
        return (
          <ErrorBoundary>
            <Insights footprintData={footprintData} logs={logs} />
          </ErrorBoundary>
        );
      case 'map':
        return (
          <ErrorBoundary>
            <Map />
          </ErrorBoundary>
        );
      default:
        return (
          <ErrorBoundary>
            <Home setCurrentPage={setCurrentPage} />
          </ErrorBoundary>
        );
    }
  };

  return (
    <div className="min-h-screen bg-cream-100 dark:bg-forest-900 font-body transition-colors duration-300">
      <header>
        <Navbar
          currentPage={currentPage}
          setCurrentPage={setCurrentPage}
          darkMode={darkMode}
          setDarkMode={setDarkMode}
          setShowSetup={setShowSetup}
        />
      </header>

      <main id="main-content">
        <AnimatePresence mode="wait">
          <motion.div
            key={currentPage}
            variants={PAGE_VARIANTS}
            initial="initial"
            animate="animate"
            exit="exit"
          >
            {renderPage()}
          </motion.div>
        </AnimatePresence>
      </main>

      {(firstLaunch || showSetup) && (
        <SetupModal
          onComplete={handleSetupComplete}
          onClose={() => setShowSetup(false)}
          isSettings={!firstLaunch && showSetup}
        />
      )}
    </div>
  );
}

// Suppress prop-types warning for the root component — it receives no props
App.propTypes = {};

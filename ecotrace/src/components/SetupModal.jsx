import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import {
  saveGeminiKey, saveFirebaseConfig, saveMapsKey,
  getGeminiKey, getFirebaseConfig, getMapsKey,
} from '../config/keys.js';

/**
 * Parse Firebase config that may be:
 * 1. Strict JSON:          { "apiKey": "..." }
 * 2. JS object literal:    { apiKey: "..." }
 * 3. const assignment:     const firebaseConfig = { ... };
 * 4. initializeApp() call: initializeApp({ ... })
 *
 * Uses Function() to safely evaluate the JS object expression.
 */
function parseFirebaseConfig(raw) {
  if (!raw || !raw.trim()) return null;

  let text = raw.trim();

  // 1. Try strict JSON first (fastest path)
  try {
    const parsed = JSON.parse(text);
    if (parsed && typeof parsed === 'object') return parsed;
  } catch (_) {}

  // 2. Extract just the { ... } object literal from whatever wrapper exists
  // Find the first { and its matching closing }
  const start = text.indexOf('{');
  const end = text.lastIndexOf('}');
  if (start === -1 || end === -1 || end <= start) {
    throw new Error('No object literal found. Make sure you paste the full config.');
  }
  const objectText = text.slice(start, end + 1);

  // 3. Use Function() to evaluate the JS object literal safely
  try {
    // eslint-disable-next-line no-new-func
    const result = new Function(`"use strict"; return (${objectText});`)();
    if (result && typeof result === 'object') return result;
    throw new Error('Parsed value is not an object.');
  } catch (e) {
    throw new Error(e.message);
  }
}

export default function SetupModal({ onComplete, onClose, isSettings = false }) {
  const [geminiKey, setGeminiKey] = useState(getGeminiKey());
  const [firebaseJson, setFirebaseJson] = useState(
    getFirebaseConfig() ? JSON.stringify(getFirebaseConfig(), null, 2) : ''
  );
  const [mapsKey, setMapsKey] = useState(getMapsKey());
  const [error, setError] = useState('');
  const [saved, setSaved] = useState(false);

  const handleSave = () => {
    setError('');

    // Parse Firebase config (accepts JS object literals too)
    let parsedFirebase = null;
    if (firebaseJson.trim()) {
      try {
        parsedFirebase = parseFirebaseConfig(firebaseJson);
        if (!parsedFirebase || typeof parsedFirebase !== 'object') {
          throw new Error('Result is not an object');
        }
        // Sanity check — must have at least apiKey or projectId
        if (!parsedFirebase.apiKey && !parsedFirebase.projectId) {
          throw new Error('Missing required fields (apiKey / projectId)');
        }
      } catch (e) {
        setError('Firebase config error: ' + e.message + '. Paste the config object from Firebase Console.');
        return;
      }
    }

    if (!geminiKey.trim() && !isSettings) {
      setError('Please enter your Gemini API key to continue.');
      return;
    }

    if (geminiKey.trim()) saveGeminiKey(geminiKey.trim());
    if (parsedFirebase) saveFirebaseConfig(parsedFirebase);
    if (mapsKey.trim()) saveMapsKey(mapsKey.trim());

    setSaved(true);
    setTimeout(() => {
      setSaved(false);
      onComplete?.();
      onClose?.();
    }, 1200);
  };

  return (
    <AnimatePresence>
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        exit={{ opacity: 0 }}
        className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/50 backdrop-blur-sm"
      >
        <motion.div
          initial={{ scale: 0.9, opacity: 0, y: 20 }}
          animate={{ scale: 1, opacity: 1, y: 0 }}
          exit={{ scale: 0.9, opacity: 0 }}
          transition={{ type: 'spring', stiffness: 300, damping: 25 }}
          className="w-full max-w-lg bg-cream-100 dark:bg-forest-900 rounded-3xl shadow-2xl overflow-hidden"
        >
          {/* Header */}
          <div className="bg-gradient-to-r from-forest-900 to-forest-800 p-6 text-cream-100">
            <div className="flex items-center gap-3 mb-2">
              <span className="text-3xl">🌿</span>
              <h2 className="font-display text-2xl font-bold">
                {isSettings ? 'API Settings' : 'Welcome to EcoTrace'}
              </h2>
            </div>
            <p className="text-cream-200/80 text-sm">
              {isSettings
                ? 'Update your API keys below. Keys are stored locally in your browser.'
                : 'Paste your API keys to unlock all features. Keys never leave your browser.'}
            </p>
          </div>

          {/* Body */}
          <div className="p-6 space-y-5">
            {/* Gemini Key */}
            <div>
              <label className="block text-sm font-semibold text-forest-800 dark:text-cream-100 mb-1.5">
                🤖 Gemini API Key <span className="text-red-500">*</span>
              </label>
              <input
                type="password"
                value={geminiKey}
                onChange={(e) => setGeminiKey(e.target.value)}
                placeholder="AIzaSy..."
                className="w-full px-4 py-3 rounded-xl border border-forest-800/20 dark:border-forest-600/40
                           bg-white dark:bg-forest-800/50 text-forest-900 dark:text-cream-100
                           focus:outline-none focus:ring-2 focus:ring-forest-700 text-sm font-mono"
              />
              <p className="mt-1 text-xs text-forest-700/60 dark:text-cream-200/50">
                Get yours at{' '}
                <a href="https://aistudio.google.com/app/apikey" target="_blank" rel="noreferrer"
                   className="text-forest-700 dark:text-gold-500 underline">
                  aistudio.google.com
                </a>
              </p>
            </div>

            {/* Firebase Config */}
            <div>
              <label className="block text-sm font-semibold text-forest-800 dark:text-cream-100 mb-1.5">
                🔥 Firebase Config <span className="text-forest-700/50">(optional)</span>
              </label>
              <textarea
                value={firebaseJson}
                onChange={(e) => setFirebaseJson(e.target.value)}
                placeholder={`// Paste exactly from Firebase Console → Project Settings\nconst firebaseConfig = {\n  apiKey: "AIzaSy...",\n  authDomain: "your-app.firebaseapp.com",\n  projectId: "your-app",\n  storageBucket: "your-app.appspot.com",\n  messagingSenderId: "123456",\n  appId: "1:123:web:abc"\n};`}
                rows={6}
                className="w-full px-4 py-3 rounded-xl border border-forest-800/20 dark:border-forest-600/40
                           bg-white dark:bg-forest-800/50 text-forest-900 dark:text-cream-100
                           focus:outline-none focus:ring-2 focus:ring-forest-700 text-xs font-mono resize-none"
              />
              <p className="mt-1 text-xs text-forest-700/60 dark:text-cream-200/50">
                Paste the JS object or JSON from{' '}
                <a href="https://console.firebase.google.com" target="_blank" rel="noreferrer"
                   className="text-forest-700 dark:text-gold-500 underline">
                  Firebase Console
                </a>
                {' '}→ Project Settings → Your apps
              </p>
            </div>

            {/* Maps Key */}
            <div>
              <label className="block text-sm font-semibold text-forest-800 dark:text-cream-100 mb-1.5">
                🗺️ Google Maps API Key <span className="text-forest-700/50">(optional)</span>
              </label>
              <input
                type="password"
                value={mapsKey}
                onChange={(e) => setMapsKey(e.target.value)}
                placeholder="AIzaSy..."
                className="w-full px-4 py-3 rounded-xl border border-forest-800/20 dark:border-forest-600/40
                           bg-white dark:bg-forest-800/50 text-forest-900 dark:text-cream-100
                           focus:outline-none focus:ring-2 focus:ring-forest-700 text-sm font-mono"
              />
            </div>

            {error && (
              <div className="p-3 rounded-xl bg-red-50 dark:bg-red-900/30 border border-red-200 dark:border-red-700/50 text-red-700 dark:text-red-300 text-sm">
                ⚠️ {error}
              </div>
            )}
          </div>

          {/* Footer */}
          <div className="px-6 pb-6 flex gap-3">
            {isSettings && (
              <button onClick={onClose} className="btn-ghost flex-1">
                Cancel
              </button>
            )}
            <button
              onClick={handleSave}
              className={`flex-1 btn-primary flex items-center justify-center gap-2 ${saved ? 'bg-green-600' : ''}`}
            >
              {saved ? (
                <>✅ Saved!</>
              ) : (
                <>{isSettings ? 'Save Changes' : 'Launch EcoTrace 🌿'}</>
              )}
            </button>
          </div>
        </motion.div>
      </motion.div>
    </AnimatePresence>
  );
}

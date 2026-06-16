import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import ActivityForm from '../components/ActivityForm.jsx';
import { calculateDailyLog } from '../algorithms/carbonCalculator.js';
import { CATEGORY_META } from '../data/emissionFactors.js';
import { useFirestore } from '../hooks/useFirestore.js';

const CATEGORIES = ['transport', 'diet', 'energy', 'shopping', 'waste'];

function todayStr() {
  return new Date().toISOString().split('T')[0];
}

function EntryRow({ entry, onRemove }) {
  const meta = CATEGORY_META[entry.category];
  return (
    <motion.div
      initial={{ opacity: 0, x: -16 }}
      animate={{ opacity: 1, x: 0 }}
      exit={{ opacity: 0, x: 16 }}
      className="flex items-center gap-3 p-3 rounded-xl bg-forest-800/5 dark:bg-cream-100/5"
    >
      <span className="text-xl">{meta?.emoji || '📌'}</span>
      <div className="flex-1 min-w-0">
        <p className="text-sm font-medium text-forest-900 dark:text-cream-100 truncate">
          {entry.type} {entry.value ? `· ${entry.value}${entry.category === 'transport' ? ' km' : entry.category === 'energy' ? ' kWh' : ''}` : ''}
          {entry.note ? ` — ${entry.note}` : ''}
        </p>
        <p className="text-xs text-forest-700/60 dark:text-cream-200/50">{meta?.label}</p>
      </div>
      <span className="font-display font-bold text-sm text-forest-800 dark:text-gold-400 shrink-0">
        {entry.co2?.toFixed(2)} kg
      </span>
      <button
        onClick={onRemove}
        className="text-red-400 hover:text-red-600 transition-colors text-sm p-1 shrink-0"
      >✕</button>
    </motion.div>
  );
}

export default function Tracker({ onLogsUpdate }) {
  const [activeCategory, setActiveCategory] = useState('transport');
  const [entries, setEntries] = useState([]);
  const [saved, setSaved] = useState(false);
  const [pastLogs, setPastLogs] = useState([]);
  const { saveLog, getLogs, ready } = useFirestore();

  const { total, breakdown } = calculateDailyLog(entries);

  // Load past logs on mount and when Firebase becomes ready
  useEffect(() => {
    if (!ready) return;
    getLogs(7).then((fetchedLogs) => {
      setPastLogs(fetchedLogs);
      onLogsUpdate?.(fetchedLogs);
    });
  // onLogsUpdate is a stable setter from parent — safe to omit from deps
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [ready, getLogs]);

  const addEntry = (entry) => {
    setEntries((prev) => [...prev, entry]);
  };

  const removeEntry = (idx) => {
    setEntries((prev) => prev.filter((_, i) => i !== idx));
  };

  const handleSave = async () => {
    if (entries.length === 0) return;
    const date = todayStr();
    await saveLog(date, { total, breakdown, entries });
    setSaved(true);
    const updatedLogs = await getLogs(7);
    setPastLogs(updatedLogs);
    onLogsUpdate?.(updatedLogs);
    setEntries([]);
    setTimeout(() => setSaved(false), 2500);
  };

  const co2Color = total < 5 ? '#2d5016' : total < 12 ? '#DAA520' : '#ef4444';

  return (
    <div className="min-h-screen pt-24 pb-16 px-4 bg-cream-100 dark:bg-forest-900">
      <div className="max-w-2xl mx-auto">
        <motion.div initial={{ opacity: 0, y: -10 }} animate={{ opacity: 1, y: 0 }} className="mb-6">
          <h1 className="font-display text-3xl font-bold text-forest-900 dark:text-cream-100">
            Daily Tracker 📅
          </h1>
          <p className="text-forest-700/60 dark:text-cream-200/50 text-sm mt-1">
            {new Date().toLocaleDateString('en-IN', { weekday: 'long', year: 'numeric', month: 'long', day: 'numeric' })}
          </p>
        </motion.div>

        {/* Running total */}
        <motion.div
          initial={{ scale: 0.95, opacity: 0 }}
          animate={{ scale: 1, opacity: 1 }}
          className="glass-card p-5 mb-6 text-center"
        >
          <p className="text-xs text-forest-700/60 dark:text-cream-200/50 mb-1">Today's CO₂</p>
          <div className="font-display text-5xl font-black mb-1" style={{ color: co2Color }}>
            {total.toFixed(2)} kg
          </div>
          {/* Category mini bars */}
          {total > 0 && (
            <div className="flex gap-1 mt-3 h-2 rounded-full overflow-hidden">
              {Object.entries(breakdown).map(([cat, val]) => {
                if (!val) return null;
                const meta = CATEGORY_META[cat];
                return (
                  <motion.div
                    key={cat}
                    initial={{ width: 0 }}
                    animate={{ width: `${(val / total) * 100}%` }}
                    style={{ backgroundColor: meta?.color || '#2d5016' }}
                    title={`${meta?.label}: ${val.toFixed(2)} kg`}
                  />
                );
              })}
            </div>
          )}
        </motion.div>

        {/* Category tabs */}
        <div className="flex gap-2 mb-4 overflow-x-auto pb-1">
          {CATEGORIES.map((cat) => {
            const meta = CATEGORY_META[cat];
            return (
              <button
                key={cat}
                onClick={() => setActiveCategory(cat)}
                className={`flex items-center gap-1.5 px-4 py-2 rounded-xl text-sm font-medium whitespace-nowrap transition-all duration-200
                  ${activeCategory === cat
                    ? 'bg-forest-800 text-cream-100 shadow-md'
                    : 'bg-forest-800/10 dark:bg-cream-100/10 text-forest-700 dark:text-cream-200 hover:bg-forest-800/20'
                  }`}
              >
                <span>{meta?.emoji}</span>
                {meta?.label}
              </button>
            );
          })}
        </div>

        {/* Activity form */}
        <ActivityForm onAdd={addEntry} category={activeCategory} />

        {/* Entries list */}
        {entries.length > 0 && (
          <div className="mt-4 space-y-2">
            <h3 className="text-sm font-semibold text-forest-800 dark:text-cream-100 mb-2">
              Today's Entries ({entries.length})
            </h3>
            <AnimatePresence>
              {entries.map((entry, i) => (
                <EntryRow key={i} entry={entry} onRemove={() => removeEntry(i)} />
              ))}
            </AnimatePresence>

            <motion.button
              whileHover={{ scale: 1.02 }}
              whileTap={{ scale: 0.98 }}
              onClick={handleSave}
              disabled={saved}
              className={`w-full mt-4 btn-primary flex items-center justify-center gap-2 ${saved ? 'bg-green-600' : ''}`}
            >
              {saved ? '✅ Saved to your log!' : '💾 Save Today\'s Log'}
            </motion.button>
          </div>
        )}

        {/* Past 7 days timeline */}
        {pastLogs.length > 0 && (
          <div className="mt-10">
            <h3 className="font-display font-semibold text-lg text-forest-800 dark:text-cream-100 mb-4">
              Last 7 Days
            </h3>
            <div className="space-y-3">
              {[...pastLogs]
                .sort((a, b) => new Date(b.date) - new Date(a.date))
                .map((log, i) => {
                  const logColor = log.total < 8 ? '#2d5016' : log.total < 15 ? '#DAA520' : '#ef4444';
                  return (
                    <motion.div
                      key={log.date}
                      initial={{ opacity: 0, y: 10 }}
                      animate={{ opacity: 1, y: 0 }}
                      transition={{ delay: i * 0.06 }}
                      className="glass-card p-4 flex items-center gap-4"
                    >
                      <div className="text-center shrink-0 w-12">
                        <div className="text-xs text-forest-700/60 dark:text-cream-200/50">
                          {new Date(log.date).toLocaleDateString('en-IN', { month: 'short' })}
                        </div>
                        <div className="font-display font-bold text-xl text-forest-800 dark:text-cream-100">
                          {new Date(log.date).getDate()}
                        </div>
                      </div>
                      <div className="flex-1">
                        <div className="h-2 bg-forest-800/10 dark:bg-cream-100/10 rounded-full overflow-hidden">
                          <motion.div
                            className="h-full rounded-full"
                            style={{ backgroundColor: logColor }}
                            initial={{ width: 0 }}
                            animate={{ width: `${Math.min((log.total / 20) * 100, 100)}%` }}
                            transition={{ duration: 0.6, delay: i * 0.1 }}
                          />
                        </div>
                      </div>
                      <div className="font-display font-bold text-sm shrink-0" style={{ color: logColor }}>
                        {log.total?.toFixed(1)} kg
                      </div>
                    </motion.div>
                  );
                })}
            </div>
          </div>
        )}
      </div>
    </div>
  );
}

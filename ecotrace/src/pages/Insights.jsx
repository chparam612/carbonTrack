import React, { useState, useEffect } from 'react';
import PropTypes from 'prop-types';
import { motion, AnimatePresence } from 'framer-motion';
import { useGemini } from '../hooks/useGemini.js';
import TipCard from '../components/TipCard.jsx';
import EmptyState from '../components/EmptyState.jsx';
import { BENCHMARKS } from '../data/emissionFactors.js';
import { RATING_COLORS } from '../utils/constants.js';

function LeafSpinner() {
  return (
    <div className="flex flex-col items-center gap-4 py-16" role="status" aria-live="polite">
      <motion.div
        animate={{ rotate: 360 }}
        transition={{ repeat: Infinity, duration: 1.5, ease: 'linear' }}
        className="text-6xl"
        aria-hidden="true"
      >
        🌿
      </motion.div>
      <p className="text-forest-700 dark:text-cream-200 font-medium">EcoCoach is analysing your footprint…</p>
      <p className="text-xs text-forest-700 dark:text-cream-200 mt-1">Finding best available model · this takes 10–20 seconds</p>
    </div>
  );
}

function PersonalityCard({ ecoPersonality, personalityDescription, headline }) {
  return (
    <motion.div
      initial={{ opacity: 0, scale: 0.9 }} animate={{ opacity: 1, scale: 1 }}
      className="glass-card p-6 text-center"
    >
      <div className="text-5xl mb-3" aria-hidden="true">🧬</div>
      <h3 className="font-display text-xl font-bold text-forest-800 dark:text-cream-100 mb-1">Your Eco Personality</h3>
      <div className="inline-block bg-gold-500/20 border border-gold-500/50 text-gold-400 dark:text-gold-400 font-bold px-4 py-1 rounded-full text-sm mb-3">
        {ecoPersonality}
      </div>
      <p className="text-sm text-forest-700 dark:text-cream-200 mb-3 leading-relaxed">{personalityDescription}</p>
      <div className="p-3 bg-forest-800/10 dark:bg-cream-100/5 rounded-xl">
        <p className="text-sm font-semibold text-forest-800 dark:text-cream-100 italic">"{headline}"</p>
      </div>
    </motion.div>
  );
}

PersonalityCard.propTypes = {
  ecoPersonality: PropTypes.string.isRequired,
  personalityDescription: PropTypes.string.isRequired,
  headline: PropTypes.string.isRequired,
};

function ScoreCard({ score }) {
  const color = RATING_COLORS[score?.rating] || RATING_COLORS.average;
  return (
    <motion.div initial={{ opacity: 0, y: 16 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.1 }} className="glass-card p-5">
      <h3 className="font-display font-semibold text-forest-800 dark:text-cream-100 mb-3 text-sm">
        <span aria-hidden="true">📊</span> AI Score Assessment
      </h3>
      <div className="flex items-center gap-4">
        <div className="text-center">
          <div className="font-display text-4xl font-black" style={{ color }}>{score?.percentile ?? '—'}</div>
          <div className="text-xs text-forest-700 dark:text-cream-200">percentile</div>
        </div>
        <div className="flex-1">
          <div className="inline-block px-3 py-1 rounded-full text-sm font-bold capitalize mb-1" style={{ backgroundColor: color + '20', color }}>
            {score?.rating ?? 'unknown'}
          </div>
          <div className="text-xs text-forest-700 dark:text-cream-200 mb-2">Better than {score?.percentile ?? 0}% of users</div>
          <div className="h-2 bg-forest-800/10 dark:bg-cream-100/10 rounded-full overflow-hidden">
            <motion.div className="h-full rounded-full" style={{ backgroundColor: color }}
              initial={{ width: 0 }} animate={{ width: `${score?.percentile ?? 0}%` }} transition={{ duration: 1 }} />
          </div>
        </div>
      </div>
    </motion.div>
  );
}

ScoreCard.propTypes = {
  score: PropTypes.shape({
    rating: PropTypes.string,
    percentile: PropTypes.number,
  }),
};
ScoreCard.defaultProps = { score: null };

function GoalCard({ weeklyGoal, monthlyChallenge }) {
  return (
    <motion.div initial={{ opacity: 0, y: 16 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.2 }} className="glass-card p-5">
      <h3 className="font-display font-semibold text-forest-800 dark:text-cream-100 mb-4 text-sm">
        <span aria-hidden="true">🎯</span> Your Goals
      </h3>
      <div className="space-y-3">
        <div className="p-3 rounded-xl bg-forest-800/10 dark:bg-cream-100/5 border border-forest-700/20">
          <div className="text-xs text-forest-700 dark:text-cream-200 mb-1"><span aria-hidden="true">📅</span> This week</div>
          <p className="text-sm font-medium text-forest-800 dark:text-cream-100">{weeklyGoal}</p>
        </div>
        <div className="p-3 rounded-xl bg-gold-500/10 border border-gold-500/30">
          <div className="text-xs text-gold-400 dark:text-gold-400 mb-1"><span aria-hidden="true">🏆</span> Monthly challenge</div>
          <p className="text-sm font-medium text-forest-800 dark:text-cream-100">{monthlyChallenge}</p>
        </div>
      </div>
    </motion.div>
  );
}

GoalCard.propTypes = {
  weeklyGoal: PropTypes.string.isRequired,
  monthlyChallenge: PropTypes.string.isRequired,
};

function FunFactCard({ funFact, motivationalMessage }) {
  return (
    <motion.div initial={{ opacity: 0, y: 16 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.3 }} className="glass-card p-5">
      <div className="mb-4">
        <div className="flex items-center gap-2 mb-2">
          <span className="text-xl" aria-hidden="true">🌍</span>
          <h3 className="font-display font-semibold text-forest-800 dark:text-cream-100 text-sm">Fun Fact</h3>
        </div>
        <p className="text-sm text-forest-700 dark:text-cream-200 leading-relaxed italic">"{funFact}"</p>
      </div>
      <hr className="border-forest-800/10 dark:border-cream-100/10 mb-4" />
      <div>
        <div className="flex items-center gap-2 mb-2">
          <span className="text-xl" aria-hidden="true">💪</span>
          <h3 className="font-display font-semibold text-forest-800 dark:text-cream-100 text-sm">Your Motivation</h3>
        </div>
        <p className="text-sm text-forest-700 dark:text-cream-200 leading-relaxed">{motivationalMessage}</p>
      </div>
    </motion.div>
  );
}

FunFactCard.propTypes = {
  funFact: PropTypes.string.isRequired,
  motivationalMessage: PropTypes.string.isRequired,
};

export default function Insights({ footprintData = null, logs = [] }) {
  useEffect(() => { document.title = 'AI Insights | EcoTrace'; }, []);

  const [insights, setInsights] = useState(() => {
    try {
      const raw = localStorage.getItem('ecotrace_gemini_insights');
      if (raw) {
        const { data, ts } = JSON.parse(raw);
        if (Date.now() - ts < 86_400_000) return data;
      }
    } catch { /* ignore */ }
    return null;
  });

  const { analyzeFootprint, loading, error, clearCache } = useGemini();

  const handleAnalyze = async () => {
    if (!footprintData) return;
    clearCache();
    setInsights(null);
    const result = await analyzeFootprint({
      footprint: footprintData,
      logs: logs.slice(-14),
      benchmarks: BENCHMARKS,
    });
    if (result) setInsights(result);
  };

  if (!footprintData) {
    return (
      <EmptyState
        icon="🤖"
        title="Complete the Quiz First"
        description="EcoCoach needs your footprint data to analyse."
      />
    );
  }

  const total = footprintData?.total || 0;

  return (
    <div className="min-h-screen pt-24 pb-16 px-4 bg-cream-100 dark:bg-forest-900">
      <div className="max-w-2xl mx-auto">
        <motion.div initial={{ opacity: 0, y: -10 }} animate={{ opacity: 1, y: 0 }} className="mb-8">
          <h1 className="font-display text-3xl font-bold text-forest-900 dark:text-cream-100">
            AI Insights <span aria-hidden="true">🤖</span>
          </h1>
          <p className="text-forest-700 dark:text-cream-200 text-sm mt-1">Powered by Google Gemini</p>
        </motion.div>

        {!insights && !loading && (
          <motion.div initial={{ opacity: 0, scale: 0.95 }} animate={{ opacity: 1, scale: 1 }} className="glass-card p-8 text-center mb-6">
            <span className="text-6xl block mb-4" aria-hidden="true">🌿</span>
            <h2 className="font-display text-2xl font-bold text-forest-800 dark:text-cream-100 mb-2">Meet EcoCoach</h2>
            <p className="text-sm text-forest-700 dark:text-cream-200 mb-6 max-w-sm mx-auto leading-relaxed">
              Your personal AI climate scientist. Get your eco personality, top 5 personalised tips, weekly goals, and a fun climate fact.
            </p>
            <button type="button" onClick={handleAnalyze} className="btn-primary text-base px-8 py-4 w-full sm:w-auto">
              <span aria-hidden="true">🔍</span> Analyse My Footprint with Gemini AI
            </button>

            {error && (
              <div className="mt-5 p-4 rounded-xl bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-700/40 text-left" role="alert">
                <p className="text-sm font-semibold text-red-700 dark:text-red-300 mb-1"><span aria-hidden="true">⚠️</span> Analysis failed</p>
                <p className="text-xs text-red-600 dark:text-red-400 mb-3">{error}</p>
                <div className="text-xs text-red-600 dark:text-red-400 space-y-1">
                  <p>• Check your Gemini API key at <a href="https://aistudio.google.com/app/apikey" target="_blank" rel="noreferrer" className="underline">aistudio.google.com</a></p>
                  <p>• Make sure the key has the <strong>Generative Language API</strong> enabled</p>
                  <p>• Free-tier keys work — no billing needed</p>
                </div>
                <button type="button" onClick={handleAnalyze} className="mt-3 btn-secondary text-sm py-2 px-4">
                  <span aria-hidden="true">🔄</span> Try Again
                </button>
              </div>
            )}
          </motion.div>
        )}

        {loading && <LeafSpinner />}

        <AnimatePresence>
          {insights && (
            <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="space-y-4">
              <PersonalityCard
                ecoPersonality={insights.ecoPersonality}
                personalityDescription={insights.personalityDescription}
                headline={insights.headline}
              />
              <ScoreCard score={insights.score} />

              {/* Personal Reduction Plan */}
              <div className="glass-card p-5">
                <h2 className="font-display text-lg font-bold text-forest-900 dark:text-cream-100 mb-1">
                  Your Personal Reduction Plan
                </h2>
                {(() => {
                  const tips = insights.top5Tips ?? [];
                  const totalSavings = tips.reduce((sum, t) => sum + (t.annualSavingKg || 0), 0);
                  const gap = Math.max(total - BENCHMARKS.target, 1);
                  const percentToTarget = Math.min(100, Math.round((totalSavings / gap) * 100));
                  return (
                    <p className="text-sm text-forest-700 dark:text-cream-200 mb-4 leading-relaxed">
                      Based on your footprint of <strong>{total.toLocaleString()} kg CO₂/year</strong>, these{' '}
                      {tips.length} actions could save <strong>{totalSavings.toLocaleString()} kg/year</strong> —
                      bringing you <strong>{percentToTarget}%</strong> closer to the Paris 1.5°C target.
                    </p>
                  );
                })()}
                <div className="space-y-3">
                  {(insights.top5Tips ?? []).map((tip, i) => (
                    <TipCard key={i} tip={tip} index={i} showSaving />
                  ))}
                </div>
              </div>

              <GoalCard weeklyGoal={insights.weeklyGoal} monthlyChallenge={insights.monthlyChallenge} />
              <FunFactCard funFact={insights.funFact} motivationalMessage={insights.motivationalMessage} />

              <button type="button" onClick={handleAnalyze} className="btn-ghost w-full text-sm">
                <span aria-hidden="true">🔄</span> Re-analyse (refreshes AI response)
              </button>
            </motion.div>
          )}
        </AnimatePresence>
      </div>
    </div>
  );
}

Insights.propTypes = {
  footprintData: PropTypes.shape({
    total: PropTypes.number,
    breakdown: PropTypes.object,
  }),
  logs: PropTypes.array,
};

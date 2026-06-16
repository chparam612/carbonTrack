import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { useGemini } from '../hooks/useGemini.js';
import TipCard from '../components/TipCard.jsx';
import { BENCHMARKS } from '../data/emissionFactors.js';

const RATING_COLORS = {
  excellent: '#2d5016',
  good:      '#3d6b1f',
  average:   '#DAA520',
  high:      '#D2691E',
  critical:  '#ef4444',
};

function LeafSpinner() {
  return (
    <div className="flex flex-col items-center gap-4 py-16">
      <motion.div
        animate={{ rotate: 360 }}
        transition={{ repeat: Infinity, duration: 1.5, ease: 'linear' }}
        className="text-6xl"
      >
        🌿
      </motion.div>
      <p className="text-forest-700 dark:text-cream-200 font-medium">EcoCoach is analysing your footprint…</p>
      <p className="text-xs text-forest-700/50 dark:text-cream-200/40">Finding best available model · this takes 10–20 seconds</p>
    </div>
  );
}

function PersonalityCard({ ecoPersonality, personalityDescription, headline }) {
  return (
    <motion.div
      initial={{ opacity: 0, scale: 0.9 }} animate={{ opacity: 1, scale: 1 }}
      className="glass-card p-6 text-center"
    >
      <div className="text-5xl mb-3">🧬</div>
      <h3 className="font-display text-xl font-bold text-forest-800 dark:text-cream-100 mb-1">Your Eco Personality</h3>
      <div className="inline-block bg-gold-500/20 border border-gold-500/50 text-gold-600 dark:text-gold-400 font-bold px-4 py-1 rounded-full text-sm mb-3">
        {ecoPersonality}
      </div>
      <p className="text-sm text-forest-700/80 dark:text-cream-200/70 mb-3 leading-relaxed">{personalityDescription}</p>
      <div className="p-3 bg-forest-800/10 dark:bg-cream-100/5 rounded-xl">
        <p className="text-sm font-semibold text-forest-800 dark:text-cream-100 italic">"{headline}"</p>
      </div>
    </motion.div>
  );
}

function ScoreCard({ score }) {
  const color = RATING_COLORS[score?.rating] || '#DAA520';
  return (
    <motion.div initial={{ opacity: 0, y: 16 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.1 }} className="glass-card p-5">
      <h3 className="font-display font-semibold text-forest-800 dark:text-cream-100 mb-3 text-sm">📊 AI Score Assessment</h3>
      <div className="flex items-center gap-4">
        <div className="text-center">
          <div className="font-display text-4xl font-black" style={{ color }}>{score?.percentile ?? '—'}</div>
          <div className="text-xs text-forest-700/60 dark:text-cream-200/50">percentile</div>
        </div>
        <div className="flex-1">
          <div className="inline-block px-3 py-1 rounded-full text-sm font-bold capitalize mb-1" style={{ backgroundColor: color + '20', color }}>
            {score?.rating ?? 'unknown'}
          </div>
          <div className="text-xs text-forest-700/60 dark:text-cream-200/50 mb-2">Better than {score?.percentile ?? 0}% of users</div>
          <div className="h-2 bg-forest-800/10 dark:bg-cream-100/10 rounded-full overflow-hidden">
            <motion.div className="h-full rounded-full" style={{ backgroundColor: color }}
              initial={{ width: 0 }} animate={{ width: `${score?.percentile ?? 0}%` }} transition={{ duration: 1 }} />
          </div>
        </div>
      </div>
    </motion.div>
  );
}

function GoalCard({ weeklyGoal, monthlyChallenge }) {
  return (
    <motion.div initial={{ opacity: 0, y: 16 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.2 }} className="glass-card p-5">
      <h3 className="font-display font-semibold text-forest-800 dark:text-cream-100 mb-4 text-sm">🎯 Your Goals</h3>
      <div className="space-y-3">
        <div className="p-3 rounded-xl bg-forest-800/10 dark:bg-cream-100/5 border border-forest-700/20">
          <div className="text-xs text-forest-700/60 dark:text-cream-200/50 mb-1">📅 This week</div>
          <p className="text-sm font-medium text-forest-800 dark:text-cream-100">{weeklyGoal}</p>
        </div>
        <div className="p-3 rounded-xl bg-gold-500/10 border border-gold-500/30">
          <div className="text-xs text-gold-600 dark:text-gold-400 mb-1">🏆 Monthly challenge</div>
          <p className="text-sm font-medium text-forest-800 dark:text-cream-100">{monthlyChallenge}</p>
        </div>
      </div>
    </motion.div>
  );
}

function FunFactCard({ funFact, motivationalMessage }) {
  return (
    <motion.div initial={{ opacity: 0, y: 16 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.3 }} className="glass-card p-5">
      <div className="mb-4">
        <div className="flex items-center gap-2 mb-2">
          <span className="text-xl">🌍</span>
          <h3 className="font-display font-semibold text-forest-800 dark:text-cream-100 text-sm">Fun Fact</h3>
        </div>
        <p className="text-sm text-forest-700/80 dark:text-cream-200/70 leading-relaxed italic">"{funFact}"</p>
      </div>
      <hr className="border-forest-800/10 dark:border-cream-100/10 mb-4" />
      <div>
        <div className="flex items-center gap-2 mb-2">
          <span className="text-xl">💪</span>
          <h3 className="font-display font-semibold text-forest-800 dark:text-cream-100 text-sm">Your Motivation</h3>
        </div>
        <p className="text-sm text-forest-700/80 dark:text-cream-200/70 leading-relaxed">{motivationalMessage}</p>
      </div>
    </motion.div>
  );
}

export default function Insights({ footprintData, logs = [] }) {
  const [insights, setInsights] = useState(() => {
    // Load cached insights on mount
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
      <div className="min-h-screen pt-24 pb-16 px-4 bg-cream-100 dark:bg-forest-900 flex items-center justify-center">
        <div className="text-center glass-card p-10 max-w-sm">
          <span className="text-6xl block mb-4">🤖</span>
          <h2 className="font-display text-2xl font-bold text-forest-800 dark:text-cream-100 mb-2">Complete the Quiz First</h2>
          <p className="text-forest-700/70 dark:text-cream-200/60 text-sm">EcoCoach needs your footprint data to analyse.</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen pt-24 pb-16 px-4 bg-cream-100 dark:bg-forest-900">
      <div className="max-w-2xl mx-auto">
        <motion.div initial={{ opacity: 0, y: -10 }} animate={{ opacity: 1, y: 0 }} className="mb-8">
          <h1 className="font-display text-3xl font-bold text-forest-900 dark:text-cream-100">AI Insights 🤖</h1>
          <p className="text-forest-700/60 dark:text-cream-200/50 text-sm mt-1">Powered by Google Gemini</p>
        </motion.div>

        {/* CTA — shown when no insights yet */}
        {!insights && !loading && (
          <motion.div initial={{ opacity: 0, scale: 0.95 }} animate={{ opacity: 1, scale: 1 }} className="glass-card p-8 text-center mb-6">
            <span className="text-6xl block mb-4">🌿</span>
            <h2 className="font-display text-2xl font-bold text-forest-800 dark:text-cream-100 mb-2">Meet EcoCoach</h2>
            <p className="text-sm text-forest-700/70 dark:text-cream-200/60 mb-6 max-w-sm mx-auto leading-relaxed">
              Your personal AI climate scientist. Get your eco personality, top 5 personalised tips, weekly goals, and a fun climate fact.
            </p>
            <button onClick={handleAnalyze} className="btn-primary text-base px-8 py-4 w-full sm:w-auto">
              🔍 Analyse My Footprint with Gemini AI
            </button>

            {/* Error display with actionable help */}
            {error && (
              <div className="mt-5 p-4 rounded-xl bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-700/40 text-left">
                <p className="text-sm font-semibold text-red-700 dark:text-red-300 mb-1">⚠️ Analysis failed</p>
                <p className="text-xs text-red-600 dark:text-red-400 mb-3">{error}</p>
                <div className="text-xs text-red-600/80 dark:text-red-400/80 space-y-1">
                  <p>• Check your Gemini API key is valid at <a href="https://aistudio.google.com/app/apikey" target="_blank" rel="noreferrer" className="underline">aistudio.google.com</a></p>
                  <p>• Make sure the key has the <strong>Generative Language API</strong> enabled</p>
                  <p>• Free-tier keys work — no billing needed</p>
                </div>
                <button onClick={handleAnalyze} className="mt-3 btn-secondary text-sm py-2 px-4">
                  🔄 Try Again
                </button>
              </div>
            )}
          </motion.div>
        )}

        {/* Loading */}
        {loading && <LeafSpinner />}

        {/* Results */}
        <AnimatePresence>
          {insights && (
            <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="space-y-4">
              <PersonalityCard
                ecoPersonality={insights.ecoPersonality}
                personalityDescription={insights.personalityDescription}
                headline={insights.headline}
              />
              <ScoreCard score={insights.score} />

              <div className="glass-card p-5">
                <h3 className="font-display font-semibold text-forest-800 dark:text-cream-100 mb-4 text-sm">
                  💡 Top 5 Personalised Tips
                </h3>
                <div className="space-y-3">
                  {(insights.top5Tips ?? []).map((tip, i) => (
                    <TipCard key={i} tip={tip} index={i} showSaving />
                  ))}
                </div>
              </div>

              <GoalCard weeklyGoal={insights.weeklyGoal} monthlyChallenge={insights.monthlyChallenge} />
              <FunFactCard funFact={insights.funFact} motivationalMessage={insights.motivationalMessage} />

              <button onClick={handleAnalyze} className="btn-ghost w-full text-sm">
                🔄 Re-analyse (refreshes AI response)
              </button>
            </motion.div>
          )}
        </AnimatePresence>
      </div>
    </div>
  );
}

import React, { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import ChartCard from '../components/ChartCard.jsx';
import TipCard from '../components/TipCard.jsx';
import EmptyState from '../components/EmptyState.jsx';
import { BENCHMARKS, CATEGORY_META } from '../data/emissionFactors.js';
import { getTopTips } from '../algorithms/tipRanker.js';
import { analyzeProgress } from '../algorithms/progressAnalyzer.js';
import { getScoreColor, getScoreLabel } from '../utils/scoring.js';

function BentoCard({ children, className = '', span = '' }) {
  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      className={`glass-card p-5 ${span} ${className}`}
    >
      {children}
    </motion.div>
  );
}

function AnimatedNumber({ value, suffix = '' }) {
  const [display, setDisplay] = useState(0);
  useEffect(() => {
    if (value === 0) { setDisplay(0); return; }
    let start = 0;
    const end = value;
    const step = end / 60;
    const timer = setInterval(() => {
      start += step;
      if (start >= end) {
        setDisplay(end);
        clearInterval(timer);
      } else {
        setDisplay(Math.round(start));
      }
    }, 16);
    return () => clearInterval(timer);
  }, [value]);
  return <>{display.toLocaleString()}{suffix}</>;
}

export default function Dashboard({ footprintData, logs = [], setCurrentPage }) {
  useEffect(() => { document.title = 'My Dashboard | EcoTrace'; }, []);

  const hasData = !!footprintData;
  const total = footprintData?.total || 0;
  const breakdown = footprintData?.breakdown || {};
  const trees = footprintData?.trees || 0;

  // getTopTips accepts the full footprintData object (flat keys + total)
  const tips = hasData ? getTopTips(footprintData, 3) : [];
  const analytics = analyzeProgress(logs);

  const pieData = hasData ? [
    ['Category', 'kg CO₂'],
    ...Object.entries(breakdown).map(([k, v]) => [CATEGORY_META[k]?.label || k, v]),
  ] : null;

  const barData = [
    ['', 'kg CO₂/year', { role: 'style' }],
    ['You',          total,            '#2d5016'],
    ['India avg',    BENCHMARKS.india,  '#8B4513'],
    ['Paris target', BENCHMARKS.target, '#DAA520'],
    ['Global avg',   BENCHMARKS.global, '#D2691E'],
    ['EU avg',       BENCHMARKS.eu,     '#ef4444'],
  ];

  const trendData = (() => {
    if (logs.length >= 2) {
      const sorted = [...logs].sort((a, b) => new Date(a.date) - new Date(b.date)).slice(-14);
      return [
        ['Date', 'Daily CO₂', '7-day avg'],
        ...sorted.map((l, i) => [l.date.slice(5), l.total, analytics.movingAvg[i]?.avg || l.total]),
      ];
    }
    const today = new Date();
    return [
      ['Date', 'Daily CO₂'],
      ...Array.from({ length: 7 }, (_, i) => {
        const d = new Date(today);
        d.setDate(d.getDate() - (6 - i));
        return [`${d.getMonth() + 1}/${d.getDate()}`, 8 + Math.random() * 4];
      }),
    ];
  })();

  const scoreColor = getScoreColor(total);
  const scoreLabel = getScoreLabel(total);

  if (!hasData) {
    return (
      <EmptyState
        icon="📊"
        title="No Footprint Data"
        description="Complete the 5-step quiz to calculate your annual CO₂ footprint and unlock your personalised dashboard. Takes about 2 minutes ⏱️"
      >
        <button
          onClick={() => setCurrentPage?.('quiz')}
          className="btn-primary w-full text-base py-4"
        >
          <span aria-hidden="true">🌿</span> Take the Quiz
        </button>
      </EmptyState>
    );
  }

  return (
    <div className="min-h-screen pt-24 pb-16 px-4 bg-cream-100 dark:bg-forest-900">
      <div className="max-w-6xl mx-auto">
        <motion.div initial={{ opacity: 0, y: -10 }} animate={{ opacity: 1, y: 0 }} className="mb-8">
          <h1 className="font-display text-3xl font-bold text-forest-900 dark:text-cream-100">
            Your Dashboard <span aria-hidden="true">🌿</span>
          </h1>
          <p className="text-forest-700/60 dark:text-cream-200/50 text-sm mt-1">
            Annual carbon footprint overview
          </p>
        </motion.div>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 auto-rows-auto">

          {/* Total Score */}
          <section aria-label="Carbon footprint summary">
            <BentoCard className="lg:col-span-2 text-center" span="">
              <p className="text-sm font-semibold text-forest-700/70 dark:text-cream-200/50 mb-1">Annual Footprint</p>
              <div className="text-5xl font-display font-black mb-1" style={{ color: scoreColor }}>
                <AnimatedNumber value={total} suffix=" kg" />
              </div>
              <div className="text-sm font-semibold mb-3" style={{ color: scoreColor }}>
                <span aria-hidden="true">{scoreLabel.emoji}</span> {scoreLabel.text}
              </div>
              <div className="text-xs text-forest-700/60 dark:text-cream-200/50 mb-1 text-left">
                vs India average ({BENCHMARKS.india.toLocaleString()} kg)
              </div>
              <div className="h-3 bg-forest-800/10 dark:bg-cream-100/10 rounded-full overflow-hidden">
                <motion.div
                  className="h-full rounded-full"
                  style={{ backgroundColor: scoreColor }}
                  initial={{ width: 0 }}
                  animate={{ width: `${Math.min((total / 10000) * 100, 100)}%` }}
                  transition={{ duration: 1.2 }}
                />
              </div>
              <div className="mt-3 text-xs text-forest-700/60 dark:text-cream-200/50">
                <span aria-hidden="true">🌳</span> Requires <strong>{trees}</strong> trees to offset annually
              </div>
            </BentoCard>
          </section>

          {/* Streak card */}
          <BentoCard className="text-center flex flex-col items-center justify-center">
            <span className="text-4xl mb-2" aria-hidden="true">{analytics.streak > 0 ? '🔥' : '🌱'}</span>
            <div className="font-display text-3xl font-bold text-forest-800 dark:text-cream-100">
              {analytics.streak}
            </div>
            <div className="text-xs text-forest-700/60 dark:text-cream-200/50 mt-1">
              day green streak
            </div>
            {analytics.trend !== 0 && (
              <div className={`mt-2 text-xs font-semibold ${analytics.trend < 0 ? 'text-green-600' : 'text-red-500'}`}>
                {analytics.trend < 0 ? '↘ Improving' : '↗ Worsening'} {Math.abs(analytics.trend)} kg/day
              </div>
            )}
          </BentoCard>

          {/* Daily average */}
          <BentoCard className="text-center flex flex-col items-center justify-center">
            <span className="text-4xl mb-2" aria-hidden="true">📅</span>
            <div className="font-display text-3xl font-bold text-forest-800 dark:text-cream-100">
              {footprintData.dailyAvg}
            </div>
            <div className="text-xs text-forest-700/60 dark:text-cream-200/50 mt-1">kg CO₂ per day</div>
            {analytics.projectedAnnual && (
              <div className="mt-2 text-xs text-forest-700/60 dark:text-cream-200/50">
                Projected: <strong>{analytics.projectedAnnual.toLocaleString()} kg/yr</strong>
              </div>
            )}
          </BentoCard>

          {/* Category breakdown pie */}
          <section aria-label="Carbon footprint breakdown">
            <BentoCard className="lg:col-span-2">
              {pieData && (
                <ChartCard
                  type="pie"
                  data={pieData}
                  title="Emissions by Category"
                  options={{ height: 220, legend: { position: 'right', textStyle: { fontSize: 11 } } }}
                />
              )}
            </BentoCard>
          </section>

          {/* Weekly trend line */}
          <BentoCard className="lg:col-span-2">
            <ChartCard
              type="line"
              data={trendData}
              title="Daily Emissions Trend (last 14 days)"
              options={{ height: 220 }}
            />
          </BentoCard>

          {/* Benchmark bar */}
          <BentoCard className="lg:col-span-2">
            <ChartCard
              type="bar"
              data={barData}
              title="You vs. Global Benchmarks"
              options={{ height: 220, legend: 'none' }}
            />
          </BentoCard>

          {/* Category breakdown bars */}
          <section aria-label="Category emissions breakdown">
            <BentoCard className="lg:col-span-2">
              <h3 className="font-display font-semibold text-forest-800 dark:text-cream-100 mb-4 text-sm">
                Category Breakdown
              </h3>
              <div className="space-y-3">
                {Object.entries(breakdown)
                  .sort(([, a], [, b]) => b - a)
                  .map(([cat, val]) => {
                    const meta = CATEGORY_META[cat];
                    const pct = Math.round((val / total) * 100);
                    return (
                      <div key={cat}>
                        <div className="flex justify-between text-xs mb-1">
                          <span className="text-forest-800 dark:text-cream-100 font-medium">
                            <span aria-hidden="true">{meta?.emoji}</span> {meta?.label}
                          </span>
                          <span className="text-forest-700/70 dark:text-cream-200/60">
                            {val.toLocaleString()} kg ({pct}%)
                          </span>
                        </div>
                        <div className="h-2.5 bg-forest-800/10 dark:bg-cream-100/10 rounded-full overflow-hidden">
                          <motion.div
                            className="h-full rounded-full"
                            style={{ backgroundColor: meta?.color || '#2d5016' }}
                            initial={{ width: 0 }}
                            animate={{ width: `${pct}%` }}
                            transition={{ duration: 0.8, delay: 0.2 }}
                          />
                        </div>
                      </div>
                    );
                  })}
              </div>
            </BentoCard>
          </section>

          {/* Top 3 quick wins */}
          <BentoCard className="lg:col-span-2">
            <h3 className="font-display font-semibold text-forest-800 dark:text-cream-100 mb-4 text-sm">
              <span aria-hidden="true">⚡</span> Top 3 Quick Wins
            </h3>
            <div className="space-y-3">
              {tips.map((tip, i) => (
                <TipCard key={i} tip={tip} index={i} />
              ))}
            </div>
          </BentoCard>

          {/* Achievement badges */}
          <BentoCard className="lg:col-span-2">
            <h3 className="font-display font-semibold text-forest-800 dark:text-cream-100 mb-4 text-sm">
              <span aria-hidden="true">🏆</span> Achievements
            </h3>
            <div className="grid grid-cols-2 gap-3">
              {[
                { icon: '🌱', title: 'First Step',    desc: 'Completed the quiz',  unlocked: true },
                { icon: '🔥', title: 'Green Week',    desc: '7-day streak',        unlocked: analytics.streak >= 7 },
                { icon: '🥗', title: 'Diet Hero',     desc: '5 vegan meal days',   unlocked: false },
                { icon: '✂️', title: 'Carbon Cutter', desc: '10% reduction',       unlocked: false },
              ].map((badge) => (
                <div
                  key={badge.title}
                  className={`flex items-center gap-3 p-3 rounded-xl border transition-all ${
                    badge.unlocked
                      ? 'border-gold-500/50 bg-gold-500/10 dark:bg-gold-500/5'
                      : 'border-forest-800/10 dark:border-cream-100/10 opacity-50 grayscale'
                  }`}
                >
                  <span className="text-2xl" aria-hidden="true">{badge.icon}</span>
                  <div>
                    <div className="text-xs font-semibold text-forest-800 dark:text-cream-100">{badge.title}</div>
                    <div className="text-xs text-forest-700/60 dark:text-cream-200/50">{badge.desc}</div>
                  </div>
                </div>
              ))}
            </div>
          </BentoCard>

        </div>
      </div>
    </div>
  );
}

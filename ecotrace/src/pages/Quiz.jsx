import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { QUIZ_STEPS } from '../data/quizQuestions.js';
import { calculateFootprint } from '../algorithms/carbonCalculator.js';
import { BENCHMARKS } from '../data/emissionFactors.js';

// Speedometer gauge SVG
function CO2Gauge({ value, max = 10000 }) {
  const pct = Math.min(value / max, 1);
  const angle = -130 + pct * 260; // -130° to +130°
  const color = pct < 0.3 ? '#2d5016' : pct < 0.6 ? '#DAA520' : pct < 0.8 ? '#D2691E' : '#ef4444';

  return (
    <svg viewBox="0 0 200 120" className="w-48 mx-auto" aria-hidden="true">
      {/* Background arc */}
      <path d="M 20 100 A 80 80 0 0 1 180 100" fill="none" stroke="#e5e7eb" strokeWidth="12" strokeLinecap="round" />
      {/* Colored arc */}
      <motion.path
        d="M 20 100 A 80 80 0 0 1 180 100"
        fill="none" stroke={color} strokeWidth="12" strokeLinecap="round"
        strokeDasharray="251"
        initial={{ strokeDashoffset: 251 }}
        animate={{ strokeDashoffset: 251 - 251 * pct }}
        transition={{ duration: 1.5, ease: 'easeOut' }}
      />
      {/* Needle */}
      <motion.line
        x1="100" y1="100" x2="100" y2="30"
        stroke={color} strokeWidth="3" strokeLinecap="round"
        initial={{ rotate: -130 }}
        animate={{ rotate: angle }}
        style={{ transformOrigin: '100px 100px' }}
        transition={{ duration: 1.5, ease: [0.34, 1.56, 0.64, 1] }}
      />
      <circle cx="100" cy="100" r="5" fill={color} />
      {/* Value */}
      <text x="100" y="115" textAnchor="middle" fontSize="11" fill={color} fontWeight="bold">
        {value.toLocaleString()} kg
      </text>
    </svg>
  );
}

// Result reveal screen
function ResultScreen({ result, onContinue }) {
  const { total, breakdown, benchmarkDiff, trees } = result;
  const scoreColor = total < BENCHMARKS.india ? '#2d5016' : total < BENCHMARKS.target ? '#DAA520' : '#ef4444';
  const scoreLabel = total < BENCHMARKS.india ? 'Eco Champion 🌟' : total < BENCHMARKS.target ? 'On Track 👍' : total < BENCHMARKS.global ? 'Room to Improve 📈' : 'Needs Attention ⚠️';

  return (
    <motion.div
      initial={{ opacity: 0, scale: 0.9 }}
      animate={{ opacity: 1, scale: 1 }}
      className="max-w-lg mx-auto text-center px-4"
    >
      <motion.div initial={{ y: -20, opacity: 0 }} animate={{ y: 0, opacity: 1 }} transition={{ delay: 0.2 }}>
        <h2 className="font-display text-3xl font-bold text-forest-900 dark:text-cream-100 mb-1">
          Your Carbon Footprint
        </h2>
        <p className="text-forest-700/70 dark:text-cream-200/60 mb-6">Here's your annual CO₂ impact</p>
      </motion.div>

      <CO2Gauge value={total} />

      <motion.div
        initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ delay: 0.8 }}
        className="glass-card p-4 mb-4"
      >
        <div className="text-4xl font-display font-black mb-1" style={{ color: scoreColor }}>
          {total.toLocaleString()} kg CO₂
        </div>
        <div className="font-semibold text-lg mb-3" style={{ color: scoreColor }}>{scoreLabel}</div>

        {/* Benchmark bars */}
        <div className="space-y-2 text-left mt-4">
          {[
            { label: 'You', value: total, color: scoreColor },
            { label: 'India avg', value: BENCHMARKS.india, color: '#2d5016' },
            { label: 'Paris target', value: BENCHMARKS.target, color: '#DAA520' },
            { label: 'Global avg', value: BENCHMARKS.global, color: '#D2691E' },
          ].map((b) => (
            <div key={b.label}>
              <div className="flex justify-between text-xs mb-0.5">
                <span className="text-forest-700 dark:text-cream-200">{b.label}</span>
                <span className="font-semibold" style={{ color: b.color }}>{b.value.toLocaleString()} kg</span>
              </div>
              <div className="h-2 bg-forest-800/10 dark:bg-cream-100/10 rounded-full overflow-hidden">
                <motion.div
                  className="h-full rounded-full"
                  style={{ backgroundColor: b.color }}
                  initial={{ width: 0 }}
                  animate={{ width: `${Math.min((b.value / 10000) * 100, 100)}%` }}
                  transition={{ duration: 1, delay: 1 }}
                />
              </div>
            </div>
          ))}
        </div>
      </motion.div>

      {/* Tree equivalent */}
      <motion.div
        initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 1.2 }}
        className="glass-card p-3 mb-6 flex items-center gap-3"
      >
        <span className="text-3xl" aria-hidden="true">🌳</span>
        <p className="text-sm text-forest-800 dark:text-cream-100 text-left">
          Your footprint needs <strong>{trees} trees</strong> planted today to absorb all your CO₂ over a year.
        </p>
      </motion.div>

      <motion.div
        initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ delay: 1.4 }}
        className="flex gap-3"
      >
        <button onClick={onContinue} className="btn-primary flex-1">
          <span aria-hidden="true">🌿</span> View My Dashboard
        </button>
      </motion.div>
    </motion.div>
  );
}

export default function Quiz({ setCurrentPage, setFootprintData }) {
  const [step, setStep] = useState(0);
  const [answers, setAnswers] = useState({});
  const [direction, setDirection] = useState(1);
  const [result, setResult] = useState(null);
  const [errors, setErrors] = useState({});

  useEffect(() => { document.title = 'Carbon Quiz | EcoTrace'; }, []);

  const currentStep = QUIZ_STEPS[step];

  const validate = () => {
    const newErrors = {};
    currentStep.fields.forEach((field) => {
      const val = answers[field.key];
      if (field.type === 'select' && !val) {
        newErrors[field.key] = 'Please select an option';
      }
      if (field.type === 'number' && (val === '' || val === undefined)) {
        newErrors[field.key] = 'Please enter a value';
      }
    });
    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleNext = () => {
    if (!validate()) return;
    if (step < QUIZ_STEPS.length - 1) {
      setDirection(1);
      setStep(step + 1);
    } else {
      // Final step — calculate
      const res = calculateFootprint(answers);
      setResult(res);
      setFootprintData(res);
    }
  };

  const handleBack = () => {
    setDirection(-1);
    setStep(step - 1);
    setErrors({});
  };

  const updateAnswer = (key, value) => {
    setAnswers((prev) => ({ ...prev, [key]: value }));
    setErrors((prev) => { const n = { ...prev }; delete n[key]; return n; });
  };

  if (result) {
    return (
      <div className="min-h-screen pt-24 pb-16 bg-cream-100 dark:bg-forest-900">
        <ResultScreen
          result={result}
          onContinue={() => setCurrentPage('dashboard')}
        />
      </div>
    );
  }

  const progress = ((step) / QUIZ_STEPS.length) * 100;

  return (
    <div className="min-h-screen pt-24 pb-16 px-4 bg-cream-100 dark:bg-forest-900">
      <div className="max-w-xl mx-auto">
        {/* Progress bar */}
        <div className="mb-8">
          <div className="flex justify-between text-xs text-forest-700/60 dark:text-cream-200/50 mb-2">
            <span>Step {step + 1} of {QUIZ_STEPS.length}</span>
            <span>{Math.round(progress)}% complete</span>
          </div>
          <div className="h-2.5 bg-forest-800/10 dark:bg-cream-100/10 rounded-full overflow-hidden" role="progressbar" aria-valuenow={Math.round(progress)} aria-valuemin={0} aria-valuemax={100}>
            <motion.div
              className="h-full progress-plant"
              animate={{ width: `${((step + 0.5) / QUIZ_STEPS.length) * 100}%` }}
              transition={{ duration: 0.5 }}
            />
          </div>
          {/* Step dots */}
          <div className="flex justify-between mt-2" aria-hidden="true">
            {QUIZ_STEPS.map((s, i) => (
              <div
                key={s.id}
                className={`w-6 h-6 rounded-full flex items-center justify-center text-xs transition-all duration-300
                  ${i < step ? 'bg-forest-800 text-cream-100' : i === step ? 'bg-gold-500 text-forest-900 scale-110' : 'bg-forest-800/20 dark:bg-cream-100/20 text-forest-700/50'}`}
              >
                {i < step ? '✓' : s.emoji}
              </div>
            ))}
          </div>
        </div>

        {/* Step card */}
        <AnimatePresence mode="wait">
          <motion.div
            key={step}
            initial={{ opacity: 0, x: direction * 60 }}
            animate={{ opacity: 1, x: 0 }}
            exit={{ opacity: 0, x: direction * -60 }}
            transition={{ duration: 0.3, ease: 'easeInOut' }}
            className="glass-card p-6 md:p-8"
          >
            <div className="text-center mb-6">
              <span className="text-5xl block mb-3" aria-hidden="true">{currentStep.emoji}</span>
              <h2 className="font-display text-2xl font-bold text-forest-900 dark:text-cream-100">
                {currentStep.title}
              </h2>
              <p className="text-forest-700/60 dark:text-cream-200/50 text-sm mt-1">
                {currentStep.subtitle}
              </p>
            </div>

            <div className="space-y-5">
              {currentStep.fields.map((field) => (
                <div key={field.key}>
                  <label
                    htmlFor={field.key}
                    className="block text-sm font-semibold text-forest-800 dark:text-cream-100 mb-2"
                  >
                    {field.label}
                    {field.unit && <span className="font-normal text-forest-700/50 ml-1">({field.unit})</span>}
                  </label>

                  {field.type === 'select' ? (
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-2" role="group" aria-labelledby={field.key}>
                      {field.options.map((opt) => (
                        <button
                          key={opt.value}
                          onClick={() => updateAnswer(field.key, opt.value)}
                          aria-pressed={answers[field.key] === opt.value}
                          className={`flex items-center gap-2 p-3 rounded-xl border-2 text-sm font-medium text-left transition-all duration-150
                            ${answers[field.key] === opt.value
                              ? 'border-forest-700 bg-forest-800/10 dark:bg-forest-700/30 text-forest-900 dark:text-cream-100'
                              : 'border-forest-800/15 dark:border-cream-100/15 text-forest-700 dark:text-cream-200/70 hover:border-forest-700/40'
                            }`}
                        >
                          <span className="text-lg" aria-hidden="true">{opt.emoji}</span>
                          {opt.label}
                        </button>
                      ))}
                    </div>
                  ) : (
                    <input
                      id={field.key}
                      type="number"
                      min={field.min}
                      max={field.max}
                      value={answers[field.key] ?? ''}
                      onChange={(e) => updateAnswer(field.key, e.target.value)}
                      placeholder={field.placeholder}
                      aria-describedby={errors[field.key] ? `${field.key}-error` : undefined}
                      className={`w-full px-4 py-3 rounded-xl border-2 text-forest-900 dark:text-cream-100
                        bg-white dark:bg-forest-800/50 focus:outline-none transition-colors
                        ${errors[field.key] ? 'border-red-400' : 'border-forest-800/15 dark:border-cream-100/15 focus:border-forest-700'}`}
                    />
                  )}

                  {errors[field.key] && (
                    <p id={`${field.key}-error`} className="text-xs text-red-500 mt-1" role="alert">
                      <span aria-hidden="true">⚠️</span> {errors[field.key]}
                    </p>
                  )}
                </div>
              ))}
            </div>
          </motion.div>
        </AnimatePresence>

        {/* Navigation */}
        <div className="flex gap-3 mt-6">
          {step > 0 && (
            <button onClick={handleBack} className="btn-ghost flex-1">
              ← Back
            </button>
          )}
          <button onClick={handleNext} className="btn-primary flex-1">
            {step === QUIZ_STEPS.length - 1 ? '🌿 Calculate My Footprint' : 'Next →'}
          </button>
        </div>
      </div>
    </div>
  );
}

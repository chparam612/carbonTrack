/**
 * Gemini API hook — fetch-based, auto-detects working model.
 * Supports: gemini-2.0-flash, gemini-1.5-flash-latest, gemini-1.5-flash, gemini-pro
 */
import { useState, useCallback } from 'react';
import { getGeminiKey } from '../config/keys.js';

const BASE = 'https://generativelanguage.googleapis.com/v1beta/models';
const CACHE_KEY = 'ecotrace_gemini_insights';
const MODEL_CACHE_KEY = 'ecotrace_gemini_model';

// Models to try in order — newest first
const CANDIDATE_MODELS = [
  'gemini-2.0-flash',
  'gemini-2.0-flash-lite',
  'gemini-1.5-flash-latest',
  'gemini-1.5-flash',
  'gemini-1.0-pro',
  'gemini-pro',
];

/** Try to call generateContent on a given model */
async function tryModel(model, apiKey, body) {
  const res = await fetch(`${BASE}/${model}:generateContent?key=${apiKey}`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(body),
  });
  const json = await res.json();
  if (!res.ok) {
    const msg = json?.error?.message || `HTTP ${res.status}`;
    // Classify as retryable (model not found) vs fatal (bad key, quota)
    const retryable =
      res.status === 404 ||
      msg.includes('not found') ||
      msg.includes('not supported') ||
      msg.includes('deprecated') ||
      msg.includes('ListModels');
    return { ok: false, retryable, msg };
  }
  const text = json?.candidates?.[0]?.content?.parts?.[0]?.text ?? '';
  return { ok: true, text };
}

/** Find first working model, cache it for session */
async function resolveModel(apiKey, body) {
  // Try cached model first
  const cached = sessionStorage.getItem(MODEL_CACHE_KEY);
  if (cached) {
    const r = await tryModel(cached, apiKey, body);
    if (r.ok) return { model: cached, text: r.text };
    sessionStorage.removeItem(MODEL_CACHE_KEY);
  }

  for (const model of CANDIDATE_MODELS) {
    const r = await tryModel(model, apiKey, body);
    if (r.ok) {
      sessionStorage.setItem(MODEL_CACHE_KEY, model);
      console.info(`[EcoTrace] Gemini model resolved: ${model}`);
      return { model, text: r.text };
    }
    if (!r.retryable) {
      // Fatal error (bad key, quota exceeded) — stop trying
      throw new Error(r.msg);
    }
    // retryable — try next model
  }
  throw new Error(
    'No Gemini model is available for your API key. ' +
    'Please verify the key at aistudio.google.com and try again.'
  );
}

export function useGemini() {
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);

  const analyzeFootprint = useCallback(async ({ footprint, logs, benchmarks }) => {
    const apiKey = getGeminiKey();
    if (!apiKey) {
      setError('Gemini API key missing. Add it via Settings ⚙️');
      return null;
    }

    // Return cached result if < 24 hrs old
    try {
      const raw = localStorage.getItem(CACHE_KEY);
      if (raw) {
        const { data, ts } = JSON.parse(raw);
        if (Date.now() - ts < 86_400_000) return data;
      }
    } catch { /* ignore */ }

    setLoading(true);
    setError(null);

    // Compact payload so we stay well inside token limits
    const payload = {
      annual_kg: footprint.total,
      daily_kg: footprint.dailyAvg,
      transport_kg: footprint.breakdown?.transport ?? 0,
      diet_kg: footprint.breakdown?.diet ?? 0,
      energy_kg: footprint.breakdown?.energy ?? 0,
      shopping_kg: footprint.breakdown?.shopping ?? 0,
      waste_kg: footprint.breakdown?.waste ?? 0,
      trees_needed: footprint.trees,
      india_avg: benchmarks.india,
      global_avg: benchmarks.global,
      paris_target: benchmarks.target,
      log_days: logs.length,
    };

    const prompt =
      'You are EcoCoach, a climate scientist and sustainability advisor.\n' +
      'Analyse this carbon footprint and reply ONLY with minified valid JSON — no markdown, no prose.\n\n' +
      'DATA: ' + JSON.stringify(payload) + '\n\n' +
      'Return exactly:\n' +
      '{"ecoPersonality":"<name>","personalityDescription":"<2 sentences>","headline":"<1 sentence insight>",' +
      '"score":{"rating":"excellent|good|average|high|critical","percentile":<1-99>},' +
      '"top5Tips":[{"tip":"<tip>","category":"transport|diet|energy|shopping|waste","annualSavingKg":<n>,"difficulty":"easy|medium|hard","whyItMatters":"<1 sentence>"}],' +
      '"weeklyGoal":"<goal>","monthlyChallenge":"<challenge>","motivationalMessage":"<2 sentences>","funFact":"<fact>"}';

    const body = {
      contents: [{ parts: [{ text: prompt }] }],
      generationConfig: { temperature: 0.7, maxOutputTokens: 1200 },
    };

    try {
      const { text } = await resolveModel(apiKey, body);

      // Strip any accidental markdown fences
      const cleaned = text
        .replace(/^```(?:json)?\s*/i, '')
        .replace(/```\s*$/i, '')
        .trim();

      const data = JSON.parse(cleaned);

      if (!data.ecoPersonality || !data.score || !Array.isArray(data.top5Tips)) {
        throw new Error('Incomplete JSON from Gemini. Please try again.');
      }

      localStorage.setItem(CACHE_KEY, JSON.stringify({ data, ts: Date.now() }));
      return data;
    } catch (e) {
      setError(e.message);
      return null;
    } finally {
      setLoading(false);
    }
  }, []);

  const clearCache = useCallback(() => {
    localStorage.removeItem(CACHE_KEY);
    sessionStorage.removeItem(MODEL_CACHE_KEY);
  }, []);

  return { analyzeFootprint, loading, error, clearCache };
}

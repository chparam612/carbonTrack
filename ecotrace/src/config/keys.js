/**
 * API key management — all keys stored in localStorage, never hardcoded.
 * Keys are validated against known Google API key patterns before use.
 */

export const KEYS = {
  GEMINI: 'ecotrace_gemini_key',
  FIREBASE: 'ecotrace_firebase_config',
  MAPS: 'ecotrace_maps_key',
};

/** Google API key format: AIza + 35 alphanumeric/dash/underscore chars */
const GOOGLE_KEY_PATTERN = /^AIza[0-9A-Za-z_-]{35}$/;

/**
 * Returns the stored Gemini API key, or null if missing/invalid.
 * @returns {string|null}
 */
export function getGeminiKey() {
  const key = localStorage.getItem(KEYS.GEMINI) || '';
  if (!key) return null;
  if (!GOOGLE_KEY_PATTERN.test(key)) {
    if (import.meta.env.DEV) {
      console.warn('[EcoTrace] Gemini API key format looks invalid');
    }
    return null;
  }
  return key;
}

/**
 * Returns the stored Firebase config object, or null if absent/unparseable.
 * @returns {Object|null}
 */
export function getFirebaseConfig() {
  try {
    const raw = localStorage.getItem(KEYS.FIREBASE);
    return raw ? JSON.parse(raw) : null;
  } catch {
    return null;
  }
}

/**
 * Returns the stored Google Maps API key, or null if missing/invalid.
 * @returns {string|null}
 */
export function getMapsKey() {
  const key = localStorage.getItem(KEYS.MAPS) || '';
  if (!key) return null;
  if (!GOOGLE_KEY_PATTERN.test(key)) {
    if (import.meta.env.DEV) {
      console.warn('[EcoTrace] Maps API key format looks invalid');
    }
    return null;
  }
  return key;
}

export function saveGeminiKey(key) {
  localStorage.setItem(KEYS.GEMINI, key);
}

export function saveFirebaseConfig(configJson) {
  localStorage.setItem(KEYS.FIREBASE, JSON.stringify(configJson));
}

export function saveMapsKey(key) {
  localStorage.setItem(KEYS.MAPS, key);
}

export function hasAllKeys() {
  return !!(getGeminiKey() && getFirebaseConfig() && getMapsKey());
}

export function clearAllKeys() {
  Object.values(KEYS).forEach((k) => localStorage.removeItem(k));
}

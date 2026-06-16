/**
 * API key management — all keys stored in localStorage, never hardcoded.
 */

export const KEYS = {
  GEMINI: 'ecotrace_gemini_key',
  FIREBASE: 'ecotrace_firebase_config',
  MAPS: 'ecotrace_maps_key',
};

export function getGeminiKey() {
  return localStorage.getItem(KEYS.GEMINI) || '';
}

export function getFirebaseConfig() {
  try {
    const raw = localStorage.getItem(KEYS.FIREBASE);
    return raw ? JSON.parse(raw) : null;
  } catch {
    return null;
  }
}

export function getMapsKey() {
  return localStorage.getItem(KEYS.MAPS) || '';
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

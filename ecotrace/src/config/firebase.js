/**
 * Firebase initialisation — reads config from localStorage at runtime.
 * Safely re-uses existing app instance; re-initialises when config changes.
 */
import { initializeApp, getApps, getApp } from 'firebase/app';
import { getFirestore } from 'firebase/firestore';
import { getAuth } from 'firebase/auth';
import { getFirebaseConfig } from './keys.js';

let db = null;
let auth = null;

export function initFirebase() {
  const config = getFirebaseConfig();
  if (!config) return { app: null, db: null, auth: null };

  // Re-use existing app or create a new one
  const app = getApps().length > 0 ? getApp() : initializeApp(config);

  db = getFirestore(app);
  auth = getAuth(app);
  return { app, db, auth };
}

export function getDb() { return db; }
export function getAuthInstance() { return auth; }

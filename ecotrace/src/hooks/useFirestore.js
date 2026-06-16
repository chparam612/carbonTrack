/**
 * Firestore CRUD hook — uses anonymous auth.
 */
import { useState, useEffect, useCallback } from 'react';
import {
  collection, doc, setDoc, getDoc, getDocs,
  query, orderBy, limit, serverTimestamp,
} from 'firebase/firestore';
import { signInAnonymously, onAuthStateChanged } from 'firebase/auth';
import { initFirebase } from '../config/firebase.js';

export function useFirestore() {
  const [uid, setUid] = useState(null);
  const [ready, setReady] = useState(false);
  const [error, setError] = useState(null);

  // Initialise Firebase + anonymous auth on mount
  useEffect(() => {
    const { db, auth } = initFirebase();
    if (!auth) {
      setError('Firebase not configured. Please add your Firebase config in Settings.');
      setReady(false);
      return;
    }

    const unsub = onAuthStateChanged(auth, async (user) => {
      if (user) {
        setUid(user.uid);
        setReady(true);
      } else {
        try {
          await signInAnonymously(auth);
        } catch (e) {
          setError('Firebase auth failed: ' + e.message);
        }
      }
    });

    return () => unsub();
  }, []);

  // Always get a fresh db reference via initFirebase
  const getDbRef = () => {
    const { db } = initFirebase();
    return db;
  };

  const saveProfile = useCallback(async (data) => {
    if (!uid) return;
    try {
      const db = getDbRef();
      if (!db) return;
      await setDoc(doc(db, 'users', uid, 'profile', 'main'), {
        ...data,
        updatedAt: serverTimestamp(),
      });
    } catch (e) {
      console.error('saveProfile error:', e);
    }
  }, [uid]);

  const saveLog = useCallback(async (date, data) => {
    if (!uid) return;
    try {
      const db = getDbRef();
      if (!db) return;
      await setDoc(doc(db, 'users', uid, 'logs', date), {
        ...data,
        date,
        updatedAt: serverTimestamp(),
      });
    } catch (e) {
      console.error('saveLog error:', e);
    }
  }, [uid]);

  const getLogs = useCallback(async (days = 30) => {
    if (!uid) return [];
    try {
      const db = getDbRef();
      if (!db) return [];
      const q = query(
        collection(db, 'users', uid, 'logs'),
        orderBy('date', 'desc'),
        limit(days)
      );
      const snap = await getDocs(q);
      return snap.docs.map((d) => d.data());
    } catch (e) {
      console.error('getLogs error:', e);
      return [];
    }
  }, [uid]);

  const getProfile = useCallback(async () => {
    if (!uid) return null;
    try {
      const db = getDbRef();
      if (!db) return null;
      const snap = await getDoc(doc(db, 'users', uid, 'profile', 'main'));
      return snap.exists() ? snap.data() : null;
    } catch (e) {
      console.error('getProfile error:', e);
      return null;
    }
  }, [uid]);

  const saveGoals = useCallback(async (goals) => {
    if (!uid) return;
    try {
      const db = getDbRef();
      if (!db) return;
      await setDoc(doc(db, 'users', uid, 'goals', 'main'), {
        ...goals,
        updatedAt: serverTimestamp(),
      });
    } catch (e) {
      console.error('saveGoals error:', e);
    }
  }, [uid]);

  return { uid, ready, error, saveProfile, saveLog, getLogs, getProfile, saveGoals };
}

import { initializeApp } from 'firebase/app';
import { getAuth } from 'firebase/auth';
import { getFirestore } from 'firebase/firestore';

// Safely access Vite environment variables
const env = (import.meta as any).env || {};

const firebaseConfig = {
  apiKey: env.VITE_FIREBASE_API_KEY || 'AIzaSyDummyKeyForOfflineBypassOnly123456',
  authDomain: env.VITE_FIREBASE_AUTH_DOMAIN || 'dummy-app.firebaseapp.com',
  projectId: env.VITE_FIREBASE_PROJECT_ID || 'dummy-app-id',
  storageBucket: env.VITE_FIREBASE_STORAGE_BUCKET || 'dummy-app.appspot.com',
  messagingSenderId: env.VITE_FIREBASE_MESSAGING_SENDER_ID || '123456789',
  appId: env.VITE_FIREBASE_APP_ID || '1:123456789:web:abcdef',
  firestoreDatabaseId: env.VITE_FIREBASE_FIRESTORE_DATABASE_ID || undefined,
};

let app;
try {
  app = initializeApp({
    apiKey: firebaseConfig.apiKey,
    authDomain: firebaseConfig.authDomain,
    projectId: firebaseConfig.projectId,
    storageBucket: firebaseConfig.storageBucket,
    messagingSenderId: firebaseConfig.messagingSenderId,
    appId: firebaseConfig.appId,
  });
} catch (err) {
  console.warn('Firebase client SDK failed to initialize with config, using fallback:', err);
  // Create a minimal placeholder app so getAuth/getFirestore don't fail immediately on load
  app = initializeApp({
    apiKey: 'AIzaSyDummyKeyForOfflineBypassOnly123456',
    projectId: 'dummy-app-id'
  });
}

export const auth = getAuth(app);
export const db = getFirestore(app, firebaseConfig.firestoreDatabaseId || undefined);
export { firebaseConfig };

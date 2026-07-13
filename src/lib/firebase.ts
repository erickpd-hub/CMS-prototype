import { initializeApp, getApps } from 'firebase/app';
import { getAuth } from 'firebase/auth';
import { getFirestore } from 'firebase/firestore';

// Safely access Vite environment variables
const env = (import.meta as any).env || {};

// Use env vars first, then fallback to the known project config
const firebaseConfig = {
  apiKey: env.VITE_FIREBASE_API_KEY || 'AIzaSyCqg4zW7Cf_0Vvmywxouedpo8j8DlubckY',
  authDomain: env.VITE_FIREBASE_AUTH_DOMAIN || 'gen-lang-client-0891215311.firebaseapp.com',
  projectId: env.VITE_FIREBASE_PROJECT_ID || 'gen-lang-client-0891215311',
  storageBucket: env.VITE_FIREBASE_STORAGE_BUCKET || 'gen-lang-client-0891215311.firebasestorage.app',
  messagingSenderId: env.VITE_FIREBASE_MESSAGING_SENDER_ID || '530517874752',
  appId: env.VITE_FIREBASE_APP_ID || '1:530517874752:web:fc64c265a304e9721a67a5',
  firestoreDatabaseId: env.VITE_FIREBASE_FIRESTORE_DATABASE_ID || 'ai-studio-marketingcmspro-72ca5fe7-8339-4ab2-b902-8f33ac69be4a',
};

// Avoid re-initializing if already done (e.g. HMR)
const app = getApps().length === 0
  ? initializeApp({
      apiKey: firebaseConfig.apiKey,
      authDomain: firebaseConfig.authDomain,
      projectId: firebaseConfig.projectId,
      storageBucket: firebaseConfig.storageBucket,
      messagingSenderId: firebaseConfig.messagingSenderId,
      appId: firebaseConfig.appId,
    })
  : getApps()[0];

export const auth = getAuth(app);
export const db = getFirestore(app, firebaseConfig.firestoreDatabaseId);
export { firebaseConfig };

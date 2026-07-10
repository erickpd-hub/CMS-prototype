import { initializeApp } from 'firebase/app';
import { getAuth } from 'firebase/auth';
import { getFirestore } from 'firebase/firestore';

let firebaseConfig: any = {
  apiKey: (import.meta as any).env.VITE_FIREBASE_API_KEY,
  authDomain: (import.meta as any).env.VITE_FIREBASE_AUTH_DOMAIN,
  projectId: (import.meta as any).env.VITE_FIREBASE_PROJECT_ID,
  storageBucket: (import.meta as any).env.VITE_FIREBASE_STORAGE_BUCKET,
  messagingSenderId: (import.meta as any).env.VITE_FIREBASE_MESSAGING_SENDER_ID,
  appId: (import.meta as any).env.VITE_FIREBASE_APP_ID,
  firestoreDatabaseId: (import.meta as any).env.VITE_FIREBASE_FIRESTORE_DATABASE_ID,
};

// If not defined in environment variables, try to load from local configuration files
if (!firebaseConfig.apiKey) {
  try {
    // Using a variable and @vite-ignore prevents Vite and TypeScript from statically resolving the file during compilation
    const appletConfigPath = '../../firebase-applet-config.json';
    const config = await import(/* @vite-ignore */ appletConfigPath);
    firebaseConfig = { ...firebaseConfig, ...(config.default || config) };
  } catch (e1) {
    try {
      const configPath = '../../firebase-config.json';
      const config = await import(/* @vite-ignore */ configPath);
      firebaseConfig = { ...firebaseConfig, ...(config.default || config) };
    } catch (e2) {
      console.warn('Firebase configuration not found. Please set VITE_FIREBASE_* environment variables.');
    }
  }
}

const app = initializeApp({
  apiKey: firebaseConfig.apiKey,
  authDomain: firebaseConfig.authDomain,
  projectId: firebaseConfig.projectId,
  storageBucket: firebaseConfig.storageBucket,
  messagingSenderId: firebaseConfig.messagingSenderId,
  appId: firebaseConfig.appId,
});

export const auth = getAuth(app);
export const db = getFirestore(app, firebaseConfig.firestoreDatabaseId);


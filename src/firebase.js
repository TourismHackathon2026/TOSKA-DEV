import { initializeApp } from 'firebase/app';
import { getAuth, GoogleAuthProvider, signInWithPopup, signOut } from 'firebase/auth';
import { getFirestore } from 'firebase/firestore';

const firebaseConfig = {
  apiKey: import.meta.env.VITE_FIREBASE_API_KEY,
  authDomain: import.meta.env.VITE_FIREBASE_AUTH_DOMAIN,
  projectId: import.meta.env.VITE_FIREBASE_PROJECT_ID,
  storageBucket: import.meta.env.VITE_FIREBASE_STORAGE_BUCKET,
  messagingSenderId: import.meta.env.VITE_FIREBASE_MESSAGING_SENDER_ID,
  appId: import.meta.env.VITE_FIREBASE_APP_ID,
  measurementId: import.meta.env.VITE_FIREBASE_MEASUREMENT_ID,
};

let app, auth, db, googleProvider;

try {
  app = initializeApp(firebaseConfig);
  auth = getAuth(app);
  db = getFirestore(app);
  googleProvider = new GoogleAuthProvider();
  googleProvider.addScope('profile');
  googleProvider.addScope('email');
} catch (err) {
  console.warn('Firebase init failed (check your .env credentials):', err.message);
  // Provide stubs so imports don't break
  auth = null;
  db = null;
  googleProvider = null;
}

export { auth, db, googleProvider };

export const signInWithGoogle = async () => {
  if (!auth) throw new Error('Firebase not configured. Add credentials to .env');
  await signInWithPopup(auth, googleProvider);
};

export const signOutUser = async () => {
  if (!auth) return;
  await signOut(auth);
};

export default app;

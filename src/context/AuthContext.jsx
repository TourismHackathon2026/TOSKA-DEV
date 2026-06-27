import { createContext, useContext, useState, useEffect } from 'react';
import { auth, googleProvider } from '../firebase';
import {
  signInWithEmailAndPassword,
  createUserWithEmailAndPassword,
  updateProfile as updateFirebaseProfile,
  onAuthStateChanged,
  signInWithPopup,
  signOut,
} from 'firebase/auth';
import { syncUserToFirestore, updateUserProfile as updateUserProfileInFirestore } from '../utils/firebaseService';

function getFirebaseAuth() {
  if (!auth) return null;
  return {
    auth,
    signInWithEmailAndPassword,
    createUserWithEmailAndPassword,
    updateProfile: updateFirebaseProfile,
    onAuthStateChanged,
    signInWithPopup,
    signOut,
  };
}

function getFirebaseErrorMessage(code) {
  const messages = {
    'auth/email-already-in-use': 'This email is already registered. Try logging in.',
    'auth/invalid-email': 'Please enter a valid email address.',
    'auth/weak-password': 'Password must be at least 6 characters.',
    'auth/user-not-found': 'No account found with this email.',
    'auth/wrong-password': 'Incorrect password. Please try again.',
    'auth/invalid-credential': 'Invalid email or password.',
    'auth/too-many-requests': 'Too many attempts. Please wait a moment.',
    'auth/popup-closed-by-user': 'Sign-in popup was closed. Please try again.',
    'auth/cancelled-popup-request': 'Sign-in was cancelled.',
    'auth/operation-not-allowed': 'Email/password sign-in is disabled. Enable it in Firebase console.',
    'auth/network-request-failed': 'Network error. Check your connection.',
    'auth/configuration-not-found': 'Firebase not configured. Check your .env credentials.',
  };
  return messages[code] || 'An authentication error occurred. Please try again.';
}

function isAdminEmailFromEnv(email) {
  if (!email) return false;
  const adminList = String(import.meta.env.VITE_FIREBASE_ADMIN_EMAILS || '')
    .split(',')
    .map((item) => item.trim().toLowerCase())
    .filter(Boolean);
  return adminList.includes(email.toLowerCase());
}

const AuthContext = createContext(null);
const DEMO_SESSION_KEY = 'trailguard:demo-session';

function readStoredDemoSession() {
  if (typeof window === 'undefined') return null;
  try {
    const raw = window.localStorage.getItem(DEMO_SESSION_KEY);
    return raw ? JSON.parse(raw) : null;
  } catch (error) {
    console.warn('Unable to read demo session:', error.message);
    return null;
  }
}

function persistDemoSession(userData, dbUserData) {
  if (typeof window === 'undefined') return;
  try {
    window.localStorage.setItem(DEMO_SESSION_KEY, JSON.stringify({ user: userData, dbUser: dbUserData }));
  } catch (error) {
    console.warn('Unable to persist demo session:', error.message);
  }
}

function clearDemoSession() {
  if (typeof window === 'undefined') return;
  window.localStorage.removeItem(DEMO_SESSION_KEY);
}

function createDemoUser(email, name, role = 'trekker') {
  const normalizedEmail = String(email || '').trim().toLowerCase();
  const displayName = String(name || '').trim() || normalizedEmail.split('@')[0] || 'TrailGuard User';
  const uid = `demo-${normalizedEmail.replace(/[^a-z0-9]+/g, '-') || 'user'}`;
  return {
    uid,
    email: normalizedEmail,
    displayName,
    photoURL: null,
    emailVerified: true,
    isDemo: true,
  };
}

export function AuthProvider({ children }) {
  const [user, setUser] = useState(null);
  const [dbUser, setDbUser] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const isAdmin = Boolean(dbUser?.role === 'admin' || (user?.email && isAdminEmailFromEnv(user.email)));

  useEffect(() => {
    let unsubscribe = null;

    const storedDemoSession = readStoredDemoSession();
    if (storedDemoSession?.user) {
      setUser(storedDemoSession.user);
      setDbUser(storedDemoSession.dbUser || null);
      setLoading(false);
    }

    const fb = getFirebaseAuth();
    if (!fb || !fb.auth) {
      setLoading(false);
      return;
    }

    unsubscribe = onAuthStateChanged(fb.auth, async (firebaseUser) => {
      if (firebaseUser) {
        setUser(firebaseUser);
        try {
          const profile = await syncUserToFirestore(firebaseUser);
          setDbUser(profile);
        } catch (e) {
          console.warn('Firestore sync skipped (no credentials?):', e.message);
        }
      } else {
        setUser(null);
        setDbUser(null);
      }
      setLoading(false);
    }, (err) => {
      console.warn('Auth state error:', err.message);
      setLoading(false);
    });

    return () => { if (unsubscribe) unsubscribe(); };
  }, []);

  const login = async (email, password) => {
    setError(null);
    const normalizedEmail = String(email || '').trim().toLowerCase();
    const normalizedPassword = String(password || '').trim();

    if (!normalizedEmail || !normalizedPassword || normalizedPassword.length < 6) {
      const msg = 'Please enter a valid email and a password with at least 6 characters.';
      setError(msg);
      throw new Error(msg);
    }

    const fb = getFirebaseAuth();
    if (!fb || !fb.auth) {
      const role = normalizedEmail.includes('admin') ? 'admin' : 'trekker';
      const demoUser = createDemoUser(normalizedEmail, normalizedEmail.split('@')[0], role);
      const demoDbUser = {
        uid: demoUser.uid,
        name: demoUser.displayName,
        email: normalizedEmail,
        role,
        avatar: 'default-avatar.png',
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString(),
      };
      setUser(demoUser);
      setDbUser(demoDbUser);
      persistDemoSession(demoUser, demoDbUser);
      return { user: demoUser };
    }

    try {
      const result = await fb.signInWithEmailAndPassword(fb.auth, normalizedEmail, normalizedPassword);
      return { user: result.user };
    } catch (err) {
      const message = err.code ? getFirebaseErrorMessage(err.code) : err.message;
      setError(message);
      throw new Error(message);
    }
  };

  const register = async ({ name, email, password }) => {
    setError(null);
    const normalizedName = String(name || '').trim();
    const normalizedEmail = String(email || '').trim().toLowerCase();
    const normalizedPassword = String(password || '').trim();

    if (!normalizedName || !normalizedEmail || !normalizedPassword || normalizedPassword.length < 6) {
      const msg = 'Please enter a full name, a valid email, and a password with at least 6 characters.';
      setError(msg);
      throw new Error(msg);
    }

    const fb = await getFirebaseAuth();
    if (!fb || !fb.auth) {
      const role = normalizedEmail.includes('admin') ? 'admin' : 'trekker';
      const demoUser = createDemoUser(normalizedEmail, normalizedName, role);
      const demoDbUser = {
        uid: demoUser.uid,
        name: demoUser.displayName,
        email: normalizedEmail,
        role,
        avatar: 'default-avatar.png',
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString(),
      };
      setUser(demoUser);
      setDbUser(demoDbUser);
      persistDemoSession(demoUser, demoDbUser);
      return { user: demoUser };
    }

    try {
      const result = await fb.createUserWithEmailAndPassword(fb.auth, normalizedEmail, normalizedPassword);
      await fb.updateProfile(result.user, { displayName: normalizedName });
      return { user: result.user };
    } catch (err) {
      const message = err.code ? getFirebaseErrorMessage(err.code) : err.message;
      setError(message);
      throw new Error(message);
    }
  };

  const signInWithGoogle = async () => {
    setError(null);
    const fb = await getFirebaseAuth();
    if (!fb || !fb.auth) {
      const demoUser = createDemoUser('demo@trailguard.app', 'TrailGuard Demo', 'trekker');
      const demoDbUser = {
        uid: demoUser.uid,
        name: demoUser.displayName,
        email: demoUser.email,
        role: 'trekker',
        avatar: 'default-avatar.png',
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString(),
      };
      setUser(demoUser);
      setDbUser(demoDbUser);
      persistDemoSession(demoUser, demoDbUser);
      return { user: demoUser };
    }
    try {
      const result = await signInWithPopup(fb.auth, googleProvider);
      return { user: result.user };
    } catch (err) {
      const message = getFirebaseErrorMessage(err.code);
      setError(message);
      throw new Error(message);
    }
  };

  const logout = async () => {
    try {
      const fb = getFirebaseAuth();
      if (fb && fb.auth) {
        await signOut(fb.auth);
      }
    } catch (err) {
      console.error('Logout error:', err);
    } finally {
      setUser(null);
      setDbUser(null);
      clearDemoSession();
    }
  };

  const updateProfile = async (profileData) => {
    if (!user) throw new Error('Not authenticated');
    try {
      const updated = await updateUserProfileInFirestore(user.uid, profileData);
      setDbUser(updated);
      return updated;
    } catch (err) {
      throw new Error(err.message || 'Profile update failed');
    }
  };

  const getIdToken = async () => {
    if (!user) return null;
    return user.getIdToken();
  };

  return (
    <AuthContext.Provider
      value={{
        user,
        dbUser,
        loading,
        error,
        isAdmin,
        login,
        register,
        signInWithGoogle,
        logout,
        updateProfile,
        getIdToken,
      }}
    >
      {children}
    </AuthContext.Provider>
  );
}

export const useAuth = () => {
  const ctx = useContext(AuthContext);
  if (!ctx) {
    return {
      user: null,
      dbUser: null,
      loading: false,
      error: null,
      isAdmin: false,
      login: async () => {
        throw new Error('Authentication unavailable');
      },
      register: async () => {
        throw new Error('Authentication unavailable');
      },
      signInWithGoogle: async () => {
        throw new Error('Authentication unavailable');
      },
      logout: async () => {},
      updateProfile: async () => {
        throw new Error('Authentication unavailable');
      },
      getIdToken: async () => null,
    };
  }
  return ctx;
};

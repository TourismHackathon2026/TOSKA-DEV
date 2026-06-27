import { createContext, useContext, useState, useEffect } from 'react';
import {
  onAuthStateChanged,
  signInWithEmailAndPassword,
  createUserWithEmailAndPassword,
  signInWithPopup,
  signOut,
  updateProfile as firebaseUpdateProfile,
} from 'firebase/auth';
import { auth, googleProvider } from '../firebase';
import { syncUserToFirestore, updateUserProfile } from '../utils/firebaseService';

const AuthContext = createContext(null);

export function AuthProvider({ children }) {
  const [user, setUser] = useState(null);
  const [dbUser, setDbUser] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  // Sync Firebase user to Firestore DB
  const syncUserToBackend = async (firebaseUser) => {
    try {
      const dbProfile = await syncUserToFirestore(firebaseUser);
      setDbUser(dbProfile);
      return dbProfile;
    } catch (err) {
      console.error('Failed to sync user to Firestore:', err);
    }
    return null;
  };

  // Listen for Firebase auth state changes
  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, async (firebaseUser) => {
      if (firebaseUser) {
        setUser(firebaseUser);
        await syncUserToBackend(firebaseUser);
      } else {
        setUser(null);
        setDbUser(null);
      }
      setLoading(false);
    });

    return () => unsubscribe();
  }, []);

  // Email/Password Login
  const login = async (email, password) => {
    setError(null);
    try {
      const result = await signInWithEmailAndPassword(auth, email, password);
      const synced = await syncUserToBackend(result.user);
      return { user: result.user, dbUser: synced };
    } catch (err) {
      console.error('Login error details:', err);
      const message = err.code ? getFirebaseErrorMessage(err.code) : err.message || 'Authentication failed';
      setError(message);
      throw new Error(message);
    }
  };

  // Email/Password Register
  const register = async ({ name, email, password }) => {
    setError(null);
    try {
      const result = await createUserWithEmailAndPassword(auth, email, password);
      // Set display name in Firebase
      await firebaseUpdateProfile(result.user, { displayName: name });
      const synced = await syncUserToBackend(result.user);
      return { user: result.user, dbUser: synced };
    } catch (err) {
      console.error('Register error details:', err);
      const message = err.code ? getFirebaseErrorMessage(err.code) : err.message || 'Registration failed';
      setError(message);
      throw new Error(message);
    }
  };

  // Google Sign-In
  const signInWithGoogle = async () => {
    setError(null);
    try {
      const result = await signInWithPopup(auth, googleProvider);
      const synced = await syncUserToBackend(result.user);
      return { user: result.user, dbUser: synced };
    } catch (err) {
      const message = getFirebaseErrorMessage(err.code);
      setError(message);
      throw new Error(message);
    }
  };

  // Logout
  const logout = async () => {
    try {
      await signOut(auth);
      setUser(null);
      setDbUser(null);
    } catch (err) {
      console.error('Logout error:', err);
    }
  };

  // Update profile
  const updateProfile = async (profileData) => {
    if (!user) throw new Error('Not authenticated');

    try {
      const updatedUser = await updateUserProfile(user.uid, profileData);
      setDbUser(updatedUser);
      return updatedUser;
    } catch (err) {
      console.error('Failed to update profile:', err);
      throw new Error(err.message || 'Profile update failed');
    }
  };

  // Get current ID token (for API calls)
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

// Map Firebase error codes to user-friendly messages
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
    'auth/operation-not-allowed': 'Email/password sign‑in is disabled. Enable it in Firebase console.',
  };
  return messages[code] || 'An authentication error occurred. Please try again.';
}

export const useAuth = () => {
  const ctx = useContext(AuthContext);
  if (!ctx) throw new Error('useAuth must be used within AuthProvider');
  return ctx;
};

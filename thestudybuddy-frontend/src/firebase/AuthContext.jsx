import { createContext, useContext, useEffect, useState } from 'react';
import {
  signInWithEmailAndPassword,
  createUserWithEmailAndPassword,
  signInWithPopup,
  signOut,
  onAuthStateChanged,
  GoogleAuthProvider,
  updateProfile
} from 'firebase/auth';
import { auth } from './config';
import { userApi } from '../services/api';

const AuthContext = createContext({});

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
};

export function AuthProvider({ children }) {
  const [currentUser, setCurrentUser] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  // Sync user data with MongoDB
  const syncUserData = async (user) => {
    try {
      await userApi.syncUser({
        displayName: user.displayName,
        photoURL: user.photoURL,
        emailVerified: user.emailVerified,
        provider: user.providerData[0]?.providerId || 'email',
        metadata: {
          creationTime: user.metadata.creationTime,
          lastSignInTime: user.metadata.lastSignInTime,
        },
      });
    } catch (error) {
      console.error('Failed to sync user data with MongoDB:', error);
      // Don't throw - we don't want to block login/signup if MongoDB sync fails
    }
  };

  // Sign up with email and password
  const signup = async (email, password, firstName) => {
    try {
      setError(null);
      const result = await createUserWithEmailAndPassword(auth, email, password);
      // Update the user's profile with their first name
      await updateProfile(result.user, {
        displayName: firstName
      });
      // Sync user data with MongoDB
      await syncUserData(result.user);
      return result;
    } catch (err) {
      setError(err.message);
      throw err;
    }
  };

  // Sign in with email and password
  const login = async (email, password) => {
    try {
      setError(null);
      const result = await signInWithEmailAndPassword(auth, email, password);
      // Sync user data with MongoDB
      await syncUserData(result.user);
      return result;
    } catch (err) {
      setError(err.message);
      throw err;
    }
  };

  // Sign in with Google
  const loginWithGoogle = async () => {
    try {
      setError(null);
      const provider = new GoogleAuthProvider();
      const result = await signInWithPopup(auth, provider);
      // Sync user data with MongoDB
      await syncUserData(result.user);
      return result;
    } catch (err) {
      setError(err.message);
      throw err;
    }
  };

  // Sign out
  const logout = async () => {
    try {
      setError(null);
      await signOut(auth);
    } catch (err) {
      setError(err.message);
      throw err;
    }
  };

  // Listen for auth state changes
  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, (user) => {
      setCurrentUser(user);
      setLoading(false);
    });

    return unsubscribe;
  }, []);

  const value = {
    currentUser,
    loading,
    error,
    signup,
    login,
    loginWithGoogle,
    logout,
  };

  return (
    <AuthContext.Provider value={value}>
      {!loading && children}
    </AuthContext.Provider>
  );
}
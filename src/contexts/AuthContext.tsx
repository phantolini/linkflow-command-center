
import React, { createContext, useContext, useState, useEffect } from 'react';
import { auth } from '@/services/firebase';
import { onAuthStateChanged, signOut } from 'firebase/auth';

export interface User {
  id: string;
  email: string;
  username?: string;
  display_name?: string;
  avatar_url?: string;
}

interface AuthContextType {
  user: User | null;
  loading: boolean;
  setUser: (user: User | null) => void;
  logout: () => void;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
};

interface AuthProviderProps {
  children: React.ReactNode;
  initialUser?: User | null;
  onAuthStateChange?: (user: User | null) => void;
}

export const AuthProvider: React.FC<AuthProviderProps> = ({ 
  children, 
  initialUser = null,
  onAuthStateChange 
}) => {
  const [user, setUser] = useState<User | null>(initialUser);
  const [loading, setLoading] = useState(false);

  const handleSetUser = (newUser: User | null) => {
    setUser(newUser);
    onAuthStateChange?.(newUser);
  };

  const logout = async () => {
    try {
      await signOut(auth);
      handleSetUser(null);
    } catch (error) {
      console.error('Logout error:', error);
      handleSetUser(null);
    }
  };

  // Listen for Firebase auth changes
  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, (firebaseUser) => {
      if (firebaseUser) {
        const user: User = {
          id: firebaseUser.uid,
          email: firebaseUser.email || '',
          display_name: firebaseUser.displayName || undefined,
          avatar_url: firebaseUser.photoURL || undefined,
        };
        handleSetUser(user);
      } else {
        handleSetUser(null);
      }
      setLoading(false);
    });

    return () => unsubscribe();
  }, []);

  // Listen for auth changes from parent platform
  useEffect(() => {
    const handleMessage = (event: MessageEvent) => {
      if (event.data.type === 'AUTH_STATE_CHANGE') {
        handleSetUser(event.data.user);
      }
    };

    window.addEventListener('message', handleMessage);
    return () => window.removeEventListener('message', handleMessage);
  }, []);

  return (
    <AuthContext.Provider value={{ user, loading, setUser: handleSetUser, logout }}>
      {children}
    </AuthContext.Provider>
  );
};

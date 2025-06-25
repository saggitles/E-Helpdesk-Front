// Simple client-side authentication provider
import React, { createContext, useContext, useState, useEffect } from 'react';

interface User {
  id: string;
  name: string;
  email: string;
  roles: string[];
}

interface AuthContextType {
  user: User | null;
  login: (email: string, password: string) => Promise<boolean>;
  loginWithGoogle: () => Promise<boolean>;
  logout: () => void;
  isLoading: boolean;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export function ClientAuthProvider({ children }: { children: React.ReactNode }) {
  const [user, setUser] = useState<User | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    // Check for existing session on load
    const savedUser = localStorage.getItem('auth-user');
    if (savedUser) {
      try {
        setUser(JSON.parse(savedUser));
      } catch (error) {
        localStorage.removeItem('auth-user');
      }
    }
    setIsLoading(false);
  }, []);

  const login = async (email: string, password: string): Promise<boolean> => {
    // Admin login
    if (email === 'admin' && password === 'admin12345') {
      const adminUser = {
        id: 'admin-user',
        name: 'Admin User',
        email: 'admin@example.com',
        roles: ['admin']
      };
      setUser(adminUser);
      localStorage.setItem('auth-user', JSON.stringify(adminUser));
      return true;
    }
    return false;
  };

  const loginWithGoogle = async (): Promise<boolean> => {
    // For static sites, you'd need to implement OAuth flow manually
    // This is a placeholder - you'd need to use Google's OAuth library directly
    console.warn('Google login not implemented for static export');
    return false;
  };

  const logout = () => {
    setUser(null);
    localStorage.removeItem('auth-user');
  };

  return (
    <AuthContext.Provider value={{ user, login, loginWithGoogle, logout, isLoading }}>
      {children}
    </AuthContext.Provider>
  );
}

export function useClientAuth() {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error('useClientAuth must be used within a ClientAuthProvider');
  }
  return context;
}
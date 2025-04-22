// components/auth/AuthProvider.tsx
import React from 'react';
import { UserProvider } from '@auth0/nextjs-auth0/client';

interface AuthProviderProps {
  children: React.ReactNode;
}

export const AuthProvider: React.FC<AuthProviderProps> = ({
  children,
}) => {
  return <UserProvider>{children}</UserProvider>;
};

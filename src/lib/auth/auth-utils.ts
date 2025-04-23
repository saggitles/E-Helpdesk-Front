import { getSession as getNextAuthSession, signIn, signOut } from 'next-auth/react';

/**
 * Gets the current session
 */
export const getSession = getNextAuthSession;

/**
 * Checks if current user has a specific role
 */
export const hasRole = (user: any, role: string): boolean => {
  if (!user) return false;
  const roles = user.roles || [];
  return roles.includes(role);
};

/**
 * Sign in with provider
 */
export const login = (provider = 'google') => {
  return signIn(provider, { callbackUrl: '/support/create/ticket' });
};

/**
 * Sign out
 */
export const logout = () => {
  return signOut({ callbackUrl: '/' });
};
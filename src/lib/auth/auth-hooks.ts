import { useSession, signIn, signOut } from 'next-auth/react';

export function useAuthUser() {
  const { data: session, status } = useSession();
  const isLoading = status === 'loading';
  
  return {
    user: session?.user,
    isLoading,
    isAuthenticated: !!session,
    roles: session?.user?.roles || []
  };
}

export function useAuth() {
  const { data: session } = useSession();
  
  const login = (callbackUrl?: string) => {
    signIn('google', { callbackUrl });
  };
  
  const logout = (callbackUrl?: string) => {
    signOut({ callbackUrl });
  };
  
  const hasRole = (role: string): boolean => {
    return session?.user?.roles?.includes(role) || false;
  };
  
  return {
    login,
    logout,
    hasRole,
    isAuthenticated: !!session
  };
}
// components/ProtectedPage.tsx
import { useRouter } from 'next/router';
import { useAuthUser } from '../lib/auth/auth-hooks';
import { useEffect } from 'react';

const ProtectedPage = () => {
  const { user, isLoading, userRoles, checkRole } = useAuthUser();
  const router = useRouter();

  // Redirect if not logged in
  useEffect(() => {
    if (!isLoading && !user) {
      router.push('/api/auth/login');
    }
  }, [isLoading, user, router]);

  // Check if user has required role
  const isSupportTeam = checkRole('Support_Team');

  if (isLoading) {
    return <p>Loading...</p>;
  }

  if (!user) {
    return null; // Will redirect in useEffect
  }

  return (
    <div>
      <h1>Protected Page</h1>
      <p>Welcome, {user.name}</p>
      {isSupportTeam && <p>You have support team access</p>}
      <button onClick={() => router.push('/api/auth/logout')}>
        Logout
      </button>
    </div>
  );
};

export default ProtectedPage;

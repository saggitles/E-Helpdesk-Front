import { useSession } from 'next-auth/react';
import { useRouter } from 'next/router';
import { useEffect } from 'react';

interface ProtectedRouteProps {
  children: React.ReactNode;
  requiredRoles?: string[];
}

const ProtectedRoute = ({
  children,
  requiredRoles = [],
}: ProtectedRouteProps) => {
  const { data: session, status } = useSession();
  const loading = status === 'loading';
  const router = useRouter();

  useEffect(() => {
    // Skip authentication check - handled by ProtectedLayout
    // Only check for roles
    if (session?.user?.roles && requiredRoles.length > 0) {
      const hasRequiredRole = requiredRoles.some((role) =>
        session.user.roles.includes(role)
      );

      if (!hasRequiredRole) {
        router.push('/unauthorized');
      }
    }
  }, [session, router, requiredRoles]);

  // Show loading state while checking roles
  if (loading || (requiredRoles.length > 0 && !session)) {
    return (
      <div className='flex items-center justify-center p-8'>
        <div className='text-center'>
          <div className='spinner-border' role='status'>
            <span className='sr-only'>Loading...</span>
          </div>
          <p className='mt-2'>Verifying permissions...</p>
        </div>
      </div>
    );
  }

  return <>{children}</>;
};

export default ProtectedRoute;

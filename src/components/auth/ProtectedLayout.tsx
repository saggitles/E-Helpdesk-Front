import { useSession } from 'next-auth/react';
import { useRouter } from 'next/router';
import { useEffect } from 'react';
import NavBar from '@/generic_comp/navbar';

interface LayoutProps {
  children: React.ReactNode;
}

export default function Layout({ children }: LayoutProps) {
  const { data: session, status } = useSession();
  const router = useRouter();

  // Public paths that don't require authentication
  const publicPaths = ['/login', '/register', '/error', '/api/auth'];

  // Check if current path is public
  const isPublicPath = publicPaths.some(
    (publicPath) =>
      router.pathname === publicPath ||
      router.pathname.startsWith(publicPath + '/')
  );

  useEffect(() => {
    // If not authenticated and not on a public page, redirect to login
    if (status === 'unauthenticated' && !isPublicPath) {
      router.push(
        `/login?callbackUrl=${encodeURIComponent(router.asPath)}`
      );
    }
  }, [status, router, isPublicPath]);

  return (
    <div className='flex flex-col min-h-screen'>
      {/* Always render the NavBar once from here - this is the single source of truth */}

      <main className='flex-grow'>
        {isPublicPath || status === 'authenticated' ? (
          children
        ) : (
          // Loading state
          <div className='flex items-center justify-center min-h-screen'>
            <div className='text-center'>
              <div className='spinner-border' role='status'>
                <span className='sr-only'>Loading...</span>
              </div>
              <p className='mt-2'>Verifying authentication...</p>
            </div>
          </div>
        )}
      </main>
    </div>
  );
}

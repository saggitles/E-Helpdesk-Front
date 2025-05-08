import { AppProps } from 'next/app';
import { useRouter } from 'next/router';
import { useEffect } from 'react';
import '@/styles/globals.css';
import '@/components/SupportTeamComponents/TicketComments/styles.scss';
import { GeneralDetailsProvider } from '@/contexts';

function MyApp({ Component, pageProps }: AppProps) {
  const router = useRouter();

  useEffect(() => {
    // Handle GitHub Pages URL parsing
    const handleGitHubPagesRouting = () => {
      if (typeof window === 'undefined') return;
      
      const { pathname, href } = window.location;
      console.log('Current URL:', href);
      console.log('Current pathname:', pathname);
      
      // Check for direct support/vehicle access
      if (pathname.includes('/404') || pathname === '/E-Helpdesk-Front') {
        // If we're at a 404 or the root, redirect to the vehicle dashboard
        console.log('Redirecting to vehicle dashboard');
        router.replace('/support/vehicle');
      }
      
      // Check if URL contains a hash with a path (GitHub Pages redirect format)
      const hash = window.location.hash;
      if (hash && hash.startsWith('#/')) {
        const path = hash.substring(1);
        console.log('Found hash path:', path);
        router.replace(path);
      }
      
      // Special handling for direct URL access to subpaths
      if (pathname.includes('/support/vehicle') && !window.location.href.includes('/support/vehicle')) {
        console.log('Direct access to vehicle path detected, fixing URL');
        const basePath = process.env.NODE_ENV === 'production' ? '/E-Helpdesk-Front' : '';
        const newPath = `${basePath}/support/vehicle`;
        router.replace(newPath);
      }
    };
    
    handleGitHubPagesRouting();
  }, [router]);

  return (
    <GeneralDetailsProvider>
      <Component {...pageProps} />
    </GeneralDetailsProvider>
  );
}

export default MyApp;

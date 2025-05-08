import { AppProps } from 'next/app';
import { useRouter } from 'next/router';
import { useEffect } from 'react';
import '@/styles/globals.css';
import '@/components/SupportTeamComponents/TicketComments/styles.scss';
import { GeneralDetailsProvider } from '@/contexts';

function MyApp({ Component, pageProps }: AppProps) {
  const router = useRouter();

  useEffect(() => {
    // Handle GitHub Pages redirect from 404.html
    const handleGitHubPagesRedirect = () => {
      if (typeof window !== 'undefined') {
        // Check if we have a path parameter from 404.html redirect
        const urlParams = new URLSearchParams(window.location.search);
        const pathParam = urlParams.get('p');
        
        if (pathParam) {
          console.log('Detected redirect path parameter:', pathParam);
          
          // Clean URL by removing the query parameter
          const cleanUrl = window.location.pathname;
          window.history.replaceState({}, document.title, cleanUrl);
          
          // Navigate to the correct route
          const normalizedPath = pathParam.startsWith('/') ? pathParam : `/${pathParam}`;
          router.replace(normalizedPath);
        }
      }
    };
    
    handleGitHubPagesRedirect();
  }, [router]);

  return (
    <GeneralDetailsProvider>
      <Component {...pageProps} />
    </GeneralDetailsProvider>
  );
}

export default MyApp;

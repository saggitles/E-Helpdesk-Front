import type { AppProps } from 'next/app';
import { UserProvider } from '@auth0/nextjs-auth0/client';
import '@/styles/globals.css';
import '@/components/SupportTeamComponents/TicketComments/styles.scss';
import axios from 'axios';
import { useEffect, useRef, useState } from 'react';

import { GeneralDetailsProvider } from '@/contexts';

// Interface for API calls
interface ApiCall {
  url: string;
  method: string;
  timestamp: string;
  endpoint: string;
}

// Create a client-side only component for API tracking
function ApiTracker() {
  // Use refs instead of state to avoid re-renders
  const apiCallsRef = useRef<ApiCall[]>([]);
  const uniqueEndpointsRef = useRef<Set<string>>(new Set());

  useEffect(() => {
    // Function to extract endpoint from URL
    const getEndpoint = (url: string): string => {
      try {
        const urlObj = new URL(url);
        // Get the path without query parameters
        return urlObj.pathname;
      } catch (e) {
        // If URL parsing fails (e.g., relative URLs)
        const parts = url.split('?')[0].split('/');
        return `/${parts.slice(3).join('/')}`;
      }
    };

    // Function to add a new API call to our tracking array
    const trackApiCall = (url: string, method: string) => {
      const endpoint = getEndpoint(url);
      const call = {
        url,
        method,
        timestamp: new Date().toISOString(),
        endpoint,
      };

      apiCallsRef.current.push(call);

      // Check if this is a new unique endpoint
      if (!uniqueEndpointsRef.current.has(endpoint)) {
        // Add to our unique endpoints set
        uniqueEndpointsRef.current.add(endpoint);

        // Log all unique endpoints whenever a new one is discovered
        console.log('=== UNIQUE API ENDPOINTS ===');
        const endpointArray = Array.from(uniqueEndpointsRef.current);
        console.table(
          endpointArray.map((ep) => ({
            endpoint: ep,
            count: apiCallsRef.current.filter(
              (call) => call.endpoint === ep
            ).length,
          }))
        );
      }
    };

    // Track fetch API calls
    const originalFetch = window.fetch;
    window.fetch = async function (...args) {
      const url = args[0].toString();
      const method = args[1]?.method || 'GET';
      trackApiCall(url, method);
      return originalFetch.apply(this, args);
    };

    // Track axios API calls
    const interceptor = axios.interceptors.request.use((config) => {
      const url = config.url || '';
      const method = config.method?.toUpperCase() || 'GET';
      trackApiCall(url, method);
      return config;
    });

    // Cleanup function
    return () => {
      window.fetch = originalFetch;
      axios.interceptors.request.eject(interceptor);
    };
  }, []);

  // Return null - we're not rendering anything
  return null;
}

export default function App({ Component, pageProps }: AppProps) {
  return (
    <UserProvider>
      <GeneralDetailsProvider>
        <Component {...pageProps} />
        {typeof window !== 'undefined' && <ApiTracker />}
      </GeneralDetailsProvider>
    </UserProvider>
  );
}

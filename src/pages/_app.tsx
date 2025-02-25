import type { AppProps } from 'next/app';
import { UserProvider } from '@auth0/nextjs-auth0/client';
import '@/styles/globals.css';
import '@/components/SupportTeamComponents/TicketComments/styles.scss'

import { GeneralDetailsProvider } from '@/contexts';

export default function App({ Component, pageProps }: AppProps) {

  
  return (
      <UserProvider>
        <GeneralDetailsProvider>
          <Component {...pageProps} />
        </GeneralDetailsProvider>
      </UserProvider>
  );
}

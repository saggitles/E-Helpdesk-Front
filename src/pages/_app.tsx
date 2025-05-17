import type { AppProps } from 'next/app';
import { SessionProvider } from 'next-auth/react';
import Layout from '@/components/auth/ProtectedLayout';
import '@/styles/globals.css';
import '@/components/SupportTeamComponents/TicketComments/styles.scss';
import { GeneralDetailsProvider } from '@/contexts';

export default function App({
  Component,
  pageProps: { session, ...pageProps },
}: AppProps) {
  return (
    <SessionProvider session={session}>
      <GeneralDetailsProvider>
        <Layout>
          <Component {...pageProps} />
        </Layout>
      </GeneralDetailsProvider>
    </SessionProvider>
  );
}

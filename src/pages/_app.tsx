// pages/_app.tsx
import type { AppProps } from 'next/app';
import '@/styles/globals.css';
import '@/components/SupportTeamComponents/TicketComments/styles.scss';
import { GeneralDetailsProvider } from '@/contexts';

export default function App({ Component, pageProps }: AppProps) {
  return (
    <GeneralDetailsProvider>
      <Component {...pageProps} />
    </GeneralDetailsProvider>
  );
}

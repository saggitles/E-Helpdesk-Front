import React, { useState, useEffect, useReducer } from 'react';
import { useRouter } from 'next/router';
import Loading from '../components/generalComponents/Loading';
import {
  CostumerComponents,
  SiteDetails,
  EquipmentDetails,
  WebsiteSettings,
  Timeline,
  Event,
  DriverHistory,
} from '@/components/homeComponents';
import { ButtonRole } from '@/components/generalComponents/ButtonRole';
import { PendingTickets } from '@/components/SupportTeamComponents';
import { AdminComponents } from '@/components/AdminComponents';
import Alert, {
  EscalateType,
} from '../components/generalComponents/alerts';
import { GetServerSideProps, InferGetServerSidePropsType } from 'next';
import { getToken } from '@/utils';
import unresolvedTicketsReducer, {
  initialUnresolvedTicketsState,
} from '@/reducers/UnresolvedTickets/reducer';
import { getUnresolvedTickets } from '@/services/api';
import { UnresolvedTicketActionType } from '@/reducers/UnresolvedTickets/types';
import { useGenerateDetails } from '@/contexts';
import { Avatar } from '@mui/material';

export default function Home() {
  const router = useRouter();
  const [apiStatus, setApiStatus] = useState<
    'loading' | 'online' | 'offline'
  >('loading');
  const [diagnosticInfo, setDiagnosticInfo] = useState({
    apiUrl: '',
    nodeEnv: '',
    basePath: '',
    assetPrefix: '',
  });

  useEffect(() => {
    // Set diagnostic info for display
    setDiagnosticInfo({
      apiUrl: process.env.NEXT_PUBLIC_API_URL || 'Not set',
      nodeEnv: process.env.NODE_ENV || 'Not set',
      basePath: router.basePath || 'Not set',
      assetPrefix: process.env.NEXT_PUBLIC_BASE_PATH || 'Not set',
    });

    // Check API status
    const checkApi = async () => {
      try {
        const response = await fetch(
          `${process.env.NEXT_PUBLIC_API_URL}/health`,
          {
            method: 'GET',
            headers: {
              'Content-Type': 'application/json',
            },
          }
        );

        if (response.ok) {
          setApiStatus('online');
          
          // Redirect after successful API check
          setTimeout(() => {
            router.push('/support/tickets/pending');
          }, 3000);
        } else {
          setApiStatus('offline');
        }
      } catch (error) {
        setApiStatus('offline');
      }
    };

    checkApi();
  }, [router]);

  return (
    <div className='min-h-screen flex flex-col items-center justify-center bg-gray-100 p-4'>
      <div className='bg-white shadow-xl rounded-lg p-8 max-w-3xl w-full'>
        <div className='text-center mb-8'>
          <h1 className='text-3xl font-bold text-gray-800 mb-2'>
            E-Helpdesk Diagnostic Page
          </h1>
          <p className='text-gray-600'>
            Redirecting to dashboard in a few seconds...
          </p>
        </div>

        <div className='mb-6'>
          <div className='flex items-center justify-center mb-4'>
            <div
              className={`w-4 h-4 rounded-full mr-2 ${
                apiStatus === 'online'
                  ? 'bg-green-500'
                  : apiStatus === 'offline'
                  ? 'bg-red-500'
                  : 'bg-yellow-500'
              }`}
            ></div>
            <span className='font-semibold'>
              API Status:{' '}
              {apiStatus === 'loading'
                ? 'Checking...'
                : apiStatus === 'online'
                ? 'Online'
                : 'Offline'}
            </span>
          </div>
        </div>

        {/* Environment Information */}
        <div className='border border-gray-200 rounded-lg p-4 mb-6'>
          <h2 className='font-bold text-lg mb-2'>
            Environment Diagnostics
          </h2>
          <div className='grid grid-cols-1 gap-2'>
            <div className='flex items-start'>
              <span className='font-medium w-28'>API URL:</span>
              <code className='bg-gray-100 px-2 py-1 rounded text-sm flex-1 overflow-auto'>
                {diagnosticInfo.apiUrl}
              </code>
            </div>
            <div className='flex items-start'>
              <span className='font-medium w-28'>Node Env:</span>
              <code className='bg-gray-100 px-2 py-1 rounded text-sm'>
                {diagnosticInfo.nodeEnv}
              </code>
            </div>
            <div className='flex items-start'>
              <span className='font-medium w-28'>Base Path:</span>
              <code className='bg-gray-100 px-2 py-1 rounded text-sm'>
                {diagnosticInfo.basePath}
              </code>
            </div>
            <div className='flex items-start'>
              <span className='font-medium w-28'>Asset Prefix:</span>
              <code className='bg-gray-100 px-2 py-1 rounded text-sm'>
                {diagnosticInfo.assetPrefix}
              </code>
            </div>
          </div>
        </div>

        <div className='flex justify-between'>
          <button
            onClick={() => router.push('/support/vehicle')}
            className='bg-blue-600 hover:bg-blue-700 text-white font-bold py-2 px-4 rounded focus:outline-none focus:shadow-outline'
          >
            Go to Dashboard Now
          </button>

          <button
            onClick={() => window.location.reload()}
            className='bg-gray-500 hover:bg-gray-600 text-white font-bold py-2 px-4 rounded focus:outline-none focus:shadow-outline'
          >
            Refresh Page
          </button>
        </div>
      </div>
    </div>
  );
}

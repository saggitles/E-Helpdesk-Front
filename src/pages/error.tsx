// pages/error.tsx
import { useRouter } from 'next/router';
import { useEffect, useState } from 'react';
import Link from 'next/link';

export default function ErrorPage() {
  const router = useRouter();
  const [errorMessage, setErrorMessage] = useState<string | null>(null);

  useEffect(() => {
    if (router.query.message) {
      setErrorMessage(router.query.message as string);
    }
  }, [router.query]);

  return (
    <div className='flex flex-col items-center justify-center min-h-screen bg-gray-100'>
      <div className='p-8 bg-white shadow-md rounded-lg max-w-md w-full'>
        <h1 className='text-2xl font-bold text-red-600 mb-4'>
          Authentication Error
        </h1>
        <p className='text-gray-700 mb-6'>
          {errorMessage || 'An error occurred during authentication'}
        </p>
        <div className='flex gap-4'>
          <Link href='/' legacyBehavior>
            <a className='bg-gray-500 hover:bg-gray-600 text-white font-bold py-2 px-4 rounded'>
              Go to Home
            </a>
          </Link>
          <Link href='/api/auth/login' legacyBehavior>
            <a className='bg-blue-500 hover:bg-blue-700 text-white font-bold py-2 px-4 rounded'>
              Try Again
            </a>
          </Link>
        </div>
      </div>
    </div>
  );
}

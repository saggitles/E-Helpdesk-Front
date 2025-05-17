import { useEffect, useState } from 'react';
import { getProviders, signIn, useSession } from 'next-auth/react';
import { useRouter } from 'next/router';

export default function SignIn() {
  const [providers, setProviders] = useState<any>({});
  const { data: session } = useSession();
  const router = useRouter();
  const callbackUrl =
    router.query.callbackUrl?.toString() || '/support/create/ticket';

  useEffect(() => {
    // If user is already signed in, redirect to callback URL or homepage
    if (session) {
      router.push(callbackUrl);
      return;
    }

    // Fetch providers client-side
    const loadProviders = async () => {
      const response = await getProviders();
      setProviders(response || {});
    };

    loadProviders();
  }, [session, router, callbackUrl]);

  return (
    <div className='min-h-screen flex items-center justify-center bg-teal-50'>
      <div className='bg-white p-8 rounded-lg shadow-md max-w-md w-full'>
        <h1 className='text-2xl font-bold text-center mb-6'>
          Welcome Back
        </h1>
        <p className='text-gray-600 text-center mb-8'>
          Please sign in with your company account
        </p>

        {Object.values(providers).map((provider: any) => (
          <div key={provider.name} className='mb-3'>
            <button
              onClick={() =>
                signIn(provider.id, {
                  callbackUrl: callbackUrl,
                })
              }
              className='w-full bg-teal-500 hover:bg-teal-600 text-white font-bold py-3 px-4 rounded transition-colors'
            >
              Sign in with {provider.name}
            </button>
          </div>
        ))}
      </div>
    </div>
  );
}

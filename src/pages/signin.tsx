import { GetServerSideProps } from 'next';
import { getProviders, signIn } from 'next-auth/react';
import { getServerSession } from 'next-auth/next';
import { authOptions } from '../api/auth/[...nextauth]';

interface SignInProps {
  providers: any;
}

export default function SignIn({ providers }: SignInProps) {
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
                  callbackUrl: '/support/create/ticket',
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

export const getServerSideProps: GetServerSideProps = async (context) => {
  const session = await getServerSession(
    context.req,
    context.res,
    authOptions
  );

  // If user is already signed in, redirect to callback URL or homepage
  if (session) {
    return {
      redirect: {
        destination: context.query.callbackUrl?.toString() || '/',
        permanent: false,
      },
    };
  }

  // Get providers for sign in page
  const providers = await getProviders();

  return {
    props: { providers: providers ?? {} },
  };
};

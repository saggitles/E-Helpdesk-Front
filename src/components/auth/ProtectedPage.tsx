/* eslint no-use-before-define: 0 */ // --> OFF

import { GetServerSideProps } from 'next';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/pages/api/auth/[...nextauth]';
import ProtectedRoute from '@/components/auth/ProtectedRoute';

export default function ProtectedPage({ data }: { data: string }) {
  return (
    <ProtectedRoute requiredRoles={['admin', 'support']}>
      <div>
        <h1>Protected Content</h1>
        <p>
          This page can only be accessed by authenticated users with admin
          or support roles.
        </p>
        <p>Server-side data: {data}</p>
      </div>
    </ProtectedRoute>
  );
}

export const getServerSideProps: GetServerSideProps = async (context) => {
  const session = await getServerSession(
    context.req,
    context.res,
    authOptions
  );

  if (!session) {
    return {
      redirect: {
        destination: `/login?callbackUrl=${encodeURIComponent(
          context.resolvedUrl
        )}`,
        permanent: false,
      },
    };
  }

  // Check for roles
  const requiredRoles = ['admin', 'support'];
  const userRoles = session.user?.roles || [];
  const hasRequiredRole = requiredRoles.some((role) =>
    userRoles.includes(role)
  );

  if (!hasRequiredRole) {
    return {
      redirect: {
        destination: '/unauthorized',
        permanent: false,
      },
    };
  }

  return {
    props: {
      session,
      data: 'This is protected data from the server',
    },
  };
};

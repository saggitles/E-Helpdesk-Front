import { useSession } from 'next-auth/react';
import { useRouter } from 'next/router';
import { useEffect, useState } from 'react';

export default function RestrictedPage() {
  const { data: session, status } = useSession();
  const router = useRouter();
  const [content, setContent] = useState<string | null>(null);

  useEffect(() => {
    if (status === 'unauthenticated') {
      router.push('/login?callbackUrl=/restricted');
    } else if (status === 'authenticated') {
      setContent('This is protected content. You can access this content because you are signed in.');
    }
  }, [status, router]);

  if (status === 'loading') {
    return <p>Loading...</p>;
  }

  if (!session) {
    return null;
  }

  return (
    <div>
      <h1>Protected Content</h1>
      <p>{content}</p>
    </div>
  );
}

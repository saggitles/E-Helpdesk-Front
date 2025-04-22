import React, { useState, useEffect } from 'react';
import { useRouter } from 'next/router';
import LoadingScreen from '@/components/generalComponents/LoadingScreen';

interface NavItemProps {
  text: string;
}

const NavItem: React.FC<NavItemProps> = ({ text }) => (
  <li style={{ display: 'inline', marginRight: '10px' }}>
    <a href='#'>{text}</a>
  </li>
);

const NavBar: React.FC = () => {
  const handleLogout = () => {
    window.location.href = `/api/auth/logout?returnTo=${encodeURIComponent(
      process.env.NEXT_PUBLIC_AUTH0_POST_LOGOUT_REDIRECT_URI!
    )}`;
  };
  const [isLoading, setIsLoading] = useState(false);
  const router = useRouter();
  const handleRedirect = (url: string) => {
    if (router.pathname !== url) {
      setIsLoading(true);
      router.push(url);
    }
  };

  useEffect(() => {
    const handleRouteChangeComplete = () => {
      setIsLoading(false);
    };

    router.events.on('routeChangeComplete', handleRouteChangeComplete);

    return () => {
      router.events.off('routeChangeComplete', handleRouteChangeComplete);
    };
  }, [router.events]);

  return (
    <nav style={{ backgroundColor: '#2eb8b6', overflow: 'auto' }}>
      <div style={{ position: 'relative' }}>
        <div
          style={{
            position: 'absolute',
            top: '50%',
            transform: 'translateY(30%)',
          }}
        >
          <h1
            style={{
              marginLeft: '30px',
              font: 'Arial',
              color: 'white',
              fontSize: '20px',
            }}
          >
            E-Helpdesk
          </h1>
        </div>
      </div>
      <div
        style={{
          marginBottom: '55px',
          display: 'flex',
          justifyContent: 'flex-end',
          position: 'relative',
          fontFamily: 'Arial',
          color: 'white',
        }}
      >
        {isLoading && <LoadingScreen />}
        <div
          style={{
            position: 'absolute',
            top: '50%',
            transform: 'translateY(55%)',
          }}
        >
          <ul
            style={{
              listStyleType: 'none',
              display: 'flex',
              justifyContent: 'space-around',
            }}
          >
            <li
              className='cursor-pointer'
              style={{ marginRight: '30px' }}
              onClick={() => handleRedirect('/support/tickets/pending')}
            >
              Tickets
            </li>
            <li
              className='cursor-pointer'
              style={{ marginRight: '30px' }}
              onClick={() => handleRedirect('/support/user')}
            >
              User
            </li>
            <li
              className='cursor-pointer'
              style={{ marginRight: '30px' }}
              onClick={() => handleRedirect('/support/vehicle')}
            >
              Vehicle
            </li>
            {/* <li className="cursor-pointer" style={{ marginRight: "30px" }} onClick={() => handleRedirect("/support/guest/tickets")}>Guest tickets</li> */}
            <li
              className='cursor-pointer'
              style={{ marginRight: '30px' }}
              onClick={() => handleRedirect('/support/create/ticket')}
            >
              Create Tickets
            </li>
            <li
              className='cursor-pointer'
              style={{ marginRight: '30px' }}
              onClick={() => handleRedirect('/support/reports/report')}
            >
              Reports
            </li>
            <li
              className='cursor-pointer'
              style={{ marginRight: '30px' }}
              onClick={() => handleRedirect('/support/faq/questions')}
            >
              FAQs
            </li>
            <li
              className='cursor-pointer'
              style={{ marginRight: '30px' }}
              onClick={() => handleLogout()}
            >
              Logout
            </li>
          </ul>
        </div>
      </div>
    </nav>
  );
};

export default NavBar;

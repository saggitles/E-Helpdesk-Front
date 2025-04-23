import React, { useState, useEffect, useRef } from 'react';
import { useRouter } from 'next/router';
import LoadingScreen from '@/components/generalComponents/LoadingScreen';
import { useAuthUser } from '@/lib/auth/auth-hooks';
import { signIn, signOut } from 'next-auth/react';
import Link from 'next/link';
import { createPortal } from 'react-dom';

const NavBar: React.FC = () => {
  const { user } = useAuthUser();
  const [isLoading, setIsLoading] = useState(false);
  const [showProfilePopup, setShowProfilePopup] = useState(false);
  const profilePopupRef = useRef<HTMLDivElement>(null);
  const avatarRef = useRef<HTMLDivElement>(null);
  const router = useRouter();

  const handleRedirect = (url: string) => {
    if (router.pathname !== url) {
      setIsLoading(true);
      router.push(url);
    }
  };

  const handleLogin = () => {
    setIsLoading(true);
    const callbackUrl = router.asPath;
    signIn('google', {
      callbackUrl: callbackUrl !== '/login' ? callbackUrl : '/',
    });
  };

  const handleLogout = () => {
    setIsLoading(true);
    signOut({
      callbackUrl: '/',
    });
  };

  // Toggle profile popup
  const toggleProfilePopup = (e: React.MouseEvent) => {
    e.stopPropagation();
    console.log('Avatar clicked, toggling popup');
    setShowProfilePopup((prev) => !prev);
  };

  // Close popup when clicking outside
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      // Only close if click is outside both the avatar and the popup
      if (
        profilePopupRef.current &&
        !profilePopupRef.current.contains(event.target as Node) &&
        avatarRef.current &&
        !avatarRef.current.contains(event.target as Node)
      ) {
        setShowProfilePopup(false);
      }
    };

    document.addEventListener('mousedown', handleClickOutside);
    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
    };
  }, []);

  useEffect(() => {
    const handleRouteChangeComplete = () => {
      setIsLoading(false);
    };

    router.events.on('routeChangeComplete', handleRouteChangeComplete);

    return () => {
      router.events.off('routeChangeComplete', handleRouteChangeComplete);
    };
  }, [router.events]);

  // Get first letter of user name or email for the avatar
  const getInitials = () => {
    if (!user) return '?';

    if (user.name) {
      return user.name.charAt(0).toUpperCase();
    }

    if (user.email) {
      return user.email.charAt(0).toUpperCase();
    }

    return '?';
  };

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

      {/* Only render the menu items and navigation when user is logged in */}
      {user && (
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
                alignItems: 'center',
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

              {/* Profile Avatar */}
              <li className='relative' style={{ marginRight: '30px' }}>
                <div
                  ref={avatarRef}
                  className='h-8 w-8 rounded-full bg-white text-teal-600 flex items-center justify-center cursor-pointer hover:bg-gray-100'
                  onClick={toggleProfilePopup}
                  aria-label='User profile menu'
                >
                  {getInitials()}
                </div>

                {/* Profile Popup using Portal */}
                {showProfilePopup &&
                  typeof document !== 'undefined' &&
                  createPortal(
                    <div
                      className='fixed inset-0 z-[9999] bg-transparent'
                      onClick={() => setShowProfilePopup(false)}
                      style={{ pointerEvents: 'auto' }}
                    >
                      <div
                        ref={profilePopupRef}
                        className='absolute bg-white rounded-md shadow-lg py-1'
                        style={{
                          top:
                            (avatarRef.current?.getBoundingClientRect()
                              .bottom ?? 0) +
                              window.scrollY +
                              5 || 0,
                          left:
                            (avatarRef.current?.getBoundingClientRect()
                              .left ?? 0) +
                              window.scrollX -
                              200 || 0,
                          width: '250px',
                          boxShadow: '0 4px 12px rgba(0,0,0,0.15)',
                          zIndex: 10000,
                        }}
                        onClick={(e) => e.stopPropagation()}
                      >
                        <div className='px-4 py-3 border-b border-gray-200'>
                          <p className='text-sm font-medium text-gray-900'>
                            {user?.name || 'User'}
                          </p>
                          <p className='text-sm text-gray-500 truncate'>
                            {user?.email}
                          </p>
                        </div>
                        <div className='py-1'>
                          <button
                            onClick={() => {
                              console.log('Logout clicked');
                              handleLogout();
                              setShowProfilePopup(false);
                            }}
                            className='block w-full text-left px-4 py-2 text-sm text-gray-700 hover:bg-gray-100'
                            disabled={isLoading}
                          >
                            <div className='flex items-center'>
                              <svg
                                xmlns='http://www.w3.org/2000/svg'
                                className='h-4 w-4 mr-2'
                                fill='none'
                                viewBox='0 0 24 24'
                                stroke='currentColor'
                              >
                                <path
                                  strokeLinecap='round'
                                  strokeLinejoin='round'
                                  strokeWidth={2}
                                  d='M17 16l4-4m0 0l-4-4m4 4H7m6 4v1a3 3 0 01-3 3H6a3 3 0 01-3-3V7a3 3 0 013-3h4a3 3 0 013 3v1'
                                />
                              </svg>
                              {isLoading ? 'Loading...' : 'Sign out'}
                            </div>
                          </button>
                        </div>
                      </div>
                    </div>,
                    document.body
                  )}
              </li>
            </ul>
          </div>
        </div>
      )}

      {/* Show login button when not logged in */}
      {!user && (
        <div
          style={{
            display: 'flex',
            justifyContent: 'flex-end',
            padding: '15px 30px',
          }}
        >
          <Link href='/login'>
            <button className='bg-teal-600 hover:bg-teal-700 text-white font-bold py-2 px-4 rounded'>
              {isLoading ? 'Loading...' : 'Login'}
            </button>
          </Link>
        </div>
      )}

      {/* Add a style for the animation */}
      <style jsx global>{`
        @keyframes fadeIn {
          from {
            opacity: 0;
            transform: translateY(-10px);
          }
          to {
            opacity: 1;
            transform: translateY(0);
          }
        }
      `}</style>
    </nav>
  );
};

export default NavBar;

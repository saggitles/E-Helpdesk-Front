import { handleAuth, handleLogin, handleLogout } from '@auth0/nextjs-auth0';

export default handleAuth({
  login: handleLogin({
    authorizationParams: {
      audience: 'https://www.ehelpdesk.com'
    },
    returnTo: `${process.env.AUTH0_BASE_URL}/support/create/ticket`,
  }),
  logout: handleLogout({
    returnTo: `${process.env.AUTH0_BASE_URL}/`,
  }),
});

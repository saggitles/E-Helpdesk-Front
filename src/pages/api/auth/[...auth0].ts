import { handleAuth, handleLogin, handleLogout } from '@auth0/nextjs-auth0';

export default handleAuth({
  login: handleLogin({
    authorizationParams: {
      audience: 'https://www.ehelpdesk.com',
      scope: 'openid profile email read:data', // Request specific scopes
      redirect_uri: `${process.env.AUTH0_BASE_URL}/api/auth/callback`, // Custom redirect URI
      // Add any other Auth0 authorization parameters you need
    },
    returnTo: `${process.env.AUTH0_BASE_URL}/support/create/ticket`,
  }),
  logout: handleLogout({
    returnTo: `${process.env.AUTH0_BASE_URL}/`,
  }),
});

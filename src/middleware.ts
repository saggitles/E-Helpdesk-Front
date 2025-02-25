import { withMiddlewareAuthRequired } from '@auth0/nextjs-auth0/edge';

export default withMiddlewareAuthRequired();

export const config = {
    matcher: [
      '/((?!guest/five).*)'  // Aplica el middleware a todas las rutas excepto `/guest/five`
    ]
  };
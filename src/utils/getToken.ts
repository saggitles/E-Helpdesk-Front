// export const getToken = async (): Promise<string | null> => {
//   try {
//     const response = await fetch(
//       http://localhost:3000/api/token
//     );
//     console.log(process.env.NEXT_PUBLIC_AUTH0_BASE_URL)
//     console.log("tokencito")
//     const data = await response.json();

//     if (data?.access_token) {
//       return data.access_token as string;
//     } else {
//       return null;
//     }
//   } catch (error) {
//     return null;
//   }
// };

// import { getSession } from '@auth0/nextjs-auth0';
// import { NextApiRequest, NextApiResponse } from 'next';

// export const getToken = async (req: NextApiRequest, res: NextApiResponse): Promise<string | null> => {
//   try {

//     console.log("aca debe estar el token")

//     const session = await getSession(req, res);

//     // Verifica si session es nulo o indefinido
//     if (!session) { 
//       return null;
//     }

//     // Verifica si session.accessToken existe antes de acceder a él
//     if (!session.accessToken) {
//       return null;
//     }

//     console.log("El token por dios")

//     console.log(session.accessToken)

//     // Ahora puedes usar session.accessToken para hacer una solicitud a tu API
//     // ...

//     // Ejemplo de solicitud a una API ficticia
//     const apiResponse = await fetch('http://localhost:8080/api/users', {
//       headers: {
//         Authorization: Bearer ${session.accessToken},
//       },
//     });

//     const apiData = await apiResponse.json();

//     // Hacer algo con apiData

//     // Devuelve el token como cadena
//     return session.accessToken;
//   } catch (error) {
//     console.error('Error al obtener el token de acceso o al hacer una solicitud a la API:', error);
//     return null;
//   }
// };




//-------------Token Aplicacion -------------------------
import axios from 'axios';


export const getToken = async () => {


  try {
    const auth0TokenUrl = `https://${process.env.NEXT_PUBLIC_AUTH0_DOMAIN}/oauth/token`;

    const response = await axios.post(
      auth0TokenUrl,
      {
        grant_type: 'client_credentials',
        client_id: process.env.AUTH0_CLIENT_ID,
        client_secret: process.env.AUTH0_CLIENT_SECRET,
        audience: `https://www.ehelpdesk.com`   
      }
    );

    const accessToken = response.data.access_token;


    console.log("Aca esta el token de la aplicacion")
    console.log(accessToken)
    return accessToken;
  } catch (error) {
    console.error('Error al obtener el token de acceso:', error);
    return null;
  }
};
//-------------Token Aplicacion -------------------------





//-------------TOKEN USUARIO-------------------
// import { getAccessToken, withApiAuthRequired } from '@auth0/nextjs-auth0';

// export default withApiAuthRequired(async function products(req, res) {
//   // If your access token is expired and you have a refresh token
//   // getAccessToken will fetch you a new one using the refresh_token grant
//   const { accessToken } = await getAccessToken(req, res,);
//   const response = await fetch('http://localhost:8080/api/roles', {
//     headers: {
//       Authorization: Bearer ${accessToken}
//     }
//   });
//   const products = await response.json();
//   res.status(200).json(products);
// });
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





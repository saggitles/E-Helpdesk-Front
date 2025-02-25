const axios = require('axios');


export const getToken = async () => {
  try {
    const response = await axios.post(
      `${process.env.AUTH0_ISSUER_BASE_URL}/oauth/token`,
      {
        grant_type: process.env.AUDIENCE,
        client_id: process.env.AUTH0_CLIENT_ID,
        client_secret: process.env.AUTH0_CLIENT_SECRET,
        audience: process.env.AUTH0_ISSUER_BASE_URL,
      }
    );

    const accessToken = response.data.access_token;
    return accessToken

  } catch (error) {
    if (error instanceof Error) {
        console.error('Error:', error.message);
      } else {
        console.error('Error desconocido:', error);
      }
  }
};


import axios from 'axios';

const CLIENT_ID = 'A5aQWK2jyYAjxAgfSoXKKrRqJLHHoXwA';
const CLIENT_SECRET = 'r8Io4D8iSkp6s2c3InTJ7xHG4-3Pc1RdT0MJmGWLLGWEiYLyVNTvEU46t7mQpTyT';
const AUDIENCE = 'https://e-helpdesk-back-dgcjdsb9djh2hgbn.eastus-01.azurewebsites.net';
const DOMAIN = 'https://dev-so03q0yu6n6ltwg2.us.auth0.com';

export const getToken = async (): Promise<string | null> => {
  try {
    const response = await axios.post(`${DOMAIN}/oauth/token`, {
      client_id: CLIENT_ID,
      client_secret: CLIENT_SECRET,
      audience: AUDIENCE,
      grant_type: 'client_credentials',
    });

    const { access_token } = response.data;
    
    return access_token;
  } catch (error) {
    return null;
  }
};





import { NextApiRequest, NextApiResponse } from 'next';
import axios from 'axios';

export default async function handler(
  _: NextApiRequest,
  res: NextApiResponse
) {
  try {
    const response = await axios.post('http://localhost:3001/api/token', {
      // Si necesitas enviar datos adicionales, puedes hacerlo aquí
    });

    if (response.data && response.data.access_token) {
      const { access_token } = response.data;
      return res.status(200).json({ access_token });
    } else {
      console.error('Problema con el token');
      return res.status(403).json({ error: 'Problems with token' });
    }
  } catch (error: any) {
    console.error('api error', error.message);
    return res.status(error.response?.status || 500).json({
      code: error.response?.data?.code || 'UNKNOWN_ERROR',
      error: error.message,
    });
  }
}

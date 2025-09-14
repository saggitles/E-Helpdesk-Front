import axios from 'axios';
import { getToken } from '@/utils';

const BASE_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:3000';

// Create axios instance
const api = axios.create({
  baseURL: BASE_URL,
  timeout: 30000,
  headers: {
    'Content-Type': 'application/json',
  },
});

// Request interceptor to add auth token
api.interceptors.request.use(
  (config) => {
    const token = localStorage.getItem('accessToken');
    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }
    return config;
  },
  (error) => Promise.reject(error)
);

// Response interceptor for error handling
api.interceptors.response.use(
  (response) => {
    return response;
  },
  (error) => {
    if (error.response?.status === 401) {
      localStorage.removeItem('accessToken');
      window.location.href = '/login';
    }
    return Promise.reject(error);
  }
);

interface IAxios {
  method: 'GET' | 'POST' | 'PUT' | 'DELETE';
  url: string;
  data?: any;
  config?: AxiosRequestConfig<any>;
}

const useAxios = async <T>({
  method,
  url,
  data,
  config,
}: IAxios): Promise<T> => {
  const token = await getToken();

  const defaultInstance = async () => {
    return (await api
      .get(url, {
        ...config,
        headers: {
          ...config?.headers,
          Authorization: `Bearer ${token}`,
        },
      })
      .then((res) => res.data)
      .catch(() => null)) as T;
  };

  switch (method) {
    case 'GET':
      return await defaultInstance();
    case 'POST':
      return (await api
        .post(url, data, config)
        .then((res) => res.data)
        .catch(() => null)) as T;
    case 'PUT':
      return (await api
        .put(url, data, config)
        .then((res) => res.data)
        .catch(() => null)) as T;
    case 'DELETE':
      return (await api
        .delete(url, config)
        .then((res) => res.data)
        .catch(() => null)) as T;
    default:
      return await defaultInstance();
  }
};

// TODO: ADD TYPES FOR DATA
export const sendEmail = (data: any) => {
  return useAxios({
    method: 'POST',
    url: '/api/email/send',
    data,
  });
};

// TODO: ADD TYPES FOR DATA
export const remindNew = (data: any) => {
  return useAxios({
    method: 'POST',
    url: '/api/remind/new',
    data,
    config: {
      headers: {
        'Content-Type': 'application/x-www-form-urlencoded',
      },
    },
  });
};

export const getDriverHistory = (equipmentId: string) => {
  return useAxios<DriverHistoryType[]>({
    method: 'GET',
    url: `/api/driver/history/${equipmentId}`,
  });
};

export const getHomeEquipment = (
  equipmentId: string,
  params: { customer: string }
) => {
  return useAxios<{
    impact: CategoryType['impacts'];
    preop: CategoryType['preop'];
    session: CategoryType['sessions'];
  }>({
    method: 'GET',
    url: `/api/home/${equipmentId}`,
    config: {
      params,
    },
  });
};

export const getHomeSiteDetails = (params: { customer: string }) => {
  return useAxios<GeneralDetailsType>({
    method: 'GET',
    url: `/api/home/site/details`,
    config: {
      params,
    },
  });
};

export const getTimeline = (equipmentId: string) => {
  return useAxios({
    method: 'GET',
    url: `/api/timeline/${equipmentId}`,
  });
};

export const getEquipment = async <T>(equipmentId: string) => {
  return await useAxios<T>({
    method: 'GET',
    url: `/api/equipment/${equipmentId}`,
  });
};

export const getDriversByEquipment = <T>(equipmentId: string) => {
  return useAxios<T>({
    method: 'GET',
    url: `/api/driver/${equipmentId}`,
  });
};

export const newTicket = async (data: any) => {
  const token = await getToken();
  try {
    const response = await api.post('/tickets', data, {
      headers: {
        Authorization: `Bearer ${token}`,
      },
    });
    return response.data;
  } catch (error) {
    return Promise.reject(error);
  }
};

type GetCustomerDetails = {
  customer: string;
  region: string;
  location: string;
  department: string;
};

export const getCustomerDetails = (params: {
  customer: string;
  equipmentId: string;
}) => {
  return useAxios<GetCustomerDetails>({
    method: 'GET',
    url: `/api/customer/details`,
    config: {
      params,
    },
  });
};

export const getWebsiteSettings = (equipmentId: string) => {
  return useAxios({
    method: 'GET',
    url: `/api/home/website/settings/${equipmentId}`,
  });
};

export const getMasterCodes = (equipmentId: string) => {
  return useAxios({
    method: 'GET',
    url: `/api/master/lists/${equipmentId}`,
  });
};

export const getBlacklist = (equipmentId: string) => {
  return useAxios({
    method: 'GET',
    url: `/api/driver/list/black-list/${equipmentId}`,
  });
};

export const getExpiredLicenses = async (equipmentID: string) => {
  const token = localStorage.getItem('token');

  await axios
    .get(`/api/driver/list/expired-lic/${equipmentID}`, {
      headers: { Authorization: `Bearer ${token}` },
    })
    .catch((error) => {
      console.log(error);
    });
};

export const getAllDrivers = async (equipmentID: string) => {
  const token = localStorage.getItem('token');

  await axios
    .get(`/api/driver/history/${equipmentID}`, {
      headers: { Authorization: `Bearer ${token}` },
    })
    .catch((error) => {
      console.log(error);
    });
};

export const getDriversWithExpiredLicenses = (
  equipmentId: string,
  token: string
) => {
  return useAxios({
    method: 'GET',
    url: `/api/driver/list/expired-lic/${equipmentId}`,
  });
};

export const getUnresolvedTickets = async () => {
  const token = await getToken();

  try {
    const response = await api.get('/tickets/unresolved', {
      headers: {
        Authorization: `Bearer ${token}`,
      },
    });
    return response.data;
  } catch (error) {
    return Promise.reject(error);
  }
};


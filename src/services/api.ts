import { DriverHistoryType } from '@/components/homeComponents/DriverHistory';
import { CategoryType } from '@/components/homeComponents/Events';
import { GeneralDetailsType } from '@/components/homeComponents/SiteDetails';
import { TicketInfo } from '@/reducers/UnresolvedTickets/types';
import { getToken } from '@/utils';
import axios, { AxiosRequestConfig } from 'axios';

const BASE_URL = `${process.env.NEXT_PUBLIC_API_URL}/`; // TODO: ADD BASE URL FROM ENV

// Log the database connection configuration
console.log(`API URL configured as: ${process.env.NEXT_PUBLIC_API_URL}`);

const instance = axios.create({
  baseURL: BASE_URL,
  timeout: 1000,
});

// Add an interceptor to log successful connections
instance.interceptors.response.use(
  (response) => {
    if (response.status >= 200 && response.status < 300) {
      console.log(`✅ Successful connection to the database at ${process.env.NEXT_PUBLIC_API_URL}`);
      // You can add more details if the response includes database name information
      if (response.data?.databaseName) {
        console.log(`Database name: ${response.data.databaseName}`);
      }
    }
    return response;
  },
  (error) => {
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
    return (await instance
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
      return (await instance
        .post(url, data, config)
        .then((res) => res.data)
        .catch(() => null)) as T;
    case 'PUT':
      return (await instance
        .put(url, data, config)
        .then((res) => res.data)
        .catch(() => null)) as T;
    case 'DELETE':
      return (await instance
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

export const newTicket = (data: any) => {
  return useAxios({
    method: 'POST',
    url: `/api/ticket/new`,
    data,
  });
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

  console.log("Aca debe estar el token. Caul es el problema????")

  const token = localStorage.getItem('token');

  console.log(token)

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
  const data = await useAxios<TicketInfo[] | null>({
    method: 'GET',
    url: `/api/tickets`,
  });
  return data;
};


import React, { useState, useEffect, ChangeEvent } from 'react';
import axios from 'axios';
import NavBar from '@/generic_comp/navbar';
import Searchbar from '@/generic_comp/searchbar';
interface Device {
  deviceId: string;
  connectionState: number;
  lastActivityTime: string;
  cloudToDeviceMessageCount?: number;
  properties?: any; // Update this with the correct type if possible
  vehicleDesignation?: string;
}

const IoTDeviceList: React.FC = () => {
  const [devices, setDevices] = useState<Device[]>([]);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [newDeviceId, setNewDeviceId] = useState('');

  const handleCreateNewDevice = () => {
    setIsModalOpen(true);
  };

  const handleModalClose = () => {
    setIsModalOpen(false);
    setNewDeviceId('');
  };

  const handleInputChange = (event: ChangeEvent<HTMLInputElement>) => {
    setNewDeviceId(event.target.value);
  };

  const handleCreateDeviceSubmit = () => {
    // Get user token from local storage
    const userToken = localStorage.getItem('accessToken');

    if (!userToken) {
      console.error('Access token not found');
      return;
    }

    // Endpoint to fetch user details
    const userInfoEndpoint = 'https://dev-so03q0yu6n6ltwg2.us.auth0.com/userinfo';

    // Fetch user details using the access token
    fetch(userInfoEndpoint, {
      headers: {
        Authorization: `Bearer ${userToken}`
      }
    })
      .then(response => {
        if (!response.ok) {
          throw new Error('Failed to fetch user details');
        }
        return response.json();
      })
      .then(userData => {
        // Retrieve email from user data
        const userEmail = userData.email;

        // Endpoint to fetch user from your database
        const userEndpoint = `${process.env.NEXT_PUBLIC_API_URL}/api/users/?email=${userEmail}`;

        // Fetch user from your database with authorization token
        return fetch(userEndpoint, {
          headers: {
            Authorization: `Bearer ${userToken}`
          }
        });
      })
      .then(response => {
        if (!response.ok) {
          throw new Error('Failed to fetch user from database');
        }
        return response.json();
      })
      .then(userData => {
        // Retrieve IoT access token from user data
        const iotUserToken = userData[0].IoTAccessToken;

        // Construct endpoint with IoT access token
        const endpoint = `https://godev.collectiveintelligence.com.au/FleetXQ-8735218d-3aeb-4563-bccb-8cdfcdf1188f/dataset/api/iothubmanager/RegisterNewIoTDevice?_user_token=${iotUserToken}`;

        const formData = new FormData();
        formData.append('deviceId', newDeviceId);

        // Send POST request to register new device
        return fetch(endpoint, {
          method: 'POST',
          body: formData
        });
      })
      .then(response => {
        if (!response.ok) {
          throw new Error('Failed to register device');
        }
        console.log('Device registered successfully');
        handleModalClose(); // Close the modal after successful registration
      })
      .catch(error => {
        console.error('Error registering device:', error);
        handleModalClose();
        window.location.reload();
      });
  };

  useEffect(() => {
    const fetchData = async () => {
      try {
        const token = localStorage.getItem('accessToken');
        const config = {
          headers: {
            Authorization: `Bearer ${token}` // Include the authorization token in the request headers
          }
        }

        const response = await axios.post<string>(`${process.env.NEXT_PUBLIC_API_URL}/api/iotdevices`, { Filter: 'none' }, config);

        console.log(response.data); // Log the response data to inspect its structure

        // Parse the JSON string into an array of objects
        const devicesData = JSON.parse(response.data);

        // Now you can map over devicesData
        const formattedDevices = devicesData.map((device: any) => ({
          deviceId: device.deviceId,
          connectionState: device.connectionState,
          lastActivityTime: device.lastActivityTime,
          cloudToDeviceMessageCount: device.cloudToDeviceMessageCount,
          properties: {
            lastUpdated: device.properties.$metadata.$lastUpdated,
            version: device.properties.$version
            // Add more properties as needed
          },
          vehicleDesignation: device.vehicleDesignation
        }));
        setDevices(formattedDevices);
      } catch (error) {
        console.error('Error fetching devices:', error);
      }
    };

    fetchData();
  }, []);



  return (
    <div>
      <NavBar />
      <div className="container mx-auto">
        <h1 className="text-blue-950 font-lato text-3xl mb-8 mt-8 font-bold">Device List</h1>

        <div className="flex justify-between items-center" style={{ backgroundColor: "#f8f4f4" }}>
          <div className="flex justify-start ml-4">
            <input
              type="search"
              onChange={(e) => {
                const query = e.target.value.toLowerCase();
              }}
              placeholder="Search"
              className="p-2 text-sm bg-white border border-gray-300 rounded-md "
            />
          </div>
          <button onClick={handleCreateNewDevice} className="text-white font-bold py-2 px-10 rounded-lg mb-4 mt-4 mr-4" style={{ backgroundColor: "#30bcb4" }}>
            Create New
          </button>
        </div>


        {isModalOpen && (
          <div className="fixed inset-0 flex items-center justify-center z-50">
            <div className="absolute inset-0 bg-gray-500 opacity-75"></div>
            <div className="bg-white p-8 rounded shadow-lg z-50">
              <h2 className="text-lg font-bold mb-4">Create New Device</h2>
              <div className="flex flex-wrap -mx-2">
                <div className="w-1/2 px-2 mb-4">
                  <div className="flex items-center mb-4 space-x-2">
                    <p className="flex-shrink-0 whitespace-nowrap" style={{ width: '150px' }}>Device ID</p>
                    <input type="text" value={newDeviceId} onChange={handleInputChange} className="border rounded-md px-4 py-2 flex-grow" style={{ backgroundColor: "#ecf4f4" }} />
                  </div>
                  <div className="flex items-center mb-4 space-x-2">
                    <p className="flex-shrink-0 whitespace-nowrap" style={{ width: '150px' }}>Connection State</p>
                    <input type="text" value={newDeviceId} onChange={handleInputChange} className="border rounded-md px-4 py-2 flex-grow" style={{ backgroundColor: "#ecf4f4" }} />
                  </div>
                  <div className="flex items-center mb-4 space-x-2">
                    <p className="flex-shrink-0 whitespace-nowrap" style={{ width: '150px' }}>Last Activity Time</p>
                    <input type="text" value={newDeviceId} onChange={handleInputChange} className="border rounded-md px-4 py-2 flex-grow" style={{ backgroundColor: "#ecf4f4" }} />
                  </div>
                  <div className="flex items-center mb-4 space-x-2">
                    <p className="flex-shrink-0 whitespace-nowrap" style={{ width: '150px' }}>Last Updated</p>
                    <input type="text" value={newDeviceId} onChange={handleInputChange} className="border rounded-md px-4 py-2 flex-grow" style={{ backgroundColor: "#ecf4f4" }} />
                  </div>
                </div>
                <div className="w-1/2 px-2 mb-4">
                  <div className="flex items-center mb-4 space-x-2">
                    <p className="flex-shrink-0 whitespace-nowrap" style={{ width: '150px' }}>Message Count</p>
                    <input type="text" value={newDeviceId} onChange={handleInputChange} className="border rounded-md px-4 py-2 flex-grow" style={{ backgroundColor: "#ecf4f4" }} />
                  </div>
                  <div className="flex items-center mb-4 space-x-2">
                    <p className="flex-shrink-0 whitespace-nowrap" style={{ width: '150px' }}>Version</p>
                    <input type="text" value={newDeviceId} onChange={handleInputChange} className="border rounded-md px-4 py-2 flex-grow" style={{ backgroundColor: "#ecf4f4" }} />
                  </div>
                  <div className="flex items-center mb-4 space-x-2">
                    <p className="flex-shrink-0 whitespace-nowrap" style={{ width: '150px' }}>Vehicle Designation</p>
                    <input type="text" value={newDeviceId} onChange={handleInputChange} className="border rounded-md px-4 py-2 flex-grow" style={{ backgroundColor: "#ecf4f4" }} />
                  </div>
                </div>
              </div>


              <div className="flex justify-end mt-4">
                <button onClick={handleCreateDeviceSubmit} className="text-white font-bold py-2 px-4 rounded mr-2" style={{ backgroundColor: "#30bcb4" }}>Create</button>
                <button onClick={handleModalClose} className="bg-gray-300 hover:bg-gray-400 text-gray-800 font-bold py-2 px-4 rounded">Cancel</button>
              </div>
            </div>


          </div>
        )}
        <div className="overflow-x-auto font-lato">
          <table className="table-auto border-collapse w-full">
            <thead>
              <tr>
                <th className="px-12 py-2 text-lg text-center">Device ID</th>
                <th className="px-12 py-2 text-lg text-center">Connection State</th>
                <th className="px-12 py-2 text-lg text-center">Last Activity Time</th>
                <th className="px-12 py-2 text-lg text-center">Message Count</th>
                <th className="px-12 py-2 text-lg text-center">Last Updated</th>
                <th className="px-12 py-2 text-lg text-center">Version</th>
                <th className="px-12 py-2 text-lg text-center">Vehicle Designation</th>
              </tr>
            </thead>
            <tbody>
              {devices.map((device: Device, index: number) => (
                <tr key={index} className="hover:bg-[#b0c434] hover:text-white cursor-pointer">
                  <td className="px-12 py-2 text-center">{device.deviceId}</td>
                  <td className="px-12 py-2 text-center">{device.connectionState}</td>
                  <td className="px-12 py-2 text-center">{device.lastActivityTime}</td>
                  <td className="px-12 py-2 text-center">{device.cloudToDeviceMessageCount}</td>
                  <td className="px-12 py-2 text-center">{device.properties ? device.properties.lastUpdated : ""}</td>
                  <td className="px-12 py-2 text-center">{device.properties ? device.properties.version : ""}</td>
                  <td className="px-12 py-2 text-center">{device.vehicleDesignation}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>





      </div>
    </div>

  );
};

export default IoTDeviceList;

import React, { useState, useEffect } from 'react';
import axios from 'axios';


export const RoleAssignment = () => {
  // Datos de ejemplo (reem,plaza con tus datos reales)


  const [appToken, setAppToken] = useState('')

  const [users, setUsers] = useState([
    { id: 1, name: 'Usuario 1', role: 'Customer', lastActivity: '2023-09-01', status: 'Activo' },
    { id: 2, name: 'Usuario 2', role: 'Admin', lastActivity: '2023-09-05', status: 'Inactivo' },
    { id: 3, name: 'Usuario 3', role: 'Admin', lastActivity: '2023-09-05', status: 'Inactivo' },
    // Agrega más usuarios según sea necesario
  ]);

  const handleChangeRole = (userId: number, newRole: string) => {
    // Lógica para cambiar el rol de usuario
    // Actualiza el estado con el nuevo rol
    const updatedUsers = users.map(user => {
      if (user.id === userId) {
        return { ...user, role: newRole };
      }
      return user;
    });
    setUsers(updatedUsers);
  };

  const getUsers = async () =>{
    
    const appToken = localStorage.getItem('appToken') || '';

    try {
     
      const usersResponse = await axios.get(`https://dev-og8ybjajr0y1c7xp.us.auth0.com/api/v2/users`, {
        headers: {
          Authorization: `Bearer ${appToken}`,
        },
        params: {
          app_metadata: {
            your_app_identifier: true, 
          },
        },
      });
  
      const users = usersResponse.data;
     
    } catch (error) {
      console.error('Error al obtener los usuarios:', error);
    }

  }

  useEffect(() => {
    getUsers();
  }, []);

  return (
    <div className="text-center">
      <h1 className="text-2xl font-semibold mb-4">Assign roles</h1>
      <div className="mx-auto w-full max-w-3xl">
        <table className="w-full">
          <thead>
            <tr>
              <th>User</th>
              <th>Role</th>
              <th>Last Activity</th>
              <th>Status</th>
            </tr>
          </thead>
          <tbody>
            {users.map(user => (
              <tr key={user.id}>
                <td>{user.name}</td>
                <td>
                  <select
                    value={user.role}
                    onChange={(e) => handleChangeRole(user.id, e.target.value)}
                    className="w-full"
                  >
                    <option value="Customer">Customer</option>
                    <option value="Admin">Admin</option>
                    {/* Agrega más roles según sea necesario */}
                  </select>
                </td>
                <td>{user.lastActivity}</td>
                <td>{user.status}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
};

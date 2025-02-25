"use client";

import { Navbar } from '@material-tailwind/react';
import React from 'react';
import NavBar from '@/generic_comp/navbar';
import Navsearch from '@/generic_comp/navsearch';

interface User {
  name: string;
  lastName: string;
  department: string;
  licence: string;
  fCode: string;
  badgePin: string;
  weigand: string;
  mCodeAccess: string;
  email: string;
  username: string;
  lastWeekVehicles: string[];
  denyVehicles: string[];
}

const UserDashboard: React.FC = () => {
  const users: User[] = [
    {
      name: 'Felipe',
      lastName: 'Sarmiento',
      department: 'Access-lvl: 1',
      licence: 'Active - Model',
      fCode: '123',
      badgePin: '12345',
      weigand: '123FA47',
      mCodeAccess: 'Unlock for MM',
      email: 'something@hotmail.com',
      username: 'Felipesarm1',
      lastWeekVehicles: ['P1', 'P2', 'P3'],
      denyVehicles: ['P5', 'P6'],
    },
    {
      name: 'Maria',
      lastName: 'Gonzalez',
      department: 'Access-lvl: 2',
      licence: 'Active - Admin',
      fCode: '456',
      badgePin: '67890',
      weigand: '456WE78',
      mCodeAccess: 'Full Access',
      email: 'maria.gonzalez@example.com',
      username: 'mariagonz',
      lastWeekVehicles: ['V1', 'V2'],
      denyVehicles: ['V4'],
    },
    {
      name: 'John',
      lastName: 'Doe',
      department: 'Access-lvl: 1',
      licence: 'Active - User',
      fCode: '789',
      badgePin: '11223',
      weigand: '789JD12',
      mCodeAccess: 'Unlock for Admin',
      email: 'john.doe@example.com',
      username: 'johndoe',
      lastWeekVehicles: ['V2', 'V3'],
      denyVehicles: ['V5'],
    },
  ];

  return (
    <div>
        <NavBar/>
        <Navsearch/>

      <div className="bg-gray-100 min-h-screen p-8">
        <h1 className="text-3xl font-bold mb-6 text-gray-800">User Diagnostics Dashboard</h1>
        <div className="grid grid-cols-3 gap-6">
          {users.map((user, index) => (
            <div key={index} className="bg-white shadow-lg rounded-lg p-6 border border-gray-300">
              <div className="grid grid-cols-2 items-center mb-4">
                <div className="w-24 h-24 flex items-center justify-center">
                  <img src="/user.png" alt="User" className="w-full h-full object-contain" />
                </div>
                <div>
                  <h2 className="text-xl font-semibold text-gray-800">
                    {user.name} {user.lastName}
                  </h2>
                  <p className="text-gray-600 text-sm">
                    <strong>Department:</strong> {user.department}
                  </p>
                  <p className="text-gray-600 text-sm">
                    <strong>Licence:</strong> {user.licence}
                  </p>
                </div>
              </div>
              <hr className="border-gray-300 mb-4" />
              <div className="grid grid-cols-2 gap-4 text-sm text-gray-600">
                <p><strong>F-Code:</strong> {user.fCode}</p>
                <p><strong>Badge/Pin:</strong> {user.badgePin}</p>
                <p><strong>Weigand:</strong> {user.weigand}</p>
                <p><strong>M Code Access:</strong> {user.mCodeAccess}</p>
                <p><strong>Email:</strong> {user.email}</p>
                <p><strong>Username:</strong> {user.username}</p>
              </div>
              <hr className="border-gray-300 my-4" />
              <div>
                <h3 className="text-lg font-semibold text-gray-800 mb-2">Last Week's Vehicles</h3>
                <ul className="list-disc list-inside text-gray-600">
                  {user.lastWeekVehicles.map((vehicle, i) => (
                    <li key={i}>{vehicle}</li>
                  ))}
                </ul>
              </div>
              <div className="mt-4">
                <h3 className="text-lg font-semibold text-gray-800 mb-2">Deny Vehicles</h3>
                <ul className="list-disc list-inside text-gray-600">
                  {user.denyVehicles.map((vehicle, i) => (
                    <li key={i}>{vehicle}</li>
                  ))}
                </ul>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
};

export default UserDashboard;

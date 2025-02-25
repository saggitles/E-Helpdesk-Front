import React from 'react';

import { useRouter } from 'next/router';



interface ButtonRoleProps {
  userRole: string;
  handleMenuClick: (option: string) => void; // Define la prop para la función handleMenuClick
}

export const ButtonRole: React.FC<ButtonRoleProps> = ({ userRole, handleMenuClick }) => {

  const router = useRouter();
    
  const renderAdminButtons = () => {
    return (
      <>
        <li>
          <button
            className="block px-4 py-2 text-gray-800 hover:bg-gray-100 w-28 text-left"
            onClick={() => handleMenuClick('Default')}
          >
            Tickets
          </button>
        </li>
        <li>
          <button
            className="block px-4 py-2 text-gray-800 hover:bg-gray-100 w-28 text-left"
            onClick={() => handleMenuClick('RoleAssignment')}
          >
            Roles
          </button>
        </li>
        <li>
          <button
            className="block px-4 py-2 text-gray-800 hover:bg-gray-100 w-28 text-left"
            onClick={() => router.push('  ')}
          >
            Exit
          </button>
        </li>
        {/* Agrega más botones de acción de administrador según sea necesario */}
      </>
    );
  };

  const renderCustomerButtons = () => {
    return (
      <>
        <li>
          <button
            className="block px-4 py-2 text-gray-800 hover:bg-gray-100 w-28 text-left"
            // onClick={() => router.push('/api/auth/logout')}
          >
            Customer Action 1
          </button>
        </li>
        <li>
          <button
            className="block px-4 py-2 text-gray-800 hover:bg-gray-100 w-28 text-left"
            // onClick={() => router.push('/api/auth/logout')}
          >
            Customer Action 2
          </button>
        </li>
        <li>
          <button
            className="block px-4 py-2 text-gray-800 hover:bg-gray-100 w-28 text-left"
            // onClick={() => router.push('/api/auth/logout')}
          >
            Exit
          </button>
        </li>
      </>
    );
  };

  return (
    <div className="absolute top-full left-1/2 transform -translate-x-1/2 mt-2">
      <ul className="bg-white border border-gray-200 rounded-lg shadow-lg">
        {userRole === 'Admin' ? renderAdminButtons() : null}
        {userRole === 'Customer' ? renderCustomerButtons() : null}
        {userRole === 'Support_Team' ? renderAdminButtons() : null}
        {/* Add more role */}
      </ul>
    </div>
  );
};



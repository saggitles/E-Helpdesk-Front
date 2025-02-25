import React from 'react';
import { GeneralTickets } from './GeneralTickets'
import { RoleAssignment } from './RoleAssignment';

interface AdminComponentsProps {
  option: string;
}

export const AdminComponents: React.FC<AdminComponentsProps> = ({ option }) => {
  return (
    <div className="text-4xl mt-7 text-center">
      {option === 'Default' && <GeneralTickets/>}
      {option === 'RoleAssignment' && <RoleAssignment/>}
      {option === 'C' && <h1>Opción C</h1>}
    </div>
  );
};


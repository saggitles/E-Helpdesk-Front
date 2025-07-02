import { useState } from 'react';
import { PendingTickets } from '@/components/SupportTeamComponents';
import Navsearch from '@/generic_comp/navsearch';

const PendingTicketsPage = () => {
  const [filterChanged, setFilterChanged] = useState(false);

  // Define la función que pasarás a Navsearch
  const handleFilterChange = () => {
    console.log('Filter changed in PendingTicketsPage');
    setFilterChanged((prev) => !prev);
  };

  return (
    <div className='bg-teal-50 '>
      <h1 className='text-gray-600 text-center text-3xl mt-8'>
        Welcome to{' '}
        <span className='text-teal-700 font-bold'>E-Helpdesk</span>
      </h1>
      {/* Pasa la función como prop aquí */}
      <Navsearch onFilterChange={handleFilterChange} />
      <PendingTickets filterChanged={filterChanged} />
    </div>
  );
};

export default PendingTicketsPage;

import { CreateTickets } from '@/components/SupportTeamComponents/CreateTickets';
import Navsearch from '@/generic_comp/navsearch';
import { useRouter } from 'next/router';
import { useEffect, useState } from 'react';

const Ticket = () => {
  const router = useRouter();
  const [gmptCodeUpdated, setGmptCodeUpdated] = useState(false);

  // Función para actualizar el indicador cuando Navsearch cambia el GMPT code
  const handleFilterChange = () => {
    setGmptCodeUpdated((prev) => !prev); // Toggle para forzar la actualización
  };

  return (
    <div>
      <Navsearch onFilterChange={handleFilterChange} />
      <CreateTickets gmptCodeUpdated={gmptCodeUpdated} />
    </div>
  );
};

export default Ticket;

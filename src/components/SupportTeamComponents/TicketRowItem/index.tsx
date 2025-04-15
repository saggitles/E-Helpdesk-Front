import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { useRouter } from 'next/router';
import LoadingScreen from '@/components/generalComponents/LoadingScreen';
import { TicketRowItemProps } from '@/types/tickets.types';
import {
  STATUS_OPTIONS,
  getStatusColor,
  getStatusStyles,
} from '@/utils/statusConfig';

export const TicketRowItem: React.FC<TicketRowItemProps> = ({
  ticket,
  style,
  index,
}) => {
  const router = useRouter();
  const [selectedTicketId, setSelectedTicketId] = useState<number | null>(
    null
  );
  const [hover, setHover] = useState(false);
  const [selectedStatus, setSelectedStatus] = useState<string>(
    ticket.status
  );
  const [category, setCategory] = useState(ticket.category);
  const [isConfirmed, setIsConfirmed] = useState(false);
  const [is_Y, setis_y] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [showDonePopup, setShowDonePopup] = useState(false); // New state for done popup

  const [conclusion, setConclusion] = useState('');

  const handleCategoryChange = async (newCategory: string) => {
    setCategory(newCategory);
    console.log('New category url:', process.env.NEXT_PUBLIC_API_URL);

    try {
      const token = localStorage.getItem('accessToken');
      await axios.put(
        `${process.env.NEXT_PUBLIC_API_URL}/api/tickets/${ticket.id}`,
        { Category: newCategory },
        {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        }
      );

      window.location.reload();

      console.log(`Ticket category updated successfully: ${ticket.id}`);
    } catch (error) {
      console.error('Error updating ticket category:', error);
    }
  };

  const handleConfirm = async () => {
    setis_y(true);
    await new Promise((resolve) => setTimeout(resolve, 100)); // Wait 100ms
    handleDel();
    setTimeout(() => {
      setis_y(false);
      setIsConfirmed(false);
    }, 1000);
  };

  const handleCancel = () => {
    setis_y(false);
    setIsConfirmed(false);
  };

  const handleDelete = async () => {
    setIsConfirmed(true);
  };

  const handleDel = async () => {
    setIsLoading(true);
    try {
      const token = localStorage.getItem('accessToken');
      const headers = {
        Authorization: `Bearer ${token}`,
      };

      const response = await axios.delete(
        `${process.env.NEXT_PUBLIC_API_URL}/api/tickets/${ticket.id}`,
        { headers }
      );

      console.log(response.data);
      console.log('Ticket eliminado con éxito:', ticket.id);

      window.location.href = '/support/tickets/pending';
    } catch (error) {
      console.error('Error al eliminar el ticket:', error);
    } finally {
      setIsLoading(false);
    }
  };

  const handleRowClick = (e: React.MouseEvent<HTMLTableRowElement>) => {
    const isSelectOrOption =
      e.target instanceof HTMLSelectElement ||
      (e.target instanceof HTMLElement && e.target.closest('select'));

    if (isSelectOrOption || e.target instanceof HTMLButtonElement) {
      return;
    }
    setIsLoading(true);
    setSelectedTicketId(ticket.id);

    const fechaUpdatedISO = ticket.updated_at;
    const fechaUpdated = new Date(fechaUpdatedISO);

    const opciones: Intl.DateTimeFormatOptions = {
      year: 'numeric',
      month: '2-digit',
      day: '2-digit',
      hour: '2-digit',
      minute: '2-digit',
      second: '2-digit',
      hour12: false,
      timeZone: 'UTC',
    };

    const fechaUpdate = fechaUpdated
      .toLocaleDateString('es-ES', opciones)
      .replace(/\//g, '/')
      .replace(',', '');

    const fechaCreatedISO = ticket.created_at;
    const fechaCreated = new Date(fechaCreatedISO);
    const fechaCreate = fechaCreated
      .toLocaleDateString('es-ES', opciones)
      .replace(/\//g, '/')
      .replace(',', '');

    const fechaIncidentISO = ticket.incident_date;
    const fechaIncident = new Date(fechaIncidentISO ?? Date.now());
    const fechaIncidentFormatted = fechaIncident
      .toLocaleDateString('es-ES', opciones)
      .replace(/\//g, '/')
      .replace(',', '');

    window.open(
      `/support/tickets/${ticket.id}?` +
        new URLSearchParams({
          title: ticket.title,
          description: ticket.description,
          priority: ticket.priority,
          status: ticket.status,
          department: ticket.department || '',
          created_at: fechaCreate,
          updated_at: fechaUpdate,
          category: ticket.category,
          platform: ticket.platform || '',
          email: ticket.email || '',
          customer: ticket.customer_name || '',
          site_name: ticket.site_name || '',
          contact_name: ticket.contact_name,
          vehicle_id: ticket.vehicle_id || '',
          reporter: ticket.reporter || '',
          supported: ticket.supported || '',
          id: ticket.id.toString(),
          solution: ticket.solution || '',
          incident_date: fechaIncidentFormatted || '',
          ticket_number: ticket.ticket_number || '',
          open_since: ticket.open_since || '',
        }).toString(),
      '_blank'
    );

    setIsLoading(false);
  };

  const handleStatusChange = async (newStatus: string) => {
    if (newStatus === 'Done') {
      setShowDonePopup(true);
      return;
    }
    setSelectedStatus(newStatus);

    try {
      const token = localStorage.getItem('accessToken');
      await axios.put(
        `${process.env.NEXT_PUBLIC_API_URL}/api/tickets/${ticket.id}`,
        { status: newStatus },
        {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        }
      );

      window.location.reload();

      console.log(`Ticket status updated successfully: ${ticket.id}`);
    } catch (error) {
      console.error('Error updating ticket status:', error);
    }
  };

  // const getStatusColor = (status: string): string => {
  //   switch (status) {
  //     case 'In progress':
  //       return '#e6d856';
  //     case 'Done':
  //       return '#92cc75';
  //     case 'Scaled':
  //       return '#7ea6d3';
  //     case 'To Do':
  //       return '#ea7d7d';
  //     case "Won't do":
  //       return '#a4a89e';
  //     case 'Pending to call':
  //       return '#a909e9';
  //     default:
  //       return '#e6d856';
  //   }
  // };

  const handleDoneConfirm = async () => {
    setShowDonePopup(false);
    setSelectedStatus('Done');
    try {
      const token = localStorage.getItem('accessToken');
      const put = await axios.put(
        `${process.env.NEXT_PUBLIC_API_URL}/api/tickets/${ticket.id}`,
        { Status: 'Done', Solution: conclusion },
        {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        }
      );
      window.location.reload();

      console.log(put);
      console.log(`Ticket status updated successfully: ${ticket.id}`);
    } catch (error) {
      console.error('Error updating ticket status:', error);
    }
  };

  const handleDoneCancel = () => {
    setShowDonePopup(false);
  };

  return (
    <>
      <tr
        className='pl-11'
        style={{
          ...style,
          border: '1px solid #eaecef',
          borderRadius: '20px 20px 20px 20px',
          backgroundColor: hover
            ? '#acc637'
            : index % 2 === 0
            ? '#f3f4f6'
            : 'white',
        }}
        onMouseEnter={() => setHover(true)}
        onMouseLeave={() => setHover(false)}
        onDoubleClick={(e: React.MouseEvent<HTMLTableRowElement>) =>
          handleRowClick(e)
        }
      >
        <td className='text-center text-xs font-Lato text-gray-900'>
          # {ticket.id}
        </td>
        <td className='text-center text-xs font-Lato text-gray-900'>
          {new Date(ticket.created_at).toLocaleDateString('en-GB')}
        </td>
        <td
          className={`text-center text-xs font-Lato font-bold ${
            ticket.priority === 'High'
              ? 'text-red-600'
              : ticket.priority === 'Medium'
              ? 'text-yellow-600'
              : 'text-green-600'
          }`}
        >
          {ticket.priority}
        </td>

        <td className='text-center text-xs font-Lato text-gray-900'>
          {ticket.customer_name}
        </td>
        <td className='text-center text-xs font-Lato text-gray-900'>
          {ticket.site_name}
        </td>
        <td className='text-center text-xs font-Lato text-gray-900'>
          {ticket.contact_name}
        </td>
        <td className='text-center text-xs font-Lato text-gray-900'>
          {ticket.email}
        </td>
        <td className='text-center text-xs font-Lato text-gray-900'>
          {ticket.supported}
        </td>

        {isLoading && <LoadingScreen />}

        <td className='text-center text-xs font-Lato text-gray-900'>
          <select
            className='w-full outline-none'
            value={category}
            onChange={(e) => handleCategoryChange(e.target.value)}
            style={{
              borderRadius: '10px',
              background: '#e8eaed',
              padding: '3px',
              boxShadow: '0 2px 4px rgba(0, 0, 0, 0.1)',
            }}
          >
            <option value={ticket.category}>{ticket.category}</option>
            <option value='Checklist issue'>Checklist issue</option>
            <option value='Software Issue'>Software Issue</option>
            <option value='Hardware Issue'>Hardware Issue</option>
            <option value='Pin/card Issue'>Pin/card Issue</option>
            <option value='Dashboard Issue'>Dashboard Issue</option>
            <option value='Improvement Request'>
              Improvement Request
            </option>
            <option value='Connectivity Issue'>Connectivity Issue</option>
            <option value='User Unawareness'>User Unawareness</option>
            <option value='Team Request'>Team Request</option>
            <option value='Server Down'>Server Down</option>
            <option value='Impact Calibrations'>
              Impact Calibrations
            </option>
            <option value='Polarity Idle Timer Issue'>
              Polarity Idle Timer Issue
            </option>
            <option value='GPS Issue'>GPS Issue</option>
          </select>
        </td>

        <td className='text-center text-xs font-Lato text-gray-900'>
          <select
            value={ticket.status}
            onChange={(e) => handleStatusChange(e.target.value)}
            style={getStatusStyles(ticket.status)}
          >
            <option
              value={ticket.status}
              style={{
                backgroundColor: getStatusColor(ticket.status),
                color: 'white',
              }}
            >
              {ticket.status}
            </option>
            {STATUS_OPTIONS.map((status) => (
              <option
                key={status}
                value={status}
                style={{
                  backgroundColor: getStatusColor(status),
                  color: 'white',
                }}
              >
                {status}
              </option>
            ))}
          </select>
        </td>

        {/* <td>
          {ticket.Status} 
        </td> */}
      </tr>

      {showDonePopup && (
        <div className='fixed inset-0 flex items-center justify-center bg-gray-800 bg-opacity-50'>
          <div className='bg-white p-8 rounded-lg shadow-lg'>
            <p className='text-gray-700 text-lg'>
              Enter Conclusion/Solution for the Problem:
            </p>
            <textarea
              className='w-full p-2 mt-4 border border-gray-300 rounded'
              rows={4}
              value={conclusion}
              onChange={(e) => setConclusion(e.target.value)}
              placeholder='Enter the solution or conclusion here...'
            />
            <div className='mt-4'>
              <button
                className='bg-blue-500 hover:bg-blue-600 text-white px-4 py-2 rounded mr-2 transition duration-300 ease-in-out'
                onClick={handleDoneConfirm}
                disabled={!conclusion.trim()} // Disable if conclusion is empty
              >
                Confirm
              </button>
              <button
                className='bg-red-500 hover:bg-red-600 text-white px-4 py-2 rounded transition duration-300 ease-in-out'
                onClick={handleDoneCancel}
              >
                Cancel
              </button>
            </div>
          </div>
        </div>
      )}
    </>
  );
};

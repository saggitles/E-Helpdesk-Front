import React, { useState } from 'react';
import axios from 'axios';
import LoadingScreen from '@/components/generalComponents/LoadingScreen';
import { TicketRowItemProps } from '@/types/tickets.types';
import { CATEGORY_OPTIONS } from '@/utils/categoryConfig';
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
  const [hover, setHover] = useState(false);
  const [category, setCategory] = useState(ticket.category);
  const [isConfirmed, setIsConfirmed] = useState(false);
  const [is_Y, setis_y] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [showDonePopup, setShowDonePopup] = useState(false);
  const [conclusion, setConclusion] = useState('');

  const handleCategoryChange = async (newCategory: string) => {
    setCategory(newCategory);
    try {
      const token = localStorage.getItem('accessToken');
      await axios.put(
        `${process.env.NEXT_PUBLIC_API_URL}/api//tickets/update/${ticket.id}`,
        { Category: newCategory },
        {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        }
      );
      window.location.reload();
    } catch (error) {
      console.error('Error updating ticket category:', error);
    }
  };

  const handleConfirm = async () => {
    setis_y(true);
    await new Promise((resolve) => setTimeout(resolve, 100));
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
      await axios.delete(
        `${process.env.NEXT_PUBLIC_API_URL}/api/tickets/delete/${ticket.id}`,
        {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        }
      );
      window.location.href = '/support/tickets/pending';
    } catch (error) {
      console.error('Error deleting ticket:', error);
    } finally {
      setIsLoading(false);
    }
  };

  const handleRowClick = (e: React.MouseEvent<HTMLTableRowElement>) => {
    console.log('Row clicked:', ticket.id);

    const isSelectOrOption =
      e.target instanceof HTMLSelectElement ||
      (e.target instanceof HTMLElement && e.target.closest('select'));

    if (isSelectOrOption || e.target instanceof HTMLButtonElement) {
      return;
    }
    setIsLoading(true);

    // Simply navigate to the details page with just the ID
    window.open(`/support/tickets/${ticket.id}`, '_blank');
    console.log('Ticket ID:', ticket.id);

    setIsLoading(false);
  };

  const handleStatusChange = async (newStatus: string) => {
    if (newStatus === 'Done') {
      setShowDonePopup(true);
      return;
    }

    try {
      const token = localStorage.getItem('accessToken');
      await axios.put(
        `${process.env.NEXT_PUBLIC_API_URL}/api//tickets/update/${ticket.id}`,
        { status: newStatus },
        {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        }
      );
      window.location.reload();
    } catch (error) {
      console.error('Error updating ticket status:', error);
    }
  };

  const handleDoneConfirm = async () => {
    setShowDonePopup(false);
    try {
      const token = localStorage.getItem('accessToken');
      await axios.put(
        `${process.env.NEXT_PUBLIC_API_URL}/api//tickets/update/${ticket.id}`,
        { Status: 'Done', Solution: conclusion },
        {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        }
      );
      window.location.reload();
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
          borderRadius: '20px',
          backgroundColor: hover
            ? '#acc637'
            : index % 2 === 0
            ? '#f3f4f6'
            : 'white',
        }}
        onMouseEnter={() => setHover(true)}
        onMouseLeave={() => setHover(false)}
        onDoubleClick={(e) => handleRowClick(e)}
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
          {ticket.created_by}
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
            {/* Only show current category if it's not in the options list */}
            {!CATEGORY_OPTIONS.includes(
              ticket.category as (typeof CATEGORY_OPTIONS)[number]
            ) && (
              <option value={ticket.category}>{ticket.category}</option>
            )}

            {/* Map through category options from config */}
            {CATEGORY_OPTIONS.map((categoryOption) => (
              <option key={categoryOption} value={categoryOption}>
                {categoryOption}
              </option>
            ))}
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
                disabled={!conclusion.trim()}
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

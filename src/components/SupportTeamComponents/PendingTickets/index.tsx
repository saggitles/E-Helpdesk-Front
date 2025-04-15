'use client';

import React, { useState, useEffect, useRef } from 'react';
import axios from 'axios';
import * as XLSX from 'xlsx';
import { TicketRowItem } from '@/components/SupportTeamComponents';
import { Ticket, PendingTicketsProps } from '@/types/tickets.types';
import { STATUS_OPTIONS, getStatusColor } from '@/utils/statusConfig';

export const PendingTickets: React.FC<PendingTicketsProps> = ({
  site_id,
}) => {
  const [tickets, setTickets] = useState<Ticket[]>([]);
  const [searchResults, setSearchResults] = useState<Ticket[]>([]);
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedStatuses, setSelectedStatuses] = useState<string[]>([]);
  const [statusDropdownOpen, setStatusDropdownOpen] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);
  const statusDropdownRef = useRef<HTMLDivElement>(null);

  const [currentPage, setCurrentPage] = useState(1);
  const TICKETS_PER_PAGE = 100;

  const totalPages = Math.ceil(searchResults.length / TICKETS_PER_PAGE);
  const paginatedTickets = searchResults.slice(
    (currentPage - 1) * TICKETS_PER_PAGE,
    currentPage * TICKETS_PER_PAGE
  );

  const handleButtonClick = () => {
    if (fileInputRef.current) fileInputRef.current.click();
  };

  const handleImport = async (
    event: React.ChangeEvent<HTMLInputElement>
  ) => {
    const token = localStorage.getItem('accessToken');
    const file = event.target.files?.[0];
    if (!file) return;

    const reader = new FileReader();
    reader.onload = async (e) => {
      const data = e.target?.result;
      if (!data) return;

      const workbook = XLSX.read(data, { type: 'binary' });
      const sheet = workbook.Sheets[workbook.SheetNames[0]];
      const json = XLSX.utils.sheet_to_json(sheet);
      try {
        await axios.post(
          `${process.env.NEXT_PUBLIC_API_URL}/api/import`,
          json,
          {
            headers: {
              Authorization: `Bearer ${token}`,
              'Content-Type': 'application/json',
            },
          }
        );
        window.location.reload();
      } catch (err) {
        console.error('Import failed:', err);
      }
    };
    reader.readAsBinaryString(file);
  };

  const handleExportTickets = async () => {
    console.log('Exporting tickets...');

    const token = localStorage.getItem('accessToken');
    if (!token) {
      console.error('No access token found!');
      return;
    }

    try {
      // For exporting all tickets - check your API structure
      const exportUrl = 'http://localhost:8080/api/tickets/export';
      // OR if your API expects a different format:
      // const exportUrl = `${process.env.NEXT_PUBLIC_API_URL}/api/export/tickets`;

      console.log('Export URL:', exportUrl);
      console.log('Using token:', token.substring(0, 15) + '...');

      const response = await fetch(exportUrl, {
        method: 'GET',
        headers: {
          Authorization: `Bearer ${token}`,
          'Content-Type': 'application/json',
        },
      });

      if (!response.ok) {
        const errorText = await response.text();
        console.error(
          `Export failed with status ${response.status}: ${errorText}`
        );
        throw new Error(`Export failed: ${response.statusText}`);
      }

      const blob = await response.blob();
      const url = window.URL.createObjectURL(blob);

      const a = document.createElement('a');
      a.href = url;
      a.download = 'tickets.csv';
      document.body.appendChild(a);
      a.click();
      a.remove();

      console.log('Exported tickets successfully');
    } catch (error) {
      console.error('Error exporting tickets:', error);
    }
  };

  const handleStatusFilter = async (selectedStatuses: string[]) => {
    if (selectedStatuses.length === 0) return;

    console.log('Applying filters:', selectedStatuses);

    try {
      // Convert selected statuses to a comma-separated string for the query parameter
      const statusQuery = selectedStatuses.join(',');

      // Send a GET request with statuses as query parameters
      const response = await axios.get(
        `http://localhost:8080/tickets/filterByStatus?status=${statusQuery}`
      );

      // Sort the tickets by ID in descending order
      const sorted = response.data.sort(
        (a: Ticket, b: Ticket) => b.id - a.id
      );

      setTickets(sorted);
      setSearchResults(sorted);
    } catch (error) {
      console.error('❌ Error filtering tickets:', error);
    }
  };

  const toggleStatus = (status: string) => {
    setSelectedStatuses((prev) =>
      prev.includes(status)
        ? prev.filter((s) => s !== status)
        : [...prev, status]
    );
  };

  const handleFilter = async () => {
    const token = localStorage.getItem('accessToken');
    try {
      const response = await axios.get(
        `${process.env.NEXT_PUBLIC_API_URL}/tickets`,
        {
          headers: { Authorization: `Bearer ${token}` },
        }
      );
      const sorted = response.data.sort(
        (a: Ticket, b: Ticket) => b.id - a.id
      );
      setTickets(sorted);
      const filtered: Ticket[] = sorted.filter(
        (ticket: Ticket): boolean =>
          ticket.title
            ?.toLowerCase()
            .includes(searchQuery.toLowerCase()) ?? false
      );
      setSearchResults(filtered);
    } catch (err) {
      console.error('Error fetching tickets:', err);
    }
  };

  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (
        statusDropdownRef.current &&
        !statusDropdownRef.current.contains(event.target as Node) &&
        statusDropdownOpen
      ) {
        setStatusDropdownOpen(false);
      }
    };

    // Add event listener when dropdown is open
    if (statusDropdownOpen) {
      document.addEventListener('mousedown', handleClickOutside);
    }

    // Cleanup function
    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
    };
  }, [statusDropdownOpen]);
  useEffect(() => {
    const fetchAllTickets = async () => {
      const token = localStorage.getItem('accessToken');

      try {
        console.log('Fetching all tickets...');
        const response = await axios.get(
          `${process.env.NEXT_PUBLIC_API_URL}/api/tickets`, // Remove the /site?site_id=${site_id} part
          {
            headers: {
              Authorization: `Bearer ${token}`,
              'Content-Type': 'application/json',
            },
          }
        );
        console.log('API response status:', response.status);
        console.log('Raw response data:', response.data);

        // Process response
        const sorted = response.data.sort(
          (a: Ticket, b: Ticket) => b.id - a.id
        );
        setTickets(sorted);
        setSearchResults(sorted);
      } catch (error: any) {
        console.error('Error loading tickets:', error);
      }
    };

    fetchAllTickets(); // Always fetch all tickets
  }, []); // Remove site_id dependency

  return (
    <div className='bg-teal-50 min-h-screen px-6'>
      <div className='max-w-7xl mx-auto'>
        {/* 🔍 Search + Filter Button */}
        <div className='bg-white rounded-lg shadow-lg p-4 mb-6'>
          <div className='flex gap-4 items-center'>
            <input
              type='search'
              placeholder='Search'
              className='flex-1 p-2 border border-teal-200 rounded-md text-sm'
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
            />
            <button
              className='bg-teal-500 text-white px-4 py-2 rounded-md hover:bg-teal-600'
              onClick={handleFilter}
            >
              Filter
            </button>
          </div>
        </div>

        {/* 📁 Import / Export */}
        <div className='flex gap-4 mb-6'>
          <button
            className='bg-teal-500 text-white px-4 py-2 rounded-md'
            onClick={handleButtonClick}
          >
            Import
            <input
              type='file'
              onChange={handleImport}
              accept='.xls,.xlsx'
              className='hidden'
              ref={fileInputRef}
            />
          </button>

          <button
            className='bg-blue-600 text-white px-4 py-2 rounded hover:bg-blue-700'
            onClick={handleExportTickets}
          >
            Export All Tickets
          </button>

          {/* 🧩 Status Filter */}
          <div className='relative'>
            <button
              className='bg-teal-500 text-white px-4 py-2 rounded-md'
              onClick={() => setStatusDropdownOpen(!statusDropdownOpen)}
            >
              Filter by Status
            </button>
            {statusDropdownOpen && (
              <div
                ref={statusDropdownRef}
                className='absolute z-10 bg-white border rounded shadow p-4'
                style={{ width: '300px', right: 0 }}
              >
                {STATUS_OPTIONS.map((status) => (
                  <div key={status} className='flex items-center mb-2'>
                    <input
                      type='checkbox'
                      id={`status-${status}`}
                      checked={selectedStatuses.includes(status)}
                      onChange={() => toggleStatus(status)}
                      className='mr-2'
                    />
                    <label
                      htmlFor={`status-${status}`}
                      className='flex-1 whitespace-nowrap'
                      style={{
                        fontWeight: 500,
                      }}
                    >
                      {status}
                    </label>
                  </div>
                ))}
                <button
                  className='mt-2 bg-teal-500 text-white px-3 py-1 rounded w-full'
                  onClick={() => handleStatusFilter(selectedStatuses)}
                >
                  Apply
                </button>
              </div>
            )}
          </div>
        </div>

        {/* 📋 Ticket Table */}
        <div className='bg-white rounded-lg shadow-lg overflow-hidden'>
          <table className='w-full'>
            <thead>
              <tr className='bg-teal-500 text-white text-sm'>
                <th className='px-4 py-2'>ID</th>
                <th className='px-4 py-2'>Date</th>
                <th className='px-4 py-2'>Priority</th>
                <th className='px-4 py-2'>Company</th>
                <th className='px-4 py-2'>Site</th>
                <th className='px-4 py-2'>Contact name</th>
                <th className='px-4 py-2'>Subject</th>
                <th className='px-4 py-2'>Supported By</th>
                <th className='px-4 py-2'>Category</th>
                <th className='px-4 py-2'>Status</th>
              </tr>
            </thead>
            <tbody className='divide-y divide-gray-200'>
              {paginatedTickets.map((ticket, index) => (
                <TicketRowItem
                  key={ticket.id}
                  ticket={{
                    ...ticket,
                    user: ticket.assigned_user_id?.toString() || '',
                    reporter: ticket.reporter || '',
                  }}
                  style={{
                    backgroundColor: index % 2 === 0 ? '#f9fafb' : 'white',
                  }}
                  index={index}
                />
              ))}
            </tbody>
          </table>
        </div>

        {/* ⏮️ Pagination Controls */}
        <div className='flex justify-center items-center gap-4 mt-6'>
          <button
            className='px-4 py-2 bg-gray-300 rounded-md'
            onClick={() => setCurrentPage((prev) => Math.max(prev - 1, 1))}
            disabled={currentPage === 1}
          >
            Previous
          </button>
          <span className='text-sm text-gray-700'>
            Page {currentPage} of {totalPages}
          </span>
          <button
            className='px-4 py-2 bg-gray-300 rounded-md'
            onClick={() =>
              setCurrentPage((prev) => Math.min(prev + 1, totalPages))
            }
            disabled={currentPage === totalPages}
          >
            Next
          </button>
        </div>
      </div>
    </div>
  );
};

export default PendingTickets;

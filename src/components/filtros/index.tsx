import React, { useState, useEffect, useRef } from 'react';
import axios from 'axios';
import Searchbar from '../../generic_comp/searchbar';

import { TicketRowItem } from '@/components/SupportTeamComponents';
import * as XLSX from 'xlsx';

import Image from 'next/image';
import {
  Ticket,
  Comment,
  PendingTicketsProps,
} from '@/types/tickets.types';

export const PendingTickets: React.FC<PendingTicketsProps> = ({
  site_id,
}) => {
  const [tickets, setTickets] = useState<Ticket[]>([]);
  const [page, setPage] = useState(1);
  const [hasMore, setHasMore] = useState(true);
  const limit = 100;
  const [currentPage, setCurrentPage] = useState(1);
  const ticketsPerPage = 12;
  const [totalPages, setTotalPages] = useState(0);
  const [searchResults, setSearchResults] = useState<Ticket[]>([]);
  const [sortField, setSortField] = useState('id');
  const [sortOrder, setSortOrder] = useState('asc');
  const [showOnlyInProgress, setShowOnlyInProgress] = useState(false);

  const [showOnlyPendingCall, setShowOnlyPendingCall] = useState(false);

  const indexOfLastTicket = currentPage * ticketsPerPage;
  const indexOfFirstTicket = indexOfLastTicket - ticketsPerPage;
  const currentTickets = searchResults.slice(
    indexOfFirstTicket,
    indexOfLastTicket
  );
  const [showDoneAlert, setShowDoneAlert] = useState(false);
  const prevTicketsRef = useRef<Ticket[]>([]);
  const [isLoading, setIsLoading] = useState(false);

  const fileInputRef = useRef<HTMLInputElement>(null);

  const handleButtonClick = () => {
    if (fileInputRef.current) {
      fileInputRef.current.click();
    }
  };

  const handleLoading = (event: React.ChangeEvent<HTMLInputElement>) => {
    setIsLoading(true);
    handleImport(event);
  };

  const handleImport = async (
    event: React.ChangeEvent<HTMLInputElement>
  ) => {
    setIsLoading(true);

    const token = localStorage.getItem('accessToken');

    const file = event.target.files?.[0];
    let rowCounter = 0;
    const maxEmptyColumns = 10;
    const batchSize = 10;

    if (file) {
      const reader = new FileReader();

      reader.onload = async (e) => {
        if (e.target) {
          const data = e.target.result;
          const workbook = XLSX.read(data, { type: 'binary' });

          const sheetName = workbook.SheetNames[0];
          const sheet = workbook.Sheets[sheetName];

          const ticketList: Ticket[] = [];
          const commentsList: Comment[] = [];

          XLSX.utils
            .sheet_to_json(sheet, { header: 1 })
            .slice(3)
            .forEach((row: any, index: number) => {
              rowCounter++;

              if (
                row.every(
                  (value: any) =>
                    value === null || value === undefined || value === ''
                )
              ) {
                if (rowCounter > maxEmptyColumns) {
                  return;
                }
              }

              const words = row[5] ? row[5].split(' ') : [];
              const truncatedTitle =
                words.length > 0 ? words.slice(0, 5).join(' ') : '';

              const utc_days = Math.floor(row[1] - 25569);
              const utc_value = utc_days * 86400;
              const date_info = new Date(utc_value * 1000);

              const offset = date_info.getTimezoneOffset() * 60000;
              const correctedDate = new Date(date_info.getTime() + offset);

              const ticket = {
                created_at:
                  correctedDate !== undefined ? correctedDate : '',
                dealer: row[2] !== undefined ? row[2] : '',
                customer_name: row[3] !== undefined ? row[3] : '',
                reporter: row[4] !== undefined ? row[4] : '',
                title: truncatedTitle,
                description: row[5] !== undefined ? row[5] : '',
                id: row[6] !== undefined ? row[6] : '',
                created_by: row[7] !== undefined ? row[7] : '',
                priority: row[8] !== undefined ? row[8] : '',
                solution: row[9] !== undefined ? row[9] : '',
                category: row[11] !== undefined ? row[11] : '',
                status: row[12] !== undefined ? row[12] : '',
                is_escalated: row[13] !== undefined ? row[13] : '',
                platform: row[14] !== undefined ? row[14] : '',
                email: row[15] !== undefined ? row[15] : '',
              } as Ticket;

              ticketList.push(ticket);

              if (row[10] !== undefined && row[10] !== null) {
                commentsList.push({
                  id: 0,
                  content: row[10],
                  ticket_id: ticketList.length - 1,
                  author: '',
                  created_at: new Date().toISOString(),
                });
              }
            });

          const createdTickets: { id: number; index: number }[] = [];

          try {
            for (let i = 0; i < ticketList.length; i += batchSize) {
              const batch = ticketList.slice(i, i + batchSize);

              const response = await axios.post(
                `${process.env.NEXT_PUBLIC_API_URL}/api/import`,
                batch,
                {
                  headers: {
                    Authorization: `Bearer ${token}`,
                    'Content-Type': 'application/json',
                  },
                }
              );

              response.data.createdTickets.forEach(
                (createdTicket: any, idx: number) => {
                  createdTickets.push({
                    id: createdTicket.value.id,
                    index: i + idx,
                  });
                }
              );
            }

            for (let comment of commentsList) {
              const associatedTicket = createdTickets.find(
                (ticket) => ticket.index === comment.ticket_id
              );
              if (associatedTicket) {
                comment.ticket_id = associatedTicket.id;
              }
            }

            for (let comment of commentsList) {
              if (
                comment.ticket_id !== undefined &&
                comment.content !== null
              ) {
                try {
                  const response = await axios.post(
                    `${process.env.NEXT_PUBLIC_API_URL}/api/comments`,
                    {
                      content: comment.content,
                      ticket_id: comment.ticket_id,
                    },
                    {
                      headers: {
                        Authorization: `Bearer ${token}`,
                        'Content-Type': 'application/json',
                      },
                    }
                  );
                } catch (error) {
                  console.error('Error al importar comentario', error);
                }
              }
            }
          } catch (error) {
            console.error('Error en el proceso de importación', error);
          } finally {
            setIsLoading(false);
            window.location.reload();
          }
        }
      };

      reader.readAsBinaryString(file);
    } else {
      setIsLoading(false);
    }
  };

  const exportToExcel = () => {
    const ticketsForExport = tickets.map((ticket) => ({
      id: ticket.id,
      title: ticket.title,
      description: ticket.description,
      status: ticket.status,
      category: ticket.category,
      priority: ticket.priority,
      assigned_user_id: ticket.assigned_user_id,
      customerID: ticket.customer_id,
      site_name: ticket.site_name,
      site_id: ticket.site_id,
      department: ticket.department,
      created_at: ticket.created_at,
      updated_at: ticket.updated_at,
      incident_date: ticket.incident_date || '',
      drivers_name: ticket.drivers_name || '',
      vehicle_id: ticket.vehicle_id || '',
      dealer: ticket.dealer || '',
      contact_name: ticket.contact_name || '',
      created_by: ticket.created_by || '',
      is_escalated: ticket.is_escalated || '',
      solution: ticket.solution || '',
      platform: ticket.platform || '',
      customer_name: ticket.customer_name || '',
      email: ticket.email || '',
      reporter: ticket.reporter || '',
    }));

    const worksheet = XLSX.utils.json_to_sheet(ticketsForExport);
    const workbook = XLSX.utils.book_new();
    XLSX.utils.book_append_sheet(workbook, worksheet, 'Tickets');
    XLSX.writeFile(workbook, 'tickets.xlsx');
  };

  useEffect(() => {
    const ticketsChangedToDone = tickets.some((ticket, index) => {
      const prevTicket = prevTicketsRef.current[index];
      return (
        prevTicket &&
        ticket.status === 'Done' &&
        prevTicket.status !== 'Done'
      );
    });

    setShowDoneAlert(ticketsChangedToDone);

    prevTicketsRef.current = tickets;
  }, [tickets]);

  useEffect(() => {
    const fetchTickets = async () => {
      const token = localStorage.getItem('accessToken');

      if (!token) {
        console.error('No access token found.');
        return;
      }

      try {
        const response = await fetch(
          `${process.env.NEXT_PUBLIC_API_URL}/api/ticket/site?site_id=${site_id}`,
          {
            method: 'GET',
            headers: {
              Authorization: `Bearer ${token}`,
              'Content-Type': 'application/json',
            },
          }
        );

        if (!response.ok) throw new Error('Error fetching tickets');

        const data = await response.json();

        setTickets(data.tickets);
      } catch (error) {
        console.error('Error loading tickets:', error);
      } finally {
        setIsLoading(false);
      }
    };

    if (site_id) {
      fetchTickets();
    }
  }, [site_id]);

  useEffect(() => {
    setTotalPages(Math.ceil(searchResults.length / ticketsPerPage));
  }, [searchResults]);

  useEffect(() => {
    if (showOnlyInProgress) {
      const filteredTickets = tickets.filter(
        (ticket) => ticket.status === 'In progress'
      );
      setSearchResults(filteredTickets);
    } else {
      setSearchResults(tickets);
    }
  }, [showOnlyInProgress, tickets]);

  useEffect(() => {
    if (showOnlyPendingCall) {
      const filteredTickets = tickets.filter(
        (ticket) => ticket.status === 'Pending to call'
      );
      setSearchResults(filteredTickets);
    } else {
      setSearchResults(tickets);
    }
  }, [showOnlyPendingCall, tickets]);

  const searchData = (query: any) => {
    const trimmedQuery: string = query.trim().toLowerCase();

    const filteredData = tickets.filter((item: Ticket) => {
      return (
        item.title.toLowerCase().includes(trimmedQuery) ||
        item.contact_name.toLowerCase().includes(trimmedQuery) ||
        (item.dealer &&
          item.dealer.toLowerCase().includes(trimmedQuery)) ||
        item.customer_name.toLowerCase().includes(trimmedQuery) ||
        item.created_by.toLowerCase().includes(trimmedQuery) ||
        (item.vehicle_id ? item.vehicle_id.toLowerCase() : '').includes(
          trimmedQuery
        )
      );
    });
    setSearchResults(filteredData);
  };

  const handleSort = (field: keyof Ticket) => {
    const isAsc = sortField === field && sortOrder === 'asc';
    setSortOrder(isAsc ? 'desc' : 'asc');
    setSortField(field);

    const sorted = [...searchResults].sort((a, b) => {
      let valA = a[field] || '';
      let valB = b[field] || '';
      if (typeof valA === 'string') valA = valA.toLowerCase();
      if (typeof valB === 'string') valB = valB.toLowerCase();

      if (isAsc) {
        return valA < valB ? -1 : valA > valB ? 1 : 0;
      } else {
        return valA > valB ? -1 : valA < valB ? 1 : 0;
      }
    });
    setSearchResults(sorted);
  };

  const loadMoreTickets = () => {
    if (hasMore) {
      setPage((prevPage) => prevPage + 1);
    }
  };

  const loadPreviousTickets = () => {
    if (currentPage > 1) {
      setCurrentPage(currentPage - 1);
    }
  };

  const [searchQuery, setSearchQuery] = useState('');

  return (
    <>
      {isLoading ? (
        <div className='fixed inset-0 flex items-center justify-center bg-gray-100'>
          <div className='text-2xl font-bold text-center'>
            Loading... Importing data may take a while depending on the
            number of entries. Please wait.
          </div>
        </div>
      ) : (
        <div className='bg-teal-50 min-h-screen py-16 px-6'>
          <div className='max-w-7xl mx-auto'>
            <div className='bg-white rounded-lg shadow-lg overflow-hidden'>
              <table className='w-full'>
                <thead>
                  <tr className='bg-teal-500 text-white'>
                    <th
                      className='px-6 py-3 text-center text-sm font-semibold'
                      onClick={() => handleSort('id')}
                    >
                      ID
                    </th>
                    <th
                      className='px-6 py-3 text-center text-sm font-semibold'
                      onClick={() => handleSort('created_at')}
                    >
                      Date
                    </th>
                    <th
                      className='px-6 py-3 text-center text-sm font-semibold'
                      onClick={() => handleSort('dealer')}
                    >
                      Priority
                    </th>
                    <th
                      className='px-6 py-3 text-center text-sm font-semibold'
                      onClick={() => handleSort('customer_name')}
                    >
                      Customer
                    </th>
                    <th
                      className='px-6 py-3 text-center text-sm font-semibold'
                      onClick={() => handleSort('site_name')}
                    >
                      Site
                    </th>
                    <th
                      className='px-6 py-3 text-center text-sm font-semibold'
                      onClick={() => handleSort('contact_name')}
                    >
                      contact name
                    </th>
                    <th
                      className='px-6 py-3 text-center text-sm font-semibold'
                      onClick={() => handleSort('vehicle_id')}
                    >
                      Email Subject
                    </th>
                    <th
                      className='px-6 py-3 text-center text-sm font-semibold'
                      onClick={() => handleSort('created_by')}
                    >
                      Created by
                    </th>
                    <th className='px-6 py-3 text-center text-sm font-semibold'>
                      Category
                    </th>
                    <th className='px-6 py-3 text-center text-sm font-semibold'>
                      Status
                    </th>
                  </tr>
                </thead>
                <tbody className='divide-y divide-gray-200'>
                  {searchResults.map((ticket, index) => (
                    <TicketRowItem
                      key={index}
                      ticket={ticket as any}
                      style={{
                        backgroundColor:
                          index % 2 === 0 ? '#f9fafb' : 'white',
                      }}
                      index={index}
                    />
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        </div>
      )}
      {showDoneAlert}
    </>
  );
};

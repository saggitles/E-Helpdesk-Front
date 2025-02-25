import React, { useState, useEffect, useRef } from 'react';
import axios from 'axios';
import Searchbar from '../../../generic_comp/searchbar';
import { TicketRowItem } from '@/components/SupportTeamComponents';
import * as XLSX from 'xlsx';
// import TicketDoneAlert from '../TicketDoneAlert/TicketDoneAlert';
import ChatWidget from '../../../components/chat/ChatWidget';


import { useUser, withPageAuthRequired } from '@auth0/nextjs-auth0/client';
import Image from 'next/image'; 

type Ticket = {
  IDTicket: number;
  Title: string;
  Description: string;
  Status: string;
  Category: string;
  Priority: string;
  AssignedUserID?: number;
  CustomerID: number;
  Site?: string;
  Department?: string;
  createdAt: string;
  updatedAt: string;
  incidentDate?: string; // Fecha del incidente (opcional)
  driversName?: string; // Nombre del conductor (opcional)
  VehicleID: string; // ID del vehículo (opcional)
  Dealer: string;
  Contact: string;
  Supported: string;
  isEscalated?: string;
  Solution?: string;
  Platform?: string;
  Companyname: string;
  Email?: string;
  Reporter?: string;
  Comments?: string;
};

type Comment = {
    Content: string;
    TicketIndex: number;
    TicketID?: number; // Optional initially, will be set later
};

interface PendingTicketsProps {
  option?: string;
}

interface PendingTicketsProps {
  option?: string;
  filterChanged?: boolean;
}

export const PendingTickets: React.FC<PendingTicketsProps> = ({ filterChanged }) => {
  const [tickets, setTickets] = useState<Ticket[]>([]);
  const [page, setPage] = useState(1);  // Estado para la página actual
  const [hasMore, setHasMore] = useState(true);  // Estado para manejar si hay más tickets por cargar
  const limit = 100;  // Número de tickets por página
  const [currentPage, setCurrentPage] = useState(1);
  const ticketsPerPage = 12;
  const [totalPages, setTotalPages] = useState(0);
  const [searchResults, setSearchResults] = useState<Ticket[]>([]);
  const [sortField, setSortField] = useState('IDTicket');  // Campo por defecto para ordenar
  const [sortOrder, setSortOrder] = useState('asc');
  const [showOnlyInProgress, setShowOnlyInProgress] = useState(false);

  const [showOnlyPendingCall, setShowOnlyPendingCall] = useState(false);

  
  const indexOfLastTicket = currentPage * ticketsPerPage;
  const indexOfFirstTicket = indexOfLastTicket - ticketsPerPage;
  const currentTickets = searchResults.slice(indexOfFirstTicket, indexOfLastTicket);
  const [showDoneAlert, setShowDoneAlert] = useState(false);
  const prevTicketsRef = useRef<Ticket[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  
  // const { user, isLoading } = useUser();
  

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

const handleImport = async (event: React.ChangeEvent<HTMLInputElement>) => {
  setIsLoading(true); // Start loading
  console.log("Starting the import process...");


  console.log("Borrar tickets primero")

  const token = localStorage.getItem('accessToken');

  
//   const response = await axios.get(`${process.env.NEXT_PUBLIC_API_URL}/api/deleteTicketsAndComents`, {
//     headers: {
//       'Authorization': `Bearer ${token}`,
//       'Content-Type': 'application/json',
//     },
//   });
  
//   console.log(response)


  const file = event.target.files?.[0];
  let rowCounter = 0; // Inicializa el contador de filas
  const maxEmptyColumns = 10; 
  const batchSize = 10; // Adjust the batch size as needed

  if (file) {
      const reader = new FileReader();

      console.log("Leyendo el archivo");

      reader.onload = async (e) => {
          if (e.target) {
              console.log("En el excel");

              const data = e.target.result;
              const workbook = XLSX.read(data, { type: 'binary' });

              const sheetName = workbook.SheetNames[0];
              const sheet = workbook.Sheets[sheetName];

              const ticketList: Ticket[] = [];
              const commentsList: Comment[] = [];
              
              XLSX.utils.sheet_to_json(sheet, { header: 1 }).slice(3).forEach((row: any, index: number) => {
                  rowCounter++; // Incrementa el contador de filas

                  if (row.every((value: any) => value === null || value === undefined || value === '')) {
                      if (rowCounter > maxEmptyColumns) {
                          return;
                      }
                  }

                  const words = row[5] ? row[5].split(" ") : [];
                  const truncatedTitle = words.length > 0 ? words.slice(0, 5).join(" ") : "";

                  console.log("FECHA FECHA DATE DATE")
                  console.log(row[1])

                  const utc_days = Math.floor(row[1] - 25569);
                  const utc_value = utc_days * 86400; 
                  const date_info = new Date(utc_value * 1000); // conversión de segundos a milisegundos

                  // Ajustar la zona horaria ya que Date() asume que el parámetro está en UTC
                  const offset = date_info.getTimezoneOffset() * 60000;
                  const correctedDate = new Date(date_info.getTime() + offset);

                  console.log(correctedDate)

                  const ticket = {
                      createdAt: correctedDate !== undefined ? correctedDate : "",
                      Dealer: row[2] !== undefined ? row[2] : "",
                      Companyname: row[3] !== undefined ? row[3] : "",
                      Reporter: row[4] !== undefined ? row[4] : "",
                      Title: truncatedTitle,
                      Description: row[5] !== undefined ? row[5] : "",
                      VehicleID: row[6] !== undefined ? row[6] : "",
                      Supported: row[7] !== undefined ? row[7] : "",
                      Priority: row[8] !== undefined ? row[8] : "",
                      Solution: row[9] !== undefined ? row[9] : "",
                      Category: row[11] !== undefined ? row[11] : "",
                      Status: row[12] !== undefined ? row[12] : "",
                      isEscalated: row[13] !== undefined ? row[13] : "",
                      Platform: row[14] !== undefined ? row[14] : "",
                      Email: row[15] !== undefined ? row[15] : "",
                  } as Ticket;

                  ticketList.push(ticket);

                  // Check if there is a non-empty comment
                  if (row[10] !== undefined && row[10] !== null) {
                      commentsList.push({
                          Content: row[10],
                          TicketIndex: ticketList.length - 1 // This will be updated with IDTicket after creation
                      });
                  }
              });

              console.log("Total tickets: ", ticketList);
              console.log("Total comments: ", commentsList);

              
              const createdTickets: { IDTicket: number, index: number }[] = [];

              try {
                  // Process tickets in batches
                  for (let i = 0; i < ticketList.length; i += batchSize) {
                      const batch = ticketList.slice(i, i + batchSize);

                      const response = await axios.post(`${process.env.NEXT_PUBLIC_API_URL}/api/import`, batch, {
                          headers: {
                              'Authorization':  `Bearer ${token}`,
                              'Content-Type': 'application/json',
                          },
                      });

                      console.log(response);
                      console.log('Tickets importados exitosamente:', response.data);

                      // Assuming response.data.createdTickets contains the array of created tickets with their IDs
                      response.data.createdTickets.forEach((createdTicket: any, idx: number) => {
                          createdTickets.push({
                              IDTicket: createdTicket.value.IDTicket,
                              index: i + idx
                          });
                      });
                  }

                  // Update commentsList with the correct TicketID
                  for (let comment of commentsList) {
                      const associatedTicket = createdTickets.find(ticket => ticket.index === comment.TicketIndex);
                      if (associatedTicket) {
                          comment.TicketID = associatedTicket.IDTicket;
                      }
                  }

                  console.log("Updated comments with Ticket IDs:", commentsList);

                  // Send comments to the other endpoint
                  for (let comment of commentsList) {
                      if (comment.TicketID !== undefined && comment.Content !== null) {
                          console.log(`Posting comment for TicketID ${comment.TicketID}:`, comment.Content);
                          try {
                              const response = await axios.post(`${process.env.NEXT_PUBLIC_API_URL}/api/comments`, {
                                  Content: comment.Content,
                                  TicketID: comment.TicketID // Use the correct ID field from your API response
                              }, {
                                  headers: {
                                      'Authorization': `Bearer ${token}`,
                                      'Content-Type': 'application/json',
                                  },
                              });

                              console.log('Comentario importado exitosamente:', response.data);

                          } catch (error) {
                              console.error('Error al importar comentario', error);
                          }
                      }
                  }

              } catch (error) {
                  console.error('Error en el proceso de importación', error);
              } finally {
                  setIsLoading(false); // End loading
                  window.location.reload();
              }
          }
      };

      reader.readAsBinaryString(file);
  } else {
      setIsLoading(false); // End loading if no file is selected
  }
};



  const exportToExcel = () => {
    const ticketsForExport = tickets.map(ticket => ({
      IDTicket: ticket.IDTicket,
      Title: ticket.Title,
      Description: ticket.Description,
      Status: ticket.Status,
      Category: ticket.Category,
      Priority: ticket.Priority,
      AssignedUserID: ticket.AssignedUserID,
      CustomerID: ticket.CustomerID,
      Site: ticket.Site,
      Department: ticket.Department,
      createdAt: ticket.createdAt,
      updatedAt: ticket.updatedAt,
      incidentDate: ticket.incidentDate || '',
      driversName: ticket.driversName || '',
      VehicleID: ticket.VehicleID || '',
      Dealer: ticket.Dealer || '',
      Contact: ticket.Contact || '',
      Supported: ticket.Supported || '',
      isEscalated: ticket.isEscalated || '',
      Solution: ticket.Solution || '',
      Platform: ticket.Platform || '',
      Companyname: ticket.Companyname || '',
      Email: ticket.Email || '',
      Reporter: ticket.Reporter || '',
    }));

    const worksheet = XLSX.utils.json_to_sheet(ticketsForExport);
    const workbook = XLSX.utils.book_new();
    XLSX.utils.book_append_sheet(workbook, worksheet, 'Tickets');
    XLSX.writeFile(workbook, 'tickets.xlsx');
  };

  useEffect(() => {
    const ticketsChangedToDone = tickets.some((ticket, index) => {
      const prevTicket = prevTicketsRef.current[index];
      return prevTicket && ticket.Status === 'Done' && prevTicket.Status !== 'Done';
    });
  
    setShowDoneAlert(ticketsChangedToDone);
  
    // Actualizar la referencia de tickets anteriores después de la comparación
    prevTicketsRef.current = tickets;
  }, [tickets]);
  
  useEffect(() => {
    const token = localStorage.getItem('accessToken');
  
    const fetchTickets = async () => {
      try {
        // Usamos POST porque estamos enviando los parámetros en el cuerpo
        const response = await axios.post(
          `${process.env.NEXT_PUBLIC_API_URL}/api/tickets/paginated`,
          { // Enviamos los parámetros en el cuerpo
            page: page,  // Paginación por página
            limit: limit,  // Paginación por límite
          },
          {
            headers: {
              Authorization: `Bearer ${token}`,
            },
          }
        );
  
        console.log("Respuesta:", response.data); // Verificar la respuesta del servidor
  
        const newTickets = response.data.tickets;
        const sortedTickets = newTickets.sort((a: Ticket, b: Ticket) => b.IDTicket - a.IDTicket);
  
        // Añadir los nuevos tickets a los existentes
        setTickets((prevTickets) => [...prevTickets, ...sortedTickets]);
  
        // Verificar si hay más tickets por cargar
        if (response.data.tickets.length < 100) { // Si la cantidad de tickets es menor al límite, no hay más
          setHasMore(false);
        }
      } catch (error) {
        console.error('Error al obtener los tickets:', error);
      }
    };
  
    fetchTickets();
  }, [page]); // Depende de 'page', para que se actualice cuando cambie
  
  
  
  useEffect(() => {
    setTotalPages(Math.ceil(searchResults.length / ticketsPerPage));
  }, [searchResults]);

  useEffect(() => {
    if (showOnlyInProgress) {
      const filteredTickets = tickets.filter(ticket => ticket.Status === 'In progress');
      setSearchResults(filteredTickets);
    } else {
      setSearchResults(tickets);
    }
  }, [showOnlyInProgress, tickets]);

  useEffect(() => {
    if (showOnlyPendingCall) {
      const filteredTickets = tickets.filter(ticket => ticket.Status === 'Pending to call');
      setSearchResults(filteredTickets);
    } else {
      setSearchResults(tickets);
    }
  }, [showOnlyPendingCall, tickets]);
  
  const searchData = (query: any) => {
    
    
     const trimmedQuery: string = query.trim().toLowerCase();
     

     const filteredData = tickets.filter((item: Ticket) => {
         return (
            item.Title.toLowerCase().includes(trimmedQuery) ||
            item.Contact.toLowerCase().includes(trimmedQuery) ||
            item.Dealer.toLowerCase().includes(trimmedQuery) ||
            item.Companyname.toLowerCase().includes(trimmedQuery)||
            item.Supported.toLowerCase().includes(trimmedQuery) ||
            item.VehicleID.toLowerCase().includes(trimmedQuery)
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
      setPage((prevPage) => prevPage + 1);  // Incrementar la página
    }
  };

  const loadPreviousTickets = () => {
    if (currentPage > 1) {
      setCurrentPage(currentPage - 1);  // Decrementar la página
    }
  };

  const [searchQuery, setSearchQuery] = useState(''); // Guarda el texto del input

  const handleFilter = async () => {

    //Aca hacemos el llamado para traer todos los tickets

  const token = localStorage.getItem('accessToken');

    
    try {
      const response = await axios.get(
        `${process.env.NEXT_PUBLIC_API_URL}/api/tickets/`,
      
        {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        }
      );
      
      // Aquí puedes procesar la respuesta si todo va bien
      console.log('Tickets fetched successfully:', response.data);

      const newTickets: Ticket[] = response.data || [];

      console.log("NUEVOS TICKETS")
      console.log(newTickets)


      setTickets(newTickets)


      // Aca filtramos de todos los tickets que hay en la puta plataforma
        const query = searchQuery.toLowerCase();
        const filteredData = newTickets.filter(ticket =>
          ticket.Title?.toLowerCase().includes(query) ||
          ticket.Contact?.toLowerCase().includes(query) ||
          ticket.Dealer?.toLowerCase().includes(query) ||
          ticket.Companyname?.toLowerCase().includes(query) ||
          ticket.Supported?.toLowerCase().includes(query) ||
          ticket.Email?.toLowerCase().includes(query) ||
          ticket.VehicleID?.toLowerCase().includes(query)
        );
        setSearchResults(filteredData);

        
        console.log("datos filtrados")
        console.log(filteredData)

        setTickets(filteredData)


    } catch (error) {
      console.error('Error fetching tickets:', error);

    }
  };

 // En PendingTickets.tsx:
// En PendingTickets.tsx:
useEffect(() => {
  const fetchTickets = async () => {
    const token = localStorage.getItem('accessToken');
    const selectedSite = localStorage.getItem('selectedSite');
    const selectedCustomer = localStorage.getItem('selectedCustomer');
    
    setIsLoading(true);
    
    try {
      // Si NO hay un cliente seleccionado, traer TODOS los tickets
      if (!selectedCustomer || selectedCustomer === '') {
        console.log('No hay cliente seleccionado, trayendo todos los tickets');
        const response = await axios.get(
          `${process.env.NEXT_PUBLIC_API_URL}/api/tickets`,
          {
            headers: {
              Authorization: `Bearer ${token}`,
            },
          }
        );
        
        const sortedTickets = (response.data || []).sort((a: Ticket, b: Ticket) => b.IDTicket - a.IDTicket);
        setTickets(sortedTickets);
        setSearchResults(sortedTickets);
      }
      // Si hay cliente pero no hay sitio, filtrar por cliente
      else if (!selectedSite || selectedSite === '') {
        // Implementar lógica para filtrar solo por cliente si es necesario
        console.log('Cliente seleccionado, pero no sitio');
        // Llamada al API aquí...
        // AÑADIR ORDENAMIENTO TAMBIÉN AQUÍ CUANDO IMPLEMENTES ESTA PARTE
      }
      // Si hay cliente y sitio, filtrar por ambos
      else {
        console.log(`Buscando tickets para el sitio ${selectedSite}`);
        const response = await axios.get(
          `${process.env.NEXT_PUBLIC_API_URL}/api/ticket/site?locationCD=${selectedSite}`,
          {
            headers: {
              Authorization: `Bearer ${token}`,
            },
          }
        );
        
        const sortedTickets = (response.data || []).sort((a: Ticket, b: Ticket) => b.IDTicket - a.IDTicket);
        setTickets(sortedTickets);
        setSearchResults(sortedTickets);
      }
    } catch (error) {
      console.error('Error al obtener tickets:', error);
    } finally {
      setIsLoading(false);
    }
  };
  
  fetchTickets();
}, [filterChanged]); // Reaccionar cuando filterChanged cambia // Reaccionar cuando filterChanged cambia


  return (
    <>
      {isLoading ? (
        <div className="fixed inset-0 flex items-center justify-center bg-gray-100">
          <div className="text-2xl font-bold text-center">
            Loading... Importing data may take a while depending on the number of entries. Please wait.
          </div>
        </div>
      ) : (
        <div className="bg-teal-50 min-h-screen  px-6">
          <div className="max-w-7xl mx-auto">
           

            {/* Search section */}
            <div className='bg-white rounded-lg shadow-lg p-4 mb-6'>
              <div className="flex gap-4 items-center">
                <input
                  type='search'
                  placeholder='Search'
                  className='flex-1 p-2 border border-teal-200 rounded-md text-sm focus:outline-none focus:ring-2 focus:ring-teal-500'
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                />
                <button
                  className="bg-teal-500 text-white px-4 py-2 rounded-md hover:bg-teal-600 transition-colors"
                  onClick={handleFilter}
                >
                  Filter
                </button>
              </div>
            </div>

            {/* Import/Export buttons */}
            <div className="flex gap-4 mb-6">
              <button
                className="bg-teal-500 text-white px-4 py-2 rounded-md hover:bg-teal-600 transition-colors flex items-center"
                onClick={handleButtonClick}
              >
                Import
                <Image src="/import.png" alt="Import" width={16} height={16} className="ml-2" />
                <input
                  type="file"
                  onChange={handleLoading}
                  accept=".xls, .xlsx"
                  className="hidden"
                  ref={fileInputRef}
                />
              </button>
              <button
                className="bg-teal-500 text-white px-4 py-2 rounded-md hover:bg-teal-600 transition-colors flex items-center"
                onClick={exportToExcel}
              >
                Export
                <Image src="/export.png" alt="Export" width={16} height={16} className="ml-2" />
              </button>

              <label className="flex items-center bg-white p-3 rounded-md shadow-sm">
                <input
                  type="checkbox"
                  checked={showOnlyInProgress}
                  onChange={() => setShowOnlyInProgress(!showOnlyInProgress)}
                  className="mr-2"
                />
                <span className="text-gray-700">Show only tickets "In Progress"</span>
              </label>

              <label className="flex items-center bg-white p-3 rounded-md shadow-sm">
                <input
                  type="checkbox"
                  checked={showOnlyPendingCall}
                  onChange={() => setShowOnlyPendingCall(!showOnlyPendingCall)}
                  className="mr-2"
                />
                <span className="text-gray-700">Show only tickets "Pending call"</span>
              </label>

            </div>

            {/* Filters */}
            {/* <div className="flex gap-4 mb-6">
              <label className="flex items-center bg-white p-3 rounded-md shadow-sm">
                <input
                  type="checkbox"
                  checked={showOnlyInProgress}
                  onChange={() => setShowOnlyInProgress(!showOnlyInProgress)}
                  className="mr-2"
                />
                <span className="text-gray-700">Show only tickets "In Progress"</span>
              </label>
              <label className="flex items-center bg-white p-3 rounded-md shadow-sm">
                <input
                  type="checkbox"
                  checked={showOnlyPendingCall}
                  onChange={() => setShowOnlyPendingCall(!showOnlyPendingCall)}
                  className="mr-2"
                />
                <span className="text-gray-700">Show only tickets "Pending call"</span>
              </label>
            </div> */}

            {/* Table */}
            <div className="bg-white rounded-lg shadow-lg overflow-hidden">
              <table className="w-full">
                <thead>
                  <tr className="bg-teal-500 text-white">
                    <th className="px-6 py-3 text-center text-sm font-semibold" onClick={() => handleSort('IDTicket')}>ID</th>
                    <th className="px-6 py-3 text-center text-sm font-semibold" onClick={() => handleSort('createdAt')}>Date</th>
                    <th className="px-6 py-3 text-center text-sm font-semibold" onClick={() => handleSort('Dealer')}>Dealer</th>
                    <th className="px-6 py-3 text-center text-sm font-semibold" onClick={() => handleSort('Companyname')}>Company</th>
                    <th className="px-6 py-3 text-center text-sm font-semibold" onClick={() => handleSort('Contact')}>Contact</th>
                    <th className="px-6 py-3 text-center text-sm font-semibold" onClick={() => handleSort('VehicleID')}>Email Subject</th>
                    <th className="px-6 py-3 text-center text-sm font-semibold" onClick={() => handleSort('Supported')}>Supported by</th>
                    <th className="px-6 py-3 text-center text-sm font-semibold">Category</th>
                    <th className="px-6 py-3 text-center text-sm font-semibold">Status</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-gray-200">
                  {searchResults.map((ticket, index) => (
                    <TicketRowItem
                      key={index}
                      ticket={ticket as any}
                      style={{ backgroundColor: index % 2 === 0 ? '#f9fafb' : 'white' }}
                      index={index}
                    />
                  ))}
                </tbody>
              </table>
            </div>

            {/* Load More Button */}
            <div className="flex justify-center mt-6 pb-8">
              <button
                onClick={loadMoreTickets}
                disabled={currentPage === totalPages}
                className="bg-teal-500 text-white px-8 py-3 rounded-md hover:bg-teal-600 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
              >
                Load More
              </button>
            </div>
          </div>
        </div>
      )}
      {showDoneAlert}
      <ChatWidget />
    </>
  );}
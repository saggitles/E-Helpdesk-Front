import React, { useEffect, useState } from 'react';
import axios from 'axios';
import { ToastContainer, toast } from 'react-toastify';
import 'react-toastify/dist/ReactToastify.css';
import { useRouter } from 'next/router';
import Navbar from '../../../generic_comp/navbar'



// Definir la interfaz para los tickets
interface Ticket {
  IDGuestTicket: number;
  yourName: string;
  yourEmail: string;
  vehicleIdOrDriverName: string;
  reportedBy: string;
  companyName: string;
  issue: string;
  issueTime: string;
}

const GuestTicketsList: React.FC = () => {
  const router = useRouter();
  const [tickets, setTickets] = useState<Ticket[]>([]);

  useEffect(() => {
    const fetchTickets = async () => {
      try {
        const response = await axios.get(`${process.env.NEXT_PUBLIC_API_URL}/api/getGuestTickets`);
        setTickets(response.data);
      } catch (error) {
        console.error('Error fetching guest tickets:', error);
        toast.error('Error fetching tickets from the server.');
      }
    };

    fetchTickets();
  }, []);

  const handleGoHome = () => {
    router.push('/support/create/ticket');
  };

  const handleApprove = async (IDGuestTicket: number) => {
    const appToken = localStorage.getItem('accessToken') || '';
    try {
      const response = await axios.post(`${process.env.NEXT_PUBLIC_API_URL}/api/approveGuestTicket/${IDGuestTicket}`, {}, {
        headers: {
          Authorization: `Bearer ${appToken}`,
        },
      });

      if (response.status === 200 || response.status === 201) {
        setTickets(prevTickets => prevTickets.filter(ticket => ticket.IDGuestTicket !== IDGuestTicket));
        toast.success('Ticket approved successfully!');
      } else {
        throw new Error('Failed to approve ticket');
      }
    } catch (error) {
      console.error('Error approving ticket:', error);
      toast.error('Failed to approve ticket.');
    }
  };

  const handleDelete = async (IDGuestTicket: number) => {
    try {
      const response = await axios.delete(`${process.env.NEXT_PUBLIC_API_URL}/api/deleteGuestTicket/${IDGuestTicket}`);
      if (response.status === 200) {
        setTickets(prevTickets => prevTickets.filter(ticket => ticket.IDGuestTicket !== IDGuestTicket));
        toast.success('Ticket deleted successfully!');
      } else {
        throw new Error('Failed to delete ticket');
      }
    } catch (error) {
      console.error('Error deleting ticket:', error);
      toast.error('Failed to delete ticket.');
    }
  };

  return (
    <>
    
      <div className="bg-white overflow-x-hidden fixed top-0 right-0 left-0 z-50 w-full">
      <Navbar/>
        <div className="p-4 w-full max-w-2xl mx-auto overflow-y-auto custom-scrollbar" style={{ height: 'calc(100vh - 1rem)' }}>
          <div className="flex flex-col items-center rounded-lg bg-white shadow-lg">

          <div className="w-full justify-between p-4 md:p-5 border-b rounded-t mt-5" style={{ backgroundColor: '#2eb8b6' }}>
              <h3 className="text-lg font-semibold text-white">Guest Tickets</h3>
              {/* <button onClick={handleGoHome} className="bg-gray-50 hover:bg-teal-500 hover:text-white focus:ring-4 focus:outline-none focus:ring-teal-300 font-medium rounded-lg text-sm px-5 py-2.5 text-center border border-teal-400">Home</button> */}
            </div>
            {tickets.length === 0 ? (
              <p className="text-center text-lg text-teal-700">No tickets available.</p>
            ) : (
              <ul className="w-full p-0">
                {tickets.map((ticket) => (
                  <li key={ticket.IDGuestTicket} className="bg-gray-50 border border-teal-300 text-teal-900 p-4 mb-4 rounded-lg">
                    <h4 className="text-lg font-bold mb-2">{ticket.issue}</h4>
                    <p><strong>Reported by:</strong> {ticket.reportedBy}</p>
                    <p><strong>Vehicle ID/Driver Name:</strong> {ticket.vehicleIdOrDriverName}</p>
                    <p><strong>Company Name:</strong> {ticket.companyName}</p>
                    <p><strong>Issue Time:</strong> {new Date(ticket.issueTime).toLocaleString()}</p>
                    <div className="flex justify-between mt-2">
                      <button onClick={() => handleApprove(ticket.IDGuestTicket)} className="text-teal-700 bg-gray-50 hover:bg-teal-500 hover:text-white focus:ring-4 focus:outline-none focus:ring-teal-300 font-medium rounded-lg text-sm px-5 py-2.5 text-center border border-teal-400">Approve</button>
                      <button onClick={() => handleDelete(ticket.IDGuestTicket)} className="text-teal-700 bg-gray-50 hover:bg-red-500 hover:text-white focus:ring-4 focus:outline-none focus:ring-red-300 font-medium rounded-lg text-sm px-5 py-2.5 text-center border border-red-400">Delete</button>
                    </div>
                  </li>
                ))}
              </ul>
            )}
          </div>
        </div>
      </div>
      <ToastContainer />
      <style jsx global>{`
        .custom-scrollbar::-webkit-scrollbar {
          display: none; /* para Chrome, Safari y Opera */
        }
        .custom-scrollbar {
          -ms-overflow-style: none;  /* IE y Edge */
          scrollbar-width: none;  /* Firefox */
        }
      `}</style>
    </>
  );
};

export default GuestTicketsList;





// const response = await axios.post(`${process.env.NEXT_PUBLIC_API_URL}/api/approveGuestTicket/${IDGuestTicket}`, {}, {
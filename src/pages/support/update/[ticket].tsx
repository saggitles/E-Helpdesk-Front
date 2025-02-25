import { useRouter } from 'next/router';
import { useState } from 'react';
import Navbar from '@/generic_comp/navbar';

const Ticket = () => {
  const router = useRouter();
  const {
    ticketNumber,
    title,
    dealer,
    description,
    Contact,
    priority,
    status,
    customer,
    department,
    site,
    create,
    update,
    category,
    Companyname,
    VehicleID,
    Supported

    
  } = router.query as Record<string, string | string[]>;

  // Convierte los valores obtenidos de router.query a string para evitar problemas de tipo
  const initialTicketState = {
    IDTicket: parseInt(ticketNumber as string, 10),
    Title: title as string,
    Description: description as string,
    Dealer: dealer as string,
    Priority: priority as string,
    Status: status as string,
    // CustomerID: customer as string,
    CustomerID: 1, // Change this!
    Department: department as string,
    Site: site as string,
    category: category as string,
    createdAt: create as string,
    updatedAt: update as string,
    Companyname: Companyname as string,
    Contact: Contact as string,
    VehicleID: VehicleID as string,
    Supported: Supported as string

    // Otros campos del ticket
  };

  const [ticket, setTicket] = useState(initialTicketState);


  const getStatusColor = (status: string): string => {
    switch (status) {
      case 'In Progress':
        return 'red';
      case 'Done':
        return 'red';
      case 'Scaled':
        return 'red';
      case 'To Do':
          return 'red';
      case "Won't do":
        return 'red';
        
      default:
        return 'red';
    }
  };

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>) => {
    const { name, value } = e.target;
    setTicket((prevTicket) => ({ ...prevTicket, [name]: value }));
  };

  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();

    try {

      const token = localStorage.getItem('accessToken'); 

      const response = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/api/tickets/${ticketNumber}`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
      },
        body: JSON.stringify(ticket),
      });

      if (response.ok) {
        console.log('Ticket actualizado con éxito');
      } else {
        console.error('Error al actualizar el ticket');
      }
    } catch (error) {
      console.error('Error al realizar la solicitud:', error);
    }
  };

  return (
    <div>
      <Navbar />
      <div className="bg-gray-100 min-h-screen p-4 border">
    <div className="max-w-5xl mx-auto bg-white p-8 mt-8 rounded shadow-md">
    <h1 className="text-2xl font-semibold mb-4">Edit Ticket {ticketNumber}</h1>
    <form onSubmit={handleSubmit}>

          <div className="grid grid-cols-3 gap-4">
            <label className="block mb-4">
              <span className="text-gray-700">Title:</span>
              <input
                type="text"
                value={ticket.Title}
                name="Title"
                onChange={handleInputChange}
                className="mt-1 p-2 w-full border rounded"
              />
            </label>
            <label className="block mb-4">
              <span className="text-gray-700">Description:</span>
              <textarea
                value={ticket.Description}
                name="Description"
                onChange={handleInputChange}
                className="mt-1 p-2 w-full border rounded"
              />
            </label>

            <label className="block mb-4">
              <span className="text-gray-700">Dealer:</span>
              <textarea
                value={ticket.Dealer}
                name="Dealer"
                onChange={handleInputChange}
                className="mt-1 p-2 w-full border rounded"
              />
            </label>

            <label className="block mb-4">
              <span className="text-gray-700">Company:</span>
              <textarea
                value={ticket.Companyname}
                name="Companyname"
                onChange={handleInputChange}
                className="mt-1 p-2 w-full border rounded"
              />
            </label>

            <label className="block mb-4">
              <span className="text-gray-700">Contact:</span>
              <textarea
                value={ticket.Contact}
                name="Contact"
                onChange={handleInputChange}
                className="mt-1 p-2 w-full border rounded"
              />
            </label>

            <label className="block mb-4">
              <span className="text-gray-700">Vehicle identifier:</span>
              <textarea
                value={ticket.Contact}
                name="Contact"
                onChange={handleInputChange}
                className="mt-1 p-2 w-full border rounded"
              />
            </label>

            <label className="block mb-4">
              <span className="text-gray-700">Vehicle identifier:</span>
              <textarea
                value={ticket.VehicleID}
                name="VehicleID"
                onChange={handleInputChange}
                className="mt-1 p-2 w-full border rounded"
              />
            </label>

            <label className="block mb-4">
              <span className="text-gray-700">Supported by:</span>
              <textarea
                value={ticket.Supported}
                name="Supported"
                onChange={handleInputChange}
                className="mt-1 p-2 w-full border rounded"
              />
            </label>
            


            <label className="block mb-4">
              <span className="text-gray-700">Priority:</span>
              <input
                type="text"
                value={ticket.Priority}
                name="Priority"
                onChange={handleInputChange}
                className="mt-1 p-2 w-full border rounded"
              />
            </label>

            <label className="block mb-4">
              <span className="text-gray-700">Status:</span>
              <select
                value={ticket.Status}
                name="Status"
                onChange={handleInputChange}
                className="mt-1 p-2 w-full border rounded"
                style={{ backgroundColor: getStatusColor(ticket.Status), color: 'white' }}
              >
                <option value={ticket.Status} style={{ backgroundColor: getStatusColor(ticket.Status), color: 'white' }}>
                  {ticket.Status}
                </option>
                <option value='In progress' style={{ backgroundColor: '#e6d856', color: 'white' }}>
                  In progress
                </option>
                <option value='Done' style={{ backgroundColor: '#92cc75', color: 'white' }}>
                  Done
                </option>
                <option value='Scaled' style={{ backgroundColor: '#7ea6d3', color: 'white' }}>
                  Scaled
                </option>
                <option value="To Do" style={{ backgroundColor: '#ea7d7d', color: 'white' }}>
                  To Do
                </option>
                <option value="Won't do" style={{ backgroundColor: '#a4a89e', color: 'white' }}>
                  Won't do
                </option>
                <option value="Pending to call" style={{ backgroundColor: '#800080  ', color: 'white' }}>
                      Pending to call
                </option>
              </select>
            </label>


            <label className="block mb-4">
              <span className="text-gray-700">Category:</span>
              <select
                value={ticket.category}
                name="category"
                onChange={handleInputChange}
                className="mt-1 p-2 w-full border rounded"
              >
                <option value="Checklist issue">Checklist issue</option>
                <option value="Software Issue">Software Issue</option>
                <option value="Hardware Issue">Hardware Issue</option>
                <option value="Pin/card Issue">Pin/card Issue</option>
                <option value="Dashboard Issue">Dashboard Issue</option>
                <option value="Improvement Request">Improvement Request</option>
                <option value="Connectivity Issue">Connectivity Issue</option>
                <option value="User Unawareness">User Unawareness</option>
                <option value="Team Request (support)">Team Request (support)</option>
                <option value="Server Down">Server Down</option>
                <option value="Impact Calibrations">Impact Calibrations</option>
                <option value="Polarity Idle Timer Issue">Polarity Idle Timer Issue</option>
                <option value="GPS Issue">GPS Issue</option>
              </select>
            </label>

            <label className="block mb-4">
              <span className="text-gray-700">Customer:</span>
              <input
                type="text"
                value={ticket.CustomerID}
                name="Customer"
                onChange={handleInputChange}
                className="mt-1 p-2 w-full border rounded"
              />
            </label>

            </div>
            
            <button
              type="submit"
              className="bg-transparent border-primary text-primary text-md font-semibold rounded-full block outline-none py-2.5 px-5 mr-5 mb-5 mt-5">
              Save
            </button>
          </form>
        </div>
      </div>
    </div>
  );
};

export default Ticket;

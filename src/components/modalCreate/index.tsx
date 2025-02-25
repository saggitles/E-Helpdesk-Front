import { useState, FormEvent, ChangeEvent } from 'react';
import { toast } from 'react-toastify';

interface TicketModalProps {
  isOpen: boolean;
  onClose: () => void;
  formData: {
    company: string;
    site: string;
    contactName: string;
    phone: string;
  };
  selectedSite: {
    LOCATION_CD: number;
    NAME: string;
  } | null;
}

const TicketModal = ({ isOpen, onClose, formData, selectedSite }: TicketModalProps) => {
  const [ticketData, setTicketData] = useState({
    description: '',
    category: 'Support',
    incidentDate: new Date().toISOString().split('T')[0],
    driversName: '',
    vehicleID: '',
    supported: '',
    status: 'New',
    email: '',
    priority: 'Medium',
    platform: 'FleetXQ',
    solution: ''
  });
  const [files, setFiles] = useState<FileList | null>(null);

  if (!isOpen) return null;

  const handleChange = (e: ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>) => {
    const { name, value } = e.target;
    setTicketData({
      ...ticketData,
      [name]: value
    });
  };

  const handleFileChange = (e: ChangeEvent<HTMLInputElement>) => {
    if (e.target.files) {
      setFiles(e.target.files);
    }
  };

  const handleSubmitTicket = async (e: FormEvent) => {
    e.preventDefault();
    try {
      // Crear un FormData para enviar archivos
      const formDataToSend = new FormData();
      
      // Añadir datos del ticket
      const ticketPayload = {
        Title: `Support request from ${formData.company}`,
        LocationCD: selectedSite?.LOCATION_CD,
        Site: formData.site,
        Contact: formData.contactName,
        Priority: ticketData.priority,
        Status: ticketData.status,
        Category: ticketData.category,
        Companyname: formData.company,
        Description: ticketData.description,
        incidentDate: ticketData.incidentDate,
        driversName: ticketData.driversName,
        VehicleID: ticketData.vehicleID,
        Supported: ticketData.supported,
        Email: ticketData.email,
        Platform: ticketData.platform,
        Solution: ticketData.solution
      };
      
      formDataToSend.append('ticket', JSON.stringify(ticketPayload));
      
      // Añadir archivos
      if (files) {
        for (let i = 0; i < files.length; i++) {
          formDataToSend.append('files', files[i]);
        }
      }

      const response = await fetch('http://localhost:8080/api/tickets', {
        method: 'POST',
        body: formDataToSend
      });

      if (!response.ok) {
        throw new Error('Error creating ticket');
      }

      toast.success('Ticket created successfully!', {
        position: "bottom-right",
        autoClose: 2000
      });
      
      onClose();
    } catch (error) {
      console.error('Error submitting ticket:', error);
      toast.error('Error creating ticket');
    }
  };

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex justify-center items-center z-50">
      <div className="bg-white rounded-lg w-full max-w-4xl p-6 relative max-h-[90vh] overflow-y-auto">
        <button 
          onClick={onClose}
          className="absolute top-3 right-3 text-gray-500 hover:text-gray-800"
        >
          <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M6 18L18 6M6 6l12 12" />
          </svg>
        </button>
        
        <h2 className="text-xl font-semibold text-teal-700 mb-4">Issue Details</h2>
        
        <form onSubmit={handleSubmitTicket}>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Category</label>
              <select
                name="category"
                value={ticketData.category}
                onChange={handleChange}
                className="w-full p-2.5 text-sm border border-teal-300 rounded-lg focus:ring-teal-500 focus:border-teal-500 bg-gray-50"
              >
                <option value="Support">Support</option>
                <option value="Bug">Bug</option>
                <option value="Feature Request">Feature Request</option>
                <option value="Technical Issue">Technical Issue</option>
                <option value="Other">Other</option>
              </select>
            </div>
            
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Priority</label>
              <select
                name="priority"
                value={ticketData.priority}
                onChange={handleChange}
                className="w-full p-2.5 text-sm border border-teal-300 rounded-lg focus:ring-teal-500 focus:border-teal-500 bg-gray-50"
              >
                <option value="Low">Low</option>
                <option value="Medium">Medium</option>
                <option value="High">High</option>
                <option value="Critical">Critical</option>
              </select>
            </div>
            
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Status</label>
              <select
                name="status"
                value={ticketData.status}
                onChange={handleChange}
                className="w-full p-2.5 text-sm border border-teal-300 rounded-lg focus:ring-teal-500 focus:border-teal-500 bg-gray-50"
              >
                <option value="New">New</option>
                <option value="In Progress">In Progress</option>
                <option value="Pending">Pending</option>
                <option value="Resolved">Resolved</option>
                <option value="Closed">Closed</option>
              </select>
            </div>
            
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Platform</label>
              <select
                name="platform"
                value={ticketData.platform}
                onChange={handleChange}
                className="w-full p-2.5 text-sm border border-teal-300 rounded-lg focus:ring-teal-500 focus:border-teal-500 bg-gray-50"
              >
                <option value="FleetXQ">FleetXQ</option>
                <option value="FleetIQ">FleetIQ</option>
                <option value="Fleet Focus">Fleet Focus</option>
              </select>
            </div>
            
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Incident Date</label>
              <input
                type="date"
                name="incidentDate"
                value={ticketData.incidentDate}
                onChange={handleChange}
                className="w-full p-2.5 text-sm border border-teal-300 rounded-lg focus:ring-teal-500 focus:border-teal-500 bg-gray-50"
              />
            </div>
            
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Driver's Name</label>
              <input
                type="text"
                name="driversName"
                value={ticketData.driversName}
                onChange={handleChange}
                className="w-full p-2.5 text-sm border border-teal-300 rounded-lg focus:ring-teal-500 focus:border-teal-500 bg-gray-50"
                placeholder="Enter driver's name"
              />
            </div>
            
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Vehicle ID / GMTP ID</label>
              <input
                type="text"
                name="vehicleID"
                value={ticketData.vehicleID}
                onChange={handleChange}
                className="w-full p-2.5 text-sm border border-teal-300 rounded-lg focus:ring-teal-500 focus:border-teal-500 bg-gray-50"
                placeholder="Enter vehicle ID or GMTP ID"
              />
            </div>
            
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Supported By</label>
              <input
                type="text"
                name="supported"
                value={ticketData.supported}
                onChange={handleChange}
                className="w-full p-2.5 text-sm border border-teal-300 rounded-lg focus:ring-teal-500 focus:border-teal-500 bg-gray-50"
                placeholder="Enter who is supporting"
              />
            </div>
            
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Email</label>
              <input
                type="email"
                name="email"
                value={ticketData.email}
                onChange={handleChange}
                className="w-full p-2.5 text-sm border border-teal-300 rounded-lg focus:ring-teal-500 focus:border-teal-500 bg-gray-50"
                placeholder="Enter contact email"
              />
            </div>
          </div>
          
          <div className="mb-4">
            <label className="block text-sm font-medium text-gray-700 mb-1">Description</label>
            <textarea
              name="description"
              value={ticketData.description}
              onChange={handleChange}
              rows={4}
              className="w-full p-2.5 text-sm border border-teal-300 rounded-lg focus:ring-teal-500 focus:border-teal-500 bg-gray-50"
              placeholder="Describe the issue in detail..."
              required
            />
          </div>
          
          <div className="mb-4">
            <label className="block text-sm font-medium text-gray-700 mb-1">Solution</label>
            <textarea
              name="solution"
              value={ticketData.solution}
              onChange={handleChange}
              rows={3}
              className="w-full p-2.5 text-sm border border-teal-300 rounded-lg focus:ring-teal-500 focus:border-teal-500 bg-gray-50"
              placeholder="Provide a solution if available..."
            />
          </div>
          
          <div className="mb-4">
            <label className="block text-sm font-medium text-gray-700 mb-1">Attachments</label>
            <input
              type="file"
              onChange={handleFileChange}
              className="w-full p-2.5 text-sm border border-teal-300 rounded-lg focus:ring-teal-500 focus:border-teal-500 bg-gray-50"
              multiple
            />
            <p className="text-xs text-gray-500 mt-1">Upload screenshots or relevant files</p>
          </div>
          
          <div className="flex justify-end">
            <button
              type="button"
              onClick={onClose}
              className="mr-2 px-4 py-2 bg-gray-200 text-gray-700 rounded-lg hover:bg-gray-300 focus:outline-none focus:ring-2 focus:ring-gray-400 focus:ring-offset-2"
            >
              Cancel
            </button>
            <button
              type="submit"
              className="px-4 py-2 bg-teal-500 text-white rounded-lg hover:bg-teal-600 focus:outline-none focus:ring-2 focus:ring-teal-500 focus:ring-offset-2"
            >
              Create Ticket
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default TicketModal;
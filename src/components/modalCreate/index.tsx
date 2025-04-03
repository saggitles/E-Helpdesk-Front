'use client';
import { useState, FormEvent, ChangeEvent, useEffect } from 'react';
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
  onTicketCreated?: () => void; // Callback para actualizar los tickets después de crear uno nuevo
}

const TicketModal = ({
  isOpen,
  onClose,
  formData,
  selectedSite,
  onTicketCreated,
}: TicketModalProps) => {
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
    solution: '',
  });
  const [files, setFiles] = useState<FileList | null>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [availableGMPTs, setAvailableGMPTs] = useState<string[]>([]);
  const [filteredGMPTs, setFilteredGMPTs] = useState<string[]>([]);
  const [selectedGMPTs, setSelectedGMPTs] = useState<string[]>([]);
  const [gmptInput, setGMPTInput] = useState('');

  // Mostrar o no el modal
  if (!isOpen) return null;

  const handleChange = (
    e: ChangeEvent<
      HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement
    >
  ) => {
    const { name, value } = e.target;
    setTicketData({
      ...ticketData,
      [name]: value,
    });
  };

  const handleFileChange = (e: ChangeEvent<HTMLInputElement>) => {
    if (e.target.files) {
      setFiles(e.target.files);
    }
  };

  const handleSubmitTicket = async (e: FormEvent) => {
    e.preventDefault();

    // Validación básica
    if (!ticketData.description.trim()) {
      toast.error('Description is required');
      return;
    }

    setIsSubmitting(true);

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
        Solution: ticketData.solution,
        phone: formData.phone, // Añadir el teléfono del contacto
      };

      formDataToSend.append('ticket', JSON.stringify(ticketPayload));

      // Añadir archivos
      if (files) {
        for (let i = 0; i < files.length; i++) {
          formDataToSend.append('files', files[i]);
        }
      }

      // Spinner CSS
      const styleElement = document.createElement('style');
      styleElement.textContent = `
        @keyframes spinner-border {
          to { transform: rotate(360deg); }
        }
        .submit-spinner {
          display: inline-block;
          width: 1rem;
          height: 1rem;
          border: 0.2em solid currentColor;
          border-right-color: transparent;
          border-radius: 50%;
          animation: spinner-border 0.75s linear infinite;
          margin-right: 0.5rem;
        }
      `;
      document.head.appendChild(styleElement);

      const response = await fetch('http://localhost:8080/api/tickets', {
        method: 'POST',
        body: formDataToSend,
      });

      if (!response.ok) {
        throw new Error('Error creating ticket');
      }

      toast.success('Ticket created successfully!', {
        position: 'bottom-right',
        autoClose: 2000,
      });

      // Limpiar el formulario
      setTicketData({
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
        solution: '',
      });
      setFiles(null);

      // Llamar al callback para actualizar los tickets
      if (onTicketCreated) {
        onTicketCreated();
      }

      onClose();
    } catch (error) {
      console.error('Error submitting ticket:', error);
      toast.error('Error creating ticket');
    } finally {
      setIsSubmitting(false);
      document.head.removeChild(document.head.lastChild as Node);
    }
  };

  // CSS para spinner
  useEffect(() => {
    if (!document.getElementById('modal-spinner-styles')) {
      const style = document.createElement('style');
      style.id = 'modal-spinner-styles';
      style.innerHTML = `
        @keyframes spinner-border {
          to { transform: rotate(360deg); }
        }
        .submit-spinner {
          display: inline-block;
          width: 1rem;
          height: 1rem;
          border: 0.2em solid currentColor;
          border-right-color: transparent;
          border-radius: 50%;
          animation: spinner-border 0.75s linear infinite;
          margin-right: 0.5rem;
        }
      `;
      document.head.appendChild(style);
    }

    return () => {
      const styleElement = document.getElementById('modal-spinner-styles');
      if (styleElement) {
        styleElement.remove();
      }
    };
  }, []);

  useEffect(() => {
    const fetchGmptCodes = async () => {
      if (!selectedSite) return;

      try {
        const response = await fetch(
          `http://localhost:8080/api/gmpt-codes?locationCD=${selectedSite}`
        );
        const data = await response.json();
        setAvailableGMPTs(data); // useState to store available GMPT codes
      } catch (error) {
        console.error('Error fetching GMPT codes:', error);
      }
    };

    fetchGmptCodes();
  }, [selectedSite]);

  return (
    <div className='fixed inset-0 bg-black bg-opacity-50 flex justify-center items-center z-50'>
      <div className='bg-white rounded-lg w-full max-w-4xl p-6 relative max-h-[90vh] overflow-y-auto'>
        <button
          onClick={onClose}
          className='absolute top-3 right-3 text-gray-500 hover:text-gray-800'
          disabled={isSubmitting}
        >
          <svg
            className='w-6 h-6'
            fill='none'
            stroke='currentColor'
            viewBox='0 0 24 24'
          >
            <path
              strokeLinecap='round'
              strokeLinejoin='round'
              strokeWidth='2'
              d='M6 18L18 6M6 6l12 12'
            />
          </svg>
        </button>

        <h2 className='text-xl font-semibold text-teal-700 mb-4'>
          Issue Details
        </h2>

        <form onSubmit={handleSubmitTicket}>
          <div className='grid grid-cols-1 md:grid-cols-2 gap-4 mb-4'>
            <div>
              <label className='block text-sm font-medium text-gray-700 mb-1'>
                Category
              </label>
              <select
                name='category'
                value={ticketData.category}
                onChange={handleChange}
                className='w-full p-2.5 text-sm border border-teal-300 rounded-lg focus:ring-teal-500 focus:border-teal-500 bg-gray-50'
                disabled={isSubmitting}
              >
                <option value=''>Select a category</option>
                <option value='Checklist issue'>Checklist issue</option>
                <option value='Pin/card issue'>Pin/card Issue</option>
                <option value='Software issue'>Software Issue</option>
                <option value='Hardware issue'>Hardware Issue</option>
                <option value='Dasbhoard issue'>Dashboard Issue</option>
                <option value='Conectivity issue'>
                  Connectivity Issue
                </option>
                <option value='User awareness'>User Awareness</option>
                <option value='Team Request'>Team Request</option>
                <option value='Impact calibrations'>
                  Impact Calibrations
                </option>
                <option value='Polarity Idle timer Issue'>
                  Polarity Idle Timer Issue
                </option>
                <option value='Gps issue'>Gps Issue</option>
                <option value='Server down'>Server Down</option>
                <option value='Improvement Request'>
                  Improvement Request
                </option>
                <option value='Lockout'>Lockout</option>
              </select>
            </div>

            <div>
              <label className='block text-sm font-medium text-gray-700 mb-1'>
                Priority
              </label>
              <select
                name='priority'
                value={ticketData.priority}
                onChange={handleChange}
                className='w-full p-2.5 text-sm border border-teal-300 rounded-lg focus:ring-teal-500 focus:border-teal-500 bg-gray-50'
                disabled={isSubmitting}
              >
                <option value='low'>Low</option>
                <option value='normal'>Normal</option>
                <option value='high'>High</option>
              </select>
            </div>

            <div>
              <label className='block text-sm font-medium text-gray-700 mb-1'>
                Status
              </label>
              <select
                name='status'
                value={ticketData.status}
                onChange={handleChange}
                className='w-full p-2.5 text-sm border border-teal-300 rounded-lg focus:ring-teal-500 focus:border-teal-500 bg-gray-50'
                disabled={isSubmitting}
              >
                <option
                  value='First Contact'
                  style={{ backgroundColor: '#e6d856', color: 'white' }}
                >
                  First Contact
                </option>
                <option
                  value='Waiting information'
                  style={{ backgroundColor: '#800080', color: 'white' }}
                >
                  Waiting information
                </option>
                <option
                  value='Warranty sent'
                  style={{ backgroundColor: '#9932CC', color: 'white' }} // changed from #800080 to a slightly different purple
                >
                  Warranty sent
                </option>
                <option
                  value='Waiting confirmation'
                  style={{ backgroundColor: '#8A2BE2', color: 'white' }} // changed from #800080 to blue-violet
                >
                  Waiting confirmation
                </option>
                <option
                  value='In progress'
                  style={{ backgroundColor: '#e6d856', color: 'white' }}
                >
                  In progress
                </option>
                <option
                  value='Done'
                  style={{ backgroundColor: '#92cc75', color: 'white' }}
                >
                  Done
                </option>
                <option
                  value='Scaled'
                  style={{ backgroundColor: '#7ea6d3', color: 'white' }}
                >
                  Scaled
                </option>

                <option
                  value="Won't do"
                  style={{ backgroundColor: '#a4a89e', color: 'white' }}
                >
                  Won't do
                </option>
                <option
                  value='To do'
                  style={{ backgroundColor: '#9370DB  ', color: 'white' }}
                >
                  To do
                </option>
              </select>
            </div>

            <div>
              <label className='block text-sm font-medium text-gray-700 mb-1'>
                Platform
              </label>
              <select
                name='platform'
                value={ticketData.platform}
                onChange={handleChange}
                className='w-full p-2.5 text-sm border border-teal-300 rounded-lg focus:ring-teal-500 focus:border-teal-500 bg-gray-50'
                disabled={isSubmitting}
              >
                <option value='FleetIQ'>FleetIQ</option>
                <option value='RentalIQ'>RentalIQ</option>
                <option value='FleetXQ'>FleetXQ</option>
                <option value='Fleet Focus'>Fleet Focus</option>
              </select>
            </div>

            <div>
              <label className='block text-sm font-medium text-gray-700 mb-1'>
                Incident Date
              </label>
              <input
                type='date'
                name='incidentDate'
                value={ticketData.incidentDate}
                onChange={handleChange}
                className='w-full p-2.5 text-sm border border-teal-300 rounded-lg focus:ring-teal-500 focus:border-teal-500 bg-gray-50'
                disabled={isSubmitting}
              />
            </div>

            <div>
              <label className='block text-sm font-medium text-gray-700 mb-1'>
                Driver's Name
              </label>
              <input
                type='text'
                name='driversName'
                value={ticketData.driversName}
                onChange={handleChange}
                className='w-full p-2.5 text-sm border border-teal-300 rounded-lg focus:ring-teal-500 focus:border-teal-500 bg-gray-50'
                placeholder="Enter driver's name"
                disabled={isSubmitting}
              />
            </div>

            <div className='col-span-2'>
              <label className='block text-sm font-medium text-teal-700 mb-1'>
                GMPT IDs
              </label>

              {/* Display selected GMPTs */}
              <div className='flex flex-wrap gap-2 mb-2'>
                {selectedGMPTs.map((code) => (
                  <span
                    key={code}
                    className='bg-gray-200 text-sm px-2 py-1 rounded-full flex items-center'
                  >
                    {code}
                    <button
                      type='button'
                      className='ml-1 text-red-500 hover:text-red-700'
                      onClick={() =>
                        setSelectedGMPTs(
                          selectedGMPTs.filter((id) => id !== code)
                        )
                      }
                    >
                      ✕
                    </button>
                  </span>
                ))}
              </div>

              {/* Input with suggestions */}
              <input
                type='text'
                placeholder='Type GMPT ID'
                value={gmptInput}
                onChange={(e) => {
                  const val = e.target.value;
                  setGMPTInput(val);
                  setFilteredGMPTs(
                    availableGMPTs.filter((id) =>
                      id.toLowerCase().includes(val.toLowerCase())
                    )
                  );
                }}
                className='border border-gray-300 rounded-md px-2 py-1 text-black w-full'
              />

              {gmptInput && filteredGMPTs.length > 0 && (
                <div className='border border-gray-300 rounded-md mt-1 bg-white max-h-40 overflow-y-auto'>
                  {filteredGMPTs.map((code) => (
                    <div
                      key={code}
                      className='px-3 py-1 hover:bg-teal-100 cursor-pointer'
                      onClick={() => {
                        if (!selectedGMPTs.includes(code)) {
                          setSelectedGMPTs([...selectedGMPTs, code]);
                        }
                        setGMPTInput('');
                        setFilteredGMPTs([]);
                      }}
                    >
                      {code}
                    </div>
                  ))}
                </div>
              )}
            </div>

            <div>
              <label className='block text-sm font-medium text-gray-700 mb-1'>
                Supported By
              </label>
              <input
                type='text'
                name='supported'
                value={ticketData.supported}
                onChange={handleChange}
                className='w-full p-2.5 text-sm border border-teal-300 rounded-lg focus:ring-teal-500 focus:border-teal-500 bg-gray-50'
                placeholder='Enter who is supporting'
                disabled={isSubmitting}
              />
            </div>

            <div>
              <label className='block text-sm font-medium text-gray-700 mb-1'>
                Email Subject
              </label>
              <input
                type='email'
                name='email'
                value={ticketData.email}
                onChange={handleChange}
                className='w-full p-2.5 text-sm border border-teal-300 rounded-lg focus:ring-teal-500 focus:border-teal-500 bg-gray-50'
                placeholder='Enter contact email'
                disabled={isSubmitting}
              />
            </div>
          </div>

          <div className='mb-4'>
            <label className='block text-sm font-medium text-gray-700 mb-1'>
              Description
            </label>
            <textarea
              name='description'
              value={ticketData.description}
              onChange={handleChange}
              rows={4}
              className='w-full p-2.5 text-sm border border-teal-300 rounded-lg focus:ring-teal-500 focus:border-teal-500 bg-gray-50'
              placeholder='Describe the issue in detail...'
              required
              disabled={isSubmitting}
            />
          </div>

          <div className='mb-4'>
            <label className='block text-sm font-medium text-gray-700 mb-1'>
              Solution
            </label>
            <textarea
              name='solution'
              value={ticketData.solution}
              onChange={handleChange}
              rows={3}
              className='w-full p-2.5 text-sm border border-teal-300 rounded-lg focus:ring-teal-500 focus:border-teal-500 bg-gray-50'
              placeholder='Provide a solution if available...'
              disabled={isSubmitting}
            />
          </div>

          <div className='mb-4'>
            <label className='block text-sm font-medium text-gray-700 mb-1'>
              Attachments
            </label>
            <input
              type='file'
              onChange={handleFileChange}
              className='w-full p-2.5 text-sm border border-teal-300 rounded-lg focus:ring-teal-500 focus:border-teal-500 bg-gray-50'
              multiple
              disabled={isSubmitting}
            />
            <p className='text-xs text-gray-500 mt-1'>
              Upload screenshots or relevant files
            </p>
          </div>

          <div className='flex justify-end'>
            <button
              type='button'
              onClick={onClose}
              className='mr-2 px-4 py-2 bg-gray-200 text-gray-700 rounded-lg hover:bg-gray-300 focus:outline-none focus:ring-2 focus:ring-gray-400 focus:ring-offset-2'
              disabled={isSubmitting}
            >
              Cancel
            </button>
            <button
              type='submit'
              className='px-4 py-2 bg-teal-500 text-white rounded-lg hover:bg-teal-600 focus:outline-none focus:ring-2 focus:ring-teal-500 focus:ring-offset-2 flex items-center'
              disabled={isSubmitting}
            >
              {isSubmitting && <span className='submit-spinner'></span>}
              {isSubmitting ? 'Creating...' : 'Create Ticket'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default TicketModal;

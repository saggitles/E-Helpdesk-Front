'use client';
import { useState, FormEvent, ChangeEvent, useEffect } from 'react';
import { toast } from 'react-toastify';
import { Ticket, TicketModalProps } from '@/types/tickets.types';
import { CATEGORY_OPTIONS } from '@/utils/categoryConfig';
import { STATUS_OPTIONS, getStatusColor } from '@/utils/statusConfig';

const TicketModal = ({
  isOpen,
  onClose,
  formData,
  onTicketCreated,
}: TicketModalProps) => {
  const [parcialTicketData, setParcialTicketData] = useState<
    Partial<Ticket>
  >({
    description: '',
    category: '',
    incident_date: new Date().toISOString().split('T')[0],
    drivers_name: '',
    vehicle_id: '',
    created_by: '',
    status: 'To Do',
    email: '',
    priority: 'Medium',
    platform: 'FleetIQ',
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
    setParcialTicketData({
      ...parcialTicketData,
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

    // Validate required fields
    if (!(parcialTicketData.description ?? '').trim()) {
      toast.error('Description is required');
      return;
    }

    setIsSubmitting(true);

    try {
      // Build your payload object
      const ticketPayload: Partial<Ticket> = {
        ...parcialTicketData,
        title: `Support request from ${formData.customer_name}`,
        site_id: formData.site_id, // site id as number
        site_name: formData.site_name, // site name as string
        customer_name: formData.customer_name ?? undefined,
        customer_id: formData.customer_id, // Include customer id if needed
        contact_name: formData.contact_name,
        phone: formData.phone,
        vehicle_id:
          selectedGMPTs.length > 0
            ? selectedGMPTs.join(', ')
            : parcialTicketData.vehicle_id,
      };

      console.log('Ticket Payload:', ticketPayload);

      // Send JSON directly with the proper header.
      const response = await fetch(
        `${process.env.NEXT_PUBLIC_API_URL}/api/tickets`,
        {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
          },
          body: JSON.stringify(ticketPayload),
        }
      );

      if (!response.ok) {
        throw new Error('Error creating ticket');
      }

      toast.success('Ticket created successfully!', {
        position: 'bottom-right',
        autoClose: 2000,
      });

      // Clear the form data (reset states)
      setParcialTicketData({
        description: '',
        category: '',
        incident_date: new Date().toISOString().split('T')[0],
        drivers_name: '',
        vehicle_id: '',
        created_by: '',
        status: 'To Do',
        email: '',
        priority: 'Medium',
        platform: 'FleetIQ',
        solution: '',
      });
      setFiles(null);

      // If there's a callback to update tickets, call it.
      if (onTicketCreated) {
        onTicketCreated();
      }

      onClose();
    } catch (error) {
      console.error('Error submitting ticket:', error);
      toast.error('Error creating ticket');
    } finally {
      setIsSubmitting(false);
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
      if (!formData.site_id) return;

      try {
        const response = await fetch(
          `${process.env.NEXT_PUBLIC_API_URL}/api/gmpt-codes?site_id=${formData.site_id}`
        );
        const data = await response.json();
        setAvailableGMPTs(data); // useState to store available GMPT codes
      } catch (error) {
        console.error('Error fetching GMPT codes:', error);
      }
    };

    fetchGmptCodes();
  }, [formData.site_id]);

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
                value={parcialTicketData.category}
                onChange={handleChange}
                className='w-full p-2.5 text-sm border border-teal-300 rounded-lg focus:ring-teal-500 focus:border-teal-500 bg-gray-50'
                disabled={isSubmitting}
              >
                <option value=''>Select a category</option>
                {CATEGORY_OPTIONS.map((category) => (
                  <option key={category} value={category}>
                    {category}
                  </option>
                ))}
              </select>
            </div>

            <div>
              <label className='block text-sm font-medium text-gray-700 mb-1'>
                Priority
              </label>
              <select
                name='priority'
                value={parcialTicketData.priority}
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
              <div className='relative'>
                <select
                  name='status'
                  value={parcialTicketData.status}
                  onChange={handleChange}
                  disabled={isSubmitting}
                  className='block w-full p-3 text-sm border border-teal-300 rounded-lg bg-white appearance-none focus:outline-none focus:ring-2 focus:ring-teal-500 focus:border-teal-500'
                >
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

                {/* Custom arrow */}
                <div className='pointer-events-none absolute inset-y-0 right-0 flex items-center pr-3'>
                  <svg
                    className='h-5 w-5 text-gray-600'
                    xmlns='http://www.w3.org/2000/svg'
                    viewBox='0 0 20 20'
                    fill='currentColor'
                  >
                    <path
                      fillRule='evenodd'
                      d='M5.23 7.21a.75.75 0 011.06.02L10 10.94l3.71-3.71a.75.75 0 111.06 1.06l-4.24 4.25a.75.75 0 01-1.06 0L5.21 8.29a.75.75 0 01.02-1.08z'
                      clipRule='evenodd'
                    />
                  </svg>
                </div>
              </div>
            </div>

            <div>
              <label className='block text-sm font-medium text-gray-700 mb-1'>
                Platform
              </label>
              <select
                name='platform'
                value={parcialTicketData.platform || ''}
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
                name='incident_date'
                value={parcialTicketData.incident_date || ''}
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
                name='drivers_name'
                value={parcialTicketData.drivers_name || ''}
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
                Created By
              </label>
              <input
                type='text'
                name='created_by'
                value={parcialTicketData.created_by}
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
                type='string'
                name='email'
                value={parcialTicketData.email || ''}
                onChange={handleChange}
                className='w-full p-2.5 text-sm border border-teal-300 rounded-lg focus:ring-teal-500 focus:border-teal-500 bg-gray-50'
                placeholder='Enter contact_name email'
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
              value={parcialTicketData.description}
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
              value={parcialTicketData.solution || ''}
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

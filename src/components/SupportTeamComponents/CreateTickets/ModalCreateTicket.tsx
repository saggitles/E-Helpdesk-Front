'use client';
import {
  useState,
  MouseEvent,
  FC,
  useEffect,
  ChangeEvent,
  FormEvent,
} from 'react';
import axios from 'axios';
import { useRouter } from 'next/router';
import { useUser, withPageAuthRequired } from '@auth0/nextjs-auth0/client';
import { ToastContainer, toast } from 'react-toastify';
import 'react-toastify/dist/ReactToastify.css';
import { STATUS_OPTIONS, getStatusColor } from '@/utils/statusConfig';
import {
  PRIORITY_OPTIONS,
  getPriorityColor,
} from '@/utils/priorityConfig';
import { PLATFORM_OPTIONS } from '@/utils/platformConfig';

interface ModalCreateTicketProps {
  handleModalTicket: (event: MouseEvent<HTMLButtonElement>) => void;
}

const fetchAttachments = async (token: string, ticket_id: string) => {
  try {
    const response = await axios.get(
      `${process.env.NEXT_PUBLIC_API_URL}/api/tickets/${ticket_id}/attachments`,
      {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      }
    );

    if (response.data) {
      const attachmentsData = response.data;

      return attachmentsData;
    }
  } catch (error) {
    console.error('Error fetching attachments:', error);
    throw error;
  }
};

const ModalCreateTicket: FC<ModalCreateTicketProps> = ({
  handleModalTicket,
}) => {
  const handleShowModal = (event: MouseEvent<HTMLButtonElement>) => {
    handleModalTicket(event);
  };

  const router = useRouter();
  const [attachments, setAttachments] = useState<File[]>([]);
  const [selected, setSelected] = useState<string | null>(null);
  const [files, setFiles] = useState<File[] | null>(null);
  const [file, setFile] = useState<File | null>(null);
  const { user } = useUser();
  const [formData, setFormData] = useState({
    title: '',
    description: '',
    status: '',
    category: '',
    priority: '',
    assigned_user_id: '',
    customer_name: '',
    customer_id: '',
    site_name: '',
    site_id: '',
    dealer: '',
    contact_name: '',
    supported: '',
    department: '',
    incident_date: '',
    drivers_name: '',
    vehicle_id: '',
    email: '',
    platform: '',
    reporter: '',
    solution: '',
  });

  interface User {
    user_name: string;
    email: string;
    id: number;
  }

  /**************************************ATTACHMENTS FUNCTIONS****************************************/

  const handleFileChange = (e: ChangeEvent<HTMLInputElement>) => {
    if (e.target.files) {
      // Crea una copia de la lista de archivos actuales y agrega los nuevos
      const updatedFiles = files ? [...files] : [];
      for (let i = 0; i < e.target.files.length; i++) {
        updatedFiles.push(e.target.files[i]);
      }
      setFiles(updatedFiles);
    }
  };

  const renderAttachedFiles = () => {
    if (!files || files.length === 0) {
      return <p className='text-sm text-gray-500'>No files selected.</p>;
    }
    return (
      <ul className='mt-3 w-full'>
        {files.map((file, index) => (
          <li
            key={index}
            className='flex flex-col md:flex-row justify-between items-start bg-white border-b border-gray-200 py-2 px-3'
          >
            <span className='text-sm text-gray-800 break-all flex-1'>
              {file.name}
            </span>
            <button
              type='button'
              onClick={() => handleRemoveAttachment(index)}
              className='flex items-center justify-center text-white bg-teal-500 hover:bg-teal-600 focus:ring-4 focus:outline-none focus:ring-red-300 font-medium rounded-lg text-sm px-3 py-1 text-center mt-5 md:mt-0 md:ml-9'
            >
              <svg
                xmlns='http://www.w3.org/2000/svg'
                className='h-4 w-4 mr-1'
                fill='none'
                viewBox='0 0 24 24'
                stroke='currentColor'
              >
                <path
                  strokeLinecap='round'
                  strokeLinejoin='round'
                  strokeWidth='2'
                  d='M6 18L18 6M6 6l12 12'
                />
              </svg>
              Remove
            </button>
          </li>
        ))}
      </ul>
    );
  };

  const handleRemoveAttachment = (index: number) => {
    // @ts-ignore
    const updatedFiles = [...files];
    updatedFiles.splice(index, 1);
    setFiles(updatedFiles);
  };

  const handleChangeCreate = (
    e: ChangeEvent<HTMLInputElement | HTMLTextAreaElement>
  ) => {
    setFormData({
      ...formData,
      [e.target.name]: e.target.value,
    });
  };

  interface User {
    IDUser: number;
    Username: string;
  }

  const [selectedValue, setSelectedValue] = useState('Not Assigned');
  const [selectedValue_2, setSelectedValue_2] = useState('FleetIQ');
  const [selectedValue_3, setSelectedValue_3] = useState('To Do');
  const [selectedValue_4, setSelectedValue_4] = useState('Medium');

  function handleChange(event: React.ChangeEvent<HTMLSelectElement>) {
    setSelectedValue(event.target.value);
  }
  function handleChange_2(event: React.ChangeEvent<HTMLSelectElement>) {
    setSelectedValue_2(event.target.value);
  }
  function handleChange_3(event: React.ChangeEvent<HTMLSelectElement>) {
    setSelectedValue_3(event.target.value);
  }
  function handleChange_4(event: React.ChangeEvent<HTMLSelectElement>) {
    setSelectedValue_4(event.target.value);
  }

  const [isLoading, setIsLoading] = useState(false);

  const handleSubmit = async (e: any) => {
    e.preventDefault();

    const assignedUser = user?.name;
    let assignedUserID: number | null = null;

    try {
      const token = localStorage.getItem('accessToken');

      if (!token) {
        console.error('Token is missing');
        return; // O maneja el error de otra manera
      }

      const response = await fetch(
        `${process.env.NEXT_PUBLIC_API_URL}/api/users`,
        {
          method: 'GET',
          headers: {
            Authorization: `Bearer ${token}`,
          },
        }
      );

      console.log(response);

      if (response.ok) {
        const users = await response.json();

        users.forEach((user: User) => {
          if (user.Username === assignedUser) {
            assignedUserID = user.IDUser;
            console.log(
              'El usuario que está en este equipo es ' +
                assignedUser +
                ' con ID ' +
                assignedUserID
            );
          }
        });
      } else {
        console.error('Error al obtener los usuarios');
      }
    } catch (error) {
      console.error('Error al realizar la solicitud:', error);
    }

    setIsLoading(true);
    const dataToSend = {
      title: formData.title,
      description: formData.description,
      priority: selectedValue_4,
      status: selectedValue_3,
      department: formData.department,
      site_name: formData.site_name,
      site_id: formData.site_id, // Default test value
      assigned_user_id: assignedUserID,
      customer_id: formData.customer_id, // Default test value
      incident_date: new Date(formData.incident_date),
      category: selectedValue,
      dealer: formData.dealer,
      contact_name: formData.contact_name,
      supported: formData.supported,
      platform: selectedValue_2,
      customer_name: formData.customer_name,
      email: formData.email,
      vehicle_id: formData.vehicle_id,
      reporter: formData.reporter,
      solution: formData.solution,
    };

    console.log('Aca esta la data que se va a enviar');
    console.log(dataToSend);

    const Sendtime = new Date(Date.now());

    try {
      const token = localStorage.getItem('accessToken');

      if (!token) {
        console.error('Token is missing');
        return; // O maneja el error de otra manera
      }

      const response = await axios({
        method: 'post',
        url: `${process.env.NEXT_PUBLIC_API_URL}/api/tickets`,
        data: dataToSend,
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${token}`,
        },
      });

      console.log('Answer');
      console.log(`${process.env.NEXT_PUBLIC_API_URL}/api/tickets`);
      console.log(response);

      const Arrivetime = new Date(Date.now());

      const created_ticket = response.data;
      const ticket_id = created_ticket.id;

      console.log('Ticket created successfully:', created_ticket);
      console.log('Ticket ID', ticket_id);

      toast('😁 Ticket Created Successfully!', {
        position: 'bottom-right',
        autoClose: 2000,
        hideProgressBar: false,
        closeOnClick: true,
        pauseOnHover: true,
        draggable: true,
        progress: undefined,
        progressStyle: { background: 'white' },
        style: {
          backgroundColor: '#00897B',
          color: 'white',
        },
        onClose: () => router.push(`/support/tickets/pending`),
      });

      if (files && files.length > 0) {
        const formData = new FormData();
        for (let i = 0; i < files.length; i++) {
          formData.append('files', files[i]);
        }

        try {
          const attachmentResponse = await axios.post(
            `${process.env.NEXT_PUBLIC_API_URL}/api/tickets/${ticket_id}/attachments`,
            formData,
            {
              headers: {
                Authorization: `Bearer ${token}`,
              },
            }
          );

          console.log(
            'Files uploaded successfully!',
            attachmentResponse.data
          );

          setFiles(null);

          const attachmentsData = await fetchAttachments(token, ticket_id);
          setAttachments(attachmentsData);

          const azureStorageUrls =
            attachmentResponse.data.azureStorageUrls;
        } catch (error) {
          if (error instanceof Error) {
            console.error(
              'Error creating ticket or uploading files:',
              error.message
            );
          } else {
            console.error(
              'Unknown error creating ticket or uploading files'
            );
          }
        }
      }
    } catch (error) {
      if (error instanceof Error) {
        console.error(
          'Error creating ticket or uploading files:',
          error.message
        );
      } else {
        console.error('Unknown error creating ticket or uploading files');
      }
    } finally {
      setIsLoading(false); // Desactiva la pantalla de carga independientemente del resultado
    }
  };

  return (
    <>
      <div className=' bg-[#00000050] overflow-x-hidden flex fixed top-0 right-0 left-0 z-50 justify-center items-center w-full '>
        <div className='p-4 w-full max-w-2xl'>
          <div className='relative bg-white rounded-lg shadow max-h-[100vh] overflow-y-auto custom-scrollbar'>
            <div className='flex items-center bg-teal-500 justify-between p-4 md:p-5 border-b rounded-t'>
              <h3 className='text-lg font-semibold text-teal-50'>
                Create New Ticket
              </h3>
              <button
                type='button'
                onClick={handleShowModal}
                className='text-teal-500 bg-teal-200 hover:bg-teal-200 hover:text-teal-700 rounded-lg text-sm w-8 h-8 ms-auto inline-flex justify-center items-center'
                data-modal-toggle='crud-modal'
              >
                <svg
                  className='w-3 h-3'
                  aria-hidden='true'
                  xmlns='http://www.w3.org/2000/svg'
                  fill='none'
                  viewBox='0 0 14 14'
                >
                  <path
                    stroke='currentColor'
                    strokeLinecap='round'
                    strokeLinejoin='round'
                    strokeWidth='2'
                    d='m1 1 6 6m0 0 6 6M7 7l6-6M7 7l-6 6'
                  />
                </svg>
                <span className='sr-only'>Close modal</span>
              </button>
            </div>

            <form
              onSubmit={handleSubmit}
              className='p-4 md:p-5 bg-teal-50'
            >
              <div className='grid gap-4 mb-4 grid-cols-2'>
                <div className='w-full col-span-2'>
                  <p className='w-full text-teal-700 font-semibold text-lg border-l-2 border-teal-700 p-2 bg-teal-100'>
                    Customer details
                  </p>
                </div>
                <div className='col-span-2 sm:col-span-1'>
                  <label
                    htmlFor='CustomerName'
                    className='block mb-1 font-normal text-teal-700'
                  >
                    Customer
                  </label>
                  <input
                    value={formData.customer_name}
                    onChange={handleChangeCreate}
                    type='text'
                    name='CustomerName'
                    id='CustomerName'
                    placeholder='Type customer name'
                    className='bg-gray-50 border border-teal-300 text-teal-900 font-normal placeholder:text-gray-400 text-sm rounded-lg focus:ring-teal-600 focus:border-teal-600 block w-full p-2.5'
                    required
                  />
                </div>
                {/* <div className="col-span-2">
                                    <label htmlFor="dealer" className="block mb-1 font-normal text-teal-700">Dealer</label>
                                    <input value={formData.dealer} onChange={handleChangeCreate} type="text" name="dealer" id="dealer" placeholder="Type here the name dealer" className="bg-gray-50 border border-teal-300 text-teal-900 font-normal placeholder:text-gray-400 text-sm rounded-lg focus:ring-teal-600 focus:border-teal-600 block w-full p-2.5" required />
                                </div> */}
                <div className='col-span-2 sm:col-span-1'>
                  <label
                    htmlFor='site'
                    className='block mb-1 font-normal text-teal-700'
                  >
                    Site
                  </label>
                  <input
                    value={formData.site_name}
                    onChange={handleChangeCreate}
                    type='text'
                    name='site'
                    id='site'
                    placeholder='Type site name'
                    className='bg-gray-50 border border-teal-300 text-teal-900 font-normal placeholder:text-gray-400 text-sm rounded-lg focus:ring-teal-600 focus:border-teal-600 block w-full p-2.5'
                    required
                  />
                </div>
                <div className='col-span-2 sm:col-span-1'>
                  <label
                    htmlFor='contact_name'
                    className='block mb-1 font-normal text-teal-700'
                  >
                    Contact Name
                  </label>
                  <input
                    value={formData.contact_name}
                    onChange={handleChangeCreate}
                    type='text'
                    name='contact_name'
                    id='contact_name'
                    placeholder='Type contact name'
                    className='bg-gray-50 border border-teal-300 text-teal-900 font-normal placeholder:text-gray-400 text-sm rounded-lg focus:ring-teal-600 focus:border-teal-600 block w-full p-2.5'
                    required
                  />
                </div>

                <div className='col-span-2 sm:col-span-1'>
                  <label
                    htmlFor='Reporter'
                    className='block mb-1 font-normal text-teal-700'
                  >
                    Phone
                  </label>
                  <input
                    value={formData.reporter}
                    onChange={handleChangeCreate}
                    type='text'
                    name='Reporter'
                    id='Reporter'
                    placeholder='Type your phone'
                    className='bg-gray-50 border border-teal-300 text-teal-900 font-normal placeholder:text-gray-400 text-sm rounded-lg focus:ring-teal-600 focus:border-teal-600 block w-full p-2.5'
                    required
                  />
                </div>

                <div className='w-full col-span-2 mt-5'>
                  <p className='w-full text-teal-700 font-semibold text-lg border-l-2 border-teal-700 p-2 bg-teal-100'>
                    Issue details
                  </p>
                </div>
                {/* <div className="col-span-2 sm:col-span-1">
                                    <label htmlFor="title" className="block mb-1 font-normal text-teal-700">Issue Tittle</label>
                                    <input value={formData.title} onChange={handleChangeCreate} type="text" name="title" id="title" placeholder="Type the issue tittle" className="bg-gray-50 border border-teal-300 text-teal-900 font-normal placeholder:text-gray-400 text-sm rounded-lg focus:ring-teal-600 focus:border-teal-600 block w-full p-2.5" required />
                                </div>   */}
                <div className='col-span-2 sm:col-span-1'>
                  <label
                    htmlFor='description'
                    className='block mb-1 font-normal text-teal-700'
                  >
                    Description
                  </label>
                  <input
                    value={formData.description}
                    onChange={handleChangeCreate}
                    type='text'
                    name='description'
                    id='description'
                    placeholder='Type the description'
                    className='bg-gray-50 border border-teal-300 text-teal-900 font-normal placeholder:text-gray-400 text-sm rounded-lg focus:ring-teal-600 focus:border-teal-600 block w-full p-2.5'
                  />
                </div>
                <div className='col-span-2 sm:col-span-1'>
                  <label
                    htmlFor='category'
                    className='block mb-1 font-normal text-teal-700'
                  >
                    Categories
                  </label>
                  <select
                    value={selectedValue}
                    onChange={handleChange}
                    name='category'
                    id='category'
                    className='bg-gray-50 border border-teal-300 text-teal-900 font-normal placeholder:text-gray-400 text-sm rounded-lg focus:ring-teal-600 focus:border-teal-600 block w-full p-2.5'
                  >
                    <option value=''>Select a category</option>
                    <option value='Checklist issue'>
                      Checklist issue
                    </option>
                    <option value='Pin/card issue'>Pin/card Issue</option>
                    <option value='Software issue'>Software Issue</option>
                    <option value='Hardware issue'>Hardware Issue</option>
                    <option value='Dasbhoard issue'>
                      Dashboard Issue
                    </option>
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
                <div className='col-span-2 sm:col-span-1'>
                  <label
                    htmlFor='incidentDate'
                    className='block mb-1 font-normal text-teal-700'
                  >
                    Incident Date
                  </label>
                  <input
                    value={formData.incident_date}
                    onChange={handleChangeCreate}
                    type='date'
                    name='incidentDate'
                    id='incidentDate'
                    className='bg-gray-50 border border-teal-300 text-teal-900 font-normal text-sm rounded-lg focus:ring-teal-600 focus:border-teal-600 block w-full p-2.5'
                    required
                  />
                </div>
                <div className='col-span-2 sm:col-span-1'>
                  <label
                    htmlFor='drivers_name'
                    className='block mb-1 font-normal text-teal-700'
                  >
                    Driver name
                  </label>
                  <input
                    value={formData.drivers_name}
                    onChange={handleChangeCreate}
                    type='text'
                    name='drivers_name'
                    id='drivers_name'
                    placeholder='Type driver name'
                    className='bg-gray-50 border border-teal-300 text-teal-900 font-normal placeholder:text-gray-400 text-sm rounded-lg focus:ring-teal-600 focus:border-teal-600 block w-full p-2.5'
                  />
                </div>
                <div className='col-span-2 sm:col-span-1'>
                  <label
                    htmlFor='vehicle_id'
                    className='block mb-1 font-normal text-teal-700'
                  >
                    Vehicle ID/Serial NO/GMPT ID
                  </label>
                  <input
                    value={formData.vehicle_id}
                    onChange={handleChangeCreate}
                    type='text'
                    name='vehicle_id'
                    id='vehicle_id'
                    placeholder='Type Vehicle identifier'
                    className='bg-gray-50 border border-teal-300 text-teal-900 font-normal placeholder:text-gray-400 text-sm rounded-lg focus:ring-teal-600 focus:border-teal-600 block w-full p-2.5'
                  />
                </div>
                <div className='col-span-2 sm:col-span-1'>
                  <label
                    htmlFor='supported'
                    className='block mb-1 font-normal text-teal-700'
                  >
                    Supported by
                  </label>
                  <input
                    value={formData.supported}
                    onChange={handleChangeCreate}
                    type='text'
                    name='supported'
                    id='supported'
                    placeholder='Type supporter name'
                    className='bg-gray-50 border border-teal-300 text-teal-900 font-normal placeholder:text-gray-400 text-sm rounded-lg focus:ring-teal-600 focus:border-teal-600 block w-full p-2.5'
                  />
                </div>

                <div className='col-span-2 sm:col-span-1'>
                  <label
                    htmlFor='status'
                    className='block mb-1 font-normal text-teal-700'
                  >
                    Status
                  </label>
                  <select
                    value={selectedValue_3}
                    onChange={handleChange_3}
                    name='status'
                    id='status'
                    className='bg-gray-50 border border-teal-300 text-teal-900 font-normal text-sm rounded-lg focus:ring-teal-600 focus:border-teal-600 block w-full p-2.5'
                  >
                    <option value=''>Select status</option>
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
                </div>
                <div className='col-span-2 sm:col-span-1'>
                  <label
                    htmlFor='email'
                    className='block mb-1 font-normal text-teal-700'
                  >
                    Email Subject/Title
                  </label>
                  <input
                    value={formData.email}
                    onChange={handleChangeCreate}
                    type='text'
                    name='email'
                    id='email'
                    placeholder='If any'
                    className='bg-gray-50 border border-teal-300 text-teal-900 font-normal placeholder:text-gray-400 text-sm rounded-lg focus:ring-teal-600 focus:border-teal-600 block w-full p-2.5'
                    required
                  />
                </div>
                <div className='col-span-2 sm:col-span-1'>
                  <label
                    htmlFor='priority'
                    className='block mb-1 font-normal text-teal-700'
                  >
                    Priority
                  </label>
                  <select
                    value={selectedValue_4}
                    onChange={handleChange_4}
                    name='priority'
                    id='priority'
                    className='bg-gray-50 border border-teal-300 text-teal-900 font-normal text-sm rounded-lg focus:ring-teal-600 focus:border-teal-600 block w-full p-2.5'
                  >
                    <option value=''>Select Priority</option>
                    {PRIORITY_OPTIONS.map((priority) => (
                      <option
                        key={priority}
                        value={priority}
                        style={{
                          backgroundColor: getPriorityColor(priority),
                          color: '#333333',
                        }}
                      >
                        {priority}
                      </option>
                    ))}
                  </select>
                </div>

                <div className='col-span-2 sm:col-span-1'>
                  <label
                    htmlFor='platform'
                    className='block mb-1 font-normal text-teal-700'
                  >
                    Platform
                  </label>
                  <select
                    value={selectedValue_2}
                    onChange={handleChange_2}
                    name='platform'
                    id='platform'
                    className='bg-gray-50 border border-teal-300 text-teal-900 font-normal text-sm rounded-lg focus:ring-teal-600 focus:border-teal-600 block w-full p-2.5'
                  >
                    <option value=''>Select Platform</option>
                    {PLATFORM_OPTIONS.map((platform) => (
                      <option key={platform} value={platform}>
                        {platform}
                      </option>
                    ))}
                  </select>
                </div>

                <div className='col-span-2 sm:col-span-1'>
                  <label
                    htmlFor='Solution'
                    className='block mb-1 font-normal text-teal-700'
                  >
                    Solution
                  </label>
                  <input
                    value={formData.solution}
                    onChange={handleChangeCreate}
                    type='text'
                    name='Solution'
                    id='Solution'
                    placeholder='Type supporter name'
                    className='bg-gray-50 border border-teal-300 text-teal-900 font-normal placeholder:text-gray-400 text-sm rounded-lg focus:ring-teal-600 focus:border-teal-600 block w-full p-2.5'
                  />
                </div>

                <div className='flex flex-col items-start justify-start w-full'>
                  <label
                    htmlFor='dropzone-file'
                    className=' mb-1 font-normal text-teal-700'
                  >
                    Attachment
                  </label>
                  <div className='flex items-center justify-center w-full'>
                    <label
                      htmlFor='dropzone-file'
                      className='flex flex-col items-center justify-center w-full h-64 border-2 border-gray-300 border-dashed rounded-lg cursor-pointer bg-gray-50 dark:hover:bg-gray-800 dark:bg-gray-700 hover:bg-gray-100 dark:border-gray-600 dark:hover:border-gray-500 dark:hover:bg-gray-600'
                    >
                      <div className='flex flex-col items-center justify-center pt-5 pb-6'>
                        <svg
                          className='w-8 h-8 mb-4 text-gray-500 dark:text-gray-400'
                          aria-hidden='true'
                          xmlns='http://www.w3.org/2000/svg'
                          fill='none'
                          viewBox='0 0 20 16'
                        >
                          <path
                            stroke='currentColor'
                            strokeLinecap='round'
                            strokeLinejoin='round'
                            strokeWidth='2'
                            d='M13 13h3a3 3 0 0 0 0-6h-.025A5.56 5.56 0 0 0 16 6.5 5.5 5.5 0 0 0 5.207 5.021C5.137 5.017 5.071 5 5 5a4 4 0 0 0 0 8h2.167M10 15V6m0 0L8 8m2-2 2 2'
                          />
                        </svg>
                        <p className='mb-2 text-sm text-gray-500 dark:text-gray-400'>
                          <span className='font-semibold'>
                            Click to upload
                          </span>{' '}
                          or drag and drop
                        </p>
                        <p className='text-xs text-gray-500 dark:text-gray-400'>
                          SVG, PNG, JPG or GIF (MAX. 800x400px)
                        </p>
                      </div>
                      <input
                        onChange={handleFileChange}
                        id='dropzone-file'
                        type='file'
                        className='hidden'
                      />
                    </label>
                  </div>
                  {renderAttachedFiles()}
                </div>
              </div>

              <div className='flex justify-between mt-10'>
                <button
                  type='submit'
                  className='text-teal-700 bg-gray-50 hover:bg-teal-500 hover:text-gray-50 focus:ring-4 focus:outline-none focus:ring-teal-300 font-medium rounded-lg text-sm px-5 py-1.5 text-center border border-teal-400'
                >
                  Help
                </button>
                <div className='flex gap-4'>
                  <button
                    onClick={handleShowModal}
                    type='submit'
                    className='bg-gray-100 text-gray-500 placeholder:bg-teal-700 focus:ring-4 focus:outline-none focus:ring-teal-300 font-medium rounded-lg text-sm px-5 py-1.5 text-center border border-teal-400'
                  >
                    Cancel
                  </button>
                  <button
                    type='submit'
                    className='bg-teal-500 text-gray-50 placeholder:bg-teal-700 focus:ring-4 focus:outline-none focus:ring-teal-300 font-medium rounded-lg text-sm px-5 py-1.5 text-center border border-teal-400'
                  >
                    Create new ticket
                  </button>
                </div>
              </div>
            </form>
          </div>
        </div>
      </div>
      <ToastContainer />
      <style jsx global>{`
        .custom-scrollbar::-webkit-scrollbar {
          display: none; /* para Chrome, Safari y Opera */
        }

        .custom-scrollbar {
          -ms-overflow-style: none; /* IE y Edge */
          scrollbar-width: none; /* Firefox */
        }
      `}</style>
    </>
  );
};

export default ModalCreateTicket;

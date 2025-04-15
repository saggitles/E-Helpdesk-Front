import React, {
  useEffect,
  useState,
  useRef,
  ChangeEvent,
  FormEvent,
} from 'react';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faImages } from '@fortawesome/free-solid-svg-icons';
import { useRouter } from 'next/router';
import Link from 'next/link';
import axios from 'axios';
import CommentList from '../TicketComments/CommentList';
import { Comment as CommentType } from '../../../reducers/Comments/types';
import PopJira from '@/components/generalComponents/PopJira';
import styles from './styles.module.css';
import Image from 'next/image';
import {
  faSpinner,
  faCheckCircle,
  faTimesCircle,
  faCircleNotch,
  faBan,
} from '@fortawesome/free-solid-svg-icons';
import LoadingScreen from '@/components/generalComponents/LoadingScreen';
import { STATUS_OPTIONS, getStatusColor } from '@/utils/statusConfig';
import { format, parse, isValid, parseISO } from 'date-fns';
// FIX ME: NOTHING WORKS HERE AND INTERFACES HAVE TO GO TO THE INTERFACES, JIRA TICKET DOESNT WOK NOR DO COMMENTS
interface User {
  IDUser: number;
  Username: string;
  FirstName: string;
  LastName: string;
}

type JiraTicket = {
  id: number;
  key?: string; // Optional string field
  creation_date?: string; // Optional string field, assuming date is stored as a string
  description?: string; // Optional string field
  project_key?: string; // Optional string field
  project_name?: string; // Optional string field
  project_type?: string; // Optional string field
  status?: string; // Optional string field
  status_category?: string; // Optional string field
  type?: string; // Optional string field
  self?: string; // Optional string field, usually a URL or a reference
};

// Aca se encuentra la informacion actualizada
interface JiraTicketOfficial {
  id: string;
  key: string;
  self: string;
  fields: {
    summary: string;
    status: {
      name: string;
      id: string;
      description: string;
      iconUrl: string;
      statusCategory: {
        id: number;
        key: string;
        colorName: string;
        name: string;
      };
    };
    project: {
      id: string;
      key: string;
      name: string;
      projectTypeKey: string;
      simplified: boolean;
      avatarUrls: {
        '48x48': string;
        '24x24': string;
        '16x16': string;
        '32x32': string;
      };
    };
    issuetype: {
      id: string;
      name: string;
      description: string;
      iconUrl: string;
      subtask: boolean;
      avatarId: number;
    };
    created: string;
    updated: string;
    creator: {
      self: string;
      accountId: string;
      emailAddress: string;
      avatarUrls: {
        '48x48': string;
        '24x24': string;
        '16x16': string;
        '32x32': string;
      };
      displayName: string;
      active: boolean;
      timeZone: string;
    };
    assignee?: {
      self: string;
      accountId: string;
      avatarUrls: {
        '48x48': string;
        '24x24': string;
        '16x16': string;
        '32x32': string;
      };
      displayName: string;
      active: true;
      timeZone: string;
    };
  };
}

const fetchComments = async (
  token: string,
  ticketId: string | undefined
) => {
  // Guard against undefined ticketId
  if (!ticketId) {
    console.log('No ticket ID provided for comment fetch');
    return [];
  }

  try {
    console.log(`Fetching comments for ticket ${ticketId}`);

    const url = `${process.env.NEXT_PUBLIC_API_URL}/api/tickets/${ticketId}/comments`;
    console.log(`Request URL: ${url}`);

    const response = await fetch(url, {
      method: 'GET',
      headers: {
        Authorization: `Bearer ${token || ''}`,
        'Content-Type': 'application/json',
      },
    });

    if (!response.ok) {
      // Get more details about the error
      const errorText = await response.text();
      console.error(
        `Error fetching comments: ${response.status} ${response.statusText}`
      );
      console.error(`Response body: ${errorText}`);

      // Return empty array instead of throwing
      return [];
    }

    const commentsData = await response.json();
    console.log(`Successfully fetched ${commentsData.length} comments`);
    return commentsData || [];
  } catch (error) {
    console.error('Error in fetchComments:', error);
    return []; // Return empty array rather than throwing
  }
};

const fetchAttachments = async (token: string, ticketId: string) => {
  try {
    const response = await axios.get(
      `${process.env.NEXT_PUBLIC_API_URL}/api/tickets/${ticketId}/attachments`,
      {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      }
    );

    console.log('Attachments Response:', response.data); // Log the response

    if (response.data) {
      const attachmentsData = response.data; // Assuming your response directly contains the attachments

      return attachmentsData;
    }
  } catch (error) {
    console.error('Error fetching attachments:', error);
    throw error;
  }
};

export const TicketDetails = () => {
  const router = useRouter();
  const [comments, setComments] = React.useState<CommentType[]>([]);
  const {
    title,
    description,
    supported,
    category,
    priority,
    reporter,
    platform,
    email,
    contact_name,
    customer_name,
    status,
    customer_id,
    department,
    site_id,
    site_name,
    created_at,
    updated_at,
    id,
    dealer,
    vehicle_id,
    jira_ticket_id,
    solution,
    incident_date,
    ticket_number,
    open_since,
  } = router.query;
  const [commentContent, setCommentContent] = useState<string>(''); // Assuming you have an input for comment content
  const [selectedAction, setSelectedAction] =
    useState<string>('unassigned');
  const [isPopJiraVisible, setPopJiraVisibility] = useState(false);
  const [showConfirmation, setShowConfirmation] = useState(false);
  const [selectedProjectForEscalation, setSelectedProjectForEscalation] =
    useState('');
  const [deleteConfirmVisible, setDeleteConfirmVisible] = useState(false);
  const [selectedFileIdToDelete, setSelectedFileIdToDelete] = useState<
    string | null
  >(null);
  const [jiraTicket, setJiraTicket] = useState<JiraTicket | null>(null);
  const [jiraTicketOfficial, setJiraTicketOfficial] =
    useState<JiraTicketOfficial | null>(null);
  const [isSolutionPopupVisible, setSolutionPopupVisibility] =
    useState(false);
  const [solutionText, setSolutionText] = useState('');

  const [selectedAssignee, setSelectedAssignee] = useState(() => {
    // Initialize selectedAssignee from localStorage if available, otherwise set it to an empty string
    if (typeof window !== 'undefined') {
      return localStorage.getItem('selectedAssignee') || '';
    } else {
      return '';
    }
  });
  const [SelectedOption, setSelectedOption] = useState<string>('');
  const [attachments, setAttachments] = useState<File[]>([]);
  const [files, setFiles] = useState<File[] | null>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);
  const [users, setUsers] = useState<User[]>([]);
  const [isEditing, setIsEditing] = useState(false);
  const [editedValues, setEditedValues] = useState<{
    [key: string]: string;
  }>({});
  const [assignee, setAssignee] = useState<any | null>(null);
  const [assigneeId, setAssigneeId] = useState<number | null>(null); // State variable to hold assigneeId
  const ticketId = router?.query?.IDTicket;
  const [timeSinceCreated, setTimeSinceCreated] = useState<string>('');

  useEffect(() => {
    const urlSearchParams = new URLSearchParams(window.location.search);
    const createdAtString = urlSearchParams.get('createdAt');

    if (createdAtString) {
      // Parse the date string "15/08/2024 14:43:20" into a Date object
      const [datePart, timePart] = createdAtString.split(' ');
      const [day, month, year] = datePart.split('/').map(Number);
      const [hours, minutes, seconds] = timePart.split(':').map(Number);

      // Create the date in UTC
      const createdAt = new Date(
        Date.UTC(year, month - 1, day, hours, minutes, seconds)
      );

      // Get the current time in UTC
      const currentTime = new Date();

      const difference = currentTime.getTime() - createdAt.getTime();

      const totalHours = Math.floor(difference / (1000 * 60 * 60));
      const days = Math.floor(totalHours / 24);
      const remainingHours = totalHours % 24;

      if (days === 1) {
        if (remainingHours === 1) {
          setTimeSinceCreated(`1 day and 1 hour ago`);
        } else if (remainingHours > 1) {
          setTimeSinceCreated(`1 day and ${remainingHours} hours ago`);
        } else {
          setTimeSinceCreated(`1 day ago`);
        }
      } else if (days > 1) {
        if (remainingHours === 1) {
          setTimeSinceCreated(`${days} days and 1 hour ago`);
        } else if (remainingHours > 1) {
          setTimeSinceCreated(
            `${days} days and ${remainingHours} hours ago`
          );
        } else {
          setTimeSinceCreated(`${days} days ago`);
        }
      } else {
        if (totalHours === 1) {
          setTimeSinceCreated(`1 hour ago`);
        } else {
          setTimeSinceCreated(`${totalHours} hours ago`);
        }
      }
    } else {
      setTimeSinceCreated('N/A');
    }
  }, []);

  useEffect(() => {
    const fetchAssigneeId = async () => {
      try {
        const token = localStorage.getItem('accessToken'); // Assuming you have an access token stored in localStorage
        const config = {
          headers: {
            Authorization: `Bearer ${token}`, // Include the authorization token in the request headers
          },
        };
        const response = await axios.get(
          `${process.env.NEXT_PUBLIC_API_URL}/api/tickets/${ticketId}/assigneduser`,
          config
        );
        setAssigneeId(response.data.assigneeId); // Assuming the response contains the assigneeId
        console.log('Response:', response);
      } catch (error) {
        console.error('Error fetching assigneeId:', error);
      }
    };

    if (ticketId) {
      fetchAssigneeId();
    }
  }, [ticketId]);

  useEffect(() => {
    const fetchUsersData = async () => {
      try {
        const token = localStorage.getItem('accessToken'); // Assuming you have an access token stored in localStorage
        const config = {
          headers: {
            Authorization: `Bearer ${token}`, // Include the authorization token in the request headers
          },
        };
        const response = await axios.get<User[]>(
          `${process.env.NEXT_PUBLIC_API_URL}/api/users`,
          config
        );
        setUsers(response.data);
      } catch (error) {
        console.error('Error fetching users data:', error);
      }
    };

    fetchUsersData();

    const fetchJiraTicket = async (JiraTicketID: number) => {
      try {
        const token = localStorage.getItem('accessToken');
        const config = {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        };

        const url = `${process.env.NEXT_PUBLIC_API_URL}/api/jiratickets/${JiraTicketID}`;
        console.log('Aca debe estar la respuesta del ticket');

        const response = await axios.get<JiraTicket>(url, config);

        console.log('Aca esta la informacion del JiraTicket');
        console.log(response);
        console.log(response.data);
        setJiraTicket(response.data);

        console.log('Link para la informacion actualizada');
        console.log(response.data.self);

        const urlNew: string | undefined = response.data.self;

        if (urlNew) {
          console.log('URL:', urlNew);
          const segments = urlNew.split('/');
          const jiraIssueNumber = segments.pop() || ''; // Obtiene el último segmento que debería ser el número de Jira

          if (jiraIssueNumber) {
            console.log('El número de Jira aquí fue:', jiraIssueNumber);

            // Prepara la URL para la solicitud API al servidor local
            const apiUrl = `${process.env.NEXT_PUBLIC_API_URL}/api/jiratissue/${jiraIssueNumber}`;

            const config = {
              headers: {
                Authorization: `Bearer ${token}`,
                'Content-Type': 'application/json',
              },
            };

            // Realiza la solicitud GET
            const respuestaJiraDetails = axios
              .get(apiUrl, config)
              .then((response) => {
                console.log(
                  'Respuesta del servidor para el issue de Jira:',
                  response.data
                );
                console.log('response.data', response);
                setJiraTicketOfficial(response.data);
              })
              .catch((error) => {
                console.error(
                  'Error al hacer la solicitud al servidor local:',
                  error
                );
              });

            console.log('JIRA DETAILS');
            console.log(respuestaJiraDetails);
          }
        } else {
          console.error('URL is undefined. Check your API response.');
        }
      } catch (error) {
        console.error('Error fetching JiraTicket:', error);
      }
    };

    if (typeof jira_ticket_id === 'string') {
      const IDTicketNumber = parseInt(jira_ticket_id, 10);
      console.log('Aca esta el ticket number');
      console.log(IDTicketNumber);
      if (!isNaN(IDTicketNumber)) {
        fetchJiraTicket(IDTicketNumber);
        console.log(fetchJiraTicket);
      } else {
        console.error('Invalid ticket number');
      }
    } else if (Array.isArray(id)) {
      console.error('IDTicket must not be an array');
    } else {
      console.error('IDTicket is undefined or has an invalid type');
    }

    // Aca obtenemos la informacion del ticket que fue creado, pero lo unico que nos importa es sacar la propiedad self, esto para sacar la version
    // mas actulizada que tenemos en jira
  }, [jira_ticket_id]);

  useEffect(() => {
    const fetchAssigneeId = async () => {
      try {
        const token = localStorage.getItem('accessToken'); // Assuming you have an access token stored in localStorage
        const config = {
          headers: {
            Authorization: `Bearer ${token}`, // Include the authorization token in the request headers
          },
        };
        const response = await axios.get(
          `${process.env.NEXT_PUBLIC_API_URL}/api/tickets/${ticketId}/assigneduser`,
          config
        );
        setAssigneeId(response.data.assigneeId); // Assuming the response contains the assigneeId
        console.log('Assignee ID:', assigneeId);
        // Fetch the user corresponding to the assigneeId
        if (assigneeId) {
          const token = localStorage.getItem('accessToken'); // Assuming you have an access token stored in localStorage
          const config = {
            headers: {
              Authorization: `Bearer ${token}`, // Include the authorization token in the request headers
            },
          };
          const userResponse = await axios.get(
            `${process.env.NEXT_PUBLIC_API_URL}/api/users/${assigneeId}`,
            config
          );
          setAssignee(userResponse.data); // Set the fetched user in state
          console.log('Assignee:', userResponse.data);
        }
      } catch (error) {
        console.error('Error fetching assigneeId or user:', error);
      }
    };

    if (ticketId) {
      fetchAssigneeId();
    }
  }, [ticketId, assigneeId]);

  useEffect(() => {
    // Save selectedAssignee to localStorage whenever it changes
    localStorage.setItem('selectedAssignee', selectedAssignee);
    console.log('Aca deberia estar!');
    console.log('selectedAssignee');
  }, [selectedAssignee]);

  // Function to find and return the selected assignee's name
  const getSelectedAssigneeName = () => {
    const selectedAssigneeUser = users.find(
      (user) => user.IDUser.toString() === selectedAssignee
    );
    return selectedAssigneeUser
      ? `${selectedAssigneeUser.FirstName} ${selectedAssigneeUser.LastName}`
      : 'N/A';
  };

  const handleEditClick = () => {
    setIsEditing(true);

    const filteredValues: { [key: string]: string } = {};
    for (const key in router.query) {
      const value = router.query[key];
      if (typeof value === 'string') {
        filteredValues[key] = value;
      } else if (
        Array.isArray(value) &&
        value.length > 0 &&
        typeof value[0] === 'string'
      ) {
        filteredValues[key] = value[0];
      }
    }

    setEditedValues(filteredValues);
  };

  const statusStyles = {
    'In progress': { color: 'blue', icon: faSpinner, text: 'En progreso' },
    Done: { color: 'green', icon: faCheckCircle, text: 'Completado' },
    'To Do': { color: 'gray', icon: faCircleNotch, text: 'Por hacer' },
    "Won't do": { color: '#c9ccc4', icon: faBan, text: 'No se hará' },
    // Agrega más estados según necesites
  };

  const handleSaveClick = async () => {
    // setIsEditing(false);

    const ticket: Record<string, any> = {}; // Cambio para permitir cualquier tipo

    Object.entries(editedValues).forEach(([key, value]) => {
      if (key === 'JiraTicketID' && value) {
        // Convertir JiraTicketID a un entero si existe
        ticket[key] = parseInt(value, 10);
      } else if (!value) {
        // Assign null if the value doesn't exist
        ticket[key] = null;
      } else {
        ticket[key] = value;
      }
    });

    // Eliminar propiedades que no deberían ser enviadas a la API
    if ('ticketNumber' in ticket) {
      delete ticket['ticketNumber'];
    }
    if ('IDTicket' in ticket) {
      delete ticket['IDTicket'];
    }

    // Si el estado es "Done", calcular la diferencia de tiempo entre createdAt y ahora
    if (ticket.status === 'Done') {
      const createdAtString = router.query.createdAt as string;

      if (createdAtString) {
        const [datePart, timePart] = createdAtString.split(' ');
        const [day, month, year] = datePart.split('/').map(Number);
        const [hours, minutes, seconds] = timePart.split(':').map(Number);

        const createdAtDate = new Date(
          Date.UTC(year, month - 1, day, hours, minutes, seconds)
        );
        const currentTime = new Date();

        // Calcular la diferencia en milisegundos
        const difference = currentTime.getTime() - createdAtDate.getTime();

        // Convertir la diferencia en días y horas
        const totalHours = Math.floor(difference / (1000 * 60 * 60));
        const days = Math.floor(totalHours / 24);
        const remainingHours = totalHours % 24;

        // Almacenar el tiempo en el campo `openSince`
        if (days > 0) {
          ticket.openSince = `${days} day(s) ${remainingHours} hour(s)`;
        } else {
          ticket.openSince = `${remainingHours} hour(s)`;
        }
      }
    }

    const token = localStorage.getItem('accessToken');
    const IDTicket = router.query.IDTicket as string;

    try {
      const response = await fetch(
        `${process.env.NEXT_PUBLIC_API_URL}/api/tickets/${IDTicket}`,
        {
          method: 'PUT',
          headers: {
            'Content-Type': 'application/json',
            Authorization: `Bearer ${token}`,
          },
          body: JSON.stringify(ticket),
        }
      );

      console.log('Aca esta la propiedad de mierda esa');
      console.log(ticket);

      console.log('Aca esta el valor del ticket editado!');
      console.log(response);

      const ticketDetails = await response.json();

      if (ticketDetails.jiraTicket) {
        console.log('JiraTicket Details:', ticketDetails.jiraTicket);
      } else {
        console.log('No JiraTicket linked');
      }

      if (response.ok) {
        // Resto de la funcionalidad existente
        const fechaUpdatedISO = ticket.updatedAt;
        const fechaUpdated = new Date(fechaUpdatedISO);

        const opciones: Intl.DateTimeFormatOptions = {
          year: 'numeric',
          month: '2-digit',
          day: '2-digit',
          hour: '2-digit',
          minute: '2-digit',
          second: '2-digit',
          hour12: false,
          timeZone: 'UTC',
        };

        const fechaUpdate = fechaUpdated
          .toLocaleDateString('es-ES', opciones)
          .replace(/\//g, '-')
          .replace(',', '');

        const fechaCreatedISO = ticket.createdAt;
        const fechaCreated = new Date(fechaCreatedISO);

        const fechaCreate = fechaCreated
          .toLocaleDateString('es-ES', opciones)
          .replace(/\//g, '-')
          .replace(',', '');

        router.replace({
          pathname: router.pathname,
          query: {
            ...router.query,
            ...ticket, // Actualizar los parámetros con los valores editados
          },
        });
      } else {
        console.error('Failed to update ticket: ', response.statusText);
      }
    } catch (error) {
      console.error('Error updating ticket: ', error);
    } finally {
      setIsEditing(false);
    }
  };

  const handleCancelClick = () => {
    setIsEditing(false);
    setEditedValues({});
  };

  const handleInputChange = (
    key: string,
    value: string | string[] | undefined
  ) => {
    const stringValue = Array.isArray(value) ? value.join(', ') : value;
    setEditedValues((prevValues) => ({
      ...prevValues,
      [key]: stringValue || '',
    }));

    if (key === 'status' && value === 'Done') {
      setSolutionPopupVisibility(true);
    }
  };

  const handleCancelSolution = () => {
    setSolutionPopupVisibility(false);
    // Otras acciones necesarias si el usuario cancela
  };

  /**************************************ATTACHMENTS FUNCTIONS****************************************/
  const handleEscalateClick = () => {
    setPopJiraVisibility(true);
  };

  const handleFileChange = async (e: ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files.length > 0) {
      const filesArray: File[] = Array.from(e.target.files); // Convert FileList to an array
      setFiles(filesArray);

      // Inmediatamente después de establecer los archivos, llamamos a handleFileUpload
      await handleFileUpload(filesArray); // Asumiendo que modificas handleFileUpload para aceptar un array de archivos directamente
    }
  };

  const handleFileUpload = async (filesToUpload: File[]) => {
    if (!filesToUpload || filesToUpload.length === 0) {
      return; // Retorna si no hay archivos seleccionados.
    }

    const formData = new FormData();
    filesToUpload.forEach((file) => formData.append('files', file));

    try {
      const token = localStorage.getItem('accessToken');
      const ticketId = router.query.IDTicket;

      // if (!token || !ticketId) {
      //   console.error('Authentication or ticket ID missing.');
      //   return;
      // }

      const response = await axios.post(
        `${process.env.NEXT_PUBLIC_API_URL}/api/tickets/${ticketId}/attachments`,
        formData,
        {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        }
      );

      // Asegúrate de que la API devuelve los nuevos archivos adjuntos como un array
      const newAttachments = Array.isArray(response.data)
        ? response.data
        : [response.data];

      // Si la respuesta es exitosa, actualiza la lista de archivos adjuntos.
      if (response.status === 200) {
        setAttachments((prevAttachments) => [
          ...prevAttachments,
          ...newAttachments,
        ]);
      }

      // Limpiar el input del archivo
      if (fileInputRef.current) {
        fileInputRef.current.value = '';
        // Refresh the page after successful upload
        router.reload();
      }
    } catch (error) {
      console.error('Error uploading files:', error);
    }
  };

  const handleDownloadAttachment = async (attachmentUrl: string) => {
    try {
      // Extract the file name from the URL
      const fileName = attachmentUrl.substring(
        attachmentUrl.lastIndexOf('/') + 1
      );

      // Append the SAS token to the blob URL
      const urlWithSas = `${attachmentUrl}?sp=r&st=2024-09-06T08:50:17Z&se=2124-09-06T16:50:17Z&spr=https&sv=2022-11-02&sr=c&sig=XRcpFIGhI%2B2295A60llboreJ4ZT8RfcsI8kD0xdLglM%3D`;
      console.log(urlWithSas, 'URL WITH SAS');
      // Fetch the blob data from Azure Storage using the URL with SAS
      const response = await fetch(urlWithSas, {
        mode: 'cors',
        credentials: 'include',
      });

      if (!response.ok) {
        console.error(
          'Error downloading attachment:',
          response.statusText
        );
        return;
      }

      // Convert the blob data to a Blob object
      const blob = await response.blob();

      // Create a Blob URL and trigger a download
      const downloadUrl = window.URL.createObjectURL(new Blob([blob]));
      const link = document.createElement('a');
      link.href = downloadUrl;
      link.download = fileName;
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
    } catch (error) {
      console.error('Error downloading attachment:', error);
    }
  };

  const handleDeleteAttachment = (fileId: string) => {
    setSelectedFileIdToDelete(fileId);
    setDeleteConfirmVisible(true);
  };

  const confirmDeleteAttachment = async () => {
    if (!selectedFileIdToDelete) return;

    try {
      // const token = localStorage.getItem('accessToken');

      const token = '1234';

      const ticketId = router.query.IDTicket as string;

      // if (!token || !ticketId) {
      //   console.error('Token or ticketId is missing.');
      //   return;
      // }

      const response = await axios.delete(
        `${process.env.NEXT_PUBLIC_API_URL}/api/tickets/${ticketId}/attachments/${selectedFileIdToDelete}`,
        {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        }
      );

      if (response.status === 204) {
        // Actualiza los attachments después de una eliminación exitosa
        const attachmentsData = await fetchAttachments(token, ticketId);
        setAttachments(attachmentsData);
        setDeleteConfirmVisible(false);
      } else {
        console.error('Error deleting attachment:', response.statusText);
      }
    } catch (error) {
      console.error('Error deleting attachment:', error);
    } finally {
      setSelectedFileIdToDelete(null);
    }
  };

  /**************************************************************************************************/

  const handleChange = (e: React.ChangeEvent<HTMLSelectElement>) => {
    const selectedOption = e.target.value;

    setSelectedProjectForEscalation(selectedOption);
    setShowConfirmation(true);
  };

  const handleConfirmEscalate = () => {
    setShowConfirmation(false); // Cierra el pop-up de confirmación
    handlePopJiraEscalate(selectedProjectForEscalation); // Procede al escalado
  };

  const handleClosePopJira = () => {
    setPopJiraVisibility(false);
  };

  const handleEscalate = async () => {
    console.log('Escalate');
    await handleActionChange({
      target: {
        value: 'escalateToDev',
      },
    } as ChangeEvent<HTMLSelectElement>);
    setPopJiraVisibility(false);
  };

  const handleActionChange = async (e: ChangeEvent<HTMLSelectElement>) => {
    const selectedValue = e.target.value;
    setSelectedAction(selectedValue);

    if (selectedValue === 'escalateToDev') {
      setPopJiraVisibility(true); // Show PopJira component
    }
  };

  const handlePopJiraEscalate = (selectedProject: string) => {
    console.log('Proyecto seleccionado para escalado:', selectedProject);

    // Aquí puedes incluir lógica adicional si necesitas, antes de llamar a escalateToDeveloper
    escalateToDeveloper({
      title: title as string,
      description: description as string,
      project: selectedProject,
    });

    // Cierra el popup después de iniciar el escalado
    setPopJiraVisibility(false);
  };

  const escalateToDeveloper = async (ticketData: TicketData) => {
    try {
      const apiUrl = `${process.env.NEXT_PUBLIC_API_URL}/api/jira`;

      const token = localStorage.getItem('accessToken');

      // if (!token) {
      //   console.error('Access token not available.');
      //   return;
      // }

      console.log(ticketData, 'TICKET DATA');

      const requestData = {
        title: ticketData.title,
        description: ticketData.description,
        key: ticketData.project,
        idTicket: parseInt(id as string, 10),
      };

      console.log(requestData, 'REQUEST DATA');

      const response = await axios.post(apiUrl, requestData, {
        headers: {
          Authorization: `Bearer ${token}`,
          'Content-Type': 'application/json',
        },
      });

      console.log('ACA ESTA LA DATA');
      console.log('Server Response:', response.data);

      const { IDJiraTicket } = response.data.data;
      console.log('IDJiraTicket', IDJiraTicket);

      const fechaUpdatedISO = router.query.updatedAt as string;
      const fechaUpdated = new Date(fechaUpdatedISO);

      const opciones: Intl.DateTimeFormatOptions = {
        year: 'numeric',
        month: '2-digit',
        day: '2-digit',
        hour: '2-digit',
        minute: '2-digit',
        second: '2-digit',
        hour12: false,
        timeZone: 'UTC',
      };

      const fechaUpdate = fechaUpdated
        .toLocaleDateString('es-ES', opciones)
        .replace(/\//g, '-')
        .replace(',', '');

      const fechaCreatedISO = router.query.createdAt as string;
      const fechaCreated = new Date(fechaCreatedISO);

      const fechaCreate = fechaCreated
        .toLocaleDateString('es-ES', opciones)
        .replace(/\//g, '-')
        .replace(',', '');

      router.push(
        `/support/tickets/${requestData.idTicket}?Title=${router.query.Title}&Description=${router.query.Description}&Priority=${router.query.Priority}&Dealer=${router.query.Dealer}&Status=${router.query.Status}&Department=${router.query.Department}&Site=${router.query.Site}&createdAt=${fechaCreate}&updatedAt=${fechaUpdate}&Category=${router.query.Category}&Platform=${router.query.Platform}&Email=${router.query.Email}&Companyname=${router.query.Companyname}&contact_name=${router.query.contact_name}&VehicleID=${router.query.VehicleID}&Reporter=${router.query.Reporter}&Supported=${router.query.Supported}&IDTicket=${router.query.IDTicket}&JiraTicketID=${IDJiraTicket}&Solution=${router.query.Solution}&openSince=${router.query.openSince}&TicketNumber=${router.query.TicketNumber}`
      );
    } catch (error) {
      console.error('Error escalating to Jira:', error);
    }
  };

  useEffect(() => {
    const fetchData = async () => {
      try {
        const token = localStorage.getItem('accessToken');
        const ticketId = router?.query?.IDTicket;

        console.log(ticketId, 'ticketId');

        // if (!token || !ticketId) {
        //   console.error('Token or ticketId is missing.');
        //   return;
        // }
        // @ts-ignore
        const commentsData = await fetchComments(token, ticketId);
        setComments(commentsData);
        // @ts-ignore
        const attachmentsData = await fetchAttachments(token, ticketId);
        console.log('Fetched Attachments:', attachmentsData);

        // Only update the state if there are attachments
        if (attachmentsData.length > 0) {
          setAttachments(attachmentsData);
        }
      } catch (error) {
        console.error('Error fetching data:', error);
      }
    };

    fetchData();
  }, [router.query.IDTicket]);

  interface TicketData {
    title: string;
    description: string;
    project?: string; // Add the project property with an optional modifier (?)
  }

  const handleAddComment = async (content: string) => {
    console.log('Ticket ID:', id, 'Content', content);
    try {
      const token = localStorage.getItem('accessToken');

      // if (!token) {
      //   console.error('Token is missing.');
      //   return;
      // }

      // Fetch user info from Auth0
      const userInfoResponse = await axios.get(
        'https://dev-so03q0yu6n6ltwg2.us.auth0.com/userinfo',
        {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        }
      );
      const userEmail = userInfoResponse.data.email;

      // Fetch user info from your backend using the email
      const userResponse = await axios.get(
        `${process.env.NEXT_PUBLIC_API_URL}/api/users/?email=${userEmail}`,
        {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        }
      );

      console.log('USERRESPONSE', userResponse.data[0].IDUser);
      // Extract userID from the response
      const userID = userResponse.data[0].IDUser;

      if (!userID) {
        console.error('UserID is missing.');
        return;
      }

      const response = await axios.post(
        `${process.env.NEXT_PUBLIC_API_URL}/api/comments`,
        {
          Content: content,
          // @ts-ignore
          TicketID: parseInt(IDTicket),
          UserID: userID,
        },
        {
          headers: {
            'Content-Type': 'application/json',
            Authorization: `Bearer ${token}`,
          },
        }
      );

      const newComment = response.data;

      // Update the comments state to include the new comment
      setComments((prevComments) => [...prevComments, newComment]);
    } catch (error) {
      console.error('Error adding comment:', error);
    }
  };

  const handleEditComment = async (
    commentId: number,
    updatedContent: string
  ) => {
    try {
      const token = localStorage.getItem('accessToken');

      // if (!token) {
      //   console.error('Token is missing.');
      //   return;
      // }

      const response = await axios.put(
        `${process.env.NEXT_PUBLIC_API_URL}/api/comments/${commentId}`,
        {
          Content: updatedContent,
        },
        {
          headers: {
            'Content-Type': 'application/json',
            Authorization: `Bearer ${token}`,
          },
        }
      );

      const updatedComment = response.data;

      // Update the comments state to reflect the edited comment
      setComments((prevComments) =>
        prevComments.map((comment) =>
          comment.IDComment === commentId ? updatedComment : comment
        )
      );
    } catch (error) {
      console.error('Error editing comment:', error);
    }
  };

  const handleDeleteComment = async (commentId: number) => {
    try {
      const token = localStorage.getItem('accessToken');

      // if (!token) {
      //   console.error('Token is missing.');
      //   return;
      // }

      await axios.delete(
        `${process.env.NEXT_PUBLIC_API_URL}/api/comments/${commentId}`,
        {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        }
      );

      // Update the comments state to exclude the deleted comment
      setComments((prevComments) =>
        prevComments.filter((comment) => comment.IDComment !== commentId)
      );
    } catch (error) {
      console.error('Error deleting comment:', error);
    }
  };

  let formattedDate = '';
  let formattedTime = '';

  if (created_at) {
    try {
      // Try to parse the date safely with multiple format handling
      let createDate: Date | null = null;

      // Try different parsing approaches
      if (typeof created_at === 'string') {
        // First, check if the string contains slashes (DD/MM/YYYY format)
        if (created_at.includes('/')) {
          const parts = created_at.split(' ');
          const datePart = parts[0];
          const timePart = parts[1] || '';

          const [day, month, year] = datePart.split('/').map(Number);

          if (timePart) {
            const [hours, minutes, seconds] = timePart
              .split(':')
              .map(Number);
            createDate = new Date(
              Date.UTC(
                year,
                month - 1,
                day,
                hours || 0,
                minutes || 0,
                seconds || 0
              )
            );
          } else {
            createDate = new Date(Date.UTC(year, month - 1, day));
          }
        } else {
          // Try standard date parsing (ISO format)
          createDate = new Date(created_at);
        }

        // Check if we have a valid date
        if (createDate && !isNaN(createDate.getTime())) {
          try {
            formattedDate = createDate.toISOString().split('T')[0];
            formattedTime = createDate
              .toTimeString()
              .split(' ')[0]
              .substring(0, 5);
          } catch (formatError) {
            console.error('Error formatting date:', formatError);
            formattedDate = 'Invalid format';
            formattedTime = '--:--';
          }
        } else {
          console.error('Could not parse date from:', created_at);
          formattedDate = 'Invalid date';
          formattedTime = '--:--';
        }
      }
    } catch (error) {
      console.error('Error processing date:', error, created_at);
      formattedDate = 'Error';
      formattedTime = '--:--';
    }
  }

  let idUser = '';

  const idUserAssingUser = (id: string) => {
    idUser = id;
  };

  const AssignUser = async (
    e: React.FormEvent<HTMLFormElement> | ChangeEvent<HTMLSelectElement>
  ) => {
    e.preventDefault();

    try {
      const token = localStorage.getItem('accessToken');
      const userIdToAssign = parseInt(idUser, 10);

      if (!userIdToAssign) {
        console.error('Debe seleccionar un usuario antes de asignar.');
        return;
      }

      const response = await fetch(
        `${process.env.NEXT_PUBLIC_API_URL}/api/tickets/assign/${router?.query?.IDTicket}`,
        {
          method: 'PUT',
          headers: {
            'Content-Type': 'application/json',
            Authorization: `Bearer ${token}`,
          },
          body: JSON.stringify({
            AssignedUserID: userIdToAssign,
          }),
        }
      );

      if (response.ok) {
        console.log(
          `Usuario ${userIdToAssign} asignado al ticket con éxito`
        );
      } else {
        console.error('Error al asignar el usuario al ticket');
      }
    } catch (error) {
      console.error('Error al realizar la solicitud:', error);
    }
  };

  const handleSolutionChange = (
    event: ChangeEvent<HTMLTextAreaElement>
  ) => {
    setSolutionText(event.target.value);
  };

  const handleSaveSolution = async () => {
    try {
      const token = localStorage.getItem('accessToken');
      const IDTicket = router.query.IDTicket as string;

      // if (!token || !IDTicket) {
      //   console.error('Token or ticket ID is missing.');
      //   return;
      // }

      const response = await fetch(
        `${process.env.NEXT_PUBLIC_API_URL}/api/tickets/${IDTicket}`,
        {
          method: 'PUT', // Usar PATCH para actualizar solo un campo
          headers: {
            'Content-Type': 'application/json',
            Authorization: `Bearer ${token}`,
          },
          body: JSON.stringify({ solution: solutionText, status: 'Done' }), // Solo enviamos el campo Solution
        }
      );

      if (!response.ok) {
        console.error('Error updating the solution:', response.statusText);
        return;
      }

      console.log('Solution updated successfully');
      setSolutionPopupVisibility(false);

      router.push(`/support/tickets/pending`);
    } catch (error) {
      console.error('Error updating the solution:', error);
    }
  };

  useEffect(() => {
    const token = localStorage.getItem('accessToken');
    axios
      .get(`${process.env.NEXT_PUBLIC_API_URL}/api/users`, {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      })
      .then((response) => setUsers(response.data))
      .catch((error) => console.error(error));

    // Aca se debe poner lo de jira

    // Entonces aca debemos sacar el id, y con ese id pues
  }, []);

  const [isLoading, setIsLoading] = useState(false);
  const router_ = useRouter();

  const handleRedirect = (url: string) => {
    setIsLoading(true);
    router.push(url);
  };
  return (
    <>
      <div className='bg-teal-50 min-h-screen'>
        <div className='py-10 px-14 overflow-y-auto max-h-fit'>
          <h1 className='text-gray-600 text-center text-3xl mb-8'>
            Welcome to{' '}
            <span className='text-[#14b8a6] font-bold'>
              Ticket Number: {router?.query?.IDTicket}
            </span>
          </h1>

          <div className='flex justify-between'>
            {/* Left Column */}
            <div className='flex flex-col gap-y-8 w-1/2 mr-12'>
              {/* Title and Description Card */}
              <div className='bg-gray-100 p-5 flex flex-col gap-y-5 rounded'>
                <div>
                  <p className='text-[#14b8a6] text-sm'>Title</p>
                  <p className='text-md'>{title}</p>
                </div>

                <div>
                  <p className='text-[#14b8a6] text-sm'>Description</p>
                  <p className='text-md'>{description}</p>
                </div>
              </div>

              <div className=''>
                <p>Attachments:</p>

                <div className='flex flex-wrap gap-x-5 pb-4'>
                  {attachments.map((attachment, index) => (
                    <div
                      key={index}
                      className='relative w-1/6 border border-teal-100 flex flex-col items-center mt-3'
                    >
                      <div className='my-3'>
                        <FontAwesomeIcon
                          size='2x'
                          icon={faImages}
                          className='text-[#14b8a6]'
                        />
                      </div>
                      <p>
                        {/*@ts-ignore*/}
                        {attachment.name?.length > 12
                          ? `${attachment.name.slice(0, 10)}...`
                          : attachment.name}
                      </p>
                      <div className='bg-gray-200 w-full text-center px-3'>
                        <button
                          className='mr-2'
                          onClick={() =>
                            // @ts-ignore
                            handleDownloadAttachment(attachment.url)
                          }
                        >
                          Download
                        </button>
                        <button
                          className='absolute top-0 right-0 pr-1'
                          onClick={() =>
                            // @ts-ignore
                            handleDeleteAttachment(attachment.IDFile)
                          }
                        >
                          <b>x</b>
                        </button>
                      </div>
                    </div>
                  ))}
                </div>

                <input
                  type='file'
                  className='w-1/4'
                  onChange={handleFileChange}
                  multiple
                  ref={fileInputRef}
                />

                <div className='pt-4'>
                  <CommentList
                    comments={comments}
                    onAdd={handleAddComment}
                    onEdit={handleEditComment}
                    onDelete={handleDeleteComment}
                  />
                </div>

                <div className='flex flex-col space-y-10 ml-7 mt-5 mb-10'>
                  <div className='border border-gray-200 rounded-lg p-4 bg-gray-100'>
                    <h3 className='text-lg font-bold mb-2'>Solution</h3>
                    <div className='bg-white rounded-md p-4 shadow-md'>
                      <p className='text-gray-700'>
                        {solution || 'No solution provided yet.'}
                      </p>
                    </div>
                  </div>
                </div>
              </div>
            </div>

            <div className='border border-gray-100 w-1/2 rounded h-1/2'>
              <div
                className='text-md font-semibold'
                style={{
                  background: '#14b8a6',
                  color: 'white',
                  padding: '10px 50px',
                  textAlign: 'center',
                  display: 'inline-block',
                  fontSize: '16px',
                  borderBottomRightRadius: '25px',
                }}
              >
                <p className='text-white text-md'>Details</p>
              </div>
              <div
                className='grid grid-cols-2'
                style={{ marginLeft: '15px' }}
              >
                <div className='flex flex-row mt-4'>
                  <p className='text-sm w-1/3'>Assignee</p>
                  <div className='w-2/3'>
                    {isEditing ? (
                      <select
                        className='text-md font text-left border border-teal-200 rounded'
                        value={selectedAssignee}
                        onChange={(e) => {
                          idUserAssingUser(e.target.value);
                          AssignUser(e);
                          setSelectedAssignee(e.target.value);
                        }}
                        style={{ fontSize: '14px', width: '163px' }}
                      >
                        <option value='' disabled>
                          {selectedAssignee
                            ? `${selectedAssignee}`
                            : 'Assign to'}
                        </option>
                        {users.map((user) => (
                          <option
                            key={user.IDUser}
                            value={user.IDUser.toString()}
                          >
                            {user.FirstName} {user.LastName}
                          </option>
                        ))}
                      </select>
                    ) : (
                      <div>
                        {assignee && (
                          <div>
                            <p className='text-md font-semibold'>
                              {assignee.FirstName} {assignee.LastName}
                            </p>
                          </div>
                        )}
                      </div>
                    )}
                  </div>
                </div>
                <div
                  className='flex flex-row mt-4'
                  style={{ fontSize: '14px' }}
                >
                  <div className='w-1/3'>
                    <p className='text-sm'>Opened since</p>
                  </div>
                  <div className='w-2/3'>
                    <div className='w-2/3'>
                      {router.query.status === 'Done' ? (
                        <p className='text-md font-semibold'>
                          {router.query.openSince || 'N/A'}
                        </p>
                      ) : (
                        <p className='text-md font-semibold'>
                          {timeSinceCreated}
                        </p>
                      )}
                    </div>
                  </div>
                </div>

                {Object.entries(router.query).map(([key, value]) => {
                  if (key !== 'ticketNumber' && key !== 'IDTicket') {
                    return (
                      <div
                        key={key}
                        className='flex flex-row mt-4 items-center py-3 border-b border-teal-100 hover:bg-teal-50 transition-all duration-200'
                      >
                        <div className='w-1/3'>
                          <span className='text-sm text-gray-600 font-medium'>
                            {key}
                          </span>
                        </div>
                        <div className='w-2/3'>
                          {isEditing ? (
                            key === 'status' ? (
                              <select
                                className='w-48 px-3 py-1.5 text-sm border border-teal-200 rounded-md focus:ring-2 focus:ring-[#14b8a6]'
                                value={editedValues[key] || ''}
                                onChange={(e) =>
                                  handleInputChange(key, e.target.value)
                                }
                              >
                                {[
                                  'In progress',
                                  'Done',
                                  'Scaled',
                                  'To Do',
                                  "Won't do",
                                  'Pending to call',
                                ].map((option) => (
                                  <option key={option} value={option}>
                                    {option}
                                  </option>
                                ))}
                              </select>
                            ) : (
                              <input
                                type='text'
                                value={editedValues[key] || ''}
                                onChange={(e) =>
                                  handleInputChange(key, e.target.value)
                                }
                                className='w-48 px-3 py-1.5 text-sm border border-teal-200 rounded-md focus:ring-2 focus:ring-[#14b8a6]'
                              />
                            )
                          ) : (
                            <p className='text-md font-medium text-gray-800'>
                              {value || 'N/A'}
                            </p>
                          )}
                        </div>
                      </div>
                    );
                  }
                  return null;
                })}
              </div>

              <div className='border-2 border-gray-200 mt-20'>
                <div
                  className='text-white px-5 py-3 text-xl font-semibold'
                  style={{
                    background: '#14b8a6',
                    padding: '10px 50px',
                    textAlign: 'center',
                    display: 'inline-block',
                    fontSize: '16px',
                    borderBottomRightRadius: '25px',
                  }}
                >
                  Jira Details
                </div>

                <div className='flex justify-between space-x-0 mb-5 mt-3 px-7 w-full'>
                  {/* Jira Details Grid */}
                  <div
                    className='flex-grow'
                    style={{
                      display: 'flex',
                      flexDirection: 'column',
                      alignItems: 'center',
                      fontSize: '16px',
                    }}
                  >
                    <span
                      className='text-lg mb-4'
                      style={{ fontSize: '14px' }}
                    >
                      Ticket number
                    </span>
                    <span className='text-base'>
                      <a
                        href={`https://collectiveintelligence.atlassian.net/browse/${jiraTicket?.key}`}
                        target='_blank'
                        rel='noopener noreferrer'
                        className='text-[#14b8a6] hover:text-[#14b8a6]'
                      >
                        {jiraTicket?.key}
                      </a>
                    </span>
                  </div>

                  <div
                    className='flex-grow'
                    style={{
                      display: 'flex',
                      flexDirection: 'column',
                      alignItems: 'center',
                      fontSize: '14px',
                    }}
                  >
                    <span
                      className='text-lg mb-4'
                      style={{ fontSize: '14px' }}
                    >
                      Escalated at
                    </span>
                    <span className='text-base'>
                      {jiraTicketOfficial?.fields?.project?.name || 'N/A'}
                    </span>
                  </div>

                  <div
                    className='flex-grow'
                    style={{
                      display: 'flex',
                      flexDirection: 'column',
                      alignItems: 'center',
                      fontSize: '14px',
                    }}
                  >
                    <span
                      className='text-lg mb-4'
                      style={{ fontSize: '14px' }}
                    >
                      Status
                    </span>
                    <span className='text-base'>
                      {jiraTicketOfficial?.fields?.status?.name ||
                        'Unknown'}
                    </span>
                  </div>

                  <div className='flex-grow relative'>
                    <div className='text-sm text-center'>
                      {jiraTicketOfficial?.fields?.assignee ? (
                        <div className='group inline-block text-center'>
                          <span className='block font-bold text-lg mb-1'>
                            Assignee
                          </span>
                          <Image
                            src={
                              jiraTicketOfficial.fields.assignee
                                .avatarUrls['48x48']
                            }
                            alt='Avatar'
                            width={18}
                            height={18}
                            layout='fixed'
                          />
                          <span className='absolute hidden group-hover:block w-32 bg-black text-white text-center text-xs rounded py-1 px-2 z-10 -bottom-8 left-1/2 transform -translate-x-1/2'>
                            {
                              jiraTicketOfficial.fields.assignee
                                .displayName
                            }
                          </span>
                        </div>
                      ) : (
                        <span>Not assigned</span>
                      )}
                    </div>
                  </div>
                </div>
              </div>

              <div className='flex flex-col space-y-10 ml-7 mt-5 mb-10'>
                <p style={{ fontSize: '14px' }}>Qa Assigned to</p>
                <p style={{ fontSize: '14px' }}>QA Test Notes</p>
              </div>

              <div className='flex items-center'>
                {isEditing ? (
                  <>
                    <button
                      onClick={handleSaveClick}
                      className='bg-transparent border-[#14b8a6] text-[#14b8a6] text-md font-semibold rounded-full block outline-none py-2.5 px-5 mr-5 ml-5 mb-5 hover:bg-[#14b8a6] hover:text-white transition-colors'
                    >
                      Save
                    </button>
                    <button
                      onClick={handleCancelClick}
                      className='bg-transparent border-[#14b8a6] text-[#14b8a6] text-md font-semibold rounded-full block outline-none py-2.5 px-5 mr-5 ml-5 mb-5 hover:bg-[#14b8a6] hover:text-white transition-colors'
                    >
                      Cancel
                    </button>
                  </>
                ) : (
                  <button
                    onClick={handleEditClick}
                    className='bg-transparent border-[#14b8a6] text-[#14b8a6] text-md font-semibold rounded-full block outline-none py-2.5 px-5 mr-5 ml-5 mb-5 hover:bg-[#14b8a6] hover:text-white transition-colors'
                  >
                    Edit
                  </button>
                )}
              </div>
            </div>
          </div>
        </div>

        {/* Bottom Action Bar */}
        <div className='bg-gray-100 py-5 flex flex-row justify-between px-14 bottom-0 w-full'>
          <div className='flex items-center px-8 border border-gray-200 rounded-full text-sm text-[#14b8a6] hover:text-[#14b8a6]'>
            <p
              style={{ cursor: 'pointer' }}
              onClick={() => handleRedirect('/support/tickets/pending')}
            >
              BACK
            </p>
          </div>

          <select
            className='border-[#14b8a6] text-[#14b8a6] text-md font-semibold rounded-full block outline-none py-2.5 px-5 mr-5 hover:bg-[#14b8a6] hover:text-white transition-colors'
            onChange={handleChange}
            value={SelectedOption}
          >
            <option value='' disabled>
              Escalate to
            </option>
            <option value='FXQ'>Fleet XQ</option>
            <option value='EH'>E-Helpdesk</option>
            <option value='FF'>Fleet IQ/Focus</option>
          </select>
        </div>

        {/* Modals */}
        {showConfirmation && (
          <div className='fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50'>
            <div className='bg-white rounded-lg p-6 max-w-md w-full mx-4'>
              <h3 className='text-lg font-medium text-gray-900 mb-4'>
                Are you sure you want to escalate this ticket to Jira?
              </h3>
              <div className='flex justify-end gap-4'>
                <button
                  className='bg-[#14b8a6] text-white px-4 py-2 rounded-md hover:bg-[#8fa830] transition-colors'
                  onClick={handleConfirmEscalate}
                >
                  Yes
                </button>
                <button
                  className='border border-gray-300 text-gray-700 px-4 py-2 rounded-md hover:bg-gray-50 transition-colors'
                  onClick={() => setShowConfirmation(false)}
                >
                  No
                </button>
              </div>
            </div>
          </div>
        )}

        {isSolutionPopupVisible && (
          <div className='fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50'>
            <div className='bg-white rounded-lg p-6 max-w-lg w-full mx-4'>
              <h2 className='text-xl font-medium text-gray-900 mb-4'>
                Enter Conclusion/Solution for the Problem
              </h2>
              <textarea
                className='w-full h-32 px-3 py-2 text-sm border border-teal-200 rounded-md focus:ring-2 focus:ring-[#14b8a6] resize-none'
                value={solutionText}
                onChange={handleSolutionChange}
                placeholder='Describe the solution here...'
              />
              <div className='flex justify-end gap-4 mt-6'>
                <button
                  className='bg-[#14b8a6] text-white px-4 py-2 rounded-md hover:bg-[#8fa830] transition-colors'
                  onClick={handleSaveSolution}
                >
                  Save Solution
                </button>
                <button
                  className='border border-gray-300 text-gray-700 px-4 py-2 rounded-md hover:bg-gray-50 transition-colors'
                  onClick={handleCancelSolution}
                >
                  Cancel
                </button>
              </div>
            </div>
          </div>
        )}

        {deleteConfirmVisible && (
          <div className='fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50'>
            <div className='bg-white rounded-lg p-6 max-w-md w-full mx-4'>
              <h2 className='text-lg font-medium text-gray-900 mb-4'>
                Confirm Deletion
              </h2>
              <p className='text-gray-600 mb-6'>
                Are you sure you want to delete this attachment?
              </p>
              <div className='flex justify-end gap-4'>
                <button
                  className='bg-red-500 text-white px-4 py-2 rounded-md hover:bg-red-600 transition-colors'
                  onClick={confirmDeleteAttachment}
                >
                  Delete
                </button>
                <button
                  className='border border-gray-300 text-gray-700 px-4 py-2 rounded-md hover:bg-gray-50 transition-colors'
                  onClick={() => setDeleteConfirmVisible(false)}
                >
                  Cancel
                </button>
              </div>
            </div>
          </div>
        )}

        {isPopJiraVisible && (
          <PopJira
            onClose={handleClosePopJira}
            escalate={handlePopJiraEscalate}
          />
        )}
        {isLoading && <LoadingScreen />}
      </div>
    </>
  );
};

import React, { useEffect, useState, useRef, ChangeEvent } from 'react';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import {
  faImages,
  faSpinner,
  faCheckCircle,
  faCircleNotch,
  faBan,
} from '@fortawesome/free-solid-svg-icons';
import { useRouter } from 'next/router';
import axios from 'axios';
import CommentList from '../TicketComments/CommentList';
import PopJira from '@/components/generalComponents/PopJira';
import Image from 'next/image';
import LoadingScreen from '@/components/generalComponents/LoadingScreen';
import { STATUS_OPTIONS, getStatusColor } from '@/utils/statusConfig';
import { Ticket, Comment as CommentType } from '@/types/tickets.types';

interface User {
  id: number;
  username: string;
  first_name: string;
  last_name: string;
}

type JiraTicket = {
  id: number;
  key?: string;
  self?: string;
  // Other fields removed for simplicity
};

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
      icon_url: string;
      status_category: {
        id: number;
        key: string;
        color_name: string;
        name: string;
      };
    };
    project: {
      id: string;
      key: string;
      name: string;
      project_type_key: string;
      simplified: boolean;
      avatar_urls: Record<string, string>;
    };
    assignee?: {
      self: string;
      account_id: string;
      avatar_urls: Record<string, string>;
      display_name: string;
      active: true;
      time_zone: string;
    };
    // Other fields removed for simplicity
  };
}

const fetchComments = async (
  token: string,
  ticketId: string | undefined
) => {
  if (!ticketId) {
    console.log('No ticket ID provided for comment fetch');
    return [];
  }

  try {
    console.log('Fetching comments for ticket ID:', ticketId);
    console.log(
      `this is the link used to access fetch tickets: ${process.env.NEXT_PUBLIC_API_URL}/api/tickets/${ticketId}/comments`
    );
    const response = await fetch(
      `${process.env.NEXT_PUBLIC_API_URL}/api/tickets/${ticketId}/comments`,
      {
        method: 'GET',
        headers: {
          Authorization: `Bearer ${token || ''}`,
          'Content-Type': 'application/json',
        },
      }
    );

    if (!response.ok) {
      return [];
    }

    const commentsData = await response.json();
    return commentsData || [];
  } catch (error) {
    console.error('Error in fetchComments:', error);
    return [];
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

    if (response.data) {
      return response.data;
    }
    return [];
  } catch (error) {
    console.error('Error fetching attachments:', error);
    return [];
  }
};

export const TicketDetails = () => {
  const emptyTicket: Ticket = {
    id: 0,
    title: '',
    description: '',
    status: '',
    category: '',
    priority: '',
    created_at: '',
    updated_at: '',
    assigned_user_id: null,
    customer_id: null,
    site_name: null,
    site_id: null,
    department: null,
    incident_date: null,
    drivers_name: null,
    vehicle_id: null,
    dealer: null,
    contact_name: '',
    supported: '',
    is_escalated: null,
    solution: null,
    platform: null,
    customer_name: '',
    email: null,
    reporter: null,
    comments: null,
    ticket_number: null,
    open_since: null,
    user: null,
    jira_ticket_id: null,
    phone: null,
  };

  const [ticket, setTicket] = useState<Ticket>(emptyTicket);
  const [error, setError] = useState<string | null>(null);

  const router = useRouter();
  const [comments, setComments] = useState<CommentType[]>([]);
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
  const [selectedAssignee, setSelectedAssignee] = useState('');
  const [selectedOption, setSelectedOption] = useState<string>('');
  const [attachments, setAttachments] = useState<File[]>([]);
  const [files, setFiles] = useState<File[] | null>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);
  const [users, setUsers] = useState<User[]>([]);
  const [isEditing, setIsEditing] = useState(false);
  const [editedValues, setEditedValues] = useState<Record<string, string>>(
    {}
  );
  const [assignee, setAssignee] = useState<any | null>(null);
  const [assigneeId, setAssigneeId] = useState<number | null>(null);
  const { id } = router.query;
  const [timeSinceCreated, setTimeSinceCreated] = useState<string>('');
  const [isLoading, setIsLoading] = useState(false);

  console.log('check out my router query', router.query.id);
  useEffect(() => {
    const fetchTicketById = async () => {
      // Only fetch if we have an ID
      if (!router.isReady || !router.query.id) {
        return;
      }

      setIsLoading(true);
      setError(null);

      try {
        // Get auth token
        const token = localStorage.getItem('accessToken');
        if (!token) {
          setError('Authentication token not found');
          return;
        }

        // Debug the endpoint
        const endpoint = `${process.env.NEXT_PUBLIC_API_URL}/api/tickets/${router.query.id}`;
        console.log('Attempting to fetch ticket from:', endpoint);

        // Fetch ticket data by ID
        const response = await axios.get(endpoint, {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        });

        // Log full response for debugging
        console.log('Full ticket API response:', response);

        // Update state with fetched ticket
        setTicket(response.data);
        console.log('Fetched ticket data:', response.data);

        // Fetch related data (comments, attachments, etc.)
        if (response.data && response.data.id) {
          const ticketId = response.data.id.toString();

          // Fetch in parallel for better performance
          const [commentsData, attachmentsData] = await Promise.all([
            fetchComments(token, ticketId),
            fetchAttachments(token, ticketId),
          ]);
          console.log('Fetched comments:', commentsData);
          setComments(commentsData);
          if (attachmentsData.length > 0) {
            setAttachments(attachmentsData);
          }

          // Calculate time since creation if created_at is available
          if (response.data.created_at) {
            const createdDate = new Date(response.data.created_at);
            const now = new Date();
            const diffMs = now.getTime() - createdDate.getTime();
            const diffHours = Math.floor(diffMs / (1000 * 60 * 60));
            const days = Math.floor(diffHours / 24);
            const remainingHours = diffHours % 24;

            if (days > 0) {
              setTimeSinceCreated(
                `${days} day${days > 1 ? 's' : ''}${
                  remainingHours > 0
                    ? ` and ${remainingHours} hour${
                        remainingHours > 1 ? 's' : ''
                      }`
                    : ''
                } ago`
              );
            } else {
              setTimeSinceCreated(
                `${diffHours} hour${diffHours !== 1 ? 's' : ''} ago`
              );
            }
          }
        }
      } catch (err: any) {
        console.error('Error fetching ticket:', err);

        if (err.response) {
          console.error('Error response data:', err.response.data);
          console.error('Error response status:', err.response.status);
          setError(
            `Error ${err.response.status}: ${
              err.response.data.message || 'Failed to load ticket'
            }`
          );
        } else if (err.request) {
          console.error('No response received:', err.request);
          setError(
            'No response received from server. Please check your connection.'
          );
        } else {
          setError(
            'An unexpected error occurred when loading ticket details.'
          );
        }
      } finally {
        setIsLoading(false);
      }
    };

    fetchTicketById();
  }, [router.isReady, router.query.id]);

  useEffect(() => {
    const urlSearchParams = new URLSearchParams(window.location.search);
    const createdAtString = urlSearchParams.get('createdAt');

    if (!createdAtString) {
      setTimeSinceCreated('N/A');
      return;
    }

    try {
      const [datePart, timePart] = createdAtString.split(' ');
      const [day, month, year] = datePart.split('/').map(Number);
      const [hours, minutes, seconds] = timePart.split(':').map(Number);

      const createdAt = new Date(
        Date.UTC(year, month - 1, day, hours, minutes, seconds)
      );
      const currentTime = new Date();
      const difference = currentTime.getTime() - createdAt.getTime();

      const totalHours = Math.floor(difference / (1000 * 60 * 60));
      const days = Math.floor(totalHours / 24);
      const remainingHours = totalHours % 24;

      if (days > 0) {
        setTimeSinceCreated(
          `${days} day${days > 1 ? 's' : ''}${
            remainingHours > 0
              ? ` and ${remainingHours} hour${
                  remainingHours > 1 ? 's' : ''
                }`
              : ''
          } ago`
        );
      } else {
        setTimeSinceCreated(
          `${totalHours} hour${totalHours !== 1 ? 's' : ''} ago`
        );
      }
    } catch (error) {
      console.error('Error calculating time since creation:', error);
      setTimeSinceCreated('N/A');
    }
  }, []);

  useEffect(() => {
    if (id) {
      const fetchAssigneeData = async () => {
        try {
          const token = localStorage.getItem('accessToken');
          const config = { headers: { Authorization: `Bearer ${token}` } };
          const response = await axios.get(
            `${process.env.NEXT_PUBLIC_API_URL}/api/tickets/${id}/assigneduser`,
            config
          );

          const newAssigneeId = response.data.assigneeId;
          setAssigneeId(newAssigneeId);

          if (newAssigneeId) {
            const userResponse = await axios.get(
              `${process.env.NEXT_PUBLIC_API_URL}/api/users/${newAssigneeId}`,
              config
            );
            setAssignee(userResponse.data);
          }
        } catch (error) {
          console.error('Error fetching assignee data:', error);
        }
      };

      fetchAssigneeData();
    }
  }, [id]);

  useEffect(() => {
    const loadUsers = async () => {
      try {
        const token = localStorage.getItem('accessToken');
        const response = await axios.get<User[]>(
          `${process.env.NEXT_PUBLIC_API_URL}/api/users`,
          { headers: { Authorization: `Bearer ${token}` } }
        );
        setUsers(response.data);
      } catch (error) {
        console.error('Error loading users:', error);
      }
    };

    loadUsers();
  }, []);

  useEffect(() => {
    if (
      typeof ticket.jira_ticket_id === 'string' &&
      ticket.jira_ticket_id
    ) {
      const fetchJiraData = async () => {
        try {
          const token = localStorage.getItem('accessToken');
          const config = { headers: { Authorization: `Bearer ${token}` } };

          const jiraId = ticket.jira_ticket_id
            ? parseInt(ticket.jira_ticket_id.toString(), 10)
            : NaN;
          if (isNaN(jiraId)) return;

          const response = await axios.get<JiraTicket>(
            `${process.env.NEXT_PUBLIC_API_URL}/api/jiratickets/${jiraId}`,
            config
          );

          setJiraTicket(response.data);

          const jiraUrl = response.data.self;
          if (!jiraUrl) return;

          const segments = jiraUrl.split('/');
          const issueNumber = segments.pop() || '';

          if (issueNumber) {
            const detailsResponse = await axios.get(
              `${process.env.NEXT_PUBLIC_API_URL}/api/jiratissue/${issueNumber}`,
              config
            );
            setJiraTicketOfficial(detailsResponse.data);
          }
        } catch (error) {
          console.error('Error fetching Jira data:', error);
        }
      };

      fetchJiraData();
    }
  }, [ticket.jira_ticket_id]);

  useEffect(() => {
    localStorage.setItem('selectedAssignee', selectedAssignee);
  }, [selectedAssignee]);

  useEffect(() => {
    const fetchData = async () => {
      try {
        const token = localStorage.getItem('accessToken');

        const commentsData = await fetchComments(
          token || '',
          id as string
        );
        setComments(commentsData);

        const attachmentsData = await fetchAttachments(
          token || '',
          id as string
        );
        if (attachmentsData.length > 0) {
          setAttachments(attachmentsData);
        }
      } catch (error) {
        console.error('Error fetching data:', error);
      }
    };

    fetchData();
  }, [router.query.IDTicket]);

  const handleEditClick = () => {
    setIsEditing(true);

    const filteredValues: Record<string, string> = {};
    Object.entries(router.query).forEach(([key, value]) => {
      if (typeof value === 'string') {
        filteredValues[key] = value;
      } else if (
        Array.isArray(value) &&
        value.length > 0 &&
        typeof value[0] === 'string'
      ) {
        filteredValues[key] = value[0];
      }
    });

    setEditedValues(filteredValues);
  };

  const handleSaveClick = async () => {
    const ticket: Record<string, any> = {};

    Object.entries(editedValues).forEach(([key, value]) => {
      if (key === 'JiraTicketID' && value) {
        ticket[key] = parseInt(value, 10);
      } else {
        ticket[key] = value || null;
      }
    });

    // Remove properties not needed by API
    delete ticket.id;

    // Calculate openSince for Done status
    if (ticket.status === 'Done' && router.query.createdAt) {
      const createdAtStr = router.query.createdAt as string;
      const [datePart, timePart] = createdAtStr.split(' ');
      const [day, month, year] = datePart.split('/').map(Number);
      const [hours, minutes, seconds] = timePart.split(':').map(Number);

      const createdAt = new Date(
        Date.UTC(year, month - 1, day, hours, minutes, seconds)
      );
      const now = new Date();
      const diff = now.getTime() - createdAt.getTime();

      const totalHours = Math.floor(diff / (1000 * 60 * 60));
      const days = Math.floor(totalHours / 24);
      const remainingHours = totalHours % 24;

      ticket.openSince =
        days > 0
          ? `${days} day(s) ${remainingHours} hour(s)`
          : `${remainingHours} hour(s)`;
    }

    try {
      const token = localStorage.getItem('accessToken');
      const IDTicket = router.query.IDTicket as string;

      const response = await fetch(
        `${process.env.NEXT_PUBLIC_API_URL}/api//tickets/update/${IDTicket}`,
        {
          method: 'PUT',
          headers: {
            'Content-Type': 'application/json',
            Authorization: `Bearer ${token || ''}`,
          },
          body: JSON.stringify(ticket),
        }
      );

      if (response.ok) {
        // Update URL with new values
        router.replace({
          pathname: router.pathname,
          query: { ...router.query, ...ticket },
        });
      }
    } catch (error) {
      console.error('Error updating ticket:', error);
    } finally {
      setIsEditing(false);
    }
  };

  const handleCancelClick = () => {};

  const handleInputChange = (
    key: string,
    value: string | string[] | undefined
  ) => {
    const stringValue = Array.isArray(value) ? value.join(', ') : value;
    setEditedValues((prev) => ({ ...prev, [key]: stringValue || '' }));
    console.log('Edited values:', editedValues);

    if (key === 'status' && value === 'Done') {
      setSolutionPopupVisibility(true);
    }
  };

  const handleFileChange = async (e: ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files.length > 0) {
      const filesArray = Array.from(e.target.files);
      setFiles(filesArray);
      await handleFileUpload(filesArray);
    }
  };

  const handleFileUpload = async (filesToUpload: File[]) => {
    if (!filesToUpload.length) return;

    const formData = new FormData();
    filesToUpload.forEach((file) => formData.append('files', file));

    try {
      const token = localStorage.getItem('accessToken');
      const ticketId = router.query.IDTicket as string;

      const response = await axios.post(
        `${process.env.NEXT_PUBLIC_API_URL}/api/tickets/${ticketId}/attachments`,
        formData,
        { headers: { Authorization: `Bearer ${token || ''}` } }
      );

      if (response.status === 200) {
        const newAttachments = Array.isArray(response.data)
          ? response.data
          : [response.data];
        setAttachments((prev) => [...prev, ...newAttachments]);

        if (fileInputRef.current) {
          fileInputRef.current.value = '';
          router.reload();
        }
      }
    } catch (error) {
      console.error('Error uploading files:', error);
    }
  };

  const handleDownloadAttachment = async (attachmentUrl: string) => {
    try {
      const fileName = attachmentUrl.substring(
        attachmentUrl.lastIndexOf('/') + 1
      );
      const sasToken =
        'sp=r&st=2024-09-06T08:50:17Z&se=2124-09-06T16:50:17Z&spr=https&sv=2022-11-02&sr=c&sig=XRcpFIGhI%2B2295A60llboreJ4ZT8RfcsI8kD0xdLglM%3D';
      const urlWithSas = `${attachmentUrl}?${sasToken}`;

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

      const blob = await response.blob();
      const downloadUrl = URL.createObjectURL(blob);
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
      const ticketId = router.query.IDTicket as string;
      const token = localStorage.getItem('accessToken') || '1234'; // Using default token is not secure

      const response = await axios.delete(
        `${process.env.NEXT_PUBLIC_API_URL}/api/tickets/${ticketId}/attachments/${selectedFileIdToDelete}`,
        { headers: { Authorization: `Bearer ${token}` } }
      );

      if (response.status === 204) {
        const attachmentsData = await fetchAttachments(token, ticketId);
        setAttachments(attachmentsData);
        setDeleteConfirmVisible(false);
      }
    } catch (error) {
      console.error('Error deleting attachment:', error);
    } finally {
      setSelectedFileIdToDelete(null);
    }
  };

  const handleChange = (e: React.ChangeEvent<HTMLSelectElement>) => {
    setSelectedProjectForEscalation(e.target.value);
    setShowConfirmation(true);
  };

  const handleConfirmEscalate = () => {
    setShowConfirmation(false);
    escalateToDeveloper({
      title: ticket.title as string,
      description: ticket.description as string,
      project: selectedProjectForEscalation,
    });
  };

  const handleClosePopJira = () => {
    setPopJiraVisibility(false);
  };

  const escalateToDeveloper = async (ticketData: {
    title: string;
    description: string;
    project?: string;
  }) => {
    try {
      const token = localStorage.getItem('accessToken');

      const requestData = {
        title: ticketData.title,
        description: ticketData.description,
        key: ticketData.project,
        idTicket: parseInt(id as string, 10),
      };

      const response = await axios.post(
        `${process.env.NEXT_PUBLIC_API_URL}/api/jira`,
        requestData,
        {
          headers: {
            Authorization: `Bearer ${token || ''}`,
            'Content-Type': 'application/json',
          },
        }
      );

      const { IDJiraTicket } = response.data.data;

      // Update URL with new Jira ticket ID
      router.push({
        pathname: `/support/tickets/${requestData.idTicket}`,
        query: { ...router.query, JiraTicketID: IDJiraTicket },
      });
    } catch (error) {
      console.error('Error escalating to Jira:', error);
    }
  };

  const handleAddComment = async (content: string) => {
    try {
      const token = localStorage.getItem('accessToken');

      // Get user info from Auth0
      const userInfoResponse = await axios.get(
        'https://dev-so03q0yu6n6ltwg2.us.auth0.com/userinfo',
        { headers: { Authorization: `Bearer ${token || ''}` } }
      );

      // Get user ID from backend
      const userResponse = await axios.get(
        `${
          process.env.NEXT_PUBLIC_API_URL
        }/api/users/?email=${encodeURIComponent(
          userInfoResponse.data.email
        )}`,
        { headers: { Authorization: `Bearer ${token || ''}` } }
      );

      let userID;
      if (userResponse.data && userResponse.data.length > 0) {
        userID = userResponse.data[0].id;
      } else {
        userID = 1; // Default user ID as fallback
      }

      // Add the comment
      const response = await axios.post(
        `${process.env.NEXT_PUBLIC_API_URL}/api/comments`,
        {
          Content: content,
          TicketID: parseInt(router.query.id as string, 10),
          UserID: userID,
        },
        {
          headers: {
            'Content-Type': 'application/json',
            Authorization: `Bearer ${token || ''}`,
          },
        }
      );

      // Update comments list
      setComments((prev) => [...prev, response.data]);
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

      const response = await axios.put(
        `${process.env.NEXT_PUBLIC_API_URL}/api/comments/${commentId}`,
        { Content: updatedContent },
        {
          headers: {
            'Content-Type': 'application/json',
            Authorization: `Bearer ${token || ''}`,
          },
        }
      );

      setComments((prev) =>
        prev.map((comment) =>
          comment.id === commentId ? response.data : comment
        )
      );
    } catch (error) {
      console.error('Error editing comment:', error);
    }
  };

  const handleDeleteComment = async (commentId: number) => {
    try {
      const token = localStorage.getItem('accessToken');

      await axios.delete(
        `${process.env.NEXT_PUBLIC_API_URL}/api/comments/${commentId}`,
        { headers: { Authorization: `Bearer ${token || ''}` } }
      );

      setComments((prev) =>
        prev.filter((comment) => comment.id !== commentId)
      );
    } catch (error) {
      console.error('Error deleting comment:', error);
    }
  };

  const idUserAssingUser = (id: string) => {
    return id; // Return instead of using global variable
  };

  const handleAssignUser = async (
    e: React.ChangeEvent<HTMLSelectElement>
  ) => {
    e.preventDefault();
    const userId = e.target.value;

    try {
      const token = localStorage.getItem('accessToken');
      const userIdToAssign = parseInt(userId, 10);

      if (!userIdToAssign) {
        console.error('Must select a user before assigning');
        return;
      }

      const response = await fetch(
        `${process.env.NEXT_PUBLIC_API_URL}/api/tickets/assign/${router.query.IDTicket}`,
        {
          method: 'PUT',
          headers: {
            'Content-Type': 'application/json',
            Authorization: `Bearer ${token || ''}`,
          },
          body: JSON.stringify({ AssignedUserID: userIdToAssign }),
        }
      );

      if (response.ok) {
        console.log(
          `User ${userIdToAssign} assigned to ticket successfully`
        );
        setSelectedAssignee(userId);
      }
    } catch (error) {
      console.error('Error assigning user:', error);
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

      const response = await fetch(
        `${process.env.NEXT_PUBLIC_API_URL}/api//tickets/update/${IDTicket}`,
        {
          method: 'PUT',
          headers: {
            'Content-Type': 'application/json',
            Authorization: `Bearer ${token || ''}`,
          },
          body: JSON.stringify({ solution: solutionText, status: 'Done' }),
        }
      );

      if (response.ok) {
        setSolutionPopupVisibility(false);
        router.push('/support/tickets/pending');
      }
    } catch (error) {
      console.error('Error updating solution:', error);
    }
  };

  const handleCancelSolution = () => {
    setSolutionPopupVisibility(false);
  };

  const handleRedirect = (url: string) => {
    setIsLoading(true);
    router.push(url);
  };

  // Render component (UI remains mostly the same)
  return (
    <>
      <div className='bg-teal-50 min-h-screen'>
        <div className='py-10 px-14 overflow-y-auto max-h-fit'>
          <h1 className='text-gray-600 text-center text-3xl mb-8'>
            Welcome to{' '}
            <span className='text-[#14b8a6] font-bold'>
              Ticket Number: {router?.query?.id}
            </span>
          </h1>

          <div className='flex justify-between'>
            {/* Left Column */}
            <div className='flex flex-col gap-y-8 w-1/2 mr-12'>
              {/* Title and Description Card */}
              <div className='bg-gray-100 p-5 flex flex-col gap-y-5 rounded'>
                <div>
                  <p className='text-[#14b8a6] text-sm'>Title</p>
                  <p className='text-md'>{ticket.title}</p>
                </div>

                <div>
                  <p className='text-[#14b8a6] text-sm'>Description</p>
                  <p className='text-md'>{ticket.description}</p>
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
                        {ticket.solution || 'No solution provided yet.'}
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

              {/* start of new add */}
              <div className='grid grid-cols-2 gap-4 bg-white p-6 rounded-lg shadow-sm'>
                <div className='col-span-2'>
                  <h3 className='text-lg font-bold text-teal-700 mb-3 pb-2 border-b border-teal-100'>
                    Ticket Information
                  </h3>
                </div>

                {/* Basic Info */}
                <div className='mb-4'>
                  <p className='text-sm font-medium text-gray-600'>ID</p>
                  <p className='text-base'>{ticket.id}</p>
                </div>

                <div className='mb-4'>
                  <p className='text-sm font-medium text-gray-600'>
                    Title
                  </p>
                  <p className='text-base'>{ticket.title}</p>
                </div>

                <div className='mb-4'>
                  <p className='text-sm font-medium text-gray-600'>
                    Status
                  </p>
                  <p
                    className='text-base px-2 py-1 inline-block rounded-full'
                    style={{
                      backgroundColor: getStatusColor(ticket.status),
                      color: 'white',
                    }}
                  >
                    {ticket.status}
                  </p>
                </div>

                <div className='mb-4'>
                  <p className='text-sm font-medium text-gray-600'>
                    Priority
                  </p>
                  <p
                    className={`text-base font-medium ${
                      ticket.priority === 'High'
                        ? 'text-red-600'
                        : ticket.priority === 'Medium'
                        ? 'text-yellow-600'
                        : 'text-green-600'
                    }`}
                  >
                    {ticket.priority}
                  </p>
                </div>

                <div className='mb-4'>
                  <p className='text-sm font-medium text-gray-600'>
                    Category
                  </p>
                  <p className='text-base'>{ticket.category}</p>
                </div>

                <div className='mb-4'>
                  <p className='text-sm font-medium text-gray-600'>
                    Platform
                  </p>
                  <p className='text-base'>{ticket.platform || 'N/A'}</p>
                </div>

                {/* Customer Info */}
                <div className='col-span-2'>
                  <h3 className='text-lg font-bold text-teal-700 mt-4 mb-3 pb-2 border-b border-teal-100'>
                    Customer Information
                  </h3>
                </div>

                <div className='mb-4'>
                  <p className='text-sm font-medium text-gray-600'>
                    Customer
                  </p>
                  <p className='text-base'>{ticket.customer_name}</p>
                </div>

                <div className='mb-4'>
                  <p className='text-sm font-medium text-gray-600'>
                    Contact Name
                  </p>
                  <p className='text-base'>
                    {ticket.contact_name || 'N/A'}
                  </p>
                </div>

                <div className='mb-4'>
                  <p className='text-sm font-medium text-gray-600'>Site</p>
                  <p className='text-base'>{ticket.site_name || 'N/A'}</p>
                </div>

                <div className='mb-4'>
                  <p className='text-sm font-medium text-gray-600'>
                    Email
                  </p>
                  <p className='text-base'>{ticket.email || 'N/A'}</p>
                </div>

                <div className='mb-4'>
                  <p className='text-sm font-medium text-gray-600'>
                    Phone
                  </p>
                  <p className='text-base'>{ticket.phone || 'N/A'}</p>
                </div>

                <div className='mb-4'>
                  <p className='text-sm font-medium text-gray-600'>
                    Department
                  </p>
                  <p className='text-base'>{ticket.department || 'N/A'}</p>
                </div>

                {/* Vehicle Info */}
                <div className='col-span-2'>
                  <h3 className='text-lg font-bold text-teal-700 mt-4 mb-3 pb-2 border-b border-teal-100'>
                    Vehicle Information
                  </h3>
                </div>

                <div className='mb-4'>
                  <p className='text-sm font-medium text-gray-600'>
                    Vehicle ID
                  </p>
                  <p className='text-base'>{ticket.vehicle_id || 'N/A'}</p>
                </div>

                <div className='mb-4'>
                  <p className='text-sm font-medium text-gray-600'>
                    Driver's Name
                  </p>
                  <p className='text-base'>
                    {ticket.drivers_name || 'N/A'}
                  </p>
                </div>

                <div className='mb-4'>
                  <p className='text-sm font-medium text-gray-600'>
                    Dealer
                  </p>
                  <p className='text-base'>{ticket.dealer || 'N/A'}</p>
                </div>

                <div className='mb-4'>
                  <p className='text-sm font-medium text-gray-600'>
                    Incident Date
                  </p>
                  <p className='text-base'>
                    {ticket.incident_date
                      ? new Date(ticket.incident_date).toLocaleDateString()
                      : 'N/A'}
                  </p>
                </div>

                {/* Support Info */}
                <div className='col-span-2'>
                  <h3 className='text-lg font-bold text-teal-700 mt-4 mb-3 pb-2 border-b border-teal-100'>
                    Support Information
                  </h3>
                </div>

                <div className='mb-4'>
                  <p className='text-sm font-medium text-gray-600'>
                    Opened
                  </p>
                  <p className='text-base'>
                    {ticket.created_at
                      ? new Date(ticket.created_at).toLocaleString()
                      : 'N/A'}
                  </p>
                </div>

                <div className='mb-4'>
                  <p className='text-sm font-medium text-gray-600'>
                    Updated
                  </p>
                  <p className='text-base'>
                    {ticket.updated_at
                      ? new Date(ticket.updated_at).toLocaleString()
                      : 'N/A'}
                  </p>
                </div>

                <div className='mb-4'>
                  <p className='text-sm font-medium text-gray-600'>
                    Supported By
                  </p>
                  <p className='text-base'>{ticket.supported || 'N/A'}</p>
                </div>

                <div className='mb-4'>
                  <p className='text-sm font-medium text-gray-600'>
                    Escalated
                  </p>
                  <p className='text-base'>
                    {ticket.is_escalated === true
                      ? 'Yes'
                      : ticket.is_escalated === false
                      ? 'No'
                      : 'N/A'}
                  </p>
                </div>

                <div className='mb-4'>
                  <p className='text-sm font-medium text-gray-600'>
                    Reporter
                  </p>
                  <p className='text-base'>{ticket.reporter || 'N/A'}</p>
                </div>

                <div className='mb-4'>
                  <p className='text-sm font-medium text-gray-600'>
                    Open Since
                  </p>
                  <p className='text-base'>
                    {ticket.open_since || timeSinceCreated || 'N/A'}
                  </p>
                </div>

                <div className='col-span-2 mb-4'>
                  <p className='text-sm font-medium text-gray-600'>
                    Description
                  </p>
                  <div className='bg-gray-50 p-3 rounded border border-gray-200 mt-1'>
                    <p className='text-base whitespace-pre-wrap'>
                      {ticket.description}
                    </p>
                  </div>
                </div>

                <div className='col-span-2 mb-4'>
                  <p className='text-sm font-medium text-gray-600'>
                    Solution
                  </p>
                  <div className='bg-gray-50 p-3 rounded border border-gray-200 mt-1'>
                    <p className='text-base whitespace-pre-wrap'>
                      {ticket.solution || 'No solution provided yet.'}
                    </p>
                  </div>
                </div>
              </div>
              {/* end of new add */}

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
                          handleAssignUser(e);
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
                          <option key={user.id} value={user.id.toString()}>
                            {user.first_name} {user.last_name}
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
                                {STATUS_OPTIONS.map((option) => (
                                  <option
                                    key={option}
                                    value={option}
                                    style={{
                                      backgroundColor:
                                        getStatusColor(option),
                                      color: 'white',
                                    }}
                                  >
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
                                .avatar_urls['48x48']
                            }
                            alt='Avatar'
                            width={18}
                            height={18}
                            layout='fixed'
                          />
                          <span className='absolute hidden group-hover:block w-32 bg-black text-white text-center text-xs rounded py-1 px-2 z-10 -bottom-8 left-1/2 transform -translate-x-1/2'>
                            {
                              jiraTicketOfficial.fields.assignee
                                .display_name
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
            value={selectedOption}
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
            escalate={handleConfirmEscalate}
          />
        )}
        {isLoading && <LoadingScreen />}
      </div>
    </>
  );
};

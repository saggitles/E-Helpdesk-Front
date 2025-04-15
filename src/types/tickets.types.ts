// src/types/tickets.types.ts

// Core Ticket interface
 export interface Ticket {
    id: number;
    title: string;
    description: string;
    status: string;
    category: string;
    priority: string;
    assigned_user_id: number | null;
    customer_id: number | null;
    site_name: string | null;
    site_id: number | null;
    department: string | null;
    created_at: string;
    updated_at: string;
    incident_date: string | null;
    drivers_name: string | null;
    vehicle_id: string | null;
    dealer: string | null;
    contact_name: string;
    supported: string;
    is_escalated: boolean | null;
    solution: string | null;
    platform: string | null;
    customer_name: string;
    email: string | null;
    reporter: string | null;
    comments: string | null;
    ticket_number: string | null;
    open_since: string | null;
    user: string | null;
    jira_ticket_id: number | null;
    phone: string | null;
  }
  
  // Ticket Details Props
  export interface TicketDetailsProps {
    title: string;
    description: string;
    priority: string;
    status: string;
    customer: string;
    department: string;
    site: string;
    created_at: Date;
    updated_at: Date;
    category?: string;
    platform?: string;
    email?: string;
    contact_name?: string;
    vehicle_id?: string;
    reporter?: string;
    supported?: string;
    id?: string;
    solution?: string;
    incident_date?: string;
    ticket_number?: string;
  }

  export interface Filters{
    customer: string;
    site: string;
    gmptCode: string;
  }

  export interface VehicleData {
    customer: string;
    site: string;
  }
  
  // Customer interface
  export interface Customer {
    customer_id: number;
    customer_name: string;
  }
  
  // Site interface
  export interface Site {
    site_id: number;
    site_name: string;
  }
  
  // Form Data for creating tickets
  export interface CreateTicketFormData {
    customer_name: string | null;
    customer_id: number | null;
    site_name: string | null;
    site_id: number | null;
    contact_name: string;
    phone: string;
  }

  export interface TicketModalProps {
        isOpen: boolean;
        onClose: () => void;
        formData: CreateTicketFormData
        
        onTicketCreated?: () => void; // Callback para actualizar los tickets después de crear uno nuevo
    }
  
  // Props for PendingTickets component
  export interface PendingTicketsProps {
    site_id?: number;
  }
  
  // Props for TicketRowItem component
  export interface TicketRowItemProps {
    ticket: Ticket;
    style?: React.CSSProperties;
    index: number;
  }
  
  // API Call interface for tracking
  export interface ApiCall {
    url: string;
    method: string;
    timestamp: string;
    endpoint: string;
  }
  
  // Comment type
  export interface Comment {
    id: number;
    content: string;
    author: string;
    created_at: string;
    ticket_id: number;
    user_id?: number;
  }

  export interface JiraTicketData {
    title: string;
    description: string;
    project?: string;
  }
  
  export interface User {
    id: number;
    username: string;
    first_name: string;
    last_name: string;
  }
  
  export type JiraTicket = {
    id: number;
    key?: string;
    creation_date?: string;
    description?: string;
    project_key?: string;
    project_name?: string;
    project_type?: string;
    status?: string;
    status_category?: string;
    type?: string;
    self?: string;
  };
  
  export interface JiraTicketOfficial {
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
        avatar_urls: {
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
        icon_url: string;
        subtask: boolean;
        avatar_id: number;
      };
      created: string;
      updated: string;
      creator: {
        self: string;
        account_id: string;
        email_address: string;
        avatar_urls: {
          '48x48': string;
          '24x24': string;
          '16x16': string;
          '32x32': string;
        };
        display_name: string;
        active: boolean;
        time_zone: string;
      };
      assignee?: {
        self: string;
        account_id: string;
        avatar_urls: {
          '48x48': string;
          '24x24': string;
          '16x16': string;
          '32x32': string;
        };
        display_name: string;
        active: true;
        time_zone: string;
      };
    };
  }
// src/utils/statusConfig.ts

// Define the status options as constants
export const STATUS_OPTIONS = [
    'In Progress',
    'Done',
    'Development',
    'To Do',
    'Pending Information',
    'Warranty Sent',
    'Pending Tech Visit',
    'Pending Confirmation'
  ] as const;
  
  // Create a type based on the options
  export type TicketStatus = typeof STATUS_OPTIONS[number];
  
  // Object mapping for status colors
  export const STATUS_COLORS: Record<TicketStatus, string> = {
    'In Progress': '#82CAFF',    // Light blue frosting
    'Done': '#AAFF99',           // Mint green frosting
    'Development': '#A8C7FA',    // Blueberry yogurt
    'To Do': '#FF9A9A',          // Vanilla cream
    'Pending Information': '#FFE4A8', // Lemon cake
    'Warranty Sent': '#FFBB99',      // Peach filling
    'Pending Tech Visit': '#99E6D9',  // Teal frosting
    'Pending Confirmation': '#E8C0FF'  // Lavender frosting
  };
  
  // Function to get color based on status
  export const getStatusColor = (status: string): string => {
    return STATUS_COLORS[status as TicketStatus] || '#e6d856';
  };
  
  // Additional helper for status styles
  export const getStatusStyles = (status: string) => {
    return {
      backgroundColor: getStatusColor(status),
      color: 'black',
      padding: '3px',
      borderRadius: '10px',
      boxShadow: '0 2px 4px rgba(0, 0, 0, 0.1)'
    };
  };
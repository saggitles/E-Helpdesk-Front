// Define the category options as constants
export const CATEGORY_OPTIONS = [
    'Checklist issue',
    'Software Issue',
    'Hardware Issue',
    'Pin/card Issue',
    'Dashboard Issue',
    'Improvement Request',
    'Connectivity Issue',
    'User Unawareness',
    'Team Request',
    'Server Down',
    'Impact Calibrations',
    'Polarity Idle Timer Issue',
    'GPS Issue'
  ] as const;
  
  // Create a type based on the options
  export type TicketCategory = typeof CATEGORY_OPTIONS[number];
  
  
  // Additional helper for category styles
  export const getCategoryStyles = (category: string) => {
    return {
      backgroundColor: 'grey',
      color: '#333333', // Dark text for better readability on pastel backgrounds
      padding: '3px',
      borderRadius: '10px',
      boxShadow: '0 2px 4px rgba(0, 0, 0, 0.1)'
    };
  };
  
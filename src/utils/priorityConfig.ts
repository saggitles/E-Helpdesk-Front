// Define the priority options as constants
export const PRIORITY_OPTIONS = [
    'Low',
    'Medium',
    'High'
  ] as const;
  
  // Create a type based on the options
  export type TicketPriority = typeof PRIORITY_OPTIONS[number];
  
  // Object mapping for priority colors in cake theme
  export const PRIORITY_COLORS: Record<TicketPriority, string> = {
    'Low': '#A8C7FA',    // Blueberry frosting
    'Medium': '#FFE4A8', // Lemon cake
    'High': '#FF9A9A',   // Strawberry frosting
  };
  
  // Function to get color based on priority
  export const getPriorityColor = (priority: string): string => {
    return PRIORITY_COLORS[priority as TicketPriority] || '#E0E0E0';
  };
  
  // Additional helper for priority styles
  export const getPriorityStyles = (priority: string) => {
    return {
      backgroundColor: getPriorityColor(priority),
      color: '#333333', // Dark text for better readability on pastel colors
      padding: '3px 8px',
      borderRadius: '10px',
      fontWeight: 500,
      boxShadow: '0 2px 4px rgba(0, 0, 0, 0.1)'
    };
  };
  
  // Priority descriptions
  export const PRIORITY_DESCRIPTIONS = {
    'Low': 'Issue with minimal impact on operations',
    'Medium': 'Issue that affects efficiency but has workarounds',
    'High': 'Significant issue that impairs operations'
  };
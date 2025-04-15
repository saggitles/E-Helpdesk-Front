// Define the platform options as constants
export const PLATFORM_OPTIONS = [
    'FleetIQ',
    'FleetFocus UK',
    'FleetFocus AUS',
    'ForkliftIQ',
    'RentalIQ',
    'All platforms'
  ] as const;
  
  // Create a type based on the options
  export type TicketPlatform = typeof PLATFORM_OPTIONS[number];
  
  // Additional helper for platform styles (simple version without colors)
  export const getPlatformStyles = (platform: string) => {
    return {
      backgroundColor: '#f3f4f6', // Light gray for all platforms
      color: '#333333',
      padding: '3px 8px',
      borderRadius: '10px',
      fontWeight: 500,
      boxShadow: '0 2px 4px rgba(0, 0, 0, 0.1)'
    };
  };
  
  // Platform descriptions
  export const PLATFORM_DESCRIPTIONS = {
    'FleetIQ': 'Main fleet management platform',
    'FleetFocus UK': 'Specialized platform for UK operations',
    'FleetFocus AUS': 'Specialized platform for Australian operations',
    'ForkliftIQ': 'Platform for forklift operations management',
    'RentalIQ': 'Platform for equipment rental operations',
    'All platforms': 'Issue affecting all systems'
  };
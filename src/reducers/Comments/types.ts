export interface Comment {
  IDComment: number;
  Content: string;
  TicketID: number;
  Ticket: Ticket; // Asume que ya tienes una interfaz Ticket
  Images: Image[];
  Files: File[];
  UserID: number;
  createdAt: Date; // Ajusta el tipo según tu configuración actual (e.g., Date)
  updatedAt: Date; // Ajusta el tipo según tu configuración actual (e.g., Date)
}

export interface Ticket {
  IDTicket: number;
  Title: string;
  Description: string;
  Status: string;
  Category: string;
  Priority: string;
  AssignedUserID?: number | null;
  CustomerID: number;
  Site?: string | null;
  Department?: string | null;
  AssignedUser?: User | null;
  Customer: Customer;
  Comments: Comment[]; // Asume que tienes una interfaz Comment
  Images: Image[]; // Asume que tienes una interfaz Image
  Files: File[];
  createdAt: Date; // Ajusta el tipo según tu configuración actual (e.g., Date)
  updatedAt: Date; // Ajusta el tipo según tu configuración actual (e.g., Date)
  incidentDate?: Date | null; // Ajusta el tipo según tu configuración actual (e.g., Date)
  driversName?: string | null;
  VehicleID?: string | null;
}

export interface User {
  IDUser: number;
  Username: string;
  FirstName: string;
  LastName: string;
  Email: string;
  UserRoleID: number;
  UserRole: UserRole;
  Tickets: Ticket[];
}

export interface UserRole {
  IDRole: number;
  RoleName: string;
  Users: User[];
}

export interface Customer {
  IDCustomer: number;
  CustomerName: string;
  ContactName: string;
  Email: string;
  Tickets: Ticket[];
}

export interface Image {
  IDImage: number;
  url: string;
  TicketID?: number | null;
  Ticket?: Ticket | null;
  CommentID?: number | null;
  Comment?: Comment | null;
}

export interface File {
  IDFile: number;
  url: string;
  TicketID?: number | null;
  Ticket?: Ticket | null;
  CommentID?: number | null;
  Comment?: Comment | null;
}

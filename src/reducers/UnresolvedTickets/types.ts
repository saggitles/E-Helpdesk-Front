export interface TicketInfo {
  id: number;
  ticketId: string;
  callerName: string;
  customerName: string;
  equipment: string;
  location: string;
  department: string;
  story: string;
  eventTime: string;
  saveDAte: string;
  driverName: string;
  user: string;
}

export enum UnresolvedTicketActionType {
  ADD_UNRESOLVED_TICKETS = 'ADD_UNRESOLVED_TICKET',
  REMOVE_UNRESOLVED_TICKET = 'REMOVE_UNRESOLVED_TICKET',
}

export interface UnresolvedTicketActions {
  type: UnresolvedTicketActionType;
  payload: TicketInfo[];
}

export interface UnresolvedTicketState {
  unresolvedTickets: TicketInfo[];
}

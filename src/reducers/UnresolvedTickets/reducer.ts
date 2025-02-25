import {
  TicketInfo,
  UnresolvedTicketActionType,
  UnresolvedTicketActions,
  UnresolvedTicketState,
} from './types';

export const initialUnresolvedTicketsState = {
  unresolvedTickets: [] as TicketInfo[],
};

const unresolvedTicketsReducer = (
  state: UnresolvedTicketState = initialUnresolvedTicketsState,
  action: UnresolvedTicketActions
) => {
  switch (action.type) {
    case UnresolvedTicketActionType.ADD_UNRESOLVED_TICKETS:
      return {
        ...state,
        unresolvedTickets: [...state.unresolvedTickets, ...action.payload],
      };
    case UnresolvedTicketActionType.REMOVE_UNRESOLVED_TICKET:
      return {
        ...state,
        unresolvedTickets: state.unresolvedTickets.filter(
          (ticket) => ticket.id !== action.payload[0].id
        ),
      };
    default:
      return state;
  }
};

export default unresolvedTicketsReducer;

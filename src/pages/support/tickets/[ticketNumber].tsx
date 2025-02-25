import { useRouter } from 'next/router';
import { TicketDetails } from '@/components/SupportTeamComponents';

const TicketsPage = () => {
  const router = useRouter();
  console.log(router);

  return (
    <div>
      {/* <p>TICKET NUMBER: {router?.query?.ticketNumber}</p>
      <p>Ticket details below: </p> */}
      <TicketDetails />
    </div>
  );
};

export default TicketsPage;

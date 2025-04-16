import { useRouter } from 'next/router';
import { TicketDetails } from '@/components/SupportTeamComponents';

const TicketsPage = () => {
  const router = useRouter();
  console.log(router);

  return (
    <div>
      <TicketDetails />
    </div>
  );
};

export default TicketsPage;

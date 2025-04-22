import React, { useState, useEffect, useReducer } from 'react';
import { useRouter } from 'next/router';
import Loading from '../components/generalComponents/Loading';
import {
  CostumerComponents,
  SiteDetails,
  EquipmentDetails,
  WebsiteSettings,
  Timeline,
  Event,
  DriverHistory,
} from '@/components/homeComponents';
import { ButtonRole } from '@/components/generalComponents/ButtonRole';
import { PendingTickets } from '@/components/SupportTeamComponents';
import { AdminComponents } from '@/components/AdminComponents';
import Alert, {
  EscalateType,
} from '../components/generalComponents/alerts';
import { GetServerSideProps, InferGetServerSidePropsType } from 'next';
import { getToken } from '@/utils';
import unresolvedTicketsReducer, {
  initialUnresolvedTicketsState,
} from '@/reducers/UnresolvedTickets/reducer';
import { getUnresolvedTickets } from '@/services/api';
import { UnresolvedTicketActionType } from '@/reducers/UnresolvedTickets/types';
import { useGenerateDetails } from '@/contexts';
import { Avatar } from '@mui/material';

function Home({
  token,
  tokenApp,
}: InferGetServerSidePropsType<typeof getServerSideProps>) {
  const [state, dispatch] = useReducer(
    unresolvedTicketsReducer,
    initialUnresolvedTicketsState
  );

  const [isLoad, setIsLoad] = useState(true);
  const [viewTicket, setViewTicket] = useState<string>('');
  const [alert, setAlert] = useState(false);
  const [alertType, setAlertType] = useState<EscalateType>(
    '' as EscalateType
  );

  const {
    displaySiteDetails,
    equipmentID,
    displayEquipmentDetails,
    displayTimeline,
    displayWebsiteSettings,
    displayEvent,
    displayDriverHistory,
  } = useGenerateDetails();

  const [search, setSearch] = useState(false);
  const [clearForm, setClearForm] = useState(false);

  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const [selectedOption, setSelectedOption] = useState('Default');

  const router = useRouter();

  const handleMenuClick = (option: string) => {
    setSelectedOption(option);
    setIsMenuOpen(false);
  };

  const toggleMenu = () => {
    setIsMenuOpen(!isMenuOpen);
  };

  const userAlert = () => {
    router.push('/api/auth/logout');
  };

  const getTickets = async () => {
    if (token) {
      const unresolvedTickets = await getUnresolvedTickets();

      if (unresolvedTickets) {
        dispatch({
          type: UnresolvedTicketActionType.ADD_UNRESOLVED_TICKETS,
          payload: unresolvedTickets,
        });
      }
    }
  };

  const saveTokenLocalStorage = () => {
    if (token !== null) {
      localStorage.setItem('accessToken', token);
      // localStorage.setItem('appToken', tokenApp);
    }
  };

  const displayAlert = (type: EscalateType) => {
    setAlert(true);
    setAlertType(type);
  };

  const clearTicket = () => {
    setViewTicket('');
    setClearForm(true);
  };

  useEffect(() => {
    saveTokenLocalStorage();
    getTickets();

    router.push('/support/create/ticket');

    setIsLoad(false);
  }, []);

  return (
    <>
      <Loading />
    </>
  );
}

export default Home;

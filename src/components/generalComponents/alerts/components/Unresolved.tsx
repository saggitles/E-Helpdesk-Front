import React, { useState } from 'react';
import Alert from '../index';
import { remindNew } from '@/services/api';

interface UnresolvedProps {
  unresolvedTickets: any; // TODO - edit this
  setUnresolvedAlert: React.Dispatch<React.SetStateAction<boolean>>;
}

function Unresolved({
  unresolvedTickets,
  setUnresolvedAlert,
}: UnresolvedProps) {
  const [resolve, setResolve] = useState(false);

  const reminder = async () => {
    const data = {
      id: localStorage.getItem('userId'),
      name: localStorage.getItem('userName'),
      remindNextTime: true,
      remindSetDate: '',
    };

    await remindNew(data);
  };

  return (
    <>
      <div className='flex flex-col items-center w-full px-8 py-2 text-left '>
        {/* {unresolvedTickets.map((ticket, index) => {
          return (
            <UnresolvedTicket style={{ display: "flex" }} key={"UT" + index}>
              <UnresolvedTicketFirstColumn>
                <p>Ticket #{ticket.id}</p>
              </UnresolvedTicketFirstColumn>
              <UnresolvedTicketSecondColumn>
                {ticket.status === "1" ? (
                  <ResolvedIcon viewBox="0 0 24 24">
                    <polyline points="20 6 9 17 4 12" />
                  </ResolvedIcon>
                ) : (
                  <UnresolvedButton onClick={ _=> {setResolve(true)}} >View</UnresolvedButton>
                )}
              </UnresolvedTicketSecondColumn>
            </UnresolvedTicket>
          );
        })} */}
      </div>

      <div className='flex justify-center w-full'>
        <button
          className='w-fit h-8 m-4 cursor-pointer py-0 px-8 rounded-md border border-solid border-[#bbbbbb] bg-transparent focus:outline-none'
          onClick={(_) => {
            setUnresolvedAlert(false);
          }}
        >
          Ok
        </button>
        <button
          className='w-fit h-8 m-4 cursor-pointer py-0 px-8 rounded-md border border-solid border-[#bbbbbb] bg-transparent focus:outline-none'
          onClick={(_) => {
            reminder();
          }}
        >
          Remind Me later
        </button>
      </div>
      {resolve && <Alert type='resolve' setAlert={setResolve} />}
    </>
  );
}

export default Unresolved;

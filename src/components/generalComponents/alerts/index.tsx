import React, { useState } from 'react';
import Box from '../containerBox';
import Resolve from './components/Resolve';
import Escalate from './components/Escalate';

export type EscalateType =
  | 'resolve'
  | 'escalate'
  | 'unresolved'
  | 'Master Codes'
  | 'Drivers List'
  | 'Drivers have license expired'
  | 'Drivers on Blacklist'
  | 'Saved Ticket'
  | 'Category notification'
  | 'All drivers';

interface AlertProps {
  type: EscalateType;
  setAlert: React.Dispatch<React.SetStateAction<boolean>>;
  children?: React.ReactNode;
  ticketInfo?: any; // TODO - edit type
}

function Alert({ type, setAlert, children, ticketInfo }: AlertProps) {
  const [step, setStep] = useState(1);

  return (
    <>
      {type === 'resolve' ? (
        <div className='fixed top-0 left-0 w-screen h-screen bg-[rgba(255,255,255,0.5)] flex justify-center z-[999] items-start'>
          <Box title='Action' width='550px'>
            <Resolve
              step={step}
              setStep={setStep}
              setAlert={setAlert}
              ticketInfo={ticketInfo}
            />
          </Box>
        </div>
      ) : type === 'escalate' ? (
        <div className='fixed top-0 left-0 w-screen h-screen bg-[rgba(255,255,255,0.5)] flex justify-center z-[999] items-start'>
          <Box title='Action' width='550px'>
            <Escalate
              step={step}
              setStep={setStep}
              setAlert={setAlert}
              ticketInfo={ticketInfo}
            />
          </Box>
        </div>
      ) : (
        <div className='fixed top-0 left-0 w-screen h-screen bg-[rgba(255,255,255,0.5)] flex justify-center z-[999] items-start'>
          <Box title={type} width='550px' close={true} setAlert={setAlert}>
            {children}
          </Box>
        </div>
      )}
    </>
  );
}

export default Alert;

// // Styles of the component
// const AlertContainer = styled.div`
//   position: fixed;
//   top: 0;
//   left: 0;
//   width: 100vw;
//   height: 100vh;
//   background: rgba(255, 255, 255, 0.5);
//   display: flex;
//   align-items: ${props =>
//     props.position === 'start' ? 'flex-start' : 'center'};

//   justify-content: center;
//   z-index: 999;
// `;

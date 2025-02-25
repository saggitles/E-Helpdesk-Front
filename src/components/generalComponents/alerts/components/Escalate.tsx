import React, { useState } from 'react';
import { sendEmail } from '@/services/api';

interface EscalateProps {
  step: number;
  setStep: React.Dispatch<React.SetStateAction<number>>;
  setAlert: React.Dispatch<React.SetStateAction<boolean>>;
  ticketInfo: any; // TODO - edit this
}

function Escalate({ step, setStep, setAlert, ticketInfo }: EscalateProps) {
  const [callerEmail, setCallerEmail] = useState('');
  const [comment, setComment] = useState('');
  const [priority, setPriority] = useState('low');

  const escalateTicket = async () => {
    const data = {
      callerName: ticketInfo.callerName,
      customerName: ticketInfo.customerName,
      location: ticketInfo.location,
      department: ticketInfo.department,

      region: '',
      equipment: ticketInfo.equipment,
      story: ticketInfo.story,
      status: 2,
      category: [],
      driverName: ticketInfo.driverName,
      time: ticketInfo.eventTime,
      saveDAte: ticketInfo.saveDAte,

      escalatedUser: '',
      priority,
      callerEmail,
      comment,
      id: ticketInfo.id,
      ticketId: ticketInfo.id,

      sendAnEmail: true,
    };
    await sendEmail(data);
  };

  return (
    <>
      {step === 1 ? (
        <>
          <div className='flex items-start w-full px-2 py-2 text-left'>
            <div className='flex flex-col justify-center w-1/2 ml-4'>
              <div className='flex items-center'>
                <p className='min-w-[55px]'>Escalate</p>
                <select className='w-1/2 h-8 m-4 py-0 px-2 border border-solid border-[#888888] rounded-md bg-transparent focus:outline-none'>
                  <option value='users'>Users</option>
                </select>
              </div>
              <div className='flex items-center'>
                <p className='min-w-[55px]'>Priority</p>
                <select
                  className='w-1/2 h-8 m-4 py-0 px-2 border border-solid border-[#888888] rounded-md bg-transparent focus:outline-none'
                  onChange={(e) => {
                    setPriority(e.target.value);
                  }}
                >
                  <option value='low'>Low</option>
                  <option value='normal'>Normal</option>
                  <option value='high'>High</option>
                  <option value='urgent'>Urgent</option>
                </select>
              </div>
            </div>

            <div className='flex flex-col justify-center w-1/2 mr-4'>
              <div className='flex items-center'>
                <p className='min-w-[100px]'>Caller's Email </p>

                <input
                  className='w-1/2 h-8 my-1 mx-0 py-0 px-2 border border-solid border-[#888888] text-[#888888] rounded-md focus:outline-none bg-transparent'
                  type='email'
                  spellCheck={false}
                  placeholder=''
                  onChange={(e) => {
                    setCallerEmail(e.target.value);
                  }}
                />
              </div>

              <div className='flex px-0 py-6'>
                <p>Comments</p>
              </div>

              <textarea
                className='w-[80%] h-[20%] m-0 p-4 bg-transparent border border-solid border-[#888888] rounded-md focus:outline-none resize-none text-[#888888]'
                onChange={(e) => {
                  setComment(e.target.value);
                }}
              />
            </div>
          </div>
          <div className='flex items-center justify-center w-full'>
            <button
              className='w-fit h-8 m-4 cursor-pointer py-0 px-4 rounded-md border border-solid border-[#888888] bg-transparent focus:outline-none text-green-600'
              onClick={(e) => {
                escalateTicket();
              }}
            >
              Submit
            </button>

            <p
              className='mx-4 my-0 text-red-600 cursor-pointer'
              onClick={(_) => {
                setAlert(false);
              }}
            >
              Cancel
            </p>
          </div>{' '}
        </>
      ) : (
        <div className='w-full h-[270px] flex flex-col justify-evenly items-center'>
          <div className='flex items-center'>
            <svg
              className='fill-none stroke-green-600 bg-transparent stroke-[2px] border-[3px] border-solid border-green-600 rounded-[50px] p-[1px] h-[32px] w-[32px]'
              viewBox='0 0 24 24'
            >
              <polyline points='20 6 9 17 4 12' />
            </svg>
            <p className='text-[18px] ml-4'>Email was sent</p>
          </div>
          <p className='w-[62%] text-center'>
            Email with all the details was sent to the support team for
            further investigation
          </p>
          <button
            className='w-fit h-8 cursor-pointer py-0 px-8 rounded-md border border-solid border-[#888888] bg-transparent focus:outline-none'
            onClick={(_) => {
              setAlert(false);
            }}
          >
            Ok
          </button>
        </div>
      )}
    </>
  );
}

export default Escalate;

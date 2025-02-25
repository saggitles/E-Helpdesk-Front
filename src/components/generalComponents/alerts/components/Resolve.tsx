import React, { useState } from 'react';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faCheck } from '@fortawesome/free-solid-svg-icons';
import { sendEmail } from '@/services/api';

interface ResolveProps {
  step: number;
  setStep: React.Dispatch<React.SetStateAction<number>>;
  setAlert: React.Dispatch<React.SetStateAction<boolean>>;
  ticketInfo: any; // TODO - edit this
}

function Resolve({ step, setStep, setAlert, ticketInfo }: ResolveProps) {
  const [check, setCheck] = useState(false);
  const [callerEmail, setCallerEmail] = useState('');
  const [comment, setComment] = useState('');
  const resolveTicket = async () => {
    const data = {
      callerName: ticketInfo.callerName,
      customerName: ticketInfo.customerName,
      location: ticketInfo.location,
      department: ticketInfo.department,
      region: '',

      equipment: ticketInfo.equipment,
      story: ticketInfo.story,
      status: 1,
      category: [],
      driverName: ticketInfo.driverName,
      time: ticketInfo.eventTime,
      saveDAte: ticketInfo.saveDAte,
      escalatedUser: '',
      priority: '',

      callerEmail,
      comment,
      id: ticketInfo.id,
      ticketId: ticketInfo.id,
      sendAnEmail: check,
    };

    await sendEmail(data);
  };

  return (
    <>
      {step === 1 ? (
        <>
          <div className='flex items-start w-full px-8 py-2 text-left'>
            <div className='w-[55%] flex flex-col justify-center'>
              <div className='flex items-center'>
                <p>Caller's Email </p>

                <input
                  className='w-[150px] h-8 my-4 mx-auto py-0 px-2 border border-solid border-[#888888] text-[#888888] focus:outline-none'
                  type='text'
                  spellCheck={false}
                  placeholder=''
                  value={callerEmail}
                  onChange={(e) => {
                    setCallerEmail(e.target.value);
                  }}
                />
              </div>

              <div className='w-[220px] mt-8 mr-0 mb-2 ml-[1px] flex justify-start items-center'>
                <span>Send email to caller</span>
                <input
                  className='border-0 h-[1px] -m-[1px] overflow-hidden p-0 absolute whitespace-nowrap w-[1px]'
                  style={{
                    clipPath: 'inset(50%)',
                  }}
                  checked={check}
                  onChange={() => setCheck(!check)}
                />

                <div
                  className={`inline-block w-[16px] h-[16px] text-center ml-6 border border-solid border-[#bbbbbb] rounded-md transition-all duration-150 cursor-pointer ${
                    check ? 'bg-[#1d72e1]' : 'bg-transparent'
                  }`}
                  onChange={() => setCheck(!check)}
                  onClick={() => setCheck(!check)}
                >
                  <FontAwesomeIcon
                    icon={faCheck}
                    className='ResolveCheckboxIcon'
                  />
                </div>
              </div>
            </div>

            <div className='w-[45%] flex flex-col justify-center'>
              <div className='flex px-0 py-6'>
                <p>Comments</p>
              </div>
              <textarea
                className='w-[170px] h-[8rem] m-0 p-4 border border-solid border-[#888888] text-[#888888] resize-none focus:outline-none'
                value={comment}
                onChange={(e) => {
                  setComment(e.target.value);
                }}
              />
            </div>
          </div>
          <div className='flex items-center justify-center w-full'>
            <button
              className='w-fit h-8 m-4 cursor-pointer py-0 px-4 rounded-md border border-solid border-[#008cba] bg-white text-black hover:bg-[#008cba] hover:text-white focus:outline-none'
              onClick={(e) => {
                resolveTicket();
              }}
            >
              Submit
            </button>
            <button
              className='w-fit h-8 m-0 cursor-pointer py-0 px-4 rounded-md border border-solid border-[#c43e1c] bg-white text-red-600 focus:outline-none hover:bg-[#c43e1c] hover:text-white'
              onClick={(_) => {
                setAlert(false);
              }}
            >
              Cancel
            </button>
          </div>{' '}
        </>
      ) : (
        <div className='w-full h-[270px] flex flex-col justify-evenly items-center'>
          <p>The enquiry is resolved successfully</p>
          <button
            className='w-fit h-8 cursor-pointer py-0 px-8 rounded-md border border-solid border-[#bbbbbb] bg-transparent focus:outline-none'
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

export default Resolve;

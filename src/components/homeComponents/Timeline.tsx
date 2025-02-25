import React, { useEffect, useState } from 'react';
import { Box } from '@/components//generalComponents/';
import { getToken } from '@/utils';
import { getTimeline } from '@/services/api';
import { useGenerateDetails } from '@/contexts';

export type TimelineType = {
  id: number;
  cardSwipe: string;
  driver: string;
  sessionStart: string;
  preopStart: string;
  preopEnd: string;
  lockoutType: string;
  sessionEnd: string;
};

function Timeline() {
  const { equipmentID } = useGenerateDetails();

  const [expand, setExpand] = useState(false);
  const [timeline, setTimeline] = useState<TimelineType[]>([]);
  const [currentPage, setCurrentPage] = useState(1);
  const [finalPage, setFinalPage] = useState(0);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchData = async () => {
      try {
        const token = await getToken();
        if (token) {
          const data = await getTimeline(equipmentID);
          setTimeline(data as TimelineType[]); // Añadimos "as TimelineType[]" para asegurar que TypeScript comprenda el tipo correctamente.
        }
        setLoading(false);
      } catch (error) {
        console.log('Error fetching data:', error);
        setLoading(false);
      }
    };
  
    fetchData();
  }, [equipmentID]);

  return (
    <Box
      title='Timeline'
      width='auto'
      expand={expand}
      displayExpand={true}
      setExpand={setExpand}
      loading={loading}
    >
      {expand === true && (
        <>
          {/* TLTable */}
          <table
            className='w-full'
            border={1}
            cellSpacing='0'
            cellPadding='0'
          >
            <thead>
              <tr>
                {/* TLNumberColumn */}
                <th className='w-[100px] py-4 px-0 border border-solid border-[#888888]'>
                  #
                </th>
                {/* TLColumn */}
                <th className='py-4 px-0 font-normal border border-solid border-[#888888]'>
                  Time
                </th>
                {/* TLColumn */}
                <th className='py-4 px-0 font-normal border border-solid border-[#888888]'>
                  Event
                </th>
                {/* TLColumn */}
                <th className='py-4 px-0 font-normal border border-solid border-[#888888]'>
                  Driver
                </th>
              </tr>
            </thead>
            {timeline
              .filter((timeline) => timeline.id === currentPage)

              .map((row, index) => {
                let number = 0;
                return (
                  <tbody key={`TL${index}`}>
                    {row.cardSwipe && (
                      <tr>
                        {/* TLInfoCell */}
                        <td className='py-4 px-0 max-w-[100px] border border-solid border-[#888888] text-center'>
                          {(number = number + 1)}
                        </td>
                        {/* TLInfoCell */}
                        <td className='py-4 px-0 max-w-[100px] border border-solid border-[#888888] text-center'>
                          {/* TLCalendar */}
                          <div className='flex justify-center w-[90%] my-0 mx-auto border border-solid border-[#888888] focus:outline-none'>
                            {row.cardSwipe}
                          </div>
                        </td>
                        {/* TLInfoCell */}
                        <td className='py-4 px-0 max-w-[100px] border border-solid border-[#888888] text-center'>
                          Card Swipe
                        </td>
                        {/* TLInfoCell */}
                        <td className='py-4 px-0 max-w-[100px] border border-solid border-[#888888] text-center'>
                          {row.driver}
                        </td>
                      </tr>
                    )}
                    {row.sessionStart && (
                      <tr>
                        {/* TLInfoCell */}
                        <td className='py-4 px-0 max-w-[100px] border border-solid border-[#888888] text-center'>
                          {(number = number + 1)}
                        </td>
                        {/* TLInfoCell */}
                        <td className='py-4 px-0 max-w-[100px] border border-solid border-[#888888] text-center'>
                          {/* TLCalendar */}
                          <div className='flex justify-center w-[90%] my-0 mx-auto border border-solid border-[#888888] focus:outline-none'>
                            {row.sessionStart}
                          </div>
                        </td>
                        {/* TLInfoCell */}
                        <td className='py-4 px-0 max-w-[100px] border border-solid border-[#888888] text-center'>
                          Session Start
                        </td>
                        {/* TLInfoCell */}
                        <td className='py-4 px-0 max-w-[100px] border border-solid border-[#888888] text-center'>
                          {row.driver}
                        </td>
                      </tr>
                    )}
                    {row.preopStart && (
                      <tr>
                        {/* TLInfoCell */}
                        <td className='py-4 px-0 max-w-[100px] border border-solid border-[#888888] text-center'>
                          {(number = number + 1)}
                        </td>
                        {/* TLInfoCell */}
                        <td className='py-4 px-0 max-w-[100px] border border-solid border-[#888888] text-center'>
                          {/* TLCalendar */}
                          <div className='flex justify-center w-[90%] my-0 mx-auto border border-solid border-[#888888] focus:outline-none'>
                            {row.preopStart}
                          </div>
                        </td>
                        {/* TLInfoCell */}
                        <td className='py-4 px-0 max-w-[100px] border border-solid border-[#888888] text-center'>
                          Preop Start
                        </td>
                        {/* TLInfoCell */}
                        <td className='py-4 px-0 max-w-[100px] border border-solid border-[#888888] text-center'>
                          {row.driver}
                        </td>
                      </tr>
                    )}
                    {row.preopEnd && (
                      <tr>
                        {/* TLInfoCell */}
                        <td className='py-4 px-0 max-w-[100px] border border-solid border-[#888888] text-center'>
                          {(number = number + 1)}
                        </td>
                        {/* TLInfoCell */}
                        <td className='py-4 px-0 max-w-[100px] border border-solid border-[#888888] text-center'>
                          {/* TLCalendar */}
                          <div className='flex justify-center w-[90%] my-0 mx-auto border border-solid border-[#888888] focus:outline-none'>
                            {row.preopEnd}
                          </div>
                        </td>
                        {/* TLInfoCell */}
                        <td className='py-4 px-0 max-w-[100px] border border-solid border-[#888888] text-center'>
                          Preop End
                        </td>
                        {/* TLInfoCell */}
                        <td className='py-4 px-0 max-w-[100px] border border-solid border-[#888888] text-center'>
                          {row.driver}
                        </td>
                      </tr>
                    )}
                    {row.lockoutType && (
                      <tr>
                        {/* TLInfoCell */}
                        <td className='py-4 px-0 max-w-[100px] border border-solid border-[#888888] text-center'>
                          {(number = number + 1)}
                        </td>
                        {/* TLInfoCell */}
                        <td className='py-4 px-0 max-w-[100px] border border-solid border-[#888888] text-center'>
                          {/* TLCalendar */}
                          <div className='flex justify-center w-[90%] my-0 mx-auto border border-solid border-[#888888] focus:outline-none'>
                            {row.lockoutType}
                          </div>
                        </td>
                        {/* TLInfoCell */}
                        <td className='py-4 px-0 max-w-[100px] border border-solid border-[#888888] text-center'>
                          Lockout type
                        </td>
                        {/* TLInfoCell */}
                        <td className='py-4 px-0 max-w-[100px] border border-solid border-[#888888] text-center'>
                          {row.driver}
                        </td>
                      </tr>
                    )}
                    {row.sessionEnd && (
                      <tr>
                        {/* TLInfoCell */}
                        <td className='py-4 px-0 max-w-[100px] border border-solid border-[#888888] text-center'>
                          {(number = number + 1)}
                        </td>
                        {/* TLInfoCell */}
                        <td className='py-4 px-0 max-w-[100px] border border-solid border-[#888888] text-center'>
                          {/* TLCalendar */}
                          <div className='flex justify-center w-[90%] my-0 mx-auto border border-solid border-[#888888] focus:outline-none'>
                            {row.sessionEnd}
                          </div>
                        </td>
                        {/* TLInfoCell */}
                        <td className='py-4 px-0 max-w-[100px] border border-solid border-[#888888] text-center'>
                          Session End
                        </td>
                        {/* TLInfoCell */}
                        <td className='py-4 px-0 max-w-[100px] border border-solid border-[#888888] text-center'>
                          {row.driver}
                        </td>
                      </tr>
                    )}
                  </tbody>
                );
              })}
          </table>
          {/* TLButtonsContainer */}
          <div className='flex justify-between w-full'>
            {/* TLButton */}
            <button
              className='w-fit h-8 m-4 cursor-pointer py-0 px-4 rounded-md border border-solid border-[#bbbbbb] bg-transparent focus:outline-none'
              onClick={(_) => {
                setCurrentPage(currentPage - 1);
              }}
              disabled={currentPage === 1 && true}
            >
              Previous
            </button>
            {/* TLButton */}
            <button
              className='w-fit h-8 m-4 cursor-pointer py-0 px-4 rounded-md border border-solid border-[#bbbbbb] bg-transparent focus:outline-none'
              onClick={(_) => {
                setCurrentPage(currentPage + 1);
              }}
              disabled={currentPage === finalPage && true}
            >
              Next
            </button>
          </div>
        </>
      )}
    </Box>
  );
}

export default Timeline;

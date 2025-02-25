import React, { useEffect, useState } from 'react';
import { Box } from '@/components/generalComponents';
import { getDriverHistory } from '@/services/api';
import { getToken } from '@/utils';
import { useGenerateDetails } from '@/contexts';

export type DriverHistoryType = {
  name: string;
  time: string;
  cardId: string;
  wiegand: string;
  authorized: boolean;
};

function DriverHistory() {
  const { equipmentID } = useGenerateDetails();

  const [driversHistory, setDriversHistory] = useState<DriverHistoryType[]>([]);
  const [loading, setLoading] = useState(true); // Inicialmente el estado de carga es true
  const [expand, setExpand] = useState(false);

  useEffect(() => {
    const fetchData = async () => {
      try {
        const token = await getToken();
        if (token) {
          setLoading(true);
          const data = await getDriverHistory(equipmentID); // Aquí se obtienen directamente los datos sin usar response.data
          setDriversHistory(data);
          setLoading(false);
        }
      } catch (error) {
        console.log('Error fetching data:', error);
        setLoading(false);
      }
    };
  
    fetchData();
  }, [equipmentID]); 

  return (
    <Box
      title='Driver History'
      width='50%'
      expand={expand}
      displayExpand={true}
      setExpand={setExpand}
      loading={loading}
    >
      {expand === true && (
        <>
          <div style={{ position: 'relative' }}>
            <div style={{ maxHeight: '302px', overflow: 'auto' }}>
              {/* DHTable */}
              <table
                className='w-full'
                border={1}
                cellSpacing='0'
                cellPadding='0'
              >
                <thead>
                  <tr>
                    {/* DHSmallColumn */}
                    <th className='w-[55px] font-normal py-4 px-0 border border-solid border-[#888888]'>
                      #
                    </th>
                    {/* DHMediumColumn */}
                    <th className='w-[100px] font-normal py-4 px-0 border border-solid border-[#888888]'>
                      Name
                    </th>
                    {/* DHBigColumn */}
                    <th className='w-fit py-4 px-0 font-normal border border-solid border-[#888888]'>
                      Time
                    </th>
                    {/* DHMediumColumn */}
                    <th className='w-[100px] font-normal py-4 px-0 border border-solid border-[#888888]'>
                      Card ID
                    </th>
                    {/* DHMediumColumn */}
                    <th className='w-[100px] font-normal py-4 px-0 border border-solid border-[#888888]'>
                      Wiegand
                    </th>
                    {/* DHMediumColumn */}
                    <th className='w-[100px] font-normal py-4 px-0 border border-solid border-[#888888]'>
                      Authorized Access
                    </th>
                  </tr>
                </thead>
                <tbody>
                  {driversHistory.map((row, index) => {
                    return (
                      <tr key={index}>
                        {/* DHInfoCell */}
                        <td className='py-4 px-0 max-w-[100px] border border-solid border-[#888888] text-center'>
                          {index + 1}
                        </td>
                        {/* DHInfoCell */}
                        <td className='py-4 px-0 max-w-[100px] border border-solid border-[#888888] text-center'>
                          {row.name}
                        </td>
                        {/* DHInfoCell */}
                        <td className='py-4 px-0 max-w-[100px] border border-solid border-[#888888] text-center'>
                          {/* DHCalendar */}
                          {
                            <input
                              className='w-[80%] pl-4 border border-solid border-[#888888] text-[#888888] focus:outline-none'
                              type='text'
                              disabled
                              value={row.time}
                            />
                          }
                        </td>
                        {/* DHInfoCell */}
                        <td className='py-4 px-0 max-w-[100px] border border-solid border-[#888888] text-center'>
                          {row.cardId}
                        </td>
                        {/* DHInfoCell */}
                        <td className='py-4 px-0 max-w-[100px] border border-solid border-[#888888] text-center'>
                          {row.wiegand}
                        </td>
                        {/* DHInfoCell */}
                        <td className='py-4 px-0 max-w-[100px] border border-solid border-[#888888] text-center'>
                          {row.authorized ? 'Yes' : 'No'}
                        </td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>
          </div>
        </>
      )}
    </Box>
  );
}

export default DriverHistory;

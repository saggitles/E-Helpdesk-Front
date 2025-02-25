import React from 'react';

export type BlackListType = {
  driver_name: string;
  user_cd: string;
  wiegand: string;
};
interface BlackListProps {
  blackList: BlackListType[];
}

function BlackList({ blackList }: BlackListProps) {
  return (
    // BLTableContainer
    <div className='w-full max-h-[277px] overflow-y-scroll'>
      <table className='w-full' border={1} cellSpacing='0' cellPadding='0'>
        <thead>
          {/* BLNumberColumn */}
          <th className='w-[20px] font-normal py-4 px-0 border border-solid border-[#888888]'>
            #
          </th>
          {/* BLMediumColumn */}
          <th className='w-[100px] font-normal py-4 px-0 border border-solid border-[#888888]'>
            Name
          </th>
          {/* BLSmallColumn */}
          <th className='w-[50px] font-normal py-4 px-0 border border-solid border-[#888888]'>
            Card ID
          </th>
          {/* BLSmallColumn */}
          <th className='w-[50px] font-normal py-4 px-0 border border-solid border-[#888888]'>
            Pin №
          </th>
        </thead>
        {blackList.map((row, index) => {
          return (
            <tbody key={index}>
              {/* BLInfoCell */}
              <td className='py-4 px-0 max-w-[100px] border border-solid border-[#888888] text-center'>
                {index + 1}
              </td>
              <td className='py-4 px-0 max-w-[100px] border border-solid border-[#888888] text-center'>
                {row.driver_name}
              </td>
              <td className='py-4 px-0 max-w-[100px] border border-solid border-[#888888] text-center'>
                {row.wiegand}
              </td>
              <td className='py-4 px-0 max-w-[100px] border border-solid border-[#888888] text-center'>
                {row.user_cd}
              </td>
            </tbody>
          );
        })}
      </table>
    </div>
  );
}

export default BlackList;

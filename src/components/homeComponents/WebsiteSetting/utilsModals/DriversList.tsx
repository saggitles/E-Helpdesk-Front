import React from 'react';

export type DriverListType = {
  name: string;
  cardId: string;
};

interface DriverListProps {
  allDrivers: DriverListType[];
}
function DriverList({ allDrivers }: DriverListProps) {
  return (
    // DLTableContainer
    <div className='w-full max-h-[277px] overflow-y-scroll'>
      <table className='w-full' border={1} cellSpacing='0' cellPadding='0'>
        <thead>
          {/* DLMediumColumn */}
          <td className='py-4 px-0 max-w-[100px] border border-solid border-[#888888] text-center'>
            Name
          </td>
          <td className='py-4 px-0 max-w-[100px] border border-solid border-[#888888] text-center'>
            Card PIN
          </td>
        </thead>
        {allDrivers.map((row, index) => {
          return (
            <tbody>
              <td className='py-4 px-0 max-w-[100px] border border-solid border-[#888888] text-center'>
                {row.name}
              </td>
              <td className='py-4 px-0 max-w-[100px] border border-solid border-[#888888] text-center'>
                {row.cardId}
              </td>
            </tbody>
          );
        })}
      </table>
    </div>
  );
}

export default DriverList;

import React from 'react';

export type MasterCodesType = {
  master_name: string;
  wiegand: string;
};

interface MasterCodesProps {
  masterCodes: MasterCodesType[];
}

function MasterCodes({ masterCodes }: MasterCodesProps) {
  return (
    // MCTableContainer
    <div className='w-full max-h-[277px] overflow-y-scroll'>
      {/* MCTable */}
      <table
        className='w-full h-full'
        border={1}
        cellSpacing='0'
        cellPadding='0'
      >
        <thead>
          <tr>
            <th className='w-[100px] font-normal py-4 px-0 border border-solid border-[#888888]'>
              Name
            </th>
            <th className='w-[100px] font-normal py-4 px-0 border border-solid border-[#888888]'>
              Card PIN
            </th>
          </tr>
        </thead>
        {masterCodes.map((row, index) => {
          return (
            <tbody key={'MC' + index}>
              <tr>
                <td className='py-4 px-0 max-w-[100px] border border-solid border-[#888888]'>
                  {row.master_name}
                </td>
                <td className='py-4 px-0 max-w-[100px] border border-solid border-[#888888]'>
                  {row.wiegand}
                </td>
              </tr>
            </tbody>
          );
        })}
      </table>
    </div>
  );
}

export default MasterCodes;

import React from 'react';

interface LicenseExpiredProps {
  expiredLicenses: {
    driver_name: string;
  }[];
}
function LicenseExpired({ expiredLicenses }: LicenseExpiredProps) {
  return (
    // LETableContainer
    <div className='w-full max-h-[277px] overflow-y-scroll'>
      {/* LETable */}
      <table className='w-full' border={1} cellSpacing='0' cellPadding='0'>
        <thead>
          {/* LESmallColumn */}
          <th className='w-[20px] font-normal py-4 px-0 border border-solid border-[#888888]'>
            #
          </th>
          {/* LEMediumColumn */}
          <th className='w-[100px] font-normal py-4 px-0 border border-solid border-[#888888]'>
            Name
          </th>
        </thead>
        {expiredLicenses.map((row, index) => {
          return (
            <tbody key={index}>
              {/* LEInfoCell */}
              <td className='py-4 px-0 max-w-[100px] border border-solid border-[#888888]'>
                {index + 1}
              </td>
              <td className='py-4 px-0 max-w-[100px] border border-solid border-[#888888]'>
                {row.driver_name}
              </td>
            </tbody>
          );
        })}
      </table>
    </div>
  );
}

export default LicenseExpired;

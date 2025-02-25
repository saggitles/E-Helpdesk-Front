import React, { useState, useEffect } from 'react';

interface SeverityMeterProps {
  severity: number;
}

function SeverityMeter({ severity }: SeverityMeterProps) {
  const [severityLevel, setSeverityLevel] = useState(0);

  useEffect(() => {
    const calculateSeverity = () => {
      if (severity > 150) {
        setSeverityLevel(100);
      } else {
        setSeverityLevel((severity * 100) / 150);
      }
    };
    calculateSeverity();
  }, [severity]);

  return (
    <div className='relative w-[150px] flex items-center my-0 mx-4'>
      <p className='bg-[#334789] w-1/3 h-[16px]'></p>
      <p className='bg-[#ffec6a] w-1/3 h-[16px]'></p>
      <p className='bg-[#e51d23] w-1/3 h-[16px]'></p>
      <div
        className={`bg-black ${
          severity ? severityLevel + '%' : '0%'
        } h-1 absolute`}
      ></div>
    </div>
  );
}

export default SeverityMeter;

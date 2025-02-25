import React, { useEffect, useState } from 'react';
import { Box } from '@/components/generalComponents/';
import { getHomeSiteDetails } from '@/services/api';
import { getToken } from '@/utils';
import { useGenerateDetails } from '@/contexts';


export type GeneralDetailsType = {
  totalDrivers: number;
  expiredLicence: number;
  noLicenceDetails: number;
  driverNotActive: number;
  totalVehicles: number;
  vehNotActive: number;
  vehInUsed: number;
};

function SiteDetails() {
  const [generalDetails, setGeneralDetails] = useState<GeneralDetailsType>(
    {} as GeneralDetailsType
  );
  const [loading, setLoading] = useState(false);
  const [expand, setExpand] = useState(false);

  const { customer } = useGenerateDetails();

  const customerData = {
    customer: customer
  };
  
  useEffect(() => {
    const fetchData = async () => {
      try {
        const token = await getToken();
        if (token) {
          setLoading(true);
          const data = await getHomeSiteDetails(customerData); // Aquí se obtienen directamente los datos sin usar response.data
          setGeneralDetails(data);
          setLoading(false);
        }
      } catch (error) {
        console.log('Error fetching data:', error);
        setLoading(false);
      }
    };
  
    fetchData();
  }, [customerData]); 

  return (
    <Box
      title='Site Details'
      width='auto'
      expand={expand}
      displayExpand={true}
      setExpand={setExpand}
      loading={loading}
    >
      {expand === true && (
        // SDColumn
        <div className='flex flex-col m-8'>
          {/* SDDataSection */}
          <div className='flex items-start px-0 py-2'>
            {/* SDDataIdentifier */}
            <p className='min-w-[150px]'>Total Drivers:</p>
            {/* SDDataColumn */}
            <div className='flex flex-col items-start'>
              <p>{generalDetails.totalDrivers}</p>
              <p>{generalDetails.expiredLicence} with expired license</p>
              <p>
                {generalDetails.noLicenceDetails} without license details
              </p>
              <p>
                {generalDetails.driverNotActive} not active in the past
                week
              </p>
            </div>
          </div>
          {/* SDDataSection */}
          <div className='flex items-start px-0 py-2'>
            {/* SDDataIdentifier */}
            <p className='min-w-[150px]'>Total Vehicles:</p>
            {/* SDDataColumn */}
            <div className='flex flex-col items-start'>
              <p>{generalDetails.totalVehicles}</p>
              <p>
                {generalDetails.vehNotActive} inactive for over 72 hours
              </p>
              <p>{generalDetails.vehInUsed} used in last 24 hours</p>
            </div>
          </div>
        </div>
      )}
    </Box>
  );
}

export default SiteDetails;

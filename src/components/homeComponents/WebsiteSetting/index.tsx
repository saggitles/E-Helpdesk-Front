import React, { useState, useEffect } from 'react';
import axios, { AxiosResponse } from 'axios'; // Importar AxiosResponse desde axios
import { Box, Alert } from '@/components/generalComponents';
import {
  MasterCodes,
  DriversList,
  LicenseExpired,
  DriversBlackList,
} from './utilsModals';
import { EscalateType } from '@/components/generalComponents/alerts';
import { MasterCodesType } from './utilsModals/MasterCodes';
import { DriverListType } from './utilsModals/DriversList';
import { BlackListType } from './utilsModals/DriversBlacklist';
import { getAllDrivers, getBlacklist, getExpiredLicenses, getMasterCodes, getWebsiteSettings } from '@/services/api';
import { getToken } from '@/utils';



interface WebsiteSettingsProps {
  expand: boolean;
  setExpand: React.Dispatch<React.SetStateAction<boolean>>;
  equipmentID: string;
  customer: string;
}
import { useGenerateDetails } from '@/contexts';

type WebsiteSettingsType = {
  identifier: string;
  information: string;
};

function WebsiteSettings() {
  const { equipmentID } = useGenerateDetails();

  const [expand, setExpand] = useState(false);
  const [alert, setAlert] = useState(false);
  const [alertType, setAlertType] = useState<EscalateType>(
    '' as EscalateType
  );

  const [websiteSettings, setWebsiteSettings] = useState<
    WebsiteSettingsType[]
  >([]);
  const [masterCodes, setMasterCodes] = useState<MasterCodesType[]>([]);
  const [allDrivers, setAllDrivers] = useState<DriverListType[]>([]);
  const [blackList, setBlackList] = useState<BlackListType[]>([]);
  const [expiredLicenses, setExpiredLicenses] = useState<
    { driver_name: string }[]
  >([]);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    const fetchData = async () => {
      const token = await getToken(); // Obtener el token utilizando la función getToken
      if (token) {
        getWebsiteSettings(equipmentID)
        getMasterCodes(equipmentID)
        getBlacklist(equipmentID)
        getAllDrivers(equipmentID)
        getExpiredLicenses
      }
    };
    fetchData();
  }, [equipmentID]);

  (response: AxiosResponse<{ /* Define aquí el tipo de response.data */ }>) => {

  const utils = [
    {
      title: 'Master Codes',

      drivers: [
        masterCodes[0] && masterCodes[0].master_name,
        masterCodes[1] && masterCodes[1].master_name,
        masterCodes[2] && masterCodes[2].master_name,
      ],
    },
    {
      title: 'Drivers List',

      drivers: [
        allDrivers[0] && allDrivers[0].name,
        allDrivers[1] && allDrivers[1].name,
        allDrivers[2] && allDrivers[2].name,
      ],
    },
    {
      title: 'Drivers on Blacklist',

      drivers: [
        blackList[0] && blackList[0].driver_name,
        blackList[1] && blackList[1].driver_name,
        blackList[2] && blackList[2].driver_name,
      ],
    },
    {
      title: 'Drivers have license expired',

      drivers: [
        expiredLicenses[0] && expiredLicenses[0].driver_name,
        expiredLicenses[1] && expiredLicenses[1].driver_name,
        expiredLicenses[2] && expiredLicenses[2].driver_name,
      ],
    },
  ];

  const displayMoreInfo = (type: EscalateType) => {
    setAlertType(type);
    setAlert(true);
  };

  return (
    <>
      {alert && (
        <Alert type={alertType} setAlert={setAlert}>
          {alertType === 'Master Codes' ? (
            <MasterCodes masterCodes={masterCodes} />
          ) : alertType === 'Drivers List' ? (
            <DriversList allDrivers={allDrivers} />
          ) : alertType === 'Drivers on Blacklist' ? (
            <DriversBlackList blackList={blackList} />
          ) : (
            alertType === 'Drivers have license expired' && (
              <LicenseExpired expiredLicenses={expiredLicenses} />
            )
          )}
        </Alert>
      )}
      <Box
        title='Website Settings'
        width='50%'
        expand={expand}
        displayExpand={true}
        setExpand={setExpand}
        loading={loading}
      >
        {expand === true && (
          <>
            {/* WSColumn */}
            <div className='flex mx-8 my-4'>
              {/* WSDataSection */}
              <div className='flex flex-col items-start px-0 py-2'>
                {websiteSettings.map((detail, index) => {
                  return (
                    // WSDataDetails
                    <div className='flex' key={'WS' + index}>
                      {/* WSDataIdentifier */}
                      <p className='min-w-[250px] py-1 px-0'>
                        {detail.identifier}
                      </p>
                      <p className='min-w-[250px] py-1 px-0'>
                        {detail.information}
                      </p>
                    </div>
                  );
                })}
              </div>
            </div>
            {/* WSColumn */}
            <div className='flex mx-8 my-4'>
              {/* WSUtilsSection */}
              <div className='flex flex-col items-start justify-center px-0 py-2'>
                {utils.map((util, index) => {
                  return (
                    // WSDataDetails
                    <div className='flex' key={'WSUtils' + index}>
                      <div>
                        {/* WSDataIdentifier */}
                        <p className='min-w-[250px] py-1 px-0'>
                          {util.title}
                        </p>
                        <p className='min-w-[250px] py-1 px-0'>
                          {util.drivers[0]}
                          {util.drivers[1] && <>, {util.drivers[1]} </>}...
                        </p>
                      </div>

                      {/* WSShowMoreUtilsContainer */}
                      <span
                        className='self-center cursor-pointer'
                        onClick={(_) => {
                          displayMoreInfo(util.title as EscalateType);
                        }}
                      >
                        (<span className='text-[#89cff0]'>Show More</span>)
                      </span>
                    </div>
                  );
                })}
              </div>
            </div>
          </>
        )}
      </Box>
    </>
  );
}

}export default WebsiteSettings;

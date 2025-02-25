import React, { useState } from 'react';
import { Box } from '@/components/generalComponents';
import {
  EQUIPMENT_DETAILS_IDENTIFIERS,
  IDENTIFIERS_BOOLEAN_VALUES,
} from '@/constants';
import { useGenerateDetails } from '@/contexts';

type EquipmentInfoType = {
  gmtp_id: string;
  hire_no: string;
  serial_no: string;
  model: string;
  hire: boolean;
  special_use: boolean;
  vor: boolean;
  product_type: string;
  simcard_no: string;
  simcard_supplier: string;
  battery_id: string;
  modem_version: string;
  firmware_ver: string;
  exp_mod_ver: string;
  exp_mod_id: string;
};

function EquipmentDetails() {
  const [expand, setExpand] = useState(false);

  const equipmentDetails = EQUIPMENT_DETAILS_IDENTIFIERS.map((info) => {
    if (info.value === 'battery_state_of_charge') {
      return {
        identifier: info.identifier,
        information: '35%',
      };
    }
  
    if (IDENTIFIERS_BOOLEAN_VALUES.includes(info.value)) {
      const dynamicKey = info.value as keyof EquipmentInfoType;
      const value = (equipmentInfo[0] as any)?.[dynamicKey];
      return {
        identifier: info.identifier,
        information: value ? 'Yes' : 'No',
      };
    }
  
    const dynamicKey = info.value as keyof EquipmentInfoType;
    const value = (equipmentInfo[0] as any)?.[dynamicKey];
    return {
      identifier: info.identifier,
      information: value,
    };
  });
  

  const { equipmentInfo } = useGenerateDetails();

  return (
    <Box
      title='Equipment Details'
      width='50%'
      expand={expand}
      displayExpand={true}
      setExpand={setExpand}
    >
      {expand === true && (
        // EDColumn
        <div className='flex mx-8 my-4'>
          {/* EDDataSection */}
          <div className='flex flex-col items-start px-0 py-2'>
            {equipmentDetails.map((detail, index) => {
              return (
                // EDDataDetails
                <div className='flex' key={'ED' + index}>
                  {/* EDDataIdentifier */}
                  <p className='min-w-[250px] py-1 px-0'>
                    {detail.identifier}
                  </p>
                  {/* EDDataIdentifier */}
                  <p className='min-w-[250px] py-1 px-0'>
                    {detail.information}
                  </p>
                </div>
              );
            })}
          </div>
        </div>
      )}
    </Box>
  );
}

export default EquipmentDetails;

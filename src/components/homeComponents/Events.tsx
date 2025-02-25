import React, { useState, useEffect } from 'react';
import { Box, SeverityMeter } from '@/components/generalComponents';
import { useGenerateDetails } from '@/contexts';
import { getHomeEquipment } from '@/services/api';

export type CategoryType = {
  impacts: {
    impact_time: string;
    impact_value: number;
    severityLvl: number;
    driver_name: string;
    unlock_driver: string;
  }[];
  preop: {
    preopList: {
      question: string;
    }[];
    answered_time: string;
    duration: string;
    driver_name: string;
  }[];
  sessions: {
    startTime: string;
    endTime: string;
    duration: string;
    driver: string;
    seat: string;
    hydr: string;
    track: string;
  }[];
};

function Event() {
  const {
    eventCategories: categories,
    equipmentID,
    customer,
  } = useGenerateDetails();

  const [expand, setExpand] = useState(false);
  const [impacts, setImpacts] = useState<CategoryType['impacts']>([]);
  const [preops, setPreops] = useState<CategoryType['preop']>([]);
  const [sessions, setSessions] = useState<CategoryType['sessions']>([]);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    const setEventData = async () => {
      setLoading(true);

      const data = await getHomeEquipment(equipmentID, {
        customer,
      });

      if (data) {
        setImpacts(data.impact);
        setPreops(data.preop);
        setSessions(data.session);
        setLoading(false);
      }
    };
    setEventData();
  }, [categories, customer, equipmentID]);

  return (
    <Box
      title='Event'
      width='50%'
      expand={expand}
      displayExpand={true}
      setExpand={setExpand}
      loading={loading}
    >
      {expand === true && (
        <>
          {categories.impacts && (
            <>
              {/* EVColumn */}
              <div className='w-1/2'>
                {/* EVColumnTitle */}
                <p className='p-4'>Impacts</p>
                {/* EVImpactDataList */}
                <ul className='pl-12'>
                  {impacts.map((impact, index) => {
                    return (
                      // EVListContainer
                      <div className='mb-12' key={'EV' + index}>
                        <li>Time: {impact.impact_time}</li>
                        <li>Impact value: {impact.impact_value}</li>
                        <li>Impact Level: {impact.severityLvl}</li>
                        <div style={{ display: 'flex' }}>
                          <li>Severity Level: </li>
                          <SeverityMeter severity={impact.severityLvl} />
                        </div>
                        <li>Driver: {impact.driver_name}</li>
                        <li>Unlock Driver: {impact.unlock_driver}</li>
                        <li>Unlock time: {impact.unlock_driver}</li>
                      </div>
                    );
                  })}
                </ul>
              </div>
            </>
          )}
          {categories.preop && (
            <>
              {/* EVColumn */}
              <div className='w-1/2'>
                {/* EVColumnTitle */}
                <p className='p-4'>Preop Checks</p>
                {/* EVImpactDataList */}
                <ul className='pl-12'>
                  {preops.map((preop, index) => {
                    return (
                      // EVListContainer
                      <div className='mb-12' key={'EV' + index}>
                        <li>
                          Critical Failed Questions:{' '}
                          {preop.preopList[0] &&
                            preop.preopList[0].question}
                        </li>
                        <li>Time: {preop.answered_time}</li>
                        <li>Duration: {preop.duration}</li>
                        <li>Driver: {preop.driver_name}</li>
                        <li>Unlock Supervisor: --</li>
                        <li>Unlock Time: --</li>
                      </div>
                    );
                  })}
                </ul>
              </div>
            </>
          )}
          {categories.sessions && (
            <>
              {/* EVColumn */}
              <div className='w-1/2'>
                {/* EVColumnTitle */}
                <p className='p-4'>Sessions</p>
                {/* EVImpactDataList */}
                <ul className='pl-12'>
                  {sessions.map((session, index) => {
                    return (
                      // EVListContainer
                      <div className='mb-12' key={'EV' + index}>
                        <li>Start: {session.startTime}</li>
                        <li>End: {session.endTime}</li>
                        <li>During: {session.duration}</li>
                        <li>Driver: {session.driver}</li>
                        <li>Seal: {session.seat}</li>
                        <li>Hydraulic: {session.hydr}</li>
                        <li>Tracking: {session.track}</li>
                      </div>
                    );
                  })}
                </ul>
              </div>
            </>
          )}
        </>
      )}
    </Box>
  );
}

export default Event;

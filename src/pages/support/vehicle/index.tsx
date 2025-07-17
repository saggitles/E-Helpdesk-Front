'use client';

import Navsearch from '@/generic_comp/navsearch';
import React, { useState, useEffect, useRef } from 'react';
// @ts-ignore
import DatePicker from 'react-datepicker';
import 'react-datepicker/dist/react-datepicker.css';
import { format } from 'date-fns';
import Image from 'next/image';

// Define interfaces for your data types
interface VehicleInfo {
  preop_schedule: string;
  vehicle_name: string;
  serial_number: string;
  department: string;
  screen_version: string;
  expansion_version: string;
  firmware_version: string;
  last_connection: string;
  vor_setting: boolean;
  lockout_code: string;
  d_list: string;
  checklist: string;
  lo_reason: string;
  m_list: string;
  checklist_schedule: string;
  impact_lockout: string;
  red_impact_threshold: number;
  impact_recalibration_date: string;
  seat_idle: number;
  survey_timeout: number;
  can_rules_loaded?: boolean;
  vehicle_model: string;
  sim_number: number;
  status: string;
  gmpt_code: string;
  full_lockout_enabled: boolean;
  full_lockout_timeout: number;
  customer_name: string;
  site_name: string;
  has_wifi: boolean;
  last_dlist_timestamp: string;
  last_preop_timestamp: string;
  last_driver_logins: string;
  message_sent: string;
  idle_polarity: string;
}

interface MasterCode {
  master_code_user: string;
  master_code: string;
}

interface BlacklistedDriver {
  driver_name: string;
  driver_id: string;
  card_id: string;
}

interface VehicleLogin {
  driver_name: string;
  driver_id: string;
  login_time: string;
  facility_code: string | null;
  accepted: boolean;
}

interface LastDriverLogin {
  driver_name: string;
  driver_id: string;
  login_time: string;
  accepted: boolean;
}

interface MessageSent {
  message_text: string;
  message_timestamp: string;
  status: string;
  message_type: string;
}

interface Vehicle {
  VEHICLE_CD: string | number;
  vehicle_info: VehicleInfo;
  master_codes: MasterCode[];
  blacklisted_drivers: BlacklistedDriver[];
  status?: string;
}

interface PopupState {
  masterCodes: boolean;
  driverList: boolean;
  blacklistDrivers: boolean;
  expiredLicenses: boolean;
  vehicleLogins: boolean;
  lastDriverLogins: boolean;
  messagesSent: boolean;
}

interface SnapshotRow {
  vehicleName: string;
  serialNumber: string;
  gmptCode: string;
  firmwareVersion: string | null;
  screenVersion: string | null;
  expansionVersion: string | null;
  lastConnection: string | null;
  vorSetting: string | null;
  lockoutCode: string | null;
  impactLockout: string | null;
  redImpactThreshold: number | null;
  seatIdle: string | null;
  surveyTimeout: string | null;
  vehicleModel: string | null;
  simNumber: string | null;
  status: string | null;
  loReason: string | null;
  fullLockoutEnabled?: boolean;
  fullLockoutTimeout?: number;
  query_execution_date?: string;
  snapshot_date?: string; // Add snapshot_date field
  impactRecalibrationDate: string | null;
  preopSchedule: string | null;
  vehicleType: string | null;
  dept_id: number;
  site_id: number;
  cust_id: number;
  customer_name?: string;
  site_name?: string;
  dept_name?: string; // Add department name field
  snapshot_id: number;
  vehicle_cd: number;
  snapshot_time: string | null;
  hasWifi: boolean;
  lastDlistTimestamp: string | null;
  lastPreopTimestamp: string | null;
}

interface GroupedSnapshots {
  [vehicleCd: string]: {
    before: SnapshotRow;
    after: SnapshotRow;
  };
}

const LoadingOverlay: React.FC<{ message: string }> = ({ message }) => {
  return (
    <div className='fixed inset-0 bg-gray-800 bg-opacity-75 flex items-center justify-center z-50'>
      <div className='bg-white p-8 rounded-lg shadow-xl text-center'>
        <div className='animate-spin mb-4 mx-auto w-16 h-16 border-t-4 border-b-4 border-teal-500 rounded-full'></div>
        <p className='text-xl font-semibold text-gray-700'>{message}</p>
        <p className='text-gray-500 mt-2'>This may take a few moments</p>
      </div>
    </div>
  );
};

const VehicleDashboard: React.FC = () => {
  const [isLoading, setIsLoading] = useState(false);
  const [messagesSentByVehicle, setMessagesSentByVehicle] = useState<
    Record<string | number, MessageSent[]>
  >({});
  const [lastDriverLoginsByVehicle, setLastDriverLoginsByVehicle] =
    useState<Record<string | number, LastDriverLogin[]>>({});
  const [vehicleLoginsByVehicle, setVehicleLoginsByVehicle] = useState<
    Record<string | number, VehicleLogin[]>
  >({});
  const [vehicleStatusByVehicle, setVehicleStatusByVehicle] = useState<
    Record<string | number, { status: string; latest_status_time: string }>
  >({});
  const [vehicles, setVehicles] = useState<Vehicle[]>([]);
  const [masterCodesByVehicle, setMasterCodesByVehicle] = useState<{
    [key: string]: MasterCode[];
  }>({});
  const [blacklistedDriversByVehicle, setBlacklistedDriversByVehicle] =
    useState<{ [key: string]: BlacklistedDriver[] }>({});
  const [loadingStates, setLoadingStates] = useState<{
    vehicles: boolean;
    masterCodes: boolean;
    blacklistedDrivers: boolean;
    vehicleLogins: boolean;
    lastDriverLogins: boolean;
    MessageSent: boolean;
    vehicleStatus: boolean;
  }>({
    vehicles: false,
    masterCodes: false,
    blacklistedDrivers: false,
    vehicleLogins: false,
    lastDriverLogins: false,
    MessageSent: false,
    vehicleStatus: false,
  });

  const popupRef = useRef<HTMLDivElement>(null);
  const [dates, setDates] = useState<Date[]>([]);
  const [selectedFirstDate, setSelectedFirstDate] = useState<Date | null>(
    null
  );
  const [selectedFirstTime, setSelectedFirstTime] = useState<
    string | null
  >(null);
  const [availableTimes1, setAvailableTimes1] = useState<
    { time: string; ID: number }[]
  >([]);
  const [availableTimes2, setAvailableTimes2] = useState<
    { time: string; ID: number }[]
  >([]);
  const [selectedSecondDate, setSelectedSecondDate] =
    useState<Date | null>(null);
  const [selectedSecondTime, setSelectedSecondTime] = useState<
    string | null
  >(null);
  const [snapshotData, setSnapshotData] = useState<GroupedSnapshots>({});
  const [loadingVehicles, setLoadingVehicles] = useState<boolean>(false);
  const [loadingSnapshots, setLoadingSnapshots] = useState<boolean>(false);

  const [showPopup, setShowPopup] = useState<PopupState>({
    masterCodes: false,
    driverList: false,
    blacklistDrivers: false,
    expiredLicenses: false,
    vehicleLogins: false,
    lastDriverLogins: false,
    messagesSent: false,
  });
  const [activeVehicleId, setActiveVehicleId] = useState<
    string | number | null
  >(null);

  const fetchVehicles = async () => {
    setVehicles([]);
    setMasterCodesByVehicle({});
    setBlacklistedDriversByVehicle({});
    setSnapshotData({});
    setLoadingStates((prev) => ({ ...prev, vehicles: true }));
    setLoadingVehicles(true);

    const customer = localStorage.getItem('selectedCustomer');
    const site = localStorage.getItem('selectedSite');
    const gmptCode = localStorage.getItem('selectedGmpt');

    // Allow search if either customer is provided OR GMPT code is provided
    if (!customer && !gmptCode) {
      console.warn('Either Customer or GMPT Code is required for search.');
      setLoadingVehicles(false);
      setLoadingStates((prev) => ({ ...prev, vehicles: false }));
      return;
    }

    const queryParams = new URLSearchParams();
    if (customer) queryParams.append('customer', customer.toString());
    if (site && site !== '') queryParams.append('site', site.toString());
    if (gmptCode && gmptCode !== '')
      queryParams.append('gmptCode', gmptCode.toString());

    try {
      const response = await fetch(
        `${process.env.NEXT_PUBLIC_API_URL}/api/vehicles?${queryParams}`
      );

      if (!response.ok) {
        throw new Error(`HTTP error! Status: ${response.status}`);
      }

      const vehicleData = await response.json();
      if (Array.isArray(vehicleData)) {
        setVehicles(vehicleData);
        const vehicleCDs = vehicleData.map((v) => v.VEHICLE_CD);
        fetchMasterCodes(vehicleCDs);
        fetchBlacklistedDrivers(vehicleCDs);
        fetchVehicleLogins(vehicleCDs);
        fetchLastDriverLogins(vehicleCDs);
        fetchMessagesSent(vehicleCDs);
        fetchVehicleStatus(vehicleCDs);
      }
    } catch (error) {
      console.error('Error fetching vehicles:', error);
    } finally {
      setLoadingStates((prev) => ({ ...prev, vehicles: false }));
      setLoadingVehicles(false);
    }
  };

  const fetchVehicleStatus = async (vehicleIds: (string | number)[]) => {
    if (!vehicleIds.length) return;
    setLoadingStates((prev) => ({ ...prev, vehicleStatus: true }));

    try {
      const response = await fetch(
        `${process.env.NEXT_PUBLIC_API_URL}/api/vehicle-status`,
        {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ vehicleCDs: vehicleIds }),
        }
      );

      if (!response.ok) {
        throw new Error(`API error: ${response.status}`);
      }

      const statusData = await response.json();
      setVehicleStatusByVehicle(statusData);

      setVehicles((prevVehicles) =>
        prevVehicles.map((vehicle) => {
          const vehicleId = vehicle.VEHICLE_CD;
          if (statusData[vehicleId]) {
            return {
              ...vehicle,
              vehicle_info: {
                ...vehicle.vehicle_info,
                status: statusData[vehicleId].status,
                latest_status_time:
                  statusData[vehicleId].latest_status_time,
              },
            };
          }
          return vehicle;
        })
      );
    } catch (error) {
      console.error('Error fetching vehicle status:', error);
    } finally {
      setLoadingStates((prev) => ({ ...prev, vehicleStatus: false }));
    }
  };

  const fetchMasterCodes = async (vehicleIds: (string | number)[]) => {
    if (!vehicleIds.length) return;
    setLoadingStates((prev) => ({ ...prev, masterCodes: true }));

    try {
      const response = await fetch(
        `${process.env.NEXT_PUBLIC_API_URL}/api/master-codes`,
        {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ vehicleCDs: vehicleIds }),
        }
      );

      if (!response.ok) {
        throw new Error(`API error: ${response.status}`);
      }

      const masterCodesData = await response.json();
      setMasterCodesByVehicle(masterCodesData);
    } catch (error) {
      console.error('Error fetching master codes:', error);
      const fallbackData = vehicleIds.reduce((acc, id) => {
        acc[id] = [];
        return acc;
      }, {} as Record<string | number, MasterCode[]>);
      setMasterCodesByVehicle(fallbackData);
    } finally {
      setLoadingStates((prev) => ({ ...prev, masterCodes: false }));
    }
  };

  const fetchBlacklistedDrivers = async (
    vehicleIds: (string | number)[]
  ) => {
    if (!vehicleIds.length) return;
    setLoadingStates((prev) => ({ ...prev, blacklistedDrivers: true }));

    try {
      const response = await fetch(
        `${process.env.NEXT_PUBLIC_API_URL}/api/blacklisted-drivers`,
        {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ vehicleCDs: vehicleIds }),
        }
      );

      if (!response.ok) {
        throw new Error(`API error: ${response.status}`);
      }

      const blacklistedDriversData = await response.json();
      setBlacklistedDriversByVehicle(blacklistedDriversData);
    } catch (error) {
      console.error('Error fetching blacklisted drivers:', error);
      const fallbackData = vehicleIds.reduce((acc, id) => {
        acc[id] = [];
        return acc;
      }, {} as Record<string | number, BlacklistedDriver[]>);
      setBlacklistedDriversByVehicle(fallbackData);
    } finally {
      setLoadingStates((prev) => ({ ...prev, blacklistedDrivers: false }));
    }
  };

  const fetchVehicleLogins = async (vehicleIds: (string | number)[]) => {
    if (!vehicleIds.length) return;
    setLoadingStates((prev) => ({ ...prev, vehicleLogins: true }));

    try {
      const response = await fetch(
        `${process.env.NEXT_PUBLIC_API_URL}/api/vehicle-logins`,
        {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ vehicleCDs: vehicleIds }),
        }
      );

      if (!response.ok) {
        throw new Error(`API error: ${response.status}`);
      }

      const vehicleLoginsData = await response.json();
      const processedData: Record<string | number, VehicleLogin[]> = {};
      vehicleIds.forEach((id) => {
        processedData[id] = vehicleLoginsData[id] || [];
      });
      setVehicleLoginsByVehicle(processedData);
    } catch (error) {
      console.error('Error fetching vehicle logins:', error);
      const fallbackData = vehicleIds.reduce((acc, id) => {
        acc[id] = [];
        return acc;
      }, {} as Record<string | number, VehicleLogin[]>);
      setVehicleLoginsByVehicle(fallbackData);
    } finally {
      setLoadingStates((prev) => ({ ...prev, vehicleLogins: false }));
    }
  };

  const fetchLastDriverLogins = async (
    vehicleIds: (string | number)[]
  ) => {
    if (!vehicleIds.length) return;
    setLoadingStates((prev) => ({ ...prev, lastDriverLogins: true }));

    try {
      const fallbackData = vehicleIds.reduce((acc, id) => {
        acc[id] = [];
        return acc;
      }, {} as Record<string | number, LastDriverLogin[]>);

      try {
        const response = await fetch(
          `${process.env.NEXT_PUBLIC_API_URL}/api/last-driver-logins`,
          {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ vehicleCDs: vehicleIds }),
          }
        );

        if (!response.ok) {
          setLastDriverLoginsByVehicle(fallbackData);
          return;
        }

        const lastDriverLoginsData = await response.json();
        setLastDriverLoginsByVehicle(lastDriverLoginsData);
      } catch (error) {
        console.error('Error fetching last driver logins:', error);
        setLastDriverLoginsByVehicle(fallbackData);
      }
    } finally {
      setLoadingStates((prev) => ({ ...prev, lastDriverLogins: false }));
    }
  };

  const fetchMessagesSent = async (vehicleIds: (string | number)[]) => {
    if (!vehicleIds.length) return;
    setLoadingStates((prev) => ({ ...prev, messagesSent: true }));

    try {
      const response = await fetch(
        `${process.env.NEXT_PUBLIC_API_URL}/api/messages-sent`,
        {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ vehicleCDs: vehicleIds }),
        }
      );

      if (!response.ok) {
        throw new Error(`API error: ${response.status}`);
      }

      const messagesSentData = await response.json();
      setMessagesSentByVehicle(messagesSentData);
    } catch (error) {
      console.error('Error fetching messages sent:', error);
      const fallbackData = vehicleIds.reduce((acc, id) => {
        acc[id] = [];
        return acc;
      }, {} as Record<string | number, MessageSent[]>);
      setMessagesSentByVehicle(fallbackData);
    } finally {
      setLoadingStates((prev) => ({ ...prev, messagesSent: false }));
    }
  };

  const fetchDates = async () => {
    try {
      const response = await fetch(
        `${process.env.NEXT_PUBLIC_API_URL}/api/available-dates`
      );
      const data = await response.json();

      if (Array.isArray(data)) {
        const formattedDates = data.map((d: string) => new Date(d));
        setDates(formattedDates);
      } else if (data && typeof data === 'object') {
        if (Array.isArray(data.dates)) {
          const formattedDates = data.dates.map(
            (d: string) => new Date(d)
          );
          setDates(formattedDates);
        } else if (Array.isArray(data.data)) {
          const formattedDates = data.data.map((d: string) => new Date(d));
          setDates(formattedDates);
        }
      }
    } catch (error) {
      console.error('Error fetching dates:', error);
      setDates([]);
    }
  };

  const fetchTimes = async (formattedDate: string) => {
    try {
      const response = await fetch(
        `${process.env.NEXT_PUBLIC_API_URL}/api/available-times?date=${formattedDate}`
      );
      const data = await response.json();
      setAvailableTimes1(Array.isArray(data) ? data : []);
    } catch (error) {
      console.error('Error fetching first times:', error);
      setAvailableTimes1([]);
    }
  };

  const fetchSecondTimes = async (formattedDate: string) => {
    try {
      const response = await fetch(
        `${process.env.NEXT_PUBLIC_API_URL}/api/available-times?date=${formattedDate}`
      );
      const data = await response.json();
      setAvailableTimes2(Array.isArray(data) ? data : []);
    } catch (error) {
      console.error('Error fetching second times:', error);
      setAvailableTimes2([]);
    }
  };

  const fetchSnapshots = async () => {
    setLoadingSnapshots(true);

    if (!selectedFirstTime || !selectedSecondTime) {
      console.error('Missing snapshot times');
      return;
    }

    const customer = localStorage.getItem('selectedCustomer');
    const site = localStorage.getItem('selectedSite');
    const gmptCode = localStorage.getItem('selectedGmpt');

    const url = new URL(
      `${process.env.NEXT_PUBLIC_API_URL}/api/snapshots`
    );
    url.searchParams.append('time1', selectedFirstTime);
    url.searchParams.append('time2', selectedSecondTime);
    url.searchParams.append(
      'date1',
      selectedFirstDate
        ? selectedFirstDate.toISOString().split('T')[0]
        : ''
    );
    url.searchParams.append(
      'date2',
      selectedSecondDate
        ? selectedSecondDate.toISOString().split('T')[0]
        : ''
    );
    url.searchParams.append('customer', customer ?? '');
    if (site) url.searchParams.append('site', site);
    if (gmptCode) url.searchParams.append('gmptCode', gmptCode);

    try {
      const response = await fetch(url.toString());
      if (!response.ok) throw new Error('Failed to fetch snapshots');
      const data = await response.json();
      setSnapshotData(data);
    } catch (error) {
      console.error('Failed to fetch snapshots:', error);
    } finally {
      setTimeout(() => {
        setLoadingSnapshots(false);
      }, 500);
    }
  };

  const clearDateFilters = () => {
    setSelectedFirstDate(null);
    setSelectedSecondDate(null);
    setSelectedFirstTime(null);
    setSelectedSecondTime(null);
    setAvailableTimes1([]);
    setAvailableTimes2([]);
    setSnapshotData({});
  };

  const handleFirstTimeSelect = (
    e: React.ChangeEvent<HTMLSelectElement>
  ) => {
    const selected = availableTimes1.find(
      (t) => t.time === e.target.value
    );
    setSelectedFirstTime(selected?.time || '');
  };

  const handleSecondTimeSelect = (
    e: React.ChangeEvent<HTMLSelectElement>
  ) => {
    const selected = availableTimes2.find(
      (t) => t.time === e.target.value
    );
    setSelectedSecondTime(selected?.time || '');
  };

  const togglePopup = (
    key: keyof PopupState,
    vehicleId: string | number | null = null
  ) => {
    const newPopupState = {
      masterCodes: false,
      driverList: false,
      blacklistDrivers: false,
      expiredLicenses: false,
      vehicleLogins: false,
      lastDriverLogins: false,
      messagesSent: false,
    };

    newPopupState[key] = !showPopup[key];
    setShowPopup(newPopupState);

    if (newPopupState[key] && vehicleId) {
      setActiveVehicleId(vehicleId);
    }
  };

  // Helper function to get vehicle name and GMPT code for popup titles
  const getVehicleDisplayName = (
    vehicleId: string | number | null
  ): string => {
    if (!vehicleId) return 'Unknown Vehicle';

    const vehicle = vehicles.find((v) => v.VEHICLE_CD === vehicleId);
    if (vehicle) {
      return `${vehicle.vehicle_info.vehicle_name} (${vehicle.vehicle_info.gmpt_code})`;
    }
    return `Vehicle ${vehicleId}`;
  };

  const isOlderThanTwoWeeks = (
    dateString: string | null | undefined
  ): boolean => {
    if (!dateString) return false;

    let date: Date;
    if (dateString.includes('/')) {
      const [datePart, timePart] = dateString.split(' ');
      const [day, month, year] = datePart.split('/').map(Number);
      const [hours, minutes] = timePart
        ? timePart.split(':').map(Number)
        : [0, 0];
      date = new Date(year, month - 1, day, hours, minutes);
    } else {
      date = new Date(dateString);
    }

    if (isNaN(date.getTime())) return false;

    const twoWeeksAgo = new Date();
    twoWeeksAgo.setDate(twoWeeksAgo.getDate() - 14);
    return date < twoWeeksAgo;
  };

  const getLastConnectionColor = (
    dateString: string | null | undefined
  ): string => {
    if (!dateString) return 'text-gray-600';

    let date: Date;
    if (dateString.includes('/')) {
      const [datePart, timePart] = dateString.split(' ');
      const [day, month, year] = datePart.split('/').map(Number);
      const [hours, minutes] = timePart
        ? timePart.split(':').map(Number)
        : [0, 0];
      date = new Date(year, month - 1, day, hours, minutes);
    } else {
      date = new Date(dateString);
    }

    if (isNaN(date.getTime())) return 'text-gray-600';

    const now = new Date();
    const diffTime = now.getTime() - date.getTime();
    const diffDays = diffTime / (1000 * 60 * 60 * 24);

    if (diffDays > 14) return 'text-red-600 font-semibold';
    if (diffDays > 3) return 'text-amber-500 font-semibold';
    return 'text-gray-600';
  };

  useEffect(() => {
    const anyLoading = Object.values(loadingStates).some(
      (state) => state === true
    );

    if (!anyLoading) {
      const timer = setTimeout(() => {
        setIsLoading(false);
      }, 800);
      return () => clearTimeout(timer);
    } else {
      setIsLoading(true);
    }
  }, [loadingStates]);

  useEffect(() => {
    function handleClickOutside(event: MouseEvent) {
      if (
        popupRef.current &&
        !popupRef.current.contains(event.target as Node)
      ) {
        setShowPopup({
          masterCodes: false,
          driverList: false,
          blacklistDrivers: false,
          expiredLicenses: false,
          vehicleLogins: false,
          lastDriverLogins: false,
          messagesSent: false,
        });
      }
    }

    if (Object.values(showPopup).some((isOpen) => isOpen)) {
      document.addEventListener('mousedown', handleClickOutside);
    }

    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
    };
  }, [showPopup]);

  useEffect(() => {
    if (selectedFirstDate) {
      const formattedDate = format(selectedFirstDate, 'yyyy-MM-dd');
      fetchTimes(formattedDate);
    }
  }, [selectedFirstDate]);

  useEffect(() => {
    if (selectedSecondDate) {
      const formattedDate = format(selectedSecondDate, 'yyyy-MM-dd');
      fetchSecondTimes(formattedDate);
    }
  }, [selectedSecondDate]);

  const fetchDatesAndVehicles = async () => {
    await fetchDates();

    // Initial fetch when component mounts
    const customer = localStorage.getItem('selectedCustomer');
    if (customer) {
      fetchVehicles();
    }
  };

  // Fetch vehicles when the component loads or when localStorage changes
  useEffect(() => {
    // Only fetch dates on initial load, no automatic vehicle fetching
    fetchDates();

    // Remove all automatic localStorage listening and auto-fetching
    // Data will only be fetched when user clicks Search or Refresh buttons
  }, []);

  return (
    <div>
      <Navsearch onFilterChange={fetchVehicles} />
      {loadingVehicles && <LoadingOverlay message='Loading vehicles...' />}
      {loadingSnapshots && (
        <LoadingOverlay message='Loading snapshots...' />
      )}

      <div className='bg-gray-100 min-h-screen p-8'>
        <h1 className='text-4xl font-bold text-gray-800 text-center py-5'>
          Vehicle Diagnostics Dashboard
        </h1>

        {/* Date & Time Filters */}
        <div className='flex justify-between items-center mb-6'>
          <div className='shadow-lg rounded-lg p-6 border border-gray-300 bg-white'>
            <h3 className='text-2xl font-bold text-gray-800 px-4 py-2 text-center'>
              Compare vehicles at 2 points in time
            </h3>
            <hr className='border-gray-300 mb-4' />

            <div className='grid grid-cols-3 gap-4 items-center'>
              {/* First Date & Time */}
              <div>
                <label className='block text-base font-medium text-gray-700 mb-1'>
                  First Date
                </label>
                <DatePicker
                  selected={selectedFirstDate}
                  onChange={(date: Date) => setSelectedFirstDate(date)}
                  includeDates={dates}
                  dateFormat='MM/dd/yyyy'
                  className='border border-gray-300 rounded-md px-2 py-1 text-black w-full'
                />
                <label className='block text-base font-medium text-gray-700 mt-2 mb-1'>
                  First Time
                </label>
                <select
                  onChange={handleFirstTimeSelect}
                  value={selectedFirstTime || ''}
                  className='border border-gray-300 rounded-md px-2 py-1 text-black w-full'
                >
                  <option value=''>Select a time</option>
                  {availableTimes1.map(({ time, ID }) => (
                    <option key={ID} value={time}>
                      {time}
                    </option>
                  ))}
                </select>
              </div>

              {/* Second Date & Time */}
              <div>
                <label className='block text-base font-medium text-gray-700 mb-1'>
                  Second Date
                </label>
                <DatePicker
                  selected={selectedSecondDate}
                  onChange={(date: Date) => setSelectedSecondDate(date)}
                  includeDates={
                    selectedFirstDate
                      ? dates.filter(
                          (d) => d.getTime() > selectedFirstDate.getTime()
                        )
                      : dates
                  }
                  dateFormat='MM/dd/yyyy'
                  className='border border-gray-300 rounded-md px-2 py-1 text-black w-full'
                />
                <label className='block text-base font-medium text-gray-700 mt-2 mb-1'>
                  Second Time
                </label>
                <select
                  onChange={handleSecondTimeSelect}
                  value={selectedSecondTime || ''}
                  className='border border-gray-300 rounded-md px-2 py-1 text-black w-full'
                >
                  <option value=''>Select a time</option>
                  {availableTimes2.map(({ time, ID }) => (
                    <option key={ID} value={time}>
                      {time}
                    </option>
                  ))}
                </select>
              </div>

              <div className='flex flex-col items-center justify-center gap-2'>
                <button
                  className='bg-blue-600 text-white px-4 py-2 rounded-md hover:bg-blue-700 transition w-full'
                  onClick={fetchSnapshots}
                  disabled={!selectedFirstTime || !selectedSecondTime}
                >
                  Fetch Vehicle Snapshots
                </button>
                <button
                  className='text-blue-600 hover:text-blue-800 px-4 py-2 border border-blue-300 rounded-md hover:bg-blue-50 transition w-full'
                  onClick={clearDateFilters}
                  disabled={!selectedFirstDate && !selectedSecondDate}
                >
                  Clear Dates
                </button>
              </div>
            </div>
          </div>

          {/* Color Legend */}
          <div className='shadow-lg rounded-lg p-6 border border-gray-300 bg-white w-1/3'>
            <h3 className='text-2xl font-bold text-gray-800 mb-3 text-center'>
              Color Legend
            </h3>
            <hr className='border-gray-300 mb-4' />
            <div className='space-y-3'>
              <div className='flex items-center'>
                <div className='w-6 h-6 bg-yellow-300 mr-3'></div>
                <span className='text-gray-700'>
                  Changed values between snapshots
                </span>
              </div>
              <div className='flex items-center'>
                <div className='w-6 h-6 bg-green-100 mr-3'></div>
                <span className='text-gray-700'>
                  Enabled / On / Authorized status
                </span>
              </div>
              <div className='flex items-center'>
                <div className='w-6 h-6 bg-red-100 mr-3'></div>
                <span className='text-gray-700'>
                  Disabled / Off / Unauthorized status
                </span>
              </div>
            </div>
          </div>
        </div>

        {/* Vehicle Status Summary */}
        {Object.keys(snapshotData).length === 0 && (
          <div className='mb-6'>
            <div className='bg-white shadow-lg rounded-lg p-6 border border-gray-200'>
              <h2 className='text-xl font-bold text-gray-800 mb-4'>
                Vehicle Status Summary
              </h2>
              <div className='grid grid-cols-5 gap-4'>
                <div className='bg-blue-50 p-4 rounded-lg border border-blue-200'>
                  <p className='text-4xl font-bold text-blue-600'>
                    {vehicles.length}
                  </p>
                  <p className='text-sm text-gray-600 mt-1'>
                    Total Vehicles
                  </p>
                </div>
                <div className='bg-green-50 p-4 rounded-lg border border-green-200'>
                  {loadingStates.vehicleStatus ? (
                    <div className='flex items-center'>
                      <div className='animate-pulse flex space-x-1'>
                        <div className='h-8 w-8 bg-green-200 rounded-full'></div>
                        <div className='h-8 w-8 bg-green-200 rounded-full'></div>
                      </div>
                      <p className='text-sm text-gray-500 ml-2'>
                        Loading...
                      </p>
                    </div>
                  ) : (
                    <p className='text-4xl font-bold text-green-600'>
                      {
                        vehicles.filter(
                          (v) => v.vehicle_info.status === 'online'
                        ).length
                      }
                    </p>
                  )}
                  <p className='text-sm text-gray-600 mt-1'>
                    Online Vehicles
                  </p>
                </div>
                <div className='bg-gray-50 p-4 rounded-lg border border-gray-200'>
                  {loadingStates.vehicleStatus ? (
                    <div className='flex items-center'>
                      <div className='animate-pulse flex space-x-1'>
                        <div className='h-8 w-8 bg-gray-200 rounded-full'></div>
                        <div className='h-8 w-8 bg-gray-200 rounded-full'></div>
                      </div>
                      <p className='text-sm text-gray-500 ml-2'>
                        Loading...
                      </p>
                    </div>
                  ) : (
                    <p className='text-4xl font-bold text-gray-600'>
                      {
                        vehicles.filter(
                          (v) => v.vehicle_info.status === 'offline'
                        ).length
                      }
                    </p>
                  )}
                  <p className='text-sm text-gray-600 mt-1'>
                    Currently Offline
                  </p>
                </div>
                <div className='bg-orange-50 p-4 rounded-lg border border-orange-200'>
                  <p className='text-4xl font-bold text-orange-600'>
                    {
                      vehicles.filter((v) => {
                        if (!v.vehicle_info.last_connection) return false;
                        const threeDaysAgo = new Date();
                        threeDaysAgo.setDate(threeDaysAgo.getDate() - 3);
                        return (
                          new Date(v.vehicle_info.last_connection) <
                          threeDaysAgo
                        );
                      }).length
                    }
                  </p>
                  <p className='text-sm text-gray-600 mt-1'>
                    Offline &gt; 3 Days
                  </p>
                </div>
                <div className='bg-red-50 p-4 rounded-lg border border-red-200'>
                  <p className='text-4xl font-bold text-red-600'>
                    {
                      vehicles.filter((v) => {
                        if (!v.vehicle_info.last_connection) return false;
                        const twoWeeksAgo = new Date();
                        twoWeeksAgo.setDate(twoWeeksAgo.getDate() - 14);
                        return (
                          new Date(v.vehicle_info.last_connection) <
                          twoWeeksAgo
                        );
                      }).length
                    }
                  </p>
                  <p className='text-sm text-gray-600 mt-1'>
                    Offline &gt; 2 Weeks
                  </p>
                </div>
              </div>
            </div>
          </div>
        )}

        {/* Vehicle Cards or Snapshot Comparison */}
        {Object.keys(snapshotData).length === 0 ? (
          <div className='grid grid-cols-3 gap-6'>
            {/* Loading Status Panel */}
            {vehicles.length > 0 && isLoading && (
              <div className='fixed bottom-4 right-4 bg-white shadow-lg rounded-lg p-4 z-50 border border-gray-200'>
                <h4 className='font-semibold mb-2 text-gray-700'>
                  Loading Status
                </h4>
                <ul className='text-sm space-y-2'>
                  <li className='flex items-center'>
                    <span
                      className={
                        loadingStates.vehicles
                          ? 'text-red-500'
                          : 'text-green-500'
                      }
                    >
                      {loadingStates.vehicles ? 'Loading' : 'Loaded'}{' '}
                      Vehicles
                    </span>
                    {loadingStates.vehicles && (
                      <span className='ml-2 inline-block w-3 h-3 border-2 border-t-red-500 border-r-transparent border-b-transparent border-l-transparent rounded-full animate-spin'></span>
                    )}
                  </li>
                  <li className='flex items-center'>
                    <span
                      className={
                        loadingStates.vehicleStatus
                          ? 'text-red-500'
                          : 'text-green-500'
                      }
                    >
                      {loadingStates.vehicleStatus ? 'Loading' : 'Loaded'}{' '}
                      Vehicle Status
                    </span>
                    {loadingStates.vehicleStatus && (
                      <span className='ml-2 inline-block w-3 h-3 border-2 border-t-red-500 border-r-transparent border-b-transparent border-l-transparent rounded-full animate-spin'></span>
                    )}
                  </li>
                  <li className='flex items-center'>
                    <span
                      className={
                        loadingStates.masterCodes
                          ? 'text-red-500'
                          : 'text-green-500'
                      }
                    >
                      {loadingStates.masterCodes ? 'Loading' : 'Loaded'}{' '}
                      Master Codes
                    </span>
                    {loadingStates.masterCodes && (
                      <span className='ml-2 inline-block w-3 h-3 border-2 border-t-red-500 border-r-transparent border-b-transparent border-l-transparent rounded-full animate-spin'></span>
                    )}
                  </li>
                  <li className='flex items-center'>
                    <span
                      className={
                        loadingStates.blacklistedDrivers
                          ? 'text-red-500'
                          : 'text-green-500'
                      }
                    >
                      {loadingStates.blacklistedDrivers
                        ? 'Loading'
                        : 'Loaded'}{' '}
                      Blacklisted Drivers
                    </span>
                    {loadingStates.blacklistedDrivers && (
                      <span className='ml-2 inline-block w-3 h-3 border-2 border-t-red-500 border-r-transparent border-b-transparent border-l-transparent rounded-full animate-spin'></span>
                    )}
                  </li>
                  <li className='flex items-center'>
                    <span
                      className={
                        loadingStates.vehicleLogins
                          ? 'text-red-500'
                          : 'text-green-500'
                      }
                    >
                      {loadingStates.vehicleLogins ? 'Loading' : 'Loaded'}{' '}
                      Vehicle Logins
                    </span>
                    {loadingStates.vehicleLogins && (
                      <span className='ml-2 inline-block w-3 h-3 border-2 border-t-red-500 border-r-transparent border-b-transparent border-l-transparent rounded-full animate-spin'></span>
                    )}
                  </li>
                  <li className='flex items-center'>
                    <span
                      className={
                        loadingStates.lastDriverLogins
                          ? 'text-red-500'
                          : 'text-green-500'
                      }
                    >
                      {loadingStates.lastDriverLogins
                        ? 'Loading'
                        : 'Loaded'}{' '}
                      Last Driver Logins
                    </span>
                    {loadingStates.lastDriverLogins && (
                      <span className='ml-2 inline-block w-3 h-3 border-2 border-t-red-500 border-r-transparent border-b-transparent border-l-transparent rounded-full animate-spin'></span>
                    )}
                  </li>
                  <li className='flex items-center'>
                    <span
                      className={
                        loadingStates.MessageSent
                          ? 'text-red-500'
                          : 'text-green-500'
                      }
                    >
                      {loadingStates.MessageSent ? 'Loading' : 'Loaded'}{' '}
                      Messages Sent
                    </span>
                    {loadingStates.MessageSent && (
                      <span className='ml-2 inline-block w-3 h-3 border-2 border-t-red-500 border-r-transparent border-b-transparent border-l-transparent rounded-full animate-spin'></span>
                    )}
                  </li>
                </ul>
              </div>
            )}

            {vehicles.map((vehicle, index) => (
              <div
                key={index}
                className='bg-white shadow-lg rounded-lg p-6 border border-gray-300'
              >
                <div className='grid grid-cols-3 gap-4 items-start'>
                  <div className='w-20 h-20 flex items-start justify-start'>
                    <Image
                      src='/forklift.png'
                      alt='Forklift'
                      width={80}
                      height={80}
                      className='w-full h-full object-contain'
                    />
                  </div>
                  <div className='col-span-2 text-center'>
                    <h2 className='text-2xl font-bold text-gray-800'>
                      {vehicle.vehicle_info.vehicle_name}
                    </h2>
                    <p className='text-base text-gray-600'>
                      <strong>Serial:</strong>{' '}
                      {vehicle.vehicle_info.serial_number}
                    </p>
                    <p className='text-base text-gray-600'>
                      <strong>GMPT:</strong>{' '}
                      {vehicle.vehicle_info.gmpt_code}
                    </p>
                  </div>
                </div>

                {/* Vehicle Details */}
                <div className='grid grid-cols-2 gap-4 mt-4'>
                  <div>
                    <p className='text-base text-gray-600'>
                      <strong>Customer:</strong>{' '}
                      {vehicle.vehicle_info.customer_name}
                    </p>
                    <p className='text-base text-gray-600'>
                      <strong>Site:</strong>{' '}
                      {vehicle.vehicle_info.site_name}
                    </p>
                    <p className='text-base text-gray-600'>
                      <strong>Department:</strong>{' '}
                      {vehicle.vehicle_info.department}
                    </p>
                    <p className='text-base text-gray-600'>
                      <strong>Screen Version:</strong>{' '}
                      {vehicle.vehicle_info.screen_version}
                    </p>
                    <p className='text-base text-gray-600'>
                      <strong>ExpModu Version:</strong>{' '}
                      {vehicle.vehicle_info.expansion_version}
                    </p>
                    <p
                      className={`text-base ${
                        isOlderThanTwoWeeks(
                          vehicle.vehicle_info.last_dlist_timestamp
                        )
                          ? 'text-amber-500 font-semibold'
                          : 'text-gray-600'
                      }`}
                    >
                      <strong>Last Driver List sync:</strong>{' '}
                      {vehicle.vehicle_info.last_dlist_timestamp}
                    </p>
                    <p
                      className={`text-base ${
                        isOlderThanTwoWeeks(
                          vehicle.vehicle_info.last_preop_timestamp
                        )
                          ? 'text-amber-500 font-semibold'
                          : 'text-gray-600'
                      }`}
                    >
                      <strong>Last Checklist sync:</strong>{' '}
                      {vehicle.vehicle_info.last_preop_timestamp}
                    </p>
                  </div>
                  <div>
                    <p className='text-base text-gray-600'>
                      <strong>Firmware Version:</strong>{' '}
                      {vehicle.vehicle_info.firmware_version}
                    </p>
                    <p className='text-base text-gray-600'>
                      <strong>Vehicle Model:</strong>{' '}
                      {vehicle.vehicle_info.vehicle_model}
                    </p>
                    <p className='text-base text-gray-600'>
                      <strong>Sim Number:</strong>{' '}
                      {vehicle.vehicle_info.sim_number}
                    </p>
                    <p
                      className={`text-base ${getLastConnectionColor(
                        vehicle.vehicle_info.last_connection
                      )}`}
                    >
                      <strong>Last Connection:</strong>{' '}
                      {vehicle.vehicle_info.last_connection}
                    </p>
                  </div>
                </div>

                {/* Status */}
                <div className='text-center mt-4'>
                  <p
                    className={`text-lg font-bold ${
                      loadingStates.vehicleStatus
                        ? 'text-blue-600'
                        : vehicleStatusByVehicle[vehicle.VEHICLE_CD]
                            ?.status === 'online'
                        ? 'text-green-600'
                        : 'text-red-600'
                    }`}
                  >
                    <strong>
                      Status:{' '}
                      {loadingStates.vehicleStatus
                        ? 'Loading...'
                        : vehicleStatusByVehicle[vehicle.VEHICLE_CD]
                            ?.status || vehicle.vehicle_info.status}
                    </strong>
                    {loadingStates.vehicleStatus && (
                      <span className='ml-2 inline-block w-3 h-3 border-2 border-t-blue-500 border-r-transparent border-b-transparent border-l-transparent rounded-full animate-spin'></span>
                    )}
                  </p>
                </div>

                <hr className='border-gray-300 mb-4' />

                {/* Vehicle Configuration Details */}
                <div className='grid grid-cols-2 gap-4 text-base text-gray-600'>
                  <p>
                    <span
                      className={
                        vehicle.vehicle_info.lockout_code
                          ?.toString()
                          .trim() === '0'
                          ? 'text-green-500'
                          : 'text-red-500'
                      }
                    >
                      <strong>Lockout Status:</strong>{' '}
                      {vehicle.vehicle_info.lockout_code
                        ?.toString()
                        .trim() === '0'
                        ? 'Unlocked'
                        : 'Locked'}
                    </span>
                  </p>
                  <p>
                    <span
                      className={
                        vehicle.vehicle_info.impact_lockout
                          ? 'text-green-500'
                          : 'text-red-500'
                      }
                    >
                      <strong>Impact Lockouts:</strong>{' '}
                      {vehicle.vehicle_info.impact_lockout ? 'On' : 'Off'}
                    </span>
                  </p>
                  <p>
                    <strong>Recalibration Date:</strong>{' '}
                    {vehicle.vehicle_info.impact_recalibration_date}
                  </p>
                  <p
                    className={`${
                      vehicle.vehicle_info.red_impact_threshold !== null &&
                      vehicle.vehicle_info.red_impact_threshold > 0.0
                        ? 'text-green-500'
                        : 'text-red-500'
                    }`}
                  >
                    <strong>Red Impact Threshold:</strong>{' '}
                    {vehicle.vehicle_info.red_impact_threshold}g
                  </p>
                  <p>
                    <span
                      className={
                        vehicle.vehicle_info.full_lockout_enabled
                          ? 'text-green-500'
                          : 'text-red-500'
                      }
                    >
                      <strong>Full Lockout:</strong>{' '}
                      {vehicle.vehicle_info.full_lockout_enabled
                        ? 'On'
                        : 'Off'}
                    </span>
                  </p>
                  <p className='text-gray-600 text-base'>
                    <strong>Full Lockout Timeout:</strong>{' '}
                    {vehicle.vehicle_info.full_lockout_timeout}s
                  </p>
                  <p className='text-gray-600 text-base'>
                    <strong>Idle Timeout:</strong>{' '}
                    {vehicle.vehicle_info.seat_idle !== null
                      ? vehicle.vehicle_info.seat_idle
                      : 'Off'}
                    s
                  </p>
                  <p className='text-base text-gray-600'>
                    <strong>Idle Polarity:</strong>{' '}
                    {vehicle.vehicle_info.idle_polarity}
                  </p>
                  <p>
                    <strong>Checklist Schedule:</strong>{' '}
                    {vehicle.vehicle_info.preop_schedule}
                  </p>
                  <p className='text-gray-600 text-base'>
                    <strong>Checklist Timeout:</strong>{' '}
                    {vehicle.vehicle_info.survey_timeout}s
                  </p>
                  <p>
                    <span
                      className={
                        vehicle.vehicle_info.vor_setting == false
                          ? 'text-green-500'
                          : 'text-red-500'
                      }
                    >
                      <strong>VOR:</strong>{' '}
                      {vehicle.vehicle_info.vor_setting == false
                        ? 'Off'
                        : 'On'}
                    </span>
                  </p>

                  {/* Popup Buttons */}
                  <button
                    className='text-blue-500 hover:underline mt-2 flex items-center'
                    onClick={() =>
                      togglePopup('masterCodes', vehicle.VEHICLE_CD)
                    }
                  >
                    <span>Master Codes</span>
                    {loadingStates.masterCodes &&
                      activeVehicleId === vehicle.VEHICLE_CD && (
                        <span className='ml-2 inline-block w-3 h-3 border-2 border-t-blue-500 border-r-transparent border-b-transparent border-l-transparent rounded-full animate-spin'></span>
                      )}
                  </button>

                  <button
                    className='text-blue-500 hover:underline mt-2 flex items-center'
                    onClick={() =>
                      togglePopup('blacklistDrivers', vehicle.VEHICLE_CD)
                    }
                  >
                    <span>Drivers on Blacklist</span>
                    {loadingStates.blacklistedDrivers &&
                      activeVehicleId === vehicle.VEHICLE_CD && (
                        <span className='ml-2 inline-block w-3 h-3 border-2 border-t-blue-500 border-r-transparent border-b-transparent border-l-transparent rounded-full animate-spin'></span>
                      )}
                  </button>

                  <button
                    className='text-blue-500 hover:underline mt-2 flex items-center'
                    onClick={() =>
                      togglePopup('vehicleLogins', vehicle.VEHICLE_CD)
                    }
                  >
                    <span>Recent Vehicle Logins (7 days)</span>
                    {loadingStates.vehicleLogins &&
                      activeVehicleId === vehicle.VEHICLE_CD && (
                        <span className='ml-2 inline-block w-3 h-3 border-2 border-t-blue-500 border-r-transparent border-b-transparent border-l-transparent rounded-full animate-spin'></span>
                      )}
                  </button>

                  <button
                    className='text-blue-500 hover:underline mt-2 flex items-center'
                    onClick={() =>
                      togglePopup('lastDriverLogins', vehicle.VEHICLE_CD)
                    }
                  >
                    <span>Last 10 Drivers Logged in</span>
                    {loadingStates.lastDriverLogins &&
                      activeVehicleId === vehicle.VEHICLE_CD && (
                        <span className='ml-2 inline-block w-3 h-3 border-2 border-t-blue-500 border-r-transparent border-b-transparent border-l-transparent rounded-full animate-spin'></span>
                      )}
                  </button>

                  <button
                    className='text-blue-500 hover:underline mt-2 flex items-center'
                    onClick={() =>
                      togglePopup('messagesSent', vehicle.VEHICLE_CD)
                    }
                  >
                    <span>Messages Sent (7 days)</span>
                    {loadingStates.MessageSent &&
                      activeVehicleId === vehicle.VEHICLE_CD && (
                        <span className='ml-2 inline-block w-3 h-3 border-2 border-t-red-500 border-r-transparent border-b-transparent border-l-transparent rounded-full animate-spin'></span>
                      )}
                  </button>
                </div>
              </div>
            ))}
          </div>
        ) : (
          /* Snapshot Comparison View */
          <div className='mt-8'>
            <h2 className='text-2xl font-bold text-gray-800 mb-4'>
              Vehicle Snapshot Comparison
            </h2>
            <div className='grid grid-cols-2 gap-6'>
              {Object.entries(snapshotData).map(([vehicleCd, snaps]) => {
                // Helper function to check if values changed
                const hasChanged = (beforeVal: any, afterVal: any) => {
                  if (beforeVal === null && afterVal === null)
                    return false;
                  if (beforeVal === undefined && afterVal === undefined)
                    return false;
                  return beforeVal !== afterVal;
                };

                // Helper function to get appropriate styling for changed values
                const getChangeStyle = (beforeVal: any, afterVal: any) => {
                  if (hasChanged(beforeVal, afterVal)) {
                    return 'bg-yellow-300 px-1 rounded';
                  }
                  return '';
                };

                // Helper function to get boolean status color with text
                const getBooleanStatusText = (
                  value: any,
                  trueText: string,
                  falseText: string,
                  isGoodWhenTrue: boolean = true
                ) => {
                  const boolValue = Boolean(value);
                  const text = boolValue ? trueText : falseText;
                  const colorClass = isGoodWhenTrue
                    ? boolValue
                      ? 'text-green-500'
                      : 'text-red-500'
                    : boolValue
                    ? 'text-red-500'
                    : 'text-green-500';
                  return { text, colorClass };
                };

                return (
                  <div
                    key={vehicleCd}
                    className='bg-white shadow-lg rounded-lg border border-gray-300 overflow-hidden'
                  >
                    {/* Header */}
                    <div className='bg-gray-100 p-4 border-b'>
                      <h3 className='text-xl font-bold text-gray-800 text-center'>
                        GMPT:{' '}
                        {snaps.before.gmptCode || snaps.after.gmptCode}
                      </h3>
                      <div className='flex justify-between text-sm text-gray-600 mt-2'>
                        <span>
                          Before:{' '}
                          {snaps.before.snapshot_date ||
                          snaps.before.query_execution_date
                            ? format(
                                new Date(
                                  snaps.before.snapshot_date ||
                                    snaps.before.query_execution_date
                                ),
                                'MM/dd/yyyy HH:mm'
                              )
                            : 'N/A'}
                        </span>
                        <span>
                          After:{' '}
                          {snaps.after.snapshot_date ||
                          snaps.after.query_execution_date
                            ? format(
                                new Date(
                                  snaps.after.snapshot_date ||
                                    snaps.after.query_execution_date
                                ),
                                'MM/dd/yyyy HH:mm'
                              )
                            : 'N/A'}
                        </span>
                      </div>
                    </div>

                    <div className='grid grid-cols-2 gap-0'>
                      {/* Before Snapshot */}
                      <div className='p-5 border-r border-gray-200'>
                        <div className='flex items-center mb-4'>
                          <div className='w-14 h-14 mr-3'>
                            <Image
                              src='/forklift.png'
                              alt='Forklift'
                              width={56}
                              height={56}
                              className='w-full h-full object-contain'
                            />
                          </div>
                          <div>
                            <h4 className='text-base font-bold text-gray-800'>
                              {snaps.before.vehicleName ||
                                snaps.after.vehicleName}
                            </h4>
                            <p className='text-sm text-gray-600'>
                              <strong>Serial:</strong>{' '}
                              {snaps.before.serialNumber ||
                                snaps.after.serialNumber}
                            </p>
                            <p className='text-sm text-gray-600'>
                              <strong>GMPT:</strong>{' '}
                              {snaps.before.gmptCode ||
                                snaps.after.gmptCode}
                            </p>
                          </div>
                        </div>

                        <div className='grid grid-cols-2 gap-x-4 gap-y-1 text-sm mb-4'>
                          <div>
                            <p>
                              <strong>Customer:</strong>{' '}
                              <span
                                className={getChangeStyle(
                                  snaps.before.customer_name,
                                  snaps.after.customer_name
                                )}
                              >
                                {snaps.before.customer_name || 'N/A'}
                              </span>
                            </p>
                            <p>
                              <strong>Site:</strong>{' '}
                              <span
                                className={getChangeStyle(
                                  snaps.before.site_name,
                                  snaps.after.site_name
                                )}
                              >
                                {snaps.before.site_name || 'N/A'}
                              </span>
                            </p>
                            <p>
                              <strong>Department:</strong>{' '}
                              <span
                                className={getChangeStyle(
                                  snaps.before.dept_name,
                                  snaps.after.dept_name
                                )}
                              >
                                {snaps.before.dept_name || 'N/A'}
                              </span>
                            </p>
                          </div>
                          <div>
                            <p>
                              <strong>Firmware Version:</strong>
                            </p>
                            <p
                              className={getChangeStyle(
                                snaps.before.firmwareVersion,
                                snaps.after.firmwareVersion
                              )}
                            >
                              {snaps.before.firmwareVersion || 'N/A'}
                            </p>
                          </div>
                        </div>

                        <div className='grid grid-cols-2 gap-x-4 gap-y-1 text-sm mb-4'>
                          <div>
                            <p>
                              <strong>Screen Version:</strong>{' '}
                              <span
                                className={getChangeStyle(
                                  snaps.before.screenVersion,
                                  snaps.after.screenVersion
                                )}
                              >
                                {snaps.before.screenVersion || 'N/A'}
                              </span>
                            </p>
                            <p>
                              <strong>ExpModu Version:</strong>{' '}
                              <span
                                className={getChangeStyle(
                                  snaps.before.expansionVersion,
                                  snaps.after.expansionVersion
                                )}
                              >
                                {snaps.before.expansionVersion || 'N/A'}
                              </span>
                            </p>
                          </div>
                          <div>
                            <p>
                              <strong>Vehicle Model:</strong>{' '}
                              <span
                                className={getChangeStyle(
                                  snaps.before.vehicleModel,
                                  snaps.after.vehicleModel
                                )}
                              >
                                {snaps.before.vehicleModel || 'N/A'}
                              </span>
                            </p>
                            <p>
                              <strong>Sim Number:</strong>{' '}
                              <span
                                className={getChangeStyle(
                                  snaps.before.simNumber,
                                  snaps.after.simNumber
                                )}
                              >
                                {snaps.before.simNumber || 'N/A'}
                              </span>
                            </p>
                            <p>
                              <strong>Last Connection:</strong>
                            </p>
                            <p
                              className={getChangeStyle(
                                snaps.before.lastConnection,
                                snaps.after.lastConnection
                              )}
                            >
                              {snaps.before.lastConnection || 'N/A'}
                            </p>
                          </div>
                        </div>

                        <hr className='border-gray-300 my-4' />

                        <div className='grid grid-cols-2 gap-x-4 gap-y-1 text-sm'>
                          <div>
                            <p>
                              <span
                                className={`${
                                  getBooleanStatusText(
                                    (typeof snaps.before.vorSetting ===
                                      'string' &&
                                      snaps.before.vorSetting ===
                                        'false') ||
                                      (typeof snaps.before.vorSetting ===
                                        'boolean' &&
                                        snaps.before.vorSetting === false),
                                    'Off',
                                    'On',
                                    true
                                  ).colorClass
                                } ${getChangeStyle(
                                  snaps.before.vorSetting,
                                  snaps.after.vorSetting
                                )}`}
                              >
                                <strong>VOR:</strong>{' '}
                                {
                                  getBooleanStatusText(
                                    (typeof snaps.before.vorSetting ===
                                      'string' &&
                                      snaps.before.vorSetting ===
                                        'false') ||
                                      (typeof snaps.before.vorSetting ===
                                        'boolean' &&
                                        snaps.before.vorSetting === false),
                                    'Off',
                                    'On',
                                    true
                                  ).text
                                }
                              </span>
                            </p>
                            <p>
                              <strong>LO Reason:</strong>{' '}
                              <span
                                className={getChangeStyle(
                                  snaps.before.loReason,
                                  snaps.after.loReason
                                )}
                              >
                                {snaps.before.loReason || 'N/A'}
                              </span>
                            </p>
                            <p>
                              <strong>Recalibration Date:</strong>{' '}
                              <span
                                className={getChangeStyle(
                                  snaps.before.impactRecalibrationDate,
                                  snaps.after.impactRecalibrationDate
                                )}
                              >
                                {snaps.before.impactRecalibrationDate ||
                                  'N/A'}
                              </span>
                            </p>
                            <p>
                              <span
                                className={`${
                                  getBooleanStatusText(
                                    snaps.before.impactLockout,
                                    'On',
                                    'Off',
                                    true
                                  ).colorClass
                                } ${getChangeStyle(
                                  snaps.before.impactLockout,
                                  snaps.after.impactLockout
                                )}`}
                              >
                                <strong>Impact Lockouts:</strong>{' '}
                                {
                                  getBooleanStatusText(
                                    snaps.before.impactLockout,
                                    'On',
                                    'Off',
                                    true
                                  ).text
                                }
                              </span>
                            </p>
                            <p>
                              <span
                                className={`${
                                  getBooleanStatusText(
                                    snaps.before.fullLockoutEnabled,
                                    'On',
                                    'Off',
                                    true
                                  ).colorClass
                                } ${getChangeStyle(
                                  snaps.before.fullLockoutEnabled,
                                  snaps.after.fullLockoutEnabled
                                )}`}
                              >
                                <strong>Full Lockout:</strong>{' '}
                                {
                                  getBooleanStatusText(
                                    snaps.before.fullLockoutEnabled,
                                    'On',
                                    'Off',
                                    true
                                  ).text
                                }
                              </span>
                            </p>
                            <p>
                              <strong>Full Lockout Timeout:</strong>{' '}
                              <span
                                className={getChangeStyle(
                                  snaps.before.fullLockoutTimeout,
                                  snaps.after.fullLockoutTimeout
                                )}
                              >
                                {snaps.before.fullLockoutTimeout || 0}s
                              </span>
                            </p>
                            <p>
                              <strong>Checklist Timeout:</strong>{' '}
                              <span
                                className={getChangeStyle(
                                  snaps.before.surveyTimeout,
                                  snaps.after.surveyTimeout
                                )}
                              >
                                {snaps.before.surveyTimeout || 0}s
                              </span>
                            </p>
                            <p>
                              <strong>Idle Timeout:</strong>{' '}
                              <span
                                className={getChangeStyle(
                                  snaps.before.seatIdle,
                                  snaps.after.seatIdle
                                )}
                              >
                                {snaps.before.seatIdle !== null
                                  ? snaps.before.seatIdle + 's'
                                  : 'N/As'}
                              </span>
                            </p>
                          </div>
                          <div>
                            <p>
                              <span
                                className={
                                  snaps.before.lockoutCode === '0'
                                    ? 'text-green-500'
                                    : 'text-red-500'
                                }
                              >
                                <strong>Lockout Status:</strong>{' '}
                                {snaps.before.lockoutCode === '0'
                                  ? 'Unlocked'
                                  : 'Locked'}
                              </span>
                            </p>
                            <p>
                              <strong>Checklist Schedule:</strong>{' '}
                              <span
                                className={getChangeStyle(
                                  snaps.before.preopSchedule,
                                  snaps.after.preopSchedule
                                )}
                              >
                                {snaps.before.preopSchedule || 'N/A'}
                              </span>
                            </p>
                            <p
                              className={`${
                                snaps.before.redImpactThreshold &&
                                snaps.before.redImpactThreshold > 0
                                  ? 'text-green-500'
                                  : 'text-red-500'
                              }`}
                            >
                              <strong>Red Impact Threshold:</strong>{' '}
                              <span
                                className={getChangeStyle(
                                  snaps.before.redImpactThreshold,
                                  snaps.after.redImpactThreshold
                                )}
                              >
                                {snaps.before.redImpactThreshold || 0}g
                              </span>
                            </p>
                          </div>
                        </div>
                      </div>

                      {/* After Snapshot */}
                      <div className='p-5'>
                        <div className='flex items-center mb-4'>
                          <div className='w-14 h-14 mr-3'>
                            <Image
                              src='/forklift.png'
                              alt='Forklift'
                              width={56}
                              height={56}
                              className='w-full h-full object-contain'
                            />
                          </div>
                          <div>
                            <h4 className='text-base font-bold text-gray-800'>
                              {snaps.after.vehicleName ||
                                snaps.before.vehicleName}
                            </h4>
                            <p className='text-sm text-gray-600'>
                              <strong>Serial:</strong>{' '}
                              {snaps.after.serialNumber ||
                                snaps.before.serialNumber}
                            </p>
                            <p className='text-sm text-gray-600'>
                              <strong>GMPT:</strong>{' '}
                              {snaps.after.gmptCode ||
                                snaps.before.gmptCode}
                            </p>
                          </div>
                        </div>

                        <div className='grid grid-cols-2 gap-x-4 gap-y-1 text-sm mb-4'>
                          <div>
                            <p>
                              <strong>Customer:</strong>{' '}
                              <span
                                className={getChangeStyle(
                                  snaps.before.customer_name,
                                  snaps.after.customer_name
                                )}
                              >
                                {snaps.after.customer_name || 'N/A'}
                              </span>
                            </p>
                            <p>
                              <strong>Site:</strong>{' '}
                              <span
                                className={getChangeStyle(
                                  snaps.before.site_name,
                                  snaps.after.site_name
                                )}
                              >
                                {snaps.after.site_name || 'N/A'}
                              </span>
                            </p>
                            <p>
                              <strong>Department:</strong>{' '}
                              <span
                                className={getChangeStyle(
                                  snaps.before.dept_name,
                                  snaps.after.dept_name
                                )}
                              >
                                {snaps.after.dept_name || 'N/A'}
                              </span>
                            </p>
                          </div>
                          <div>
                            <p>
                              <strong>Firmware Version:</strong>
                            </p>
                            <p
                              className={getChangeStyle(
                                snaps.before.firmwareVersion,
                                snaps.after.firmwareVersion
                              )}
                            >
                              {snaps.after.firmwareVersion || 'N/A'}
                            </p>
                          </div>
                        </div>

                        <div className='grid grid-cols-2 gap-x-4 gap-y-1 text-sm mb-4'>
                          <div>
                            <p>
                              <strong>Screen Version:</strong>{' '}
                              <span
                                className={getChangeStyle(
                                  snaps.before.screenVersion,
                                  snaps.after.screenVersion
                                )}
                              >
                                {snaps.after.screenVersion || 'N/A'}
                              </span>
                            </p>
                            <p>
                              <strong>ExpModu Version:</strong>{' '}
                              <span
                                className={getChangeStyle(
                                  snaps.before.expansionVersion,
                                  snaps.after.expansionVersion
                                )}
                              >
                                {snaps.after.expansionVersion || 'N/A'}
                              </span>
                            </p>
                          </div>
                          <div>
                            <p>
                              <strong>Vehicle Model:</strong>{' '}
                              <span
                                className={getChangeStyle(
                                  snaps.before.vehicleModel,
                                  snaps.after.vehicleModel
                                )}
                              >
                                {snaps.after.vehicleModel || 'N/A'}
                              </span>
                            </p>
                            <p>
                              <strong>Sim Number:</strong>{' '}
                              <span
                                className={getChangeStyle(
                                  snaps.before.simNumber,
                                  snaps.after.simNumber
                                )}
                              >
                                {snaps.after.simNumber || 'N/A'}
                              </span>
                            </p>
                            <p>
                              <strong>Last Connection:</strong>
                            </p>
                            <p
                              className={getChangeStyle(
                                snaps.before.lastConnection,
                                snaps.after.lastConnection
                              )}
                            >
                              {snaps.after.lastConnection || 'N/A'}
                            </p>
                          </div>
                        </div>

                        <hr className='border-gray-300 my-4' />

                        <div className='grid grid-cols-2 gap-x-4 gap-y-1 text-sm'>
                          <div>
                            <p>
                              <span
                                className={`${
                                  getBooleanStatusText(
                                    (typeof snaps.after.vorSetting ===
                                      'string' &&
                                      snaps.after.vorSetting ===
                                        'false') ||
                                      (typeof snaps.after.vorSetting ===
                                        'boolean' &&
                                        snaps.after.vorSetting === false),
                                    'Off',
                                    'On',
                                    true
                                  ).colorClass
                                } ${getChangeStyle(
                                  snaps.before.vorSetting,
                                  snaps.after.vorSetting
                                )}`}
                              >
                                <strong>VOR:</strong>{' '}
                                {
                                  getBooleanStatusText(
                                    (typeof snaps.after.vorSetting ===
                                      'string' &&
                                      snaps.after.vorSetting ===
                                        'false') ||
                                      (typeof snaps.after.vorSetting ===
                                        'boolean' &&
                                        snaps.after.vorSetting === false),
                                    'Off',
                                    'On',
                                    true
                                  ).text
                                }
                              </span>
                            </p>
                            <p>
                              <strong>LO Reason:</strong>{' '}
                              <span
                                className={getChangeStyle(
                                  snaps.before.loReason,
                                  snaps.after.loReason
                                )}
                              >
                                {snaps.after.loReason || 'N/A'}
                              </span>
                            </p>
                            <p>
                              <strong>Recalibration Date:</strong>{' '}
                              <span
                                className={getChangeStyle(
                                  snaps.before.impactRecalibrationDate,
                                  snaps.after.impactRecalibrationDate
                                )}
                              >
                                {snaps.after.impactRecalibrationDate ||
                                  'N/A'}
                              </span>
                            </p>
                            <p>
                              <span
                                className={`${
                                  getBooleanStatusText(
                                    snaps.after.impactLockout,
                                    'On',
                                    'Off',
                                    true
                                  ).colorClass
                                } ${getChangeStyle(
                                  snaps.before.impactLockout,
                                  snaps.after.impactLockout
                                )}`}
                              >
                                <strong>Impact Lockouts:</strong>{' '}
                                {
                                  getBooleanStatusText(
                                    snaps.after.impactLockout,
                                    'On',
                                    'Off',
                                    true
                                  ).text
                                }
                              </span>
                            </p>
                            <p>
                              <span
                                className={`${
                                  getBooleanStatusText(
                                    snaps.after.fullLockoutEnabled,
                                    'On',
                                    'Off',
                                    true
                                  ).colorClass
                                } ${getChangeStyle(
                                  snaps.before.fullLockoutEnabled,
                                  snaps.after.fullLockoutEnabled
                                )}`}
                              >
                                <strong>Full Lockout:</strong>{' '}
                                {
                                  getBooleanStatusText(
                                    snaps.after.fullLockoutEnabled,
                                    'On',
                                    'Off',
                                    true
                                  ).text
                                }
                              </span>
                            </p>
                            <p>
                              <strong>Full Lockout Timeout:</strong>{' '}
                              <span
                                className={getChangeStyle(
                                  snaps.before.fullLockoutTimeout,
                                  snaps.after.fullLockoutTimeout
                                )}
                              >
                                {snaps.after.fullLockoutTimeout || 0}s
                              </span>
                            </p>
                            <p>
                              <strong>Checklist Timeout:</strong>{' '}
                              <span
                                className={getChangeStyle(
                                  snaps.before.surveyTimeout,
                                  snaps.after.surveyTimeout
                                )}
                              >
                                {snaps.after.surveyTimeout || 0}s
                              </span>
                            </p>
                            <p>
                              <strong>Idle Timeout:</strong>{' '}
                              <span
                                className={getChangeStyle(
                                  snaps.before.seatIdle,
                                  snaps.after.seatIdle
                                )}
                              >
                                {snaps.after.seatIdle !== null
                                  ? snaps.after.seatIdle + 's'
                                  : 'N/As'}
                              </span>
                            </p>
                          </div>
                          <div>
                            <p>
                              <span
                                className={`${
                                  getBooleanStatusText(
                                    snaps.after.lockoutCode === '0',
                                    'Unlocked',
                                    'Locked',
                                    true
                                  ).colorClass
                                } ${getChangeStyle(
                                  snaps.before.lockoutCode,
                                  snaps.after.lockoutCode
                                )}`}
                              >
                                <strong>Lockout Status:</strong>{' '}
                                {
                                  getBooleanStatusText(
                                    snaps.after.lockoutCode === '0',
                                    'Unlocked',
                                    'Locked',
                                    true
                                  ).text
                                }
                              </span>
                            </p>
                            <p>
                              <strong>Checklist Schedule:</strong>{' '}
                              <span
                                className={getChangeStyle(
                                  snaps.before.preopSchedule,
                                  snaps.after.preopSchedule
                                )}
                              >
                                {snaps.after.preopSchedule || 'N/A'}
                              </span>
                            </p>
                            <p
                              className={`${
                                snaps.after.redImpactThreshold &&
                                snaps.after.redImpactThreshold > 0
                                  ? 'text-green-500'
                                  : 'text-red-500'
                              }`}
                            >
                              <strong>Red Impact Threshold:</strong>{' '}
                              <span
                                className={getChangeStyle(
                                  snaps.before.redImpactThreshold,
                                  snaps.after.redImpactThreshold
                                )}
                              >
                                {snaps.after.redImpactThreshold || 0}g
                              </span>
                            </p>
                          </div>
                        </div>
                      </div>
                    </div>
                  </div>
                );
              })}
            </div>
          </div>
        )}

        {/* Popup Modals */}
        {showPopup.masterCodes && activeVehicleId && (
          <div className='fixed inset-0 bg-black bg-opacity-50 flex justify-center items-center z-50'>
            <div
              ref={popupRef}
              className='bg-white p-6 rounded-lg shadow-lg w-3/4 max-h-[80vh] overflow-y-auto'
            >
              <h3 className='text-lg font-semibold mb-4'>
                Master Codes for {getVehicleDisplayName(activeVehicleId)}
              </h3>
              {loadingStates.masterCodes ? (
                <div className='flex items-center text-blue-500'>
                  <span className='mr-2 inline-block w-4 h-4 border-2 border-t-blue-500 border-r-transparent border-b-transparent border-l-transparent rounded-full animate-spin'></span>
                  Loading master codes...
                </div>
              ) : masterCodesByVehicle[activeVehicleId]?.length > 0 ? (
                <div className='overflow-x-auto'>
                  <table className='min-w-full bg-white'>
                    <thead>
                      <tr className='w-full h-16 border-b border-gray-200 bg-gray-50'>
                        <th className='text-left pl-4'>
                          Master Code User
                        </th>
                      </tr>
                    </thead>
                    <tbody>
                      {masterCodesByVehicle[activeVehicleId].map(
                        (user, idx) => (
                          <tr
                            key={idx}
                            className='h-12 border-b border-gray-200'
                          >
                            <td className='text-left pl-4'>
                              {user.master_code_user}
                            </td>
                          </tr>
                        )
                      )}
                    </tbody>
                  </table>
                </div>
              ) : (
                <p className='text-gray-600'>No master codes found.</p>
              )}
              <button
                className='mt-4 bg-blue-500 text-white px-4 py-2 rounded-md hover:bg-blue-700'
                onClick={() => togglePopup('masterCodes')}
              >
                Close
              </button>
            </div>
          </div>
        )}

        {/* Blacklisted Drivers Popup */}
        {showPopup.blacklistDrivers && activeVehicleId && (
          <div className='fixed inset-0 bg-black bg-opacity-50 flex justify-center items-center z-50'>
            <div
              ref={popupRef}
              className='bg-white p-6 rounded-lg shadow-lg w-3/4 max-h-[80vh] overflow-y-auto'
            >
              <h3 className='text-lg font-semibold mb-4'>
                Blacklisted Drivers for{' '}
                {getVehicleDisplayName(activeVehicleId)}
              </h3>
              {loadingStates.blacklistedDrivers ? (
                <div className='flex items-center text-blue-500'>
                  <span className='mr-2 inline-block w-4 h-4 border-2 border-t-blue-500 border-r-transparent border-b-transparent border-l-transparent rounded-full animate-spin'></span>
                  Loading blacklisted drivers...
                </div>
              ) : blacklistedDriversByVehicle[activeVehicleId]?.length >
                0 ? (
                <div className='overflow-x-auto'>
                  <table className='min-w-full bg-white'>
                    <thead>
                      <tr className='w-full h-16 border-b border-gray-200 bg-gray-50'>
                        <th className='text-left pl-4'>Driver Name</th>
                        <th className='text-left pl-4'>Driver ID</th>
                        <th className='text-left pl-4'>Card ID</th>
                      </tr>
                    </thead>
                    <tbody>
                      {blacklistedDriversByVehicle[activeVehicleId].map(
                        (driver, idx) => (
                          <tr
                            key={idx}
                            className='h-12 border-b border-gray-200 bg-red-100/50'
                          >
                            <td className='text-left pl-4'>
                              {driver.driver_name || 'Unknown'}
                            </td>
                            <td className='text-left pl-4'>
                              {driver.driver_id || 'N/A'}
                            </td>
                            <td className='text-left pl-4'>
                              {driver.card_id || 'N/A'}
                            </td>
                          </tr>
                        )
                      )}
                    </tbody>
                  </table>
                </div>
              ) : (
                <p className='text-gray-600'>
                  No blacklisted drivers found.
                </p>
              )}
              <button
                className='mt-4 bg-blue-500 text-white px-4 py-2 rounded-md hover:bg-blue-700'
                onClick={() => togglePopup('blacklistDrivers')}
              >
                Close
              </button>
            </div>
          </div>
        )}

        {/* Vehicle Logins Popup */}
        {showPopup.vehicleLogins && activeVehicleId && (
          <div className='fixed inset-0 bg-black bg-opacity-50 flex justify-center items-center z-50'>
            <div
              ref={popupRef}
              className='bg-white p-6 rounded-lg shadow-lg w-3/4 max-h-[80vh] overflow-y-auto'
            >
              <h3 className='text-lg font-semibold mb-4'>
                Recent Vehicle Logins for{' '}
                {getVehicleDisplayName(activeVehicleId)}
              </h3>
              {loadingStates.vehicleLogins ? (
                <div className='flex items-center text-blue-500'>
                  <span className='mr-2 inline-block w-4 h-4 border-2 border-t-blue-500 border-r-transparent border-b-transparent border-l-transparent rounded-full animate-spin'></span>
                  Loading vehicle logins...
                </div>
              ) : vehicleLoginsByVehicle[activeVehicleId]?.length > 0 ? (
                <div className='overflow-x-auto'>
                  <table className='min-w-full bg-white'>
                    <thead>
                      <tr className='w-full h-16 border-b border-gray-200 bg-gray-50'>
                        <th className='text-left pl-4'>Driver Name</th>
                        <th className='text-left pl-4'>Driver ID</th>
                        <th className='text-left pl-4'>Facility Code</th>
                        <th className='text-left pl-4'>Login Time</th>
                        <th className='text-left pl-4'>Accepted</th>
                      </tr>
                    </thead>
                    <tbody>
                      {vehicleLoginsByVehicle[activeVehicleId].map(
                        (login, idx) => (
                          <tr
                            key={idx}
                            className={`h-12 border-b border-gray-200 ${
                              login.accepted !== undefined
                                ? login.accepted
                                  ? 'bg-green-100/50'
                                  : 'bg-red-100/50'
                                : ''
                            }`}
                          >
                            <td className='text-left pl-4'>
                              {login.driver_name || 'Unknown'}
                            </td>
                            <td className='text-left pl-4'>
                              {login.driver_id || 'N/A'}
                            </td>
                            <td className='text-left pl-4'>
                              {login.facility_code || 'N/A'}
                            </td>
                            <td className='text-left pl-4'>
                              {login.login_time
                                ? typeof login.login_time === 'string'
                                  ? login.login_time
                                  : new Date(
                                      login.login_time
                                    ).toLocaleString()
                                : 'N/A'}
                            </td>
                            <td
                              className={`text-left pl-4 ${
                                login.accepted !== undefined
                                  ? login.accepted
                                    ? 'text-green-600'
                                    : 'text-red-600'
                                  : 'text-gray-500'
                              }`}
                            >
                              {login.accepted !== undefined
                                ? login.accepted
                                  ? 'Yes'
                                  : 'No'
                                : 'Unknown'}
                            </td>
                          </tr>
                        )
                      )}
                    </tbody>
                  </table>
                </div>
              ) : (
                <p className='text-gray-600'>
                  No vehicle logins found in the last 7 days.
                </p>
              )}
              <button
                className='mt-4 bg-blue-500 text-white px-4 py-2 rounded-md hover:bg-blue-700'
                onClick={() => togglePopup('vehicleLogins')}
              >
                Close
              </button>
            </div>
          </div>
        )}

        {/* Last Driver Logins Popup */}
        {showPopup.lastDriverLogins && activeVehicleId && (
          <div className='fixed inset-0 bg-black bg-opacity-50 flex justify-center items-center z-50'>
            <div
              ref={popupRef}
              className='bg-white p-6 rounded-lg shadow-lg w-3/4 max-h-[80vh] overflow-y-auto'
            >
              <h3 className='text-lg font-semibold mb-4'>
                Last 10 Driver Logins for{' '}
                {getVehicleDisplayName(activeVehicleId)}
              </h3>
              {loadingStates.lastDriverLogins ? (
                <div className='flex items-center text-blue-500'>
                  <span className='mr-2 inline-block w-4 h-4 border-2 border-t-blue-500 border-r-transparent border-b-transparent border-l-transparent rounded-full animate-spin'></span>
                  Loading last driver logins...
                </div>
              ) : lastDriverLoginsByVehicle[activeVehicleId]?.length >
                0 ? (
                <div className='overflow-x-auto'>
                  <table className='min-w-full bg-white'>
                    <thead>
                      <tr className='w-full h-16 border-b border-gray-200 bg-gray-50'>
                        <th className='text-left pl-4'>Driver Name</th>
                        <th className='text-left pl-4'>Driver ID</th>
                        <th className='text-left pl-4'>Login Time</th>
                        <th className='text-left pl-4'>Accepted</th>
                      </tr>
                    </thead>
                    <tbody>
                      {lastDriverLoginsByVehicle[activeVehicleId].map(
                        (login, idx) => (
                          <tr
                            key={idx}
                            className={`h-12 border-b border-gray-200 ${
                              login?.accepted !== undefined
                                ? login.accepted
                                  ? 'bg-green-100/50'
                                  : 'bg-red-100/50'
                                : ''
                            }`}
                          >
                            <td className='text-left pl-4'>
                              {login?.driver_name || 'Unknown'}
                            </td>
                            <td className='text-left pl-4'>
                              {login?.driver_id || 'N/A'}
                            </td>
                            <td className='text-left pl-4'>
                              {login?.login_time
                                ? typeof login.login_time === 'string'
                                  ? login.login_time
                                  : new Date(
                                      login.login_time
                                    ).toLocaleString()
                                : 'N/A'}
                            </td>
                            <td
                              className={`text-left pl-4 ${
                                login?.accepted !== undefined
                                  ? login.accepted
                                    ? 'text-green-600'
                                    : 'text-red-600'
                                  : 'text-gray-500'
                              }`}
                            >
                              {login?.accepted !== undefined
                                ? login.accepted
                                  ? 'Yes'
                                  : 'No'
                                : 'Unknown'}
                            </td>
                          </tr>
                        )
                      )}
                    </tbody>
                  </table>
                </div>
              ) : (
                <p className='text-gray-600'>
                  No login information available.
                </p>
              )}
              <button
                className='mt-4 bg-blue-500 text-white px-4 py-2 rounded-md hover:bg-blue-700'
                onClick={() => togglePopup('lastDriverLogins')}
              >
                Close
              </button>
            </div>
          </div>
        )}

        {/* Messages Sent Popup */}
        {showPopup.messagesSent && activeVehicleId && (
          <div className='fixed inset-0 bg-black bg-opacity-50 flex justify-center items-center z-50'>
            <div
              ref={popupRef}
              className='bg-white p-6 rounded-lg shadow-lg w-3/4 max-h-[80vh] overflow-y-auto'
            >
              <h3 className='text-lg font-semibold mb-4'>
                Messages Sent to {getVehicleDisplayName(activeVehicleId)}
              </h3>
              {loadingStates.MessageSent ? (
                <div className='flex items-center text-blue-500'>
                  <span className='mr-2 inline-block w-4 h-4 border-2 border-t-blue-500 border-r-transparent border-b-transparent border-l-transparent rounded-full animate-spin'></span>
                  Loading messages...
                </div>
              ) : messagesSentByVehicle[activeVehicleId]?.length > 0 ? (
                <div className='overflow-x-auto'>
                  <table className='min-w-full bg-white'>
                    <thead>
                      <tr className='w-full h-16 border-b border-gray-200 bg-gray-50'>
                        <th className='text-left pl-4'>Message Type</th>
                        <th className='text-left pl-4'>Message</th>
                        <th className='text-left pl-4'>Sent Time</th>
                        <th className='text-left pl-4'>Status</th>
                      </tr>
                    </thead>
                    <tbody>
                      {messagesSentByVehicle[activeVehicleId].map(
                        (msg, idx) => (
                          <tr
                            key={idx}
                            className={`h-12 border-b border-gray-200 ${
                              msg.status === 'done'
                                ? 'bg-green-100/50'
                                : msg.status === 'in_queue'
                                ? 'bg-amber-100/50'
                                : ''
                            }`}
                          >
                            <td className='text-left pl-4'>
                              {msg.message_type || 'Unknown'}
                            </td>
                            <td className='text-left pl-4 max-w-xs truncate'>
                              {msg.message_text || 'N/A'}
                            </td>
                            <td className='text-left pl-4'>
                              {msg.message_timestamp || 'N/A'}
                            </td>
                            <td
                              className={`text-left pl-4 ${
                                msg.status === 'done'
                                  ? 'text-green-600 font-semibold'
                                  : msg.status === 'in_queue'
                                  ? 'text-amber-600 font-semibold'
                                  : 'text-gray-500'
                              }`}
                            >
                              {msg.status || 'N/A'}
                            </td>
                          </tr>
                        )
                      )}
                    </tbody>
                  </table>
                </div>
              ) : (
                <p className='text-gray-600'>
                  No messages found in the last 7 days.
                </p>
              )}
              <button
                className='mt-4 bg-blue-500 text-white px-4 py-2 rounded-md hover:bg-blue-700'
                onClick={() => togglePopup('messagesSent')}
              >
                Close
              </button>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default VehicleDashboard;

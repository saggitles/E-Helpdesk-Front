'use client';

import NavBar from '@/generic_comp/navbar';
import Navsearch from '@/generic_comp/navsearch';
import { dateType } from 'aws-sdk/clients/iam';
import React, { useState, useEffect, useRef } from 'react';
// @ts-ignore
import DatePicker from 'react-datepicker';
import 'react-datepicker/dist/react-datepicker.css';
import { format } from 'date-fns';
import { after, before } from 'node:test';
import { useMemo } from 'react';

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

interface Driver {
  firstName: string;
  lastName: string;
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
  impactRecalibrationDate: string | null;
  preopSchedule: string | null;
  vehicleType: string | null;
  dept_id: number;
  site_id: number;
  cust_id: number;
  snapshot_id: number;
  vehicle_cd: number;
  snapshot_time: string | null;
  hasWifi: boolean;
  lastDlistTimestamp: string | null;
  lastPreopTimestamp: string | null;
}

//TODO: check if snapshot can be a singular object and not an array
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
  }>({
    vehicles: false,
    masterCodes: false,
    blacklistedDrivers: false,
    vehicleLogins: false,
    lastDriverLogins: false,
    MessageSent: false,
  });
  const popupRef = useRef<HTMLDivElement>(null);
  const [loadingDetails, setLoadingDetails] = useState<boolean>(false);
  const [detailsLoaded, setDetailsLoaded] = useState<boolean>(false);

  const [dates, setDates] = useState<Date[]>([]);
  const [loading, setLoading] = useState<boolean>(false);
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
  const [selectedSnapshotId1, setSelectedSnapshotId1] = useState<
    number | null
  >(null);
  const [selectedSnapshotId2, setSelectedSnapshotId2] = useState<
    number | null
  >(null);

  const [snapshotData, setSnapshotData] = useState<GroupedSnapshots>({});
  const [loadingVehicles, setLoadingVehicles] = useState<boolean>(false);
  const [loadingSnapshots, setLoadingSnapshots] = useState<boolean>(false);

  const [additionalData, setAdditionalData] = useState({});
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

  const vehicleSummary = useMemo(() => {
    if (!vehicles || vehicles.length === 0) {
      return { total: 0, active: 0, inactive: 0 };
    }
    return {
      total: vehicles.length,
      active: vehicles.filter(
        (v) =>
          v.vehicle_info.status &&
          v.vehicle_info.status.toLowerCase() === 'online'
      ).length,
      inactive: vehicles.filter(
        (v) =>
          v.vehicle_info.status &&
          v.vehicle_info.status.toLowerCase() === 'offline'
      ).length,
    };
  }, [vehicles]);

  const fetchVehicles = async () => {
    setVehicles([]);
    setMasterCodesByVehicle({});
    setBlacklistedDriversByVehicle({});
    setSnapshotData({});

    setLoadingStates((prev) => ({ ...prev, vehicles: true }));
    setLoadingVehicles(true); // Make sure this is set to show loading overlay

    const customer = localStorage.getItem('selectedCustomer');
    const site = localStorage.getItem('selectedSite');
    const gmptCode = localStorage.getItem('selectedGmpt');

    if (!customer) {
      console.warn('No customer selected.');
      setLoadingVehicles(false);
      setLoadingStates((prev) => ({ ...prev, vehicles: false }));
      return;
    }

    console.log('Fetching vehicles for:');
    console.log('Customer:', customer || 'None');
    console.log('Site:', site || 'None');
    console.log('GMPT Code:', gmptCode || 'None');

    // Build query params with direct values - don't try to parse JSON
    const queryParams = new URLSearchParams();

    if (customer) queryParams.append('customer', customer.toString());
    if (site && site !== '') queryParams.append('site', site.toString());
    if (gmptCode && gmptCode !== '')
      queryParams.append('gmptCode', gmptCode.toString());

    try {
      const response = await fetch(
        `http://localhost:8080/api/vehicles?${queryParams}`
      );

      if (!response.ok) {
        throw new Error(`HTTP error! Status: ${response.status}`);
      }

      const vehicleData = await response.json();

      if (Array.isArray(vehicleData)) {
        setVehicles(vehicleData);

        // Trigger additional data fetches but don't wait for them
        const vehicleIds = vehicleData.map((v) => v.VEHICLE_CD);
        fetchMasterCodes(vehicleIds);
        fetchBlacklistedDrivers(vehicleIds);
        fetchVehicleLogins(vehicleIds);
        fetchLastDriverLogins(vehicleIds);
        fetchMessagesSent(vehicleIds);
      } else {
        console.error('Unexpected response format:', vehicleData);
      }
    } catch (error) {
      console.error('Error fetching vehicles:', error);
    } finally {
      setLoadingStates((prev) => ({ ...prev, vehicles: false }));
      setLoadingVehicles(false);
    }
  };

  // Fetch master codes separately
  const fetchMasterCodes = async (vehicleIds: (string | number)[]) => {
    if (!vehicleIds.length) return;

    setLoadingStates((prev) => ({ ...prev, masterCodes: true }));

    try {
      const response = await fetch(
        `http://localhost:8080/api/master-codes`,
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
      // Initialize with empty arrays on error
      const fallbackData = vehicleIds.reduce((acc, id) => {
        acc[id] = [];
        return acc;
      }, {} as Record<string | number, MasterCode[]>);

      setMasterCodesByVehicle(fallbackData);
    } finally {
      setLoadingStates((prev) => ({ ...prev, masterCodes: false }));
    }
  };

  // Fetch blacklisted drivers separately
  const fetchBlacklistedDrivers = async (
    vehicleIds: (string | number)[]
  ) => {
    if (!vehicleIds.length) return;

    setLoadingStates((prev) => ({ ...prev, blacklistedDrivers: true }));

    try {
      const response = await fetch(
        `http://localhost:8080/api/blacklisted-drivers`,
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
      // Initialize with empty arrays on error
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
        `http://localhost:8080/api/vehicle-logins`,
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
      console.log('Login data received:', vehicleLoginsData);

      // Ensure we have an entry for each vehicle ID
      const processedData: Record<string | number, VehicleLogin[]> = {};

      // Make sure every vehicle has an entry, even if empty
      vehicleIds.forEach((id) => {
        processedData[id] = vehicleLoginsData[id] || [];
      });

      setVehicleLoginsByVehicle(processedData);
    } catch (error) {
      console.error('Error fetching vehicle logins:', error);
      // Initialize with empty arrays on error
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
      // First create fallback data in case the endpoint doesn't exist or fails
      const fallbackData = vehicleIds.reduce((acc, id) => {
        acc[id] = [];
        return acc;
      }, {} as Record<string | number, LastDriverLogin[]>);

      try {
        const response = await fetch(
          `http://localhost:8080/api/last-driver-logins`,
          {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ vehicleCDs: vehicleIds }),
          }
        );

        if (!response.ok) {
          console.warn(
            `API warning: ${response.status} - Last driver logins endpoint may not be implemented yet`
          );
          // Use fallback data instead of throwing
          setLastDriverLoginsByVehicle(fallbackData);
          return;
        }

        const lastDriverLoginsData = await response.json();
        console.log('Last driver logins data:', lastDriverLoginsData);
        setLastDriverLoginsByVehicle(lastDriverLoginsData);
      } catch (error) {
        console.error('Error fetching last driver logins:', error);
        // Use fallback data on error
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
        `http://localhost:8080/api/messages-sent`,
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
      console.log('Messages sent front data received:', messagesSentData);
      setMessagesSentByVehicle(messagesSentData);
    } catch (error) {
      console.error('Error fetching messages sent:', error);
      // Initialize with empty arrays on error
      const fallbackData = vehicleIds.reduce((acc, id) => {
        acc[id] = [];
        return acc;
      }, {} as Record<string | number, MessageSent[]>);

      setMessagesSentByVehicle(fallbackData);
    } finally {
      setLoadingStates((prev) => ({ ...prev, messagesSent: false }));
    }
  };

  // ✅ Fetch available dates from backend
  const fetchDates = async () => {
    try {
      const response = await fetch(
        'http://localhost:8080/api/available-dates'
      );
      const data = await response.json();

      // Convert strings to JS Date objects
      const formattedDates = data.map((d: string) => new Date(d));
      setDates(formattedDates);
    } catch (error) {
      console.error('Error fetching dates:', error);
      setDates([]);
    }
  };

  const fetchTimes = async (formattedDate: string) => {
    try {
      const response = await fetch(
        `http://localhost:8080/api/available-times?date=${formattedDate}`
      );
      const data = await response.json();
      console.log('Available times for', formattedDate, ':', data);
      setAvailableTimes1(Array.isArray(data) ? data : []);
    } catch (error) {
      console.error('Error fetching first times:', error);
      setAvailableTimes1([]);
    }
  };

  const fetchSecondTimes = async (formattedDate: string) => {
    try {
      const response = await fetch(
        `http://localhost:8080/api/available-times?date=${formattedDate}`
      );
      const data = await response.json();
      setAvailableTimes2(Array.isArray(data) ? data : []);
    } catch (error) {
      console.error('Error fetching second times:', error);
      setAvailableTimes2([]);
    }
  };

  useEffect(() => {
    // Check if any loading state is true
    const anyLoading = Object.values(loadingStates).some(
      (state) => state === true
    );

    // Set a separate state to track if anything is loading
    if (!anyLoading) {
      // Add a delay before hiding the loading panel
      const timer = setTimeout(() => {
        setIsLoading(false);
      }, 800); // 800ms = 0.8 second delay

      // Clear the timeout if the component unmounts or dependencies change
      return () => clearTimeout(timer);
    } else {
      // If anything is loading, immediately show the loading status
      setIsLoading(true);
    }
  }, [loadingStates]);

  useEffect(() => {
    function handleClickOutside(event: MouseEvent) {
      if (
        popupRef.current &&
        !popupRef.current.contains(event.target as Node)
      ) {
        // Close all popups when clicking outside
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

    // Add event listener if any popup is open
    if (
      showPopup.masterCodes ||
      showPopup.driverList ||
      showPopup.blacklistDrivers ||
      showPopup.expiredLicenses ||
      showPopup.vehicleLogins ||
      showPopup.lastDriverLogins ||
      showPopup.messagesSent
    ) {
      document.addEventListener('mousedown', handleClickOutside);
    }

    // Cleanup the event listener
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

  const handleFirstTimeSelect = (
    e: React.ChangeEvent<HTMLSelectElement>
  ) => {
    const selected = availableTimes1.find(
      (t) => t.time === e.target.value
    );
    setSelectedFirstTime(selected?.time || '');
    setSelectedSnapshotId1(selected?.ID || null);
  };

  const handleSecondTimeSelect = (
    e: React.ChangeEvent<HTMLSelectElement>
  ) => {
    const selected = availableTimes2.find(
      (t) => t.time === e.target.value
    );
    setSelectedSecondTime(selected?.time || '');
    setSelectedSnapshotId2(selected?.ID || null);
  };

  // ✅ Fetch dates on component mount

  // Add this clearDateFilters function to your VehicleDashboard component

  const clearDateFilters = () => {
    // Clear date selections
    setSelectedFirstDate(null);
    setSelectedSecondDate(null);

    // Clear time selections
    setSelectedFirstTime(null);
    setSelectedSecondTime(null);

    // Clear snapshot IDs
    setSelectedSnapshotId1(null);
    setSelectedSnapshotId2(null);

    // Clear available times
    setAvailableTimes1([]);
    setAvailableTimes2([]);

    // Clear snapshot data
    setSnapshotData({});
  };

  const fetchSnapshots = async () => {
    setLoadingSnapshots(true);

    if (!selectedFirstTime || !selectedSecondTime) {
      console.error('Missing snapshot times');
      return;
    }

    // Get the filters from local storage.
    const customer = localStorage.getItem('selectedCustomer');
    const site = localStorage.getItem('selectedSite'); // optional
    const gmptCode = localStorage.getItem('selectedGmpt'); // optional

    // Create the URL and append parameters.
    const url = new URL('http://localhost:8080/api/snapshots');
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
      console.log('Snapshot data:', data);
      setSnapshotData(data);
    } catch (error) {
      console.error('Failed to fetch snapshots:', error);
    } finally {
      setTimeout(() => {
        setLoadingSnapshots(false);
      }, 500);
    }
  };

  // Fetch vehicles when the component loads
  useEffect(() => {
    console.log('Loading state:', loading);
    fetchDates();

    const handleStorageChange = (event: StorageEvent) => {
      console.log('event.key', event.key);
      if (
        event.key === 'selectedCustomer' ||
        event.key === 'selectedSite'
      ) {
        console.log('this is actually making my method reset');
      }
    };

    window.addEventListener('storage', handleStorageChange);

    return () => {
      window.removeEventListener('storage', handleStorageChange);
    };
  }, []);

  // Data for popups
  const driverList: Driver[] = Array.from({ length: 40 }, (_, i) => ({
    firstName: `Driver${i + 1}`,
    lastName: `LastName${i + 1}`,
  }));

  const togglePopup = (
    key: keyof PopupState,
    vehicleId: string | number | null = null
  ) => {
    setShowPopup((prev) => ({
      ...prev,
      [key]: !prev[key],
    }));
    setActiveVehicleId(vehicleId);
  };

  interface SnapshotCardProps {
    snapshot: SnapshotRow;
    bothSnaps?: any;
    isAfter?: boolean;
  }

  const SnapshotCard: React.FC<SnapshotCardProps> = ({
    snapshot,
    bothSnaps,
    isAfter,
  }) => {
    const compareBeforeAfterSnaps = (attributeName: string) => {
      if (isAfter && bothSnaps) {
        return bothSnaps.before[attributeName] !==
          bothSnaps.after[attributeName]
          ? 'bg-yellow-300'
          : '';
      }
      return '';
    };

    const vehicleSummary = useMemo(() => {
      if (!vehicles || vehicles.length === 0) {
        return { total: 0, active: 0, inactive: 0 };
      }
      return {
        total: vehicles.length,
        active: vehicles.filter(
          (v) => v.status && v.status.toLowerCase() === 'online'
        ).length,
        inactive: vehicles.filter(
          (v) => v.status && v.status.toLowerCase() === 'offline'
        ).length,
      };
    }, [vehicles]);

    if (loadingVehicles || loadingSnapshots) {
      console.log('Loading state:', loadingVehicles, loadingSnapshots); // Debugging
      return (
        <div className='flex justify-center items-center h-screen'>
          <svg
            className='animate-spin h-12 w-12 text-blue-600'
            xmlns='http://www.w3.org/2000/svg'
            fill='none'
            viewBox='0 0 24 24'
          >
            <circle
              className='opacity-25'
              cx='12'
              cy='12'
              r='10'
              stroke='currentColor'
              strokeWidth='4'
            ></circle>
            <path
              className='opacity-75'
              fill='currentColor'
              d='M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z'
            ></path>
          </svg>
        </div>
      );
    }

    return (
      <div className='bg-white shadow-lg rounded-lg p-6 border border-gray-300'>
        {/* Top Section: Image and Basic Details */}
        <div className='grid grid-cols-3 gap-4 items-start'>
          <div className='w-20 h-20 flex items-start justify-start'>
            <img
              src='/forklift.png'
              alt='Forklift'
              className='w-full h-full object-contain'
            />
          </div>
          <div className='col-span-2 text-center'>
            <h2 className='text-2xl font-bold text-gray-800'>
              {snapshot.vehicleName || 'N/A'}
            </h2>
            <p
              className={`text-base text-gray-600 ${compareBeforeAfterSnaps(
                'serialNumber'
              )}`}
            >
              <strong>Serial:</strong> {snapshot.serialNumber || 'N/A'}
            </p>
            <p className='text-base text-gray-600'>
              <strong>GMPT:</strong> {snapshot.gmptCode || 'N/A'}
            </p>
          </div>
        </div>

        {/* Middle Section: Vehicle Specs and Connection Info */}
        <div className='grid grid-cols-2 gap-4 mt-4'>
          <div>
            <p
              className={`text-base text-gray-600 ${compareBeforeAfterSnaps(
                'cust_id'
              )}`}
            >
              <strong>Customer:</strong> {snapshot.cust_id || 'N/A'}
            </p>
            <p
              className={`text-base text-gray-600 ${compareBeforeAfterSnaps(
                'site_id'
              )}`}
            >
              <strong>Site:</strong> {snapshot.site_id || 'N/A'}
            </p>
            <p
              className={`text-base text-gray-600 ${compareBeforeAfterSnaps(
                'dept_id'
              )}`}
            >
              <strong>Department:</strong> {snapshot.dept_id || 'N/A'}
            </p>
            <p
              className={`text-base text-gray-600 ${compareBeforeAfterSnaps(
                'screenVersion'
              )}`}
            >
              <strong>Screen Version:</strong> {snapshot.screenVersion}
            </p>
            <p
              className={`text-base text-gray-600 ${compareBeforeAfterSnaps(
                'expansionVersion'
              )}`}
            >
              <strong>ExpModu Version:</strong> {snapshot.expansionVersion}
            </p>
          </div>
          <div>
            <p
              className={`text-base text-gray-600 ${compareBeforeAfterSnaps(
                'firmwareVersion'
              )}`}
            >
              <strong>Firmware Version:</strong> {snapshot.firmwareVersion}
            </p>
            <p
              className={`text-base text-gray-600 ${compareBeforeAfterSnaps(
                'vehicleModel'
              )}`}
            >
              <strong>Vehicle Model:</strong> {snapshot.vehicleModel}
            </p>
            <p
              className={`text-base text-gray-600 ${compareBeforeAfterSnaps(
                'simNumber'
              )}`}
            >
              <strong>Sim Number:</strong> {snapshot.simNumber || 'N/A'}
            </p>
            <p
              className={`text-base text-gray-600 ${compareBeforeAfterSnaps(
                'lastConnection'
              )}`}
            >
              <strong>Last Connection:</strong>{' '}
              {snapshot.lastConnection
                ? new Date(snapshot.lastConnection).toLocaleString()
                : 'N/A'}
            </p>
          </div>
        </div>

        {/* Status */}
        <div className='text-center mt-4'>
          <p
            className={`text-lg font-bold ${
              snapshot.status === 'online'
                ? 'text-green-600'
                : 'text-red-600'
            }`}
          >
            <strong>Status: {snapshot.status || 'Unknown'}</strong>
          </p>
        </div>
        <hr className='border-gray-300 mb-4' />

        {/* Bottom Section: Additional Details */}
        <div className='grid grid-cols-2 gap-4 mt-4'>
          <div>
            <p>
              <span
                className={`${compareBeforeAfterSnaps('vorSetting')}${
                  snapshot.vorSetting == 'false'
                    ? 'text-green-500'
                    : 'text-red-500'
                }`}
              >
                <strong>VOR: </strong>{' '}
                {snapshot.vorSetting == 'false' ? 'Off' : 'On'}
              </span>
            </p>
            
            <p
              className={`text-base text-gray-600 ${compareBeforeAfterSnaps(
                'impactRecalibrationDate'
              )}`}
            >
              <strong>Recalibration Date:</strong>{' '}
              {snapshot.impactRecalibrationDate
                ? new Date(
                    snapshot.impactRecalibrationDate
                  ).toLocaleString()
                : 'N/A'}
            </p>
            <p>
              <span
                className={
                  snapshot.impactLockout
                    ? 'text-green-500' // If false/null, Unlocked (Green)
                    : 'text-red-500' // If true, Locked (Red)
                }
              >
                <strong>Impact Lockouts:</strong>{' '}
                {snapshot.impactLockout ? 'On' : 'Off'}
              </span>
            </p>

            <p
              className={`text-base text-gray-600 ${compareBeforeAfterSnaps(
                'fullLockoutTimeout'
              )}`}
            >
              <strong>Full Lockout Timeout:</strong>{' '}
              {snapshot.fullLockoutTimeout || 'N/A'}s
            </p>
            <p
              className={`text-base text-gray-600 ${compareBeforeAfterSnaps(
                'surveyTimeout'
              )}`}
            >
              <strong>Checklist Timeout:</strong>{' '}
              {snapshot.surveyTimeout || 'N/A'}s
            </p>
          </div>
          <div>
            <p>
              <span
                className={`${compareBeforeAfterSnaps('lockoutCode')}${
                  snapshot.lockoutCode?.toString().trim() === '0'
                    ? 'text-green-500' // If "0", Unlocked (Green)
                    : 'text-red-500' // If not "0", Locked (Red)
                }`}
              >
                <strong>Lockout Status:</strong>{' '}
                {snapshot.lockoutCode?.toString().trim() === '0'
                  ? 'Unlocked'
                  : 'Locked'}
              </span>
            </p>
            <p
              className={`text-base text-gray-600 ${compareBeforeAfterSnaps(
                'preopSchedule'
              )}`}
            >
              <strong>Checklist Schedule:</strong>{' '}
              {snapshot.preopSchedule || 'N/A'}
            </p>
            <p
              className={` ${compareBeforeAfterSnaps(
                'redImpactThreshold'
              )}${
                snapshot.redImpactThreshold !== null &&
                snapshot.redImpactThreshold > 0.0
                  ? 'text-green-500'
                  : 'text-red-500'
              }`}
            >
              <strong>Red Impact Threshold: </strong>{' '}
              {snapshot.redImpactThreshold}g
            </p>
            <p>
              <span
                className={`${compareBeforeAfterSnaps(
                  'fullLockoutEnabled'
                )}${
                  snapshot.fullLockoutEnabled
                    ? 'text-green-500'
                    : 'text-red-500'
                } 
                `}
              >
                <strong>Full Lockout:</strong>{' '}
                {snapshot.fullLockoutEnabled ? 'On' : 'Off'}
              </span>
            </p>

            <p
              className={`text-base text-gray-600 ${compareBeforeAfterSnaps(
                'seatIdle'
              )}`}
            >
              <strong>Idle Timeout:</strong> {snapshot.seatIdle || 'N/A'}s
            </p>
            <p
              className={`text-base text-gray-600 ${compareBeforeAfterSnaps(
                'canRulesLoaded'
              )}`}
            >
              <strong>Can Rules Loaded:</strong>{' '}
              {snapshot.canRulesLoaded || 'N/A'}
            </p>
          </div>
        </div>
      </div>
    );
  };

  return (
    <div>
      <div>
        <NavBar />
        <Navsearch onFilterChange={fetchVehicles} />
        {/* Show loading overlay when loadingVehicles is true */}
        {loadingVehicles && (
          <LoadingOverlay message='Loading vehicles...' />
        )}  {/* This closing bracket was missing */}

        {Object.keys(snapshotData).length === 0 && (
          <p className="text-center text-gray-600">No snapshot data available.</p>
        )}

        {loadingSnapshots && (
          <LoadingOverlay message='Loading snapshots...' />
        )}
        <div className='bg-gray-100 min-h-screen p-8'>
          {/* Title with Date & Time Filters */}
          <h1 className='text-4xl font-bold text-gray-800 text-center py-5'>
            Vehicle Diagnostics Dashboard
          </h1>
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
                    dateFormat='dd/MM/yyyy'
                    className='border border-gray-300 rounded-md px-2 py-1 text-black w-full'
                  />
                  <label className='block text-base font-medium text-gray-700 mt-2 mb-1'>
                    First Time
                  </label>
                  <select
                    onChange={handleFirstTimeSelect}
                    value={selectedFirstTime as string}
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
                            (d) =>
                              d.getTime() > selectedFirstDate.getTime()
                          )
                        : dates
                    }
                    dateFormat='dd/MM/yyyy'
                    className='border border-gray-300 rounded-md px-2 py-1 text-black w-full'
                  />
                  <label className='block text-base font-medium text-gray-700 mt-2 mb-1'>
                    Second Time
                  </label>
                  <select
                    onChange={handleSecondTimeSelect}
                    value={selectedSecondTime as string}
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
          </div>

          {/* Vehicle Cards with Progressive Loading */}
          
          <div className="mb-6">
            <div className="bg-white shadow-lg rounded-lg p-6 border border-gray-200">
              <h2 className="text-xl font-bold text-gray-800 mb-4">Vehicle Status Summary</h2>
              <div className="grid grid-cols-5 gap-4">
                {/* Total vehicles */}
                <div className="bg-blue-50 p-4 rounded-lg border border-blue-200">
                  <p className="text-4xl font-bold text-blue-600">{vehicles.length}</p>
                  <p className="text-sm text-gray-600 mt-1">Total Vehicles</p>
                </div>
                
                {/* Online vehicles */}
                <div className="bg-green-50 p-4 rounded-lg border border-green-200">
                  <p className="text-4xl font-bold text-green-600">
                    {vehicles.filter(v => v.vehicle_info.status === 'online').length}
                  </p>
                  <p className="text-sm text-gray-600 mt-1">Online Vehicles</p>
                </div>
                
                {/* Currently offline vehicles */}
                <div className="bg-gray-50 p-4 rounded-lg border border-gray-200">
                  <p className="text-4xl font-bold text-gray-600">
                    {vehicles.filter(v => v.vehicle_info.status === 'offline').length}
                  </p>
                  <p className="text-sm text-gray-600 mt-1">Currently Offline</p>
                </div>
                
                {/* Offline more than 3 days */}
                <div className="bg-orange-50 p-4 rounded-lg border border-orange-200">
                  <p className="text-4xl font-bold text-orange-600">
                    {vehicles.filter(v => {
                      if (v.vehicle_info.status !== 'offline') return false;
                      if (!v.vehicle_info.last_connection) return false;
                      
                      const lastConn = new Date(v.vehicle_info.last_connection);
                      const threeDaysAgo = new Date();
                      threeDaysAgo.setDate(threeDaysAgo.getDate() - 3);
                      
                      return lastConn < threeDaysAgo;
                    }).length}
                  </p>
                  <p className="text-sm text-gray-600 mt-1">Offline > 3 Days</p>
                </div>
                
                {/* Offline more than 2 weeks */}
                <div className="bg-red-50 p-4 rounded-lg border border-red-200">
                  <p className="text-4xl font-bold text-red-600">
                    {vehicles.filter(v => {
                      if (v.vehicle_info.status !== 'offline') return false;
                      if (!v.vehicle_info.last_connection) return false;
                      
                      const lastConn = new Date(v.vehicle_info.last_connection);
                      const twoWeeksAgo = new Date();
                      twoWeeksAgo.setDate(twoWeeksAgo.getDate() - 14);
                      
                      return lastConn < twoWeeksAgo;
                    }).length}
                  </p>
                  <p className="text-sm text-gray-600 mt-1">Offline > 2 Weeks</p>
                </div>
              </div>
            </div>
          </div>


          {Object.keys(snapshotData).length === 0 && (
             <div className='grid grid-cols-3 gap-6'>
              {/* Data Loading Status Panel */}
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
                            ? 'text-blue-500'
                            : 'text-green-500'
                        }
                      >
                        {loadingStates.vehicles ? 'Loading' : 'Loaded'}{' '}
                        Vehicles
                      </span>
                      {loadingStates.vehicles && (
                        <span className='ml-2 inline-block w-3 h-3 border-2 border-t-blue-500 border-r-transparent border-b-transparent border-l-transparent rounded-full animate-spin'></span>
                      )}
                    </li>
                    <li className='flex items-center'>
                      <span
                        className={
                          loadingStates.masterCodes
                            ? 'text-blue-500'
                            : 'text-green-500'
                        }
                      >
                        {loadingStates.masterCodes ? 'Loading' : 'Loaded'}{' '}
                        Master Codes
                      </span>
                      {loadingStates.masterCodes && (
                        <span className='ml-2 inline-block w-3 h-3 border-2 border-t-blue-500 border-r-transparent border-b-transparent border-l-transparent rounded-full animate-spin'></span>
                      )}
                    </li>
                    <li className='flex items-center'>
                      <span
                        className={
                          loadingStates.blacklistedDrivers
                            ? 'text-blue-500'
                            : 'text-green-500'
                        }
                      >
                        {loadingStates.blacklistedDrivers
                          ? 'Loading'
                          : 'Loaded'}{' '}
                        Blacklisted Drivers
                      </span>
                      {loadingStates.blacklistedDrivers && (
                        <span className='ml-2 inline-block w-3 h-3 border-2 border-t-blue-500 border-r-transparent border-b-transparent border-l-transparent rounded-full animate-spin'></span>
                      )}
                    </li>
                    <li className='flex items-center'>
                      <span
                        className={
                          loadingStates.vehicleLogins
                            ? 'text-blue-500'
                            : 'text-green-500'
                        }
                      >
                        {loadingStates.vehicleLogins
                          ? 'Loading'
                          : 'Loaded'}{' '}
                        Vehicle Logins
                      </span>
                      {loadingStates.vehicleLogins && (
                        <span className='ml-2 inline-block w-3 h-3 border-2 border-t-blue-500 border-r-transparent border-b-transparent border-l-transparent rounded-full animate-spin'></span>
                      )}
                    </li>
                    <li className='flex items-center'>
                      <span
                        className={
                          loadingStates.lastDriverLogins
                            ? 'text-blue-500'
                            : 'text-green-500'
                        }
                      >
                        {loadingStates.lastDriverLogins
                          ? 'Loading'
                          : 'Loaded'}{' '}
                        Last Driver Logins
                      </span>
                      {loadingStates.lastDriverLogins && (
                        <span className='ml-2 inline-block w-3 h-3 border-2 border-t-blue-500 border-r-transparent border-b-transparent border-l-transparent rounded-full animate-spin'></span>
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
                  {/* Adjusted grid layout for top section */}
                  <div className='grid grid-cols-3 gap-4 items-start'>
                    {/* Adjusted Image Size & Positioning */}
                    <div className='w-20 h-20 flex items-start justify-start'>
                      <img
                        src='/forklift.png'
                        alt='Forklift'
                        className='w-full h-full object-contain'
                      />
                    </div>
                    {/* Vehicle Identification Details */}
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

                  {/* Vehicle Specs and Status */}
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
                      <p className='text-base text-gray-600'>
                        <strong>Last Connection:</strong>{' '}
                        {vehicle.vehicle_info.last_connection}
                      </p>
                      <p className='text-base text-gray-600'>
                        <strong>Last Driver List sync:</strong>{' '}
                        {vehicle.vehicle_info.last_dlist_timestamp}
                      </p>
                      <p className='text-base text-gray-600'>
                        <strong>Last Checklist sync:</strong>{' '}
                        {vehicle.vehicle_info.last_preop_timestamp}
                      </p>
                    </div>
                  </div>

                  {/* Status */}
                  <div className='text-center mt-4'>
                    <p
                      className={`text-lg font-bold ${
                        vehicle.vehicle_info.status === 'online'
                          ? 'text-green-600'
                          : 'text-red-600'
                      }`}
                    >
                      <strong>
                        Status: {vehicle.vehicle_info.status}
                      </strong>
                    </p>
                  </div>

                  <hr className='border-gray-300 mb-4' />
                  <div className='grid grid-cols-2 gap-4 text-base text-gray-600'>
                    <p>
                      <span
                        className={
                          vehicle.vehicle_info.vor_setting == false
                            ? 'text-green-500'
                            : 'text-red-500'
                        }
                      >
                        <strong>VOR: </strong>{' '}
                        {vehicle.vehicle_info.vor_setting == false
                          ? 'Off'
                          : 'On'}
                      </span>
                    </p>
                    <p>
                      <span
                        className={
                          vehicle.vehicle_info.lockout_code
                            ?.toString()
                            .trim() === '0'
                            ? 'text-green-500' // If "0", Unlocked (Green)
                            : 'text-red-500' // If not "0", Locked (Red)
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
                      <strong>Checklist Schedule:</strong>{' '}
                      {vehicle.vehicle_info.preop_schedule}
                    </p>
                    <p>
                      <strong>Recalibration Date:</strong>{' '}
                      {vehicle.vehicle_info.impact_recalibration_date}
                    </p>
                    <p
                      className={` ${
                        vehicle.vehicle_info.red_impact_threshold !==
                          null &&
                        vehicle.vehicle_info.red_impact_threshold > 0.0
                          ? 'text-green-500'
                          : 'text-red-500'
                      }`}
                    >
                      <strong>Red Impact Threshold: </strong>{' '}
                      {vehicle.vehicle_info.red_impact_threshold}g
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
                        {vehicle.vehicle_info.impact_lockout
                          ? 'On'
                          : 'Off'}
                      </span>
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
                    <p className='text-gray-600 text-base'>
                      <strong>Checklist Timeout:</strong>{' '}
                      {vehicle.vehicle_info.survey_timeout}s
                    </p>
                    <p className='text-gray-600 text-base'>
                      <strong>Can-Rules Loaded:</strong>{' '}
                      {vehicle.vehicle_info.can_rules_loaded
                        ? 'Yes'
                        : 'No'}
                    </p>
                    {/* Master Codes Popup - Updated with search filter */}
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
{showPopup.masterCodes &&
  activeVehicleId === vehicle.VEHICLE_CD && (
    <div className='fixed inset-0 bg-black bg-opacity-50 flex justify-center items-center z-50'>
      <div
        ref={popupRef}
        className='bg-white p-6 rounded-lg shadow-lg w-3/4 max-h-[80vh] overflow-y-auto'
      >
        <h3 className='text-lg font-semibold mb-4'>
          Master Codes for{' '}
          {vehicle.vehicle_info.vehicle_name} (
          {vehicle.vehicle_info.gmpt_code})
        </h3>
        
        {/* Search filter input */}
        <div className="mb-4">
          <input
            type="text"
            placeholder="Search master codes..."
            className="w-full px-4 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
            onChange={(e) => {
              // Store search value in a local variable
              const searchValue = e.target.value.toLowerCase();
              
              // Re-render will use this value to filter the table
              e.target.setAttribute('data-search-mastercode', searchValue);
              // Force re-render of the component
              setShowPopup(prev => ({ ...prev }));
            }}
          />
        </div>

        {loadingStates.masterCodes ? (
          <div className='flex items-center text-blue-500'>
            <span className='mr-2 inline-block w-4 h-4 border-2 border-t-blue-500 border-r-transparent border-b-transparent border-l-transparent rounded-full animate-spin'></span>
            Loading master codes...
          </div>
        ) : masterCodesByVehicle[vehicle.VEHICLE_CD]?.length > 0 ? (
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
                {masterCodesByVehicle[vehicle.VEHICLE_CD]
                  .filter(user => {
                    // Get the current search value from the input element
                    const searchInput = document.querySelector('[data-search-mastercode]');
                    const searchValue = searchInput ? searchInput.getAttribute('data-search-mastercode') || '' : '';
                    
                    if (!searchValue) return true; // If no search, show all
                    
                    // Search in master code user
                    return user.master_code_user && user.master_code_user.toLowerCase().includes(searchValue);
                  })
                  .map((user, idx) => (
                    <tr
                      key={idx}
                      className='h-12 border-b border-gray-200'
                    >
                      <td className='text-left pl-4'>
                        {user.master_code_user}
                      </td>
                    </tr>
                  ))}
              </tbody>
            </table>
            
            {/* No results message */}
            {(() => {
              const searchInput = document.querySelector('[data-search-mastercode]');
              const searchValue = searchInput ? searchInput.getAttribute('data-search-mastercode') || '' : '';
              const filteredUsers = masterCodesByVehicle[vehicle.VEHICLE_CD].filter(user => {
                if (!searchValue) return true;
                return user.master_code_user && user.master_code_user.toLowerCase().includes(searchValue);
              });
              
              if (searchValue && filteredUsers.length === 0) {
                return (
                  <div className="text-center py-4 text-gray-500">
                    No master codes match your search
                  </div>
                );
              }
              return null;
            })()}
          </div>
        ) : (
          <p className='text-gray-600'>
            No master codes found.
          </p>
        )}

        {/* Show filter stats */}
        {(() => {
          const searchInput = document.querySelector('[data-search-mastercode]');
          const searchValue = searchInput ? searchInput.getAttribute('data-search-mastercode') || '' : '';
          
          if (searchValue && masterCodesByVehicle[vehicle.VEHICLE_CD]?.length > 0) {
            const filteredCount = masterCodesByVehicle[vehicle.VEHICLE_CD].filter(user => {
              return user.master_code_user && user.master_code_user.toLowerCase().includes(searchValue);
            }).length;
            
            return (
              <div className="mt-2 text-sm text-gray-600">
                Showing {filteredCount} of {masterCodesByVehicle[vehicle.VEHICLE_CD].length} master codes
              </div>
            );
          }
          return null;
        })()}

        <button
          className='mt-4 bg-blue-500 text-white px-4 py-2 rounded-md hover:bg-blue-700'
          onClick={() => togglePopup('masterCodes')}
        >
          Close
        </button>
      </div>
    </div>
  )}

  {/* Blacklisted Drivers Popup - Updated with search filter */}
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
                  {showPopup.blacklistDrivers &&
                    activeVehicleId === vehicle.VEHICLE_CD && (
                      <div className='fixed inset-0 bg-black bg-opacity-50 flex justify-center items-center z-50'>
                        <div
                          ref={popupRef}
                          className='bg-white p-6 rounded-lg shadow-lg w-3/4 max-h-[80vh] overflow-y-auto'
                        >
                          <h3 className='text-lg font-semibold mb-4'>
                            Drivers on Blacklist for{' '}
                            {vehicle.vehicle_info.vehicle_name} (
                            {vehicle.vehicle_info.gmpt_code})
                          </h3>

                          {/* Search filter input */}
                          <div className="mb-4">
                            <input
                              type="text"
                              placeholder="Search drivers..."
                              className="w-full px-4 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                              onChange={(e) => {
                                // Store search value in a local variable
                                const searchValue = e.target.value.toLowerCase();
                                
                                // Re-render will use this value to filter the table
                                e.target.setAttribute('data-search', searchValue);
                                // Force re-render of the component
                                setShowPopup(prev => ({ ...prev }));
                              }}
                            />
                          </div>

                          {loadingStates.blacklistedDrivers ? (
                            <div className='flex items-center text-blue-500'>
                              <span className='mr-2 inline-block w-4 h-4 border-2 border-t-blue-500 border-r-transparent border-b-transparent border-l-transparent rounded-full animate-spin'></span>
                              Loading blacklisted drivers...
                            </div>
                          ) : blacklistedDriversByVehicle[vehicle.VEHICLE_CD]?.length > 0 ? (
                            <div className='overflow-x-auto'>
                              <table className='min-w-full bg-white'>
                                <thead>
                                  <tr className='w-full h-16 border-b border-gray-200 bg-gray-50'>
                                    <th className='text-left pl-4'>
                                      Driver Name
                                    </th>
                                    <th className='text-left pl-4'>
                                      Driver ID
                                    </th>
                                  </tr>
                                </thead>
                                <tbody>
                                  {/* Filter drivers based on search input */}
                                  {blacklistedDriversByVehicle[vehicle.VEHICLE_CD]
                                    .filter(driver => {
                                      // Get the current search value from the input element
                                      const searchInput = document.querySelector('[data-search]');
                                      const searchValue = searchInput ? searchInput.getAttribute('data-search') || '' : '';
                                      
                                      if (!searchValue) return true; // If no search, show all
                                      
                                      // Search in driver name and ID
                                      return (
                                        (driver.driver_name && driver.driver_name.toLowerCase().includes(searchValue)) ||
                                        (driver.driver_id && driver.driver_id.toLowerCase().includes(searchValue))
                                      );
                                    })
                                    .map((driver, idx) => (
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
                                      </tr>
                                    ))}
                                </tbody>
                              </table>
                              
                              {/* No results message */}
                              {(() => {
                                const searchInput = document.querySelector('[data-search]');
                                const searchValue = searchInput ? searchInput.getAttribute('data-search') || '' : '';
                                const filteredDrivers = blacklistedDriversByVehicle[vehicle.VEHICLE_CD].filter(driver => {
                                  if (!searchValue) return true;
                                  return (
                                    (driver.driver_name && driver.driver_name.toLowerCase().includes(searchValue)) ||
                                    (driver.driver_id && driver.driver_id.toLowerCase().includes(searchValue))
                                  );
                                });
                                
                                if (searchValue && filteredDrivers.length === 0) {
                                  return (
                                    <div className="text-center py-4 text-gray-500">
                                      No drivers match your search
                                    </div>
                                  );
                                }
                                return null;
                              })()}
                            </div>
                          ) : (
                            <p className='text-gray-600'>
                              No blacklisted drivers found.
                            </p>
                          )}

                          {/* Show filter stats */}
                          {(() => {
                            const searchInput = document.querySelector('[data-search]');
                            const searchValue = searchInput ? searchInput.getAttribute('data-search') || '' : '';
                            
                            if (searchValue && blacklistedDriversByVehicle[vehicle.VEHICLE_CD]?.length > 0) {
                              const filteredCount = blacklistedDriversByVehicle[vehicle.VEHICLE_CD].filter(driver => {
                                return (
                                  (driver.driver_name && driver.driver_name.toLowerCase().includes(searchValue)) ||
                                  (driver.driver_id && driver.driver_id.toLowerCase().includes(searchValue))
                                );
                              }).length;
                              
                              return (
                                <div className="mt-2 text-sm text-gray-600">
                                  Showing {filteredCount} of {blacklistedDriversByVehicle[vehicle.VEHICLE_CD].length} drivers
                                </div>
                              );
                            }
                            return null;
                          })()}

                          <button
                            className='mt-4 bg-blue-500 text-white px-4 py-2 rounded-md hover:bg-blue-700'
                            onClick={() => togglePopup('blacklistDrivers')}
                          >
                            Close
                          </button>
                        </div>
                      </div>
                    )}

                    {/* Vehicle Logins Popup with Enhanced Search Filter */}

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
                    {showPopup.vehicleLogins &&
                      activeVehicleId === vehicle.VEHICLE_CD && (
                        <div className='fixed inset-0 bg-black bg-opacity-50 flex justify-center items-center z-50'>
                          <div
                            ref={popupRef}
                            className='bg-white p-6 rounded-lg shadow-lg w-3/4 max-h-[80vh] overflow-y-auto'
                          >
                            <h3 className='text-lg font-semibold mb-4'>
                              Recent vehicle logins for{' '}
                              {vehicle.vehicle_info.vehicle_name} (
                              {vehicle.vehicle_info.gmpt_code})
                            </h3>

                            {/* Search filter input - now searches all columns */}
                            <div className="mb-4">
                              <input
                                type="text"
                                placeholder="Search logins across all fields..."
                                className="w-full px-4 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                                onChange={(e) => {
                                  // Store search value in a local variable
                                  const searchValue = e.target.value.toLowerCase();
                                  
                                  // Re-render will use this value to filter the table
                                  e.target.setAttribute('data-search-logins', searchValue);
                                  // Force re-render of the component
                                  setShowPopup(prev => ({ ...prev }));
                                }}
                              />
                            </div>

                            {loadingStates.vehicleLogins ? (
                              <div className='flex items-center text-blue-500'>
                                <span className='mr-2 inline-block w-4 h-4 border-2 border-t-blue-500 border-r-transparent border-b-transparent border-l-transparent rounded-full animate-spin'></span>
                                Loading vehicle logins...
                              </div>
                            ) : vehicleLoginsByVehicle[vehicle.VEHICLE_CD]?.length > 0 ? (
                              <div className='overflow-x-auto'>
                                <table className='min-w-full bg-white'>
                                  <thead>
                                    <tr className='w-full h-16 border-b border-gray-200 bg-gray-50'>
                                      <th className='text-left pl-4'>Driver Name</th>
                                      <th className='text-left pl-4'>Driver ID</th>
                                      <th className='text-left pl-4'>Facility code</th>
                                      <th className='text-left pl-4'>Login Time</th>
                                      <th className='text-left pl-4'>Accepted</th>
                                    </tr>
                                  </thead>
                                  <tbody>
                                    {vehicleLoginsByVehicle[vehicle.VEHICLE_CD]
                                      .filter(login => {
                                        // Get the current search value from the input element
                                        const searchInput = document.querySelector('[data-search-logins]');
                                        const searchValue = searchInput ? searchInput.getAttribute('data-search-logins') || '' : '';
                                        
                                        if (!searchValue) return true; // If no search, show all
                                        
                                        // Convert login time to string for searching
                                        const loginTimeStr = login.login_time
                                          ? typeof login.login_time === 'string'
                                            ? login.login_time.toLowerCase()
                                            : new Date(login.login_time).toLocaleString('en-GB', {
                                                day: '2-digit',
                                                month: '2-digit',
                                                year: 'numeric',
                                                hour: '2-digit',
                                                minute: '2-digit',
                                                hour12: false,
                                              }).toLowerCase()
                                          : '';

                                        // Convert accepted status to string for searching
                                        const acceptedStr = login.accepted !== undefined
                                          ? login.accepted ? 'yes' : 'no'
                                          : 'unknown';
                                        
                                        // Search in ALL fields
                                        return (
                                          (login.driver_name && login.driver_name.toLowerCase().includes(searchValue)) ||
                                          (login.driver_id && login.driver_id.toLowerCase().includes(searchValue)) ||
                                          (login.facility_code && login.facility_code.toLowerCase().includes(searchValue)) ||
                                          loginTimeStr.includes(searchValue) ||
                                          acceptedStr.includes(searchValue)
                                        );
                                      })
                                      .map((login, idx) => (
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
                                          <td className='text-left pl-4'>{login.driver_name || 'Unknown'}</td>
                                          <td className='text-left pl-4'>{login.driver_id || 'N/A'}</td>
                                          <td className='text-left pl-4'>{login.facility_code || 'N/A'}</td>
                                          <td className='text-left pl-4'>
                                            {login.login_time
                                              ? typeof login.login_time === 'string'
                                                ? login.login_time
                                                : new Date(login.login_time).toLocaleString('en-GB', {
                                                    day: '2-digit',
                                                    month: '2-digit',
                                                    year: 'numeric',
                                                    hour: '2-digit',
                                                    minute: '2-digit',
                                                    hour12: false,
                                                  })
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
                                      ))}
                                  </tbody>
                                </table>
                                
                                {/* No results message */}
                                {(() => {
                                  const searchInput = document.querySelector('[data-search-logins]');
                                  const searchValue = searchInput ? searchInput.getAttribute('data-search-logins') || '' : '';
                                  const filteredLogins = vehicleLoginsByVehicle[vehicle.VEHICLE_CD].filter(login => {
                                    if (!searchValue) return true;

                                    // Convert login time to string for searching
                                    const loginTimeStr = login.login_time
                                      ? typeof login.login_time === 'string'
                                        ? login.login_time.toLowerCase()
                                        : new Date(login.login_time).toLocaleString('en-GB', {
                                            day: '2-digit',
                                            month: '2-digit',
                                            year: 'numeric',
                                            hour: '2-digit',
                                            minute: '2-digit',
                                            hour12: false,
                                          }).toLowerCase()
                                      : '';

                                    // Convert accepted status to string for searching
                                    const acceptedStr = login.accepted !== undefined
                                      ? login.accepted ? 'yes' : 'no'
                                      : 'unknown';
                                    
                                    // Search in ALL fields
                                    return (
                                      (login.driver_name && login.driver_name.toLowerCase().includes(searchValue)) ||
                                      (login.driver_id && login.driver_id.toLowerCase().includes(searchValue)) ||
                                      (login.facility_code && login.facility_code.toLowerCase().includes(searchValue)) ||
                                      loginTimeStr.includes(searchValue) ||
                                      acceptedStr.includes(searchValue)
                                    );
                                  });
                                  
                                  if (searchValue && filteredLogins.length === 0) {
                                    return (
                                      <div className="text-center py-4 text-gray-500">
                                        No logins match your search
                                      </div>
                                    );
                                  }
                                  return null;
                                })()}
                              </div>
                            ) : (
                              <p className='text-gray-600'>
                                No vehicle logins found in the last 7 days.
                              </p>
                            )}
                            
                            {/* Show filter stats */}
                            {(() => {
                              const searchInput = document.querySelector('[data-search-logins]');
                              const searchValue = searchInput ? searchInput.getAttribute('data-search-logins') || '' : '';
                              
                              if (searchValue && vehicleLoginsByVehicle[vehicle.VEHICLE_CD]?.length > 0) {
                                const filteredCount = vehicleLoginsByVehicle[vehicle.VEHICLE_CD].filter(login => {
                                  // Convert login time to string for searching
                                  const loginTimeStr = login.login_time
                                    ? typeof login.login_time === 'string'
                                      ? login.login_time.toLowerCase()
                                      : new Date(login.login_time).toLocaleString('en-GB', {
                                          day: '2-digit',
                                          month: '2-digit',
                                          year: 'numeric',
                                          hour: '2-digit',
                                          minute: '2-digit',
                                          hour12: false,
                                        }).toLowerCase()
                                    : '';

                                  // Convert accepted status to string for searching
                                  const acceptedStr = login.accepted !== undefined
                                    ? login.accepted ? 'yes' : 'no'
                                    : 'unknown';
                                  
                                  // Search in ALL fields
                                  return (
                                    (login.driver_name && login.driver_name.toLowerCase().includes(searchValue)) ||
                                    (login.driver_id && login.driver_id.toLowerCase().includes(searchValue)) ||
                                    (login.facility_code && login.facility_code.toLowerCase().includes(searchValue)) ||
                                    loginTimeStr.includes(searchValue) ||
                                    acceptedStr.includes(searchValue)
                                  );
                                }).length;
                                
                                return (
                                  <div className="mt-2 text-sm text-gray-600">
                                    Showing {filteredCount} of {vehicleLoginsByVehicle[vehicle.VEHICLE_CD].length} logins
                                  </div>
                                );
                              }
                              return null;
                            })()}

                            <button
                              className='mt-4 bg-blue-500 text-white px-4 py-2 rounded-md hover:bg-blue-700'
                              onClick={() => togglePopup('vehicleLogins')}
                            >
                              Close
                            </button>
                          </div>
                        </div>
                      )}
                      
                    {/* Last driver logins Popup with Search Filter */}
                  <button
                    className='text-blue-500 hover:underline mt-2 flex items-center'
                    onClick={() =>
                      togglePopup('lastDriverLogins', vehicle.VEHICLE_CD)
                    }
                  >
                    <span>Last 10 Drivers Loged in</span>
                    {loadingStates.lastDriverLogins &&
                      activeVehicleId === vehicle.VEHICLE_CD && (
                        <span className='ml-2 inline-block w-3 h-3 border-2 border-t-blue-500 border-r-transparent border-b-transparent border-l-transparent rounded-full animate-spin'></span>
                      )}
                  </button>
                  {showPopup.lastDriverLogins &&
                    activeVehicleId === vehicle.VEHICLE_CD && (
                      <div className='fixed inset-0 bg-black bg-opacity-50 flex justify-center items-center z-50'>
                        <div
                          ref={popupRef}
                          className='bg-white p-6 rounded-lg shadow-lg w-3/4 max-h-[80vh] overflow-y-auto'
                        >
                          <h3 className='text-lg font-semibold mb-4'>
                            Last 10 Drivers Loged in for{' '}
                            {vehicle.vehicle_info.vehicle_name} (
                            {vehicle.vehicle_info.gmpt_code})
                          </h3>

                          {/* Search filter input - searches all columns */}
                          <div className="mb-4">
                            <input
                              type="text"
                              placeholder="Search driver logins across all fields..."
                              className="w-full px-4 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                              onChange={(e) => {
                                // Store search value in a local variable
                                const searchValue = e.target.value.toLowerCase();
                                
                                // Re-render will use this value to filter the table
                                e.target.setAttribute('data-search-lastdriverlogins', searchValue);
                                // Force re-render of the component
                                setShowPopup(prev => ({ ...prev }));
                              }}
                            />
                          </div>

                          {loadingStates.lastDriverLogins ? (
                            <div className='flex items-center text-blue-500'>
                              <span className='mr-2 inline-block w-4 h-4 border-2 border-t-blue-500 border-r-transparent border-b-transparent border-l-transparent rounded-full animate-spin'></span>
                              Loading last driver login...
                            </div>
                          ) : lastDriverLoginsByVehicle[
                              vehicle.VEHICLE_CD
                            ]?.length > 0 ? (
                            <div className='overflow-x-auto'>
                              <table className='min-w-full bg-white'>
                                <thead>
                                  <tr className='w-full h-16 border-b border-gray-200 bg-gray-50'>
                                    <th className='text-left pl-4'>
                                      Driver Name
                                    </th>
                                    <th className='text-left pl-4'>
                                      Driver ID
                                    </th>
                                    <th className='text-left pl-4'>
                                      Login Time
                                    </th>
                                    <th className='text-left pl-4'>
                                      Accepted
                                    </th>
                                  </tr>
                                </thead>
                                <tbody>
                                  {lastDriverLoginsByVehicle[vehicle.VEHICLE_CD]
                                    .filter(login => {
                                      // Get the current search value from the input element
                                      const searchInput = document.querySelector('[data-search-lastdriverlogins]');
                                      const searchValue = searchInput ? searchInput.getAttribute('data-search-lastdriverlogins') || '' : '';
                                      
                                      if (!searchValue) return true; // If no search, show all
                                      
                                      // Convert login time to string for searching
                                      const loginTimeStr = login?.login_time
                                        ? typeof login.login_time === 'string'
                                          ? login.login_time.toLowerCase()
                                          : new Date(login.login_time).toLocaleString('en-GB', {
                                              day: '2-digit',
                                              month: '2-digit',
                                              year: 'numeric',
                                              hour: '2-digit',
                                              minute: '2-digit',
                                              hour12: false,
                                            }).toLowerCase()
                                        : '';

                                      // Convert accepted status to string for searching
                                      const acceptedStr = login?.accepted !== undefined
                                        ? login.accepted ? 'yes' : 'no'
                                        : 'unknown';
                                      
                                      // Search in ALL fields
                                      return (
                                        (login?.driver_name && login.driver_name.toLowerCase().includes(searchValue)) ||
                                        (login?.driver_id && login.driver_id.toLowerCase().includes(searchValue)) ||
                                        loginTimeStr.includes(searchValue) ||
                                        acceptedStr.includes(searchValue)
                                      );
                                    })
                                    .map((login, idx) => (
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
                                                ).toLocaleString('en-GB', {
                                                  day: '2-digit',
                                                  month: '2-digit',
                                                  year: 'numeric',
                                                  hour: '2-digit',
                                                  minute: '2-digit',
                                                  hour12: false,
                                                })
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
                                    ))}
                                </tbody>
                              </table>
                              
                              {/* No results message */}
                              {(() => {
                                const searchInput = document.querySelector('[data-search-lastdriverlogins]');
                                const searchValue = searchInput ? searchInput.getAttribute('data-search-lastdriverlogins') || '' : '';
                                const filteredLogins = lastDriverLoginsByVehicle[vehicle.VEHICLE_CD].filter(login => {
                                  if (!searchValue) return true;

                                  // Convert login time to string for searching
                                  const loginTimeStr = login?.login_time
                                    ? typeof login.login_time === 'string'
                                      ? login.login_time.toLowerCase()
                                      : new Date(login.login_time).toLocaleString('en-GB', {
                                          day: '2-digit',
                                          month: '2-digit',
                                          year: 'numeric',
                                          hour: '2-digit',
                                          minute: '2-digit',
                                          hour12: false,
                                        }).toLowerCase()
                                    : '';

                                  // Convert accepted status to string for searching
                                  const acceptedStr = login?.accepted !== undefined
                                    ? login.accepted ? 'yes' : 'no'
                                    : 'unknown';
                                  
                                  // Search in ALL fields
                                  return (
                                    (login?.driver_name && login.driver_name.toLowerCase().includes(searchValue)) ||
                                    (login?.driver_id && login.driver_id.toLowerCase().includes(searchValue)) ||
                                    loginTimeStr.includes(searchValue) ||
                                    acceptedStr.includes(searchValue)
                                  );
                                });
                                
                                if (searchValue && filteredLogins.length === 0) {
                                  return (
                                    <div className="text-center py-4 text-gray-500">
                                      No driver logins match your search
                                    </div>
                                  );
                                }
                                return null;
                              })()}
                            </div>
                          ) : (
                            <p className='text-gray-600'>
                              No login information available.
                            </p>
                          )}
                          
                          {/* Show filter stats */}
                          {(() => {
                            const searchInput = document.querySelector('[data-search-lastdriverlogins]');
                            const searchValue = searchInput ? searchInput.getAttribute('data-search-lastdriverlogins') || '' : '';
                            
                            if (searchValue && lastDriverLoginsByVehicle[vehicle.VEHICLE_CD]?.length > 0) {
                              const filteredCount = lastDriverLoginsByVehicle[vehicle.VEHICLE_CD].filter(login => {
                                // Convert login time to string for searching
                                const loginTimeStr = login?.login_time
                                  ? typeof login.login_time === 'string'
                                    ? login.login_time.toLowerCase()
                                    : new Date(login.login_time).toLocaleString('en-GB', {
                                        day: '2-digit',
                                        month: '2-digit',
                                        year: 'numeric',
                                        hour: '2-digit',
                                        minute: '2-digit',
                                        hour12: false,
                                      }).toLowerCase()
                                  : '';

                                // Convert accepted status to string for searching
                                const acceptedStr = login?.accepted !== undefined
                                  ? login.accepted ? 'yes' : 'no'
                                  : 'unknown';
                                
                                // Search in ALL fields
                                return (
                                  (login?.driver_name && login.driver_name.toLowerCase().includes(searchValue)) ||
                                  (login?.driver_id && login.driver_id.toLowerCase().includes(searchValue)) ||
                                  loginTimeStr.includes(searchValue) ||
                                  acceptedStr.includes(searchValue)
                                );
                              }).length;
                              
                              return (
                                <div className="mt-2 text-sm text-gray-600">
                                  Showing {filteredCount} of {lastDriverLoginsByVehicle[vehicle.VEHICLE_CD].length} driver logins
                                </div>
                              );
                            }
                            return null;
                          })()}

                          <button
                            className='mt-4 bg-blue-500 text-white px-4 py-2 rounded-md hover:bg-blue-700'
                            onClick={() => togglePopup('lastDriverLogins')}
                          >
                            Close
                          </button>
                        </div>
                      </div>
                    )}

                    {/* messagesSent Popup with Search Filter */}
                    <button
                      className='text-blue-500 hover:underline mt-2 flex items-center'
                      onClick={() =>
                        togglePopup('messagesSent', vehicle.VEHICLE_CD)
                      }
                    >
                      <span>Messages Sent (7 days)</span>
                      {loadingStates.MessageSent &&
                        activeVehicleId === vehicle.VEHICLE_CD && (
                          <span className='ml-2 inline-block w-3 h-3 border-2 border-t-blue-500 border-r-transparent border-b-transparent border-l-transparent rounded-full animate-spin'></span>
                        )}
                    </button>
                    {showPopup.messagesSent &&
                      activeVehicleId === vehicle.VEHICLE_CD && (
                        <div className='fixed inset-0 bg-black bg-opacity-50 flex justify-center items-center z-50'>
                          <div
                            ref={popupRef}
                            className='bg-white p-6 rounded-lg shadow-lg w-3/4 max-h-[80vh] overflow-y-auto'
                          >
                            <h3 className='text-lg font-semibold mb-4'>
                              Messages Sent to{' '}
                              {vehicle.vehicle_info.vehicle_name} (
                              {vehicle.vehicle_info.gmpt_code})
                            </h3>

                            {/* Search filter input */}
                            <div className="mb-4">
                              <input
                                type="text"
                                placeholder="Search messages across all fields..."
                                className="w-full px-4 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                                onChange={(e) => {
                                  // Store search value in a local variable
                                  const searchValue = e.target.value.toLowerCase();
                                  
                                  // Re-render will use this value to filter the table
                                  e.target.setAttribute('data-search-messages', searchValue);
                                  // Force re-render of the component
                                  setShowPopup(prev => ({ ...prev }));
                                }}
                              />
                            </div>

                            {loadingStates.MessageSent ? (
                              <div className='flex items-center text-blue-500'>
                                <span className='mr-2 inline-block w-4 h-4 border-2 border-t-blue-500 border-r-transparent border-b-transparent border-l-transparent rounded-full animate-spin'></span>
                                Loading messages...
                              </div>
                            ) : messagesSentByVehicle[vehicle.VEHICLE_CD]?.length > 0 ? (
                              <div className='overflow-x-auto'>
                                <table className='min-w-full bg-white'>
                                  <thead>
                                    <tr className='w-full h-16 border-b border-gray-200 bg-gray-50'>
                                      <th className='text-left pl-4'>
                                        Message Type
                                      </th>
                                      <th className='text-left pl-4'>
                                        Message
                                      </th>
                                      <th className='text-left pl-4'>
                                        Sent Time
                                      </th>
                                      <th className='text-left pl-4'>
                                        Status
                                      </th>
                                    </tr>
                                  </thead>
                                  <tbody>
                                    {messagesSentByVehicle[vehicle.VEHICLE_CD]
                                      .filter(msg => {
                                        // Get the current search value from the input element
                                        const searchInput = document.querySelector('[data-search-messages]');
                                        const searchValue = searchInput ? searchInput.getAttribute('data-search-messages') || '' : '';
                                        
                                        if (!searchValue) return true; // If no search, show all
                                        
                                        // Search in all message fields
                                        return (
                                          (msg.message_type && msg.message_type.toLowerCase().includes(searchValue)) ||
                                          (msg.message_text && msg.message_text.toLowerCase().includes(searchValue)) ||
                                          (msg.message_timestamp && msg.message_timestamp.toLowerCase().includes(searchValue)) ||
                                          (msg.status && msg.status.toLowerCase().includes(searchValue))
                                        );
                                      })
                                      .map((msg, idx) => (
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
                                      ))}
                                  </tbody>
                                </table>
                                
                                {/* No results message */}
                                {(() => {
                                  const searchInput = document.querySelector('[data-search-messages]');
                                  const searchValue = searchInput ? searchInput.getAttribute('data-search-messages') || '' : '';
                                  const filteredMessages = messagesSentByVehicle[vehicle.VEHICLE_CD].filter(msg => {
                                    if (!searchValue) return true;
                                    return (
                                      (msg.message_type && msg.message_type.toLowerCase().includes(searchValue)) ||
                                      (msg.message_text && msg.message_text.toLowerCase().includes(searchValue)) ||
                                      (msg.message_timestamp && msg.message_timestamp.toLowerCase().includes(searchValue)) ||
                                      (msg.status && msg.status.toLowerCase().includes(searchValue))
                                    );
                                  });
                                  
                                  if (searchValue && filteredMessages.length === 0) {
                                    return (
                                      <div className="text-center py-4 text-gray-500">
                                        No messages match your search
                                      </div>
                                    );
                                  }
                                  return null;
                                })()}
                              </div>
                            ) : (
                              <p className='text-gray-600'>
                                No messages found in the last 7 days.
                              </p>
                            )}
                            
                            {/* Show filter stats */}
                            {(() => {
                              const searchInput = document.querySelector('[data-search-messages]');
                              const searchValue = searchInput ? searchInput.getAttribute('data-search-messages') || '' : '';
                              
                              if (searchValue && messagesSentByVehicle[vehicle.VEHICLE_CD]?.length > 0) {
                                const filteredCount = messagesSentByVehicle[vehicle.VEHICLE_CD].filter(msg => {
                                  return (
                                    (msg.message_type && msg.message_type.toLowerCase().includes(searchValue)) ||
                                    (msg.message_text && msg.message_text.toLowerCase().includes(searchValue)) ||
                                    (msg.message_timestamp && msg.message_timestamp.toLowerCase().includes(searchValue)) ||
                                    (msg.status && msg.status.toLowerCase().includes(searchValue))
                                  );
                                }).length;
                                
                                return (
                                  <div className="mt-2 text-sm text-gray-600">
                                    Showing {filteredCount} of {messagesSentByVehicle[vehicle.VEHICLE_CD].length} messages
                                  </div>
                                );
                              }
                              return null;
                            })()}

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
              ))}
            </div>
          )}

          {/* If we DO have snapshot data, show the side-by-side comparison */}
          {Object.keys(snapshotData).length > 0 && (
            <div className='mt-8'>
              <h2 className='text-2xl font-bold text-gray-800 mb-4'>
                Snapshot Cards
              </h2>
              <div className='grid grid-cols-2 gap-6'>
                {Object.entries(snapshotData).map(
                  ([vehicleCd, snaps]: [
                    string,
                    { before: SnapshotRow; after: SnapshotRow }
                  ]) => (
                    <div
                      key={vehicleCd}
                      className='bg-white shadow-lg rounded-lg p-6 border border-gray-300'
                    >
                      <h3 className='text-xl font-bold text-gray-800 mb-2'>
                        GMPT : {snaps.before.gmptCode}
                      </h3>
                      {/* Before Snapshot */}
                      <div className='flex gap-6'>
                        {/* Before Snapshot */}
                        {snaps.before && snaps.before ? (
                          <div className='mb-4'>
                            <h4 className='font-semibold mb-2'>
                              Before Snapshot -{' '}
                              {snaps.before.query_execution_date
                                ? format(
                                    new Date(
                                      snaps.before.query_execution_date
                                    ),
                                    'dd/MM/yyyy HH:mm'
                                  )
                                : 'N/A'}
                            </h4>
                            <SnapshotCard snapshot={snaps.before} />
                          </div>
                        ) : (
                          <p>No before snapshot available</p>
                        )}
                        {/* After Snapshot */}
                        {snaps.after && snaps.after ? (
                          <div>
                            <h4 className='font-semibold mb-2'>
                              After Snapshot -{' '}
                              {snaps.after.query_execution_date
                                ? format(
                                    new Date(
                                      snaps.after.query_execution_date
                                    ),
                                    'dd/MM/yyyy HH:mm'
                                  )
                                : 'N/A'}
                            </h4>
                            <SnapshotCard
                              snapshot={snaps.after}
                              isAfter
                              bothSnaps={snaps}
                            />
                          </div>
                        ) : (
                          <p>No after snapshot available</p>
                        )}
                      </div>
                    </div>
                  )
                )}
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default VehicleDashboard;

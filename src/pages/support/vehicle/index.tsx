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
  preopSchedule: string;
  vehicleName: string;
  serialNumber: string;
  department: string;
  screenVersion: string;
  expansionVersion: string;
  firmwareVersion: string;
  lastConnection: string;
  vorSetting: boolean;
  lockoutCode: string;
  dList: string;
  checklist: string;
  loReason: string;
  mList: string;
  checklistSchedule: string;
  impactLockout: string;
  redImpactThreshold: number;
  impactRecalibrationDate: string;
  seatIdle: number;
  surveyTimeout: number;
  canRulesLoaded?: boolean;
  vehicleModel: string;
  simNumber: number;
  status: string;
  gmptCode: string;
  fullLockoutEnabled: boolean;
  fullLockoutTimeout: number;
  customerName: string;
  siteName: string;
}

interface MasterCode {
  masterCodeUser: string;
}

interface BlacklistedDriver {
  blacklistedDriver: string;
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
}

//TODO: check if snapshot can be a singular object and not an array
interface GroupedSnapshots {
  [vehicleCd: string]: {
    before: SnapshotRow;
    after: SnapshotRow;
  };
}

const VehicleDashboard: React.FC = () => {
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

  const [vehicles, setVehicles] = useState<Vehicle[]>([]);
  const [additionalData, setAdditionalData] = useState({});
  const [showPopup, setShowPopup] = useState<PopupState>({
    masterCodes: false,
    driverList: false,
    blacklistDrivers: false,
    expiredLicenses: false,
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
    setLoading(true);
    const customer = localStorage.getItem('selectedCustomer');
    const site = localStorage.getItem('selectedSite');
    const gmptCode = localStorage.getItem('selectedGmpt'); // Get the GMPT code from local storage

    if (!customer) {
      console.warn('No customer selected.');
      return;
    }

    console.log('Fetching vehicles for:');
    console.log('Customer:', customer || 'None');
    console.log('Site:', site || 'None');
    console.log('GMPT Code:', gmptCode || 'None');

    const queryParams = new URLSearchParams({ customer });

    if (site) queryParams.append('site', site);
    if (gmptCode) queryParams.append('gmptCode', gmptCode);

    // Add start and end datetime if both are selected
    if (
      selectedFirstDate &&
      selectedFirstTime &&
      selectedSecondDate &&
      selectedSecondTime
    ) {
      const startDate = selectedFirstDate.toISOString().split('T')[0];
      const endDate = selectedSecondDate.toISOString().split('T')[0];

      queryParams.append('startDate', startDate);
      queryParams.append('startTime', selectedFirstTime);
      queryParams.append('endDate', endDate);
      queryParams.append('endTime', selectedSecondTime);
    }

    try {
      const response = await fetch(
        `http://localhost:8080/api/vehicles?${queryParams}`
      );
      if (!response.ok)
        throw new Error(`HTTP error! Status: ${response.status}`);

      setSelectedFirstDate(null);
      setSelectedFirstTime('');
      setSelectedSecondDate(null);
      setSelectedSecondTime('');
      setSnapshotData({});

      /// Aqui estoy cambiando cosas/////////////////////////////////////////
      const vehicleData = await response.json();
      console.log('Fetched Vehicle Data:', vehicleData);

      if (Array.isArray(vehicleData)) {
        setVehicles(vehicleData);
      } else {
        console.warn('Received non-array data:', vehicleData);
        setVehicles([]);
      }
    } catch (error) {
      console.error('Error fetching vehicles:', error);
      setVehicles([]);
    }
    setLoading(false);
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
  useEffect(() => {
    fetchDates();
  }, []);

  const fetchSnapshots = async () => {
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
    url.searchParams.append('date1', selectedFirstDate);
    url.searchParams.append('date2', selectedSecondDate);

    url.searchParams.append('customer', customer);
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
    }
  };

  // Fetch vehicles when the component loads
  useEffect(() => {
    console.log('Loading state:', loading);
    fetchVehicles();

    const handleStorageChange = (event: StorageEvent) => {
      console.log('event.key', event.key);
      if (
        event.key === 'selectedCustomer' ||
        event.key === 'selectedSite'
      ) {
        console.log('this is actually making my method reset');
        fetchVehicles(); // Fetch new data when filters update
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

  console.log('mesajito para vaidar snapshot data', snapshotData);
  const leftSnap: SnapshotRow = snapshotData[String(selectedFirstTime)]?.[
    'before'
  ]
    ? snapshotData[String(selectedFirstTime)]['before']
    : snapshotData[String(selectedFirstTime)];
  const rightSnap: SnapshotRow = snapshotData[String(selectedFirstTime)]?.[
    'after'
  ]
    ? snapshotData[String(selectedFirstTime)]['after']
    : snapshotData[String(selectedFirstTime)];

  // Format date/time from the snapshot row if needed
  const formatSnapshotDate = (snap?: SnapshotRow) => {
    if (!snap?.query_execution_date) return '';
    // e.g. "9/10/2025 10:00"
    const dt = new Date(snap.query_execution_date);
    return format(dt, 'dd/MM/yyyy HH:mm');
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

    if (loading) {
      console.log('Loading state:', loading); // Debugging
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
              snapshot.status === 'Online'
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
                'loReason'
              )}`}
            >
              <strong>LO Reason:</strong> {snapshot.loReason || 'N/A'}
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
      <NavBar />
      <Navsearch onFilterChange={fetchVehicles} />
      <div className='bg-gray-100 min-h-screen p-8'>
        {/* Title with Date & Time Filters */}
        <div className='flex justify-between items-center mb-6'>
          <h1 className='text-3xl font-bold text-gray-800'>
            Vehicle Diagnostics Dashboard
          </h1>

          {/* 🔹 Date & Time Filters */}
          <div className='flex items-center gap-4 mb-6'>
            {/* 📅 First Date Picker */}
            <div>
              <label className='block text-base font-medium text-gray-700'>
                Select Date
              </label>
              <DatePicker
                selected={selectedFirstDate}
                onChange={(date: Date) => setSelectedFirstDate(date)}
                includeDates={dates}
                dateFormat='dd/MM/yyyy'
                className='border border-gray-300 rounded-md px-2 py-1 text-black'
              />
            </div>

            {/* ⏰ First Time Picker (Disabled until Date is selected) */}
            <div>
              <label className='block text-base font-medium text-gray-700'>
                Time
              </label>
              <select
                onChange={handleFirstTimeSelect}
                value={selectedFirstTime as string}
              >
                <option value=''>Select a time</option>
                {availableTimes1.map(({ time, ID }) => (
                  <option key={ID} value={time}>
                    {time}
                  </option>
                ))}
              </select>
            </div>
          </div>

          <div className='flex items-center gap-4 mb-6'>
            {/* 📅 Second Date Picker */}
            <div>
              <label className='block text-base font-medium text-gray-700'>
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
                dateFormat='dd/MM/yyyy'
                className='border border-gray-300 rounded-md px-2 py-1 text-black'
              />
            </div>

            {/* ⏰ Second Time Picker */}
            <div>
              <label className='block text-base font-medium text-gray-700'>
                Second Time
              </label>
              <select
                onChange={handleSecondTimeSelect}
                value={selectedSecondTime as string}
              >
                <option value=''>Select a time</option>
                {availableTimes2.map(({ time, ID }) => (
                  <option key={ID} value={time}>
                    {time}
                  </option>
                ))}
              </select>
            </div>
          </div>
          <div className='flex justify-end'>
            <button
              className='mt-4 bg-blue-600 text-white px-4 py-2 rounded-md hover:bg-blue-700 transition'
              onClick={fetchSnapshots}
            >
              Fetch Vehicle Snapshots
            </button>
          </div>
        </div>

        {/* Site Summary Card */}
        <div className='bg-white shadow-lg rounded-lg p-6 mb-6 border border-gray-300'>
          <h2 className='text-2xl font-bold text-gray-800 mb-4'>
            Vehicle Summary
          </h2>
          <div className='flex justify-between text-gray-600 text-lg'>
            <p>
              <strong>Total Vehicles: </strong>
              {vehicleSummary.total}
            </p>
            <p>
              <strong>Active Vehicles: </strong> {vehicleSummary.active}
            </p>
            <p>
              <strong>Inactive Vehicles: </strong>{' '}
              {vehicleSummary.inactive}
            </p>
          </div>
        </div>

        {Object.keys(snapshotData).length === 0 && (
          <div className='grid grid-cols-3 gap-6'>
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
                      {vehicle.vehicle_info.vehicleName}
                    </h2>
                    <p className='text-base text-gray-600'>
                      <strong>Serial:</strong>{' '}
                      {vehicle.vehicle_info.serialNumber}
                    </p>
                    <p className='text-base text-gray-600'>
                      <strong>GMPT:</strong>{' '}
                      {vehicle.vehicle_info.gmptCode}
                    </p>
                  </div>
                </div>

                {/* Vehicle Specs and Status */}
                <div className='grid grid-cols-2 gap-4 mt-4'>
                  <div>
                    <p className='text-base text-gray-600'>
                      <strong>Customer:</strong>{' '}
                      {vehicle.vehicle_info.customerName}
                    </p>
                    <p className='text-base text-gray-600'>
                      <strong>Site:</strong>{' '}
                      {vehicle.vehicle_info.siteName}
                    </p>
                    <p className='text-base text-gray-600'>
                      <strong>Department:</strong>{' '}
                      {vehicle.vehicle_info.department}
                    </p>
                    <p className='text-base text-gray-600'>
                      <strong>Screen Version:</strong>{' '}
                      {vehicle.vehicle_info.screenVersion}
                    </p>
                    <p className='text-base text-gray-600'>
                      <strong>ExpModu Version:</strong>{' '}
                      {vehicle.vehicle_info.expansionVersion}
                    </p>
                  </div>
                  <div>
                    <p className='text-base text-gray-600'>
                      <strong>Firmware Version:</strong>{' '}
                      {vehicle.vehicle_info.firmwareVersion}
                    </p>
                    <p className='text-base text-gray-600'>
                      <strong>Vehicle Model:</strong>{' '}
                      {vehicle.vehicle_info.vehicleModel}
                    </p>
                    <p className='text-base text-gray-600'>
                      <strong>Sim Number:</strong>{' '}
                      {vehicle.vehicle_info.simNumber}
                    </p>
                    <p className='text-base text-gray-600'>
                      <strong>Firmware Version:</strong>{' '}
                      {vehicle.vehicle_info.firmwareVersion}
                    </p>
                    <p className='text-base text-gray-600'>
                      <strong>Last Connection:</strong>{' '}
                      {vehicle.vehicle_info.lastConnection}
                    </p>
                  </div>
                </div>

                {/* Status */}
                <div className='text-center mt-4'>
                  <p
                    className={`text-lg font-bold ${
                      vehicle.vehicle_info.status === 'Online'
                        ? 'text-green-600'
                        : 'text-red-600'
                    }`}
                  >
                    <strong>Status: {vehicle.vehicle_info.status}</strong>
                  </p>
                </div>

                <hr className='border-gray-300 mb-4' />
                <div className='grid grid-cols-2 gap-4 text-base text-gray-600'>
                  <p>
                    <span
                      className={
                        vehicle.vehicle_info.vorSetting == false
                          ? 'text-green-500'
                          : 'text-red-500'
                      }
                    >
                      <strong>VOR: </strong>{' '}
                      {vehicle.vehicle_info.vorSetting == false
                        ? 'Off'
                        : 'On'}
                    </span>
                  </p>
                  <p>
                    <span
                      className={
                        vehicle.vehicle_info.lockoutCode
                          ?.toString()
                          .trim() === '0'
                          ? 'text-green-500' // If "0", Unlocked (Green)
                          : 'text-red-500' // If not "0", Locked (Red)
                      }
                    >
                      <strong>Lockout Status:</strong>{' '}
                      {vehicle.vehicle_info.lockoutCode
                        ?.toString()
                        .trim() === '0'
                        ? 'Unlocked'
                        : 'Locked'}
                    </span>
                  </p>
                  <p>
                    <strong>LO Reason:</strong>{' '}
                    {vehicle.vehicle_info.loReason}
                  </p>
                  <p>
                    <strong>Checklist Schedule:</strong>{' '}
                    {vehicle.vehicle_info.preopSchedule}
                  </p>
                  <p>
                    <strong>Recalibration Date:</strong>{' '}
                    {vehicle.vehicle_info.impactRecalibrationDate}
                  </p>

                  <p
                    className={` ${
                      vehicle.vehicle_info.redImpactThreshold !== null &&
                      vehicle.vehicle_info.redImpactThreshold > 0.0
                        ? 'text-green-500'
                        : 'text-red-500'
                    }`}
                  >
                    <strong>Red Impact Threshold: </strong>{' '}
                    {vehicle.vehicle_info.redImpactThreshold}g
                  </p>
                  <p>
                    <span
                      className={
                        vehicle.vehicle_info.impactLockout
                          ? 'text-green-500' // If false/null, Unlocked (Green)
                          : 'text-red-500' // If true, Locked (Red)
                      }
                    >
                      <strong>Impact Lockouts:</strong>{' '}
                      {vehicle.vehicle_info.impactLockout ? 'On' : 'Off'}
                    </span>
                  </p>
                  <p>
                    <span
                      className={
                        vehicle.vehicle_info.fullLockoutEnabled
                          ? 'text-green-500' // If false/null, Unlocked (Green)
                          : 'text-red-500' // If true, Locked (Red)
                      }
                    >
                      <strong>Full Lockout:</strong>{' '}
                      {vehicle.vehicle_info.fullLockoutEnabled
                        ? 'On'
                        : 'Off'}
                    </span>
                  </p>

                  <p className='text-gray-600 text-base'>
                    <strong>Full Lockout Timeout:</strong>{' '}
                    {vehicle.vehicle_info.fullLockoutTimeout}s
                  </p>

                  <p className='text-gray-600 text-base'>
                    <strong>Idle Timeout:</strong>{' '}
                    {vehicle.vehicle_info.seatIdle !== null
                      ? vehicle.vehicle_info.seatIdle
                      : 'Off'}
                    s
                  </p>
                  <p className='text-gray-600 text-base'>
                    <strong>Checklist Timeout:</strong>{' '}
                    {vehicle.vehicle_info.surveyTimeout}s
                  </p>
                  <p className='text-gray-600 text-base'>
                    <strong>Can-Rules Loaded:</strong>{' '}
                    {vehicle.vehicle_info.canRulesLoaded ? 'Yes' : 'No'}
                  </p>
                  {/* Master Codes Popup */}
                  <button
                    className='text-blue-500 hover:underline mt-2'
                    onClick={() =>
                      togglePopup('masterCodes', vehicle.VEHICLE_CD)
                    }
                  >
                    Master Codes
                  </button>
                  {showPopup.masterCodes &&
                    activeVehicleId === vehicle.VEHICLE_CD && (
                      <div className='fixed inset-0 bg-black bg-opacity-50 flex justify-center items-center z-50'>
                        <div className='bg-white p-6 rounded-lg shadow-lg w-1/2'>
                          <h3 className='text-lg font-semibold mb-4'>
                            Master Codes for {activeVehicleId}
                          </h3>

                          <ul className='list-disc pl-6'>
                            {vehicle.master_codes.length > 0 ? (
                              vehicle.master_codes.map((user, idx) => (
                                <li key={idx}>{user.masterCodeUser}</li>
                              ))
                            ) : (
                              <p className='text-gray-600'>
                                No master codes found.
                              </p>
                            )}
                          </ul>

                          <button
                            className='mt-4 bg-blue-500 text-white px-4 py-2 rounded-md hover:bg-blue-700'
                            onClick={() => togglePopup('masterCodes')}
                          >
                            Close
                          </button>
                        </div>
                      </div>
                    )}
                  {/* Driver List Popup */}
                  <button
                    className='text-blue-500 hover:underline mt-2'
                    onClick={() => togglePopup('driverList')}
                  >
                    Driver List
                  </button>
                  {showPopup.driverList && (
                    <div className='fixed inset-0 bg-black bg-opacity-50 flex justify-center items-center z-50'>
                      <div className='bg-white p-6 rounded-lg shadow-lg w-3/4'>
                        <h3 className='text-lg font-semibold mb-4'>
                          Driver List
                        </h3>
                        <ul className='list-disc pl-6'>
                          {driverList.map((driver, idx) => (
                            <li key={idx}>
                              {driver.firstName} {driver.lastName}
                            </li>
                          ))}
                        </ul>
                        <button
                          className='mt-4 bg-blue-500 text-white px-4 py-2 rounded-md hover:bg-blue-700'
                          onClick={() => togglePopup('driverList')}
                        >
                          Close
                        </button>
                      </div>
                    </div>
                  )}
                  {/* Drivers on Blacklist Popup */}
                  <button
                    className='text-blue-500 hover:underline mt-2'
                    onClick={() =>
                      togglePopup('blacklistDrivers', vehicle.VEHICLE_CD)
                    }
                  >
                    Drivers on Blacklist
                  </button>
                  {showPopup.blacklistDrivers &&
                    activeVehicleId === vehicle.VEHICLE_CD && (
                      <div className='fixed inset-0 bg-black bg-opacity-50 flex justify-center items-center z-50'>
                        <div className='bg-white p-6 rounded-lg shadow-lg w-1/2'>
                          <h3 className='text-lg font-semibold mb-4'>
                            Drivers on Blacklist for {activeVehicleId}
                          </h3>
                          <ul className='list-disc pl-6'>
                            {vehicle.blacklisted_drivers.length > 0 ? (
                              vehicle.blacklisted_drivers.map(
                                (driver, idx) => (
                                  <li key={idx}>
                                    {driver.blacklistedDriver}
                                  </li>
                                )
                              )
                            ) : (
                              <p className='text-gray-600'>
                                No blacklisted drivers found.
                              </p>
                            )}
                          </ul>
                          <button
                            className='mt-4 bg-blue-500 text-white px-4 py-2 rounded-md hover:bg-blue-700'
                            onClick={() => togglePopup('blacklistDrivers')}
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
  );
};

export default VehicleDashboard;

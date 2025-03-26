'use client';

import NavBar from '@/generic_comp/navbar';
import Navsearch from '@/generic_comp/navsearch';
import { dateType } from 'aws-sdk/clients/iam';
import React, { useState, useEffect, useRef } from 'react';
// @ts-ignore
import DatePicker from 'react-datepicker';
import 'react-datepicker/dist/react-datepicker.css';
import { format } from 'date-fns';

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
  // Adjust these fields to match the columns in your DB
  vehicleName: string;
  serial_number: string;
  gmptCode: string;
  firmwareVersion: string | null;
  screenVersion: string | null;
  expansionVersion: string | null;
  lastConnection: string | null;
  department: string | null;
  vorSetting: string | null;
  lockout_code: string | null;
  impactLockout: string | null;
  redImpactThreshold: string | null;
  seatIdle: string | null;
  surveyTimeout: string | null;
  vehicleModel: string | null;
  simNumber: string | null;
  status: string | null;
  loReason: string | null;
  fullLockoutEnabled?: boolean;
  fullLockoutTimeout?: number;
  query_execution_date?: string;
}

const VehicleDashboard: React.FC = () => {
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
  const [selectedSnapshotId1, setSelectedSnapshotId1] = useState<
    number | null
  >(null);
  const [selectedSnapshotId2, setSelectedSnapshotId2] = useState<
    number | null
  >(null);
  const [snapshotData, setSnapshotData] = useState<any>(null); // Adjust type if you have a specific snapshot shape

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

  const fetchVehicles = async () => {
    // Retrieve filters from local storage
    const customer = localStorage.getItem('selectedCustomer');
    const site = localStorage.getItem('selectedSite');
    const gmptCode = localStorage.getItem('selectedGmpt'); // Get the GMPT code from local storage

    if (!customer) {
      console.warn('No customer selected.');
      return;
    }

    console.log('Fetching vehicles for:');
    console.log('Customer:', customer);
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

    try {
      const response = await fetch(
        `http://localhost:8080/api/snapshots?time1=${selectedFirstTime}&time2=${selectedSecondTime}`
      );
      if (!response.ok) throw new Error('Failed to fetch snapshots');

      const data = await response.json();
      console.log('✅ Snapshot response:', data);
      setSnapshotData(data);
    } catch (error) {
      console.error('Failed to fetch snapshots:', error);
    }
  };

  // Fetch vehicles when the component loads
  useEffect(() => {
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
  const leftSnap: SnapshotRow | undefined = snapshotData
    ? snapshotData[String(selectedFirstTime)]?.[0]
    : undefined;
  const rightSnap: SnapshotRow | undefined = snapshotData
    ? snapshotData[String(selectedSecondTime)]?.[0]
    : undefined;

  // Format date/time from the snapshot row if needed
  const formatSnapshotDate = (snap?: SnapshotRow) => {
    if (!snap?.query_execution_date) return '';
    // e.g. "9/10/2025 10:00"
    const dt = new Date(snap.query_execution_date);
    return format(dt, 'dd/MM/yyyy HH:mm');
  };

  const totalVehicles = 85;
  const inactiveVehicles72H = 5;
  const activeVehicles24H = 80;

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
              <label className='block text-sm font-medium text-gray-700'>
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
              <label className='block text-sm font-medium text-gray-700'>
                Time
              </label>
              <select onChange={handleFirstTimeSelect}>
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
              <label className='block text-sm font-medium text-gray-700'>
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
              <label className='block text-sm font-medium text-gray-700'>
                Second Time
              </label>
              <select onChange={handleSecondTimeSelect}>
                <option value=''>Select a time</option>
                {availableTimes2.map(({ time, ID }) => (
                  <option key={ID} value={time}>
                    {time}
                  </option>
                ))}
              </select>
            </div>
          </div>
          {/* 🔘 Button to Trigger Snapshot Fetch */}
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
            Site Summary
          </h2>
          <div className='flex justify-between text-gray-600 text-lg'>
            <p>
              <strong>Total Vehicles:</strong> {totalVehicles}
            </p>
            <p>
              <strong>Inactive Vehicles (72H):</strong>{' '}
              {inactiveVehicles72H}
            </p>
            <p>
              <strong>Active Vehicles (24H):</strong> {activeVehicles24H}
            </p>
          </div>
        </div>

        {!snapshotData && (
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
                    <p className='text-sm text-gray-600'>
                      <strong>Serial:</strong>{' '}
                      {vehicle.vehicle_info.serialNumber}
                    </p>
                    <p className='text-sm text-gray-600'>
                      <strong>GMPT:</strong>{' '}
                      {vehicle.vehicle_info.gmptCode}
                    </p>
                  </div>
                </div>

                {/* Vehicle Specs and Status */}
                <div className='grid grid-cols-2 gap-4 mt-4'>
                  <div>
                    <p className='text-sm text-gray-600'>
                      <strong>Customer:</strong>{' '}
                      {vehicle.vehicle_info.customerName}
                    </p>
                    <p className='text-sm text-gray-600'>
                      <strong>Site:</strong>{' '}
                      {vehicle.vehicle_info.siteName}
                    </p>
                    <p className='text-sm text-gray-600'>
                      <strong>Department:</strong>{' '}
                      {vehicle.vehicle_info.department}
                    </p>
                    <p className='text-sm text-gray-600'>
                      <strong>Screen Version:</strong>{' '}
                      {vehicle.vehicle_info.screenVersion}
                    </p>
                    <p className='text-sm text-gray-600'>
                      <strong>ExpModu Version:</strong>{' '}
                      {vehicle.vehicle_info.expansionVersion}
                    </p>
                  </div>
                  <div>
                    <p className='text-sm text-gray-600'>
                      <strong>Firmware Version:</strong>{' '}
                      {vehicle.vehicle_info.firmwareVersion}
                    </p>
                    <p className='text-sm text-gray-600'>
                      <strong>Vehicle Model:</strong>{' '}
                      {vehicle.vehicle_info.vehicleModel}
                    </p>
                    <p className='text-sm text-gray-600'>
                      <strong>Sim Number:</strong>{' '}
                      {vehicle.vehicle_info.simNumber}
                    </p>
                    <p className='text-sm text-gray-600'>
                      <strong>Firmware Version:</strong>{' '}
                      {vehicle.vehicle_info.firmwareVersion}
                    </p>
                    <p className='text-sm text-gray-600'>
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
                <div className='grid grid-cols-2 gap-4 text-sm text-gray-600'>
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

                  <p className='text-gray-600 text-sm'>
                    <strong>Full Lockout Timeout:</strong>{' '}
                    {vehicle.vehicle_info.fullLockoutTimeout}s
                  </p>

                  <p className='text-gray-600 text-sm'>
                    <strong>Idle Timeout:</strong>{' '}
                    {vehicle.vehicle_info.seatIdle !== null
                      ? vehicle.vehicle_info.seatIdle
                      : 'Off'}
                    s
                  </p>
                  <p className='text-gray-600 text-sm'>
                    <strong>Checklist Timeout:</strong>{' '}
                    {vehicle.vehicle_info.surveyTimeout}s
                  </p>
                  <p className='text-gray-600 text-sm'>
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
        {snapshotData && (
          <div className='mt-8'>
            {/* Heading */}
            <div className='text-2xl font-bold text-gray-800 mb-4'>
              Snapshot Comparison
            </div>

            {/* Two-Column Grid for Snapshot Cards */}
            <div className='grid grid-cols-2 gap-6'>
              {/* LEFT CARD: "Before" Snapshot */}
              <div className='bg-white shadow-lg rounded-lg p-6 border border-gray-300'>
                <div className='text-xl font-bold mb-2'>
                  Before (ID: {selectedSnapshotId1})
                </div>
                {snapshotData[String(selectedSnapshotId1)]?.map(
                  (snap, idx) => (
                    <div key={idx} className='mb-4'>
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
                            {snap.vehicleName || 'N/A'}
                          </h2>
                          <p className='text-sm text-gray-600'>
                            <strong>Serial:</strong>{' '}
                            {snap.serialNumber || 'N/A'}
                          </p>
                          <p className='text-sm text-gray-600'>
                            <strong>GMPT:</strong> {snap.gmptCode || 'N/A'}
                          </p>
                        </div>
                      </div>

                      {/* Middle Section: Specs */}
                      <div className='grid grid-cols-2 gap-4 mt-4'>
                        <div>
                          <p className='text-sm text-gray-600'>
                            <strong>Firmware:</strong>{' '}
                            {snap.firmwareVersion || 'N/A'}
                          </p>
                          <p className='text-sm text-gray-600'>
                            <strong>Vehicle Model:</strong>{' '}
                            {snap.vehicleModel || 'N/A'}
                          </p>
                          <p className='text-sm text-gray-600'>
                            <strong>Sim Number:</strong>{' '}
                            {snap.simNumber || 'N/A'}
                          </p>
                          <p className='text-sm text-gray-600'>
                            <strong>Screen:</strong>{' '}
                            {snap.screenVersion || 'N/A'}
                          </p>
                          <p className='text-sm text-gray-600'>
                            <strong>ExpModu:</strong>{' '}
                            {snap.expansionVersion || 'N/A'}
                          </p>
                        </div>
                        <div>
                          <p className='text-sm text-gray-600'>
                            <strong>Customer:</strong>{' '}
                            {snap.customerName || 'N/A'}
                          </p>
                          <p className='text-sm text-gray-600'>
                            <strong>Site:</strong> {snap.siteName || 'N/A'}
                          </p>
                          <p className='text-sm text-gray-600'>
                            <strong>Department:</strong>{' '}
                            {snap.department || 'N/A'}
                          </p>
                          <p className='text-sm text-gray-600'>
                            <strong>Last Connection:</strong>{' '}
                            {snap.lastConnection
                              ? new Date(
                                  snap.lastConnection
                                ).toLocaleString()
                              : 'N/A'}
                          </p>
                        </div>
                      </div>

                      {/* Status */}
                      <div className='text-center mt-4'>
                        <p
                          className={`text-lg font-bold ${
                            snap.status === 'Online'
                              ? 'text-green-600'
                              : 'text-red-600'
                          }`}
                        >
                          <strong>
                            Status: {snap.status || 'Unknown'}
                          </strong>
                        </p>
                      </div>

                      <hr className='border-gray-300 my-4' />

                      {/* Bottom Section: Additional Details */}
                      <div className='grid grid-cols-2 gap-4 text-sm text-gray-600'>
                        <p>
                          <strong>VOR:</strong>{' '}
                          {snap.vorSetting === 'false' ? (
                            <span className='text-green-500'>Off</span>
                          ) : (
                            <span className='text-red-500'>On</span>
                          )}
                        </p>
                        <p>
                          <strong>Lockout:</strong>{' '}
                          {snap.lockoutCode?.trim() === '0' ? (
                            <span className='text-green-500'>
                              Unlocked
                            </span>
                          ) : (
                            <span className='text-red-500'>Locked</span>
                          )}
                        </p>
                        <p>
                          <strong>LO Reason:</strong>{' '}
                          {snap.loReason || 'N/A'}
                        </p>
                        <p>
                          <strong>Preop:</strong>{' '}
                          {snap.preopSchedule || 'N/A'}
                        </p>
                        <p>
                          <strong>Recalibration:</strong>{' '}
                          {snap.impactRecalibrationDate || 'N/A'}
                        </p>
                        <p>
                          <strong>Red Impact:</strong>{' '}
                          {snap.redImpactThreshold
                            ? snap.redImpactThreshold + 'g'
                            : 'N/A'}
                        </p>
                        <p>
                          <strong>Impact Lockouts:</strong>{' '}
                          {snap.impactLockout ? (
                            <span className='text-green-500'>On</span>
                          ) : (
                            <span className='text-red-500'>Off</span>
                          )}
                        </p>
                        <p>
                          <strong>Full Lockout:</strong>{' '}
                          {snap.fullLockoutEnabled ? (
                            <span className='text-green-500'>On</span>
                          ) : (
                            <span className='text-red-500'>Off</span>
                          )}
                        </p>
                        <p className='text-gray-600 text-sm'>
                          <strong>Full Lock Timeout:</strong>{' '}
                          {snap.fullLockoutTimeout
                            ? snap.fullLockoutTimeout + 's'
                            : 'N/A'}
                        </p>
                        <p className='text-gray-600 text-sm'>
                          <strong>Idle Timeout:</strong>{' '}
                          {snap.seatIdle ? snap.seatIdle + 's' : 'Off'}
                        </p>
                        <p className='text-gray-600 text-sm'>
                          <strong>Checklist Timeout:</strong>{' '}
                          {snap.surveyTimeout
                            ? snap.surveyTimeout + 's'
                            : 'Off'}
                        </p>
                      </div>
                    </div>
                  )
                )}
              </div>

              {/* RIGHT CARD: "After" snapshot */}
              <div className='bg-white shadow-lg rounded-lg p-6 border border-gray-300'>
                <div className='text-xl font-bold mb-2'>
                  After: {selectedSnapshotId2}
                </div>

                <div className='grid grid-cols-3 gap-4 items-start'>
                  <div className='w-20 h-20'>
                    <img
                      src='/forklift.png'
                      alt='Forklift'
                      className='w-full h-full object-contain'
                    />
                  </div>
                  <div className='col-span-2 text-center'>
                    <h2 className='text-2xl font-bold text-gray-800'>
                      {snapshotData[String(selectedSnapshotId2)]?.[0]
                        ?.vehicleName || 'No Name'}
                    </h2>
                    <p className='text-sm text-gray-600'>
                      <strong>Serial:</strong>{' '}
                      {
                        snapshotData[String(selectedSnapshotId2)]?.[0]
                          ?.serial_number
                      }
                    </p>
                    <p className='text-sm text-gray-600'>
                      <strong>GMPT:</strong>{' '}
                      {
                        snapshotData[String(selectedSnapshotId2)]?.[0]
                          ?.gmptCode
                      }
                    </p>
                  </div>
                </div>

                <div className='grid grid-cols-2 gap-4 mt-4'>
                  <div>
                    <p className='text-sm text-gray-600'>
                      <strong>Firmware Version:</strong>{' '}
                      {
                        snapshotData[String(selectedSnapshotId2)]?.[0]
                          ?.firmwareVersion
                      }
                    </p>
                    <p className='text-sm text-gray-600'>
                      <strong>Vehicle Model:</strong>{' '}
                      {
                        snapshotData[String(selectedSnapshotId2)]?.[0]
                          ?.vehicleModel
                      }
                    </p>
                    <p className='text-sm text-gray-600'>
                      <strong>Sim Number:</strong>{' '}
                      {
                        snapshotData[String(selectedSnapshotId2)]?.[0]
                          ?.simNumber
                      }
                    </p>
                    <p className='text-sm text-gray-600'>
                      <strong>Screen Version:</strong>{' '}
                      {
                        snapshotData[String(selectedSnapshotId2)]?.[0]
                          ?.screenVersion
                      }
                    </p>
                    <p className='text-sm text-gray-600'>
                      <strong>ExpModu Version:</strong>{' '}
                      {
                        snapshotData[String(selectedSnapshotId2)]?.[0]
                          ?.expansionVersion
                      }
                    </p>
                  </div>
                  <div>
                    <p className='text-sm text-gray-600'>
                      <strong>Department:</strong>{' '}
                      {
                        snapshotData[String(selectedSnapshotId2)]?.[0]
                          ?.department
                      }
                    </p>
                    <p className='text-sm text-gray-600'>
                      <strong>Last Connection:</strong>{' '}
                      {String(
                        snapshotData[String(selectedSnapshotId2)]?.[0]
                          ?.lastConnection || 'N/A'
                      )}
                    </p>
                  </div>
                </div>

                <div className='text-center mt-4'>
                  <p
                    className={`text-lg font-bold ${
                      snapshotData[String(selectedSnapshotId2)]?.[0]
                        ?.status === 'Online'
                        ? 'text-green-600'
                        : 'text-red-600'
                    }`}
                  >
                    <strong>
                      Status:{' '}
                      {snapshotData[String(selectedSnapshotId2)]?.[0]
                        ?.status || 'Unknown'}
                    </strong>
                  </p>
                </div>

                <hr className='border-gray-300 mb-4 mt-4' />

                <div className='grid grid-cols-2 gap-4 text-sm text-gray-600'>
                  <p>
                    <strong>VOR:</strong>{' '}
                    {snapshotData[String(selectedSnapshotId2)]?.[0]
                      ?.vorSetting === 'false' ? (
                      <span className='text-green-500'>Off</span>
                    ) : (
                      <span className='text-red-500'>On</span>
                    )}
                  </p>
                  <p>
                    <strong>Lockout Status:</strong>{' '}
                    {snapshotData[
                      String(selectedSnapshotId2)
                    ]?.[0]?.lockout_code?.trim() === '0' ? (
                      <span className='text-green-500'>Unlocked</span>
                    ) : (
                      <span className='text-red-500'>Locked</span>
                    )}
                  </p>
                  <p>
                    <strong>LO Reason:</strong>{' '}
                    {snapshotData[String(selectedSnapshotId2)]?.[0]
                      ?.loReason || 'N/A'}
                  </p>
                  <p>
                    <strong>Recalibration Date:</strong> N/A
                  </p>
                  <p>
                    <strong>Red Impact Threshold:</strong>{' '}
                    {snapshotData[String(selectedSnapshotId2)]?.[0]
                      ?.redImpactThreshold || 'N/A'}
                  </p>
                  <p>
                    <strong>Impact Lockouts:</strong>{' '}
                    {snapshotData[String(selectedSnapshotId2)]?.[0]
                      ?.impactLockout ? (
                      <span className='text-green-500'>On</span>
                    ) : (
                      <span className='text-red-500'>Off</span>
                    )}
                  </p>
                  <p>
                    <strong>Full Lockout:</strong>{' '}
                    {snapshotData[String(selectedSnapshotId2)]?.[0]
                      ?.fullLockoutEnabled ? (
                      <span className='text-green-500'>On</span>
                    ) : (
                      <span className='text-red-500'>Off</span>
                    )}
                  </p>
                  <p>
                    <strong>Full Lockout Timeout:</strong>{' '}
                    {snapshotData[String(selectedSnapshotId2)]?.[0]
                      ?.fullLockoutTimeout || 0}
                    s
                  </p>
                  <p>
                    <strong>Idle Timeout:</strong>{' '}
                    {snapshotData[String(selectedSnapshotId2)]?.[0]
                      ?.seatIdle || 'Off'}
                    s
                  </p>
                  <p>
                    <strong>Checklist Timeout:</strong>{' '}
                    {snapshotData[String(selectedSnapshotId2)]?.[0]
                      ?.surveyTimeout || 'Off'}
                    s
                  </p>
                </div>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default VehicleDashboard;

"use client";

import NavBar from '@/generic_comp/navbar';
import Navsearch from '@/generic_comp/navsearch';
import React, { useState, useEffect } from 'react';

// Define interfaces for your data types
interface VehicleInfo {
  vehicleName: string;
  serialNumber: string;
  department: string;
  screenVersion: string;
  expansionVersion: string;
  firmwareVersion: string;
  lastConnection: string;
  vor_setting: string;
  lockout_code: string;
  dList: string;
  checklist: string;
  loReason: string;
  mm: string;
  mList: string;
  checklistSchedule: string;
  calibrated: string;
  IMPACT_LOCKOUT: string;
  redImpactThreshold: string;
  impact_recalibration_date: string;
  seat_idle: string;
  survey_timeout: string;
  canRulesLoaded?: boolean;
  canHours: string;
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

const VehicleDashboard: React.FC = () => {
  const [vehicles, setVehicles] = useState<Vehicle[]>([]);
  const [showPopup, setShowPopup] = useState<PopupState>({
    masterCodes: false,
    driverList: false,
    blacklistDrivers: false,
    expiredLicenses: false,
  });
  const [activeVehicleId, setActiveVehicleId] = useState<string | number | null>(null);

  const fetchVehicles = async () => {
    // Retrieve filters from local storage
    const customer = localStorage.getItem("selectedCustomer");
    const site = localStorage.getItem("selectedSite");

    if (!customer) {
      console.warn("No customer selected.");
      return;
    }

    console.log("Fetching vehicles for:");
    console.log("Customer:", customer);
    console.log("Site:", site || "None");

    const queryParams = new URLSearchParams({ customer });
    if (site) {
      queryParams.append("site", site);
    }

    try {
      const response = await fetch(`http://localhost:8080/api/vehicles?${queryParams}`);
      if (!response.ok) throw new Error(`HTTP error! Status: ${response.status}`);

      const vehicleData = await response.json();
      console.log("Fetched Vehicle Data:", vehicleData);

      if (Array.isArray(vehicleData)) {
        setVehicles(vehicleData);
      } else {
        console.warn("Received non-array data:", vehicleData);
        setVehicles([]); // Fallback to empty array
      }
      
    } catch (error) {
      console.error("Error fetching vehicles:", error);
      setVehicles([]); // Fallback in case of error
    }
  };

  // Fetch vehicles when the component loads
  useEffect(() => {
    fetchVehicles();

    const handleStorageChange = (event: StorageEvent) => {
      console.log("event.key", event.key);
      if (event.key === "selectedCustomer" || event.key === "selectedSite") {
        console.log("this is actually making my method reset");
        fetchVehicles(); // Fetch new data when filters update
      }
    };

    window.addEventListener("storage", handleStorageChange);

    return () => {
      window.removeEventListener("storage", handleStorageChange);
    };
  }, []);

  // Data for popups
  const driverList: Driver[] = Array.from({ length: 40 }, (_, i) => ({
    firstName: `Driver${i + 1}`,
    lastName: `LastName${i + 1}`,
  }));
   
  const togglePopup = (key: keyof PopupState, vehicleId: string | number | null = null) => {
    setShowPopup((prev) => ({
      ...prev,
      [key]: !prev[key],
    }));
    setActiveVehicleId(vehicleId);
  };
  
  const totalVehicles = 85;
  const inactiveVehicles72H = 5;
  const activeVehicles24H = 80;
  

  return (

    <div>
        <NavBar/>
        <Navsearch/>
      <div className="bg-gray-100 min-h-screen p-8">
        <h1 className="text-3xl font-bold mb-6 text-gray-800">Vehicle Diagnostics Dashboard</h1>

        {/* Site Summary Card */}
        <div className="bg-white shadow-lg rounded-lg p-6 mb-6 border border-gray-300">
          <h2 className="text-2xl font-bold text-gray-800 mb-4">Site Summary</h2>
          <div className="flex justify-between text-gray-600 text-lg">
            <p><strong>Total Vehicles:</strong> {totalVehicles}</p>
            <p><strong>Inactive Vehicles (72H):</strong> {inactiveVehicles72H}</p>
            <p><strong>Active Vehicles (24H):</strong> {activeVehicles24H}</p>
          </div>
        </div>

        <div className="grid grid-cols-3 gap-6">
          {vehicles.map((vehicle, index) => (
            <div key={index} className="bg-white shadow-lg rounded-lg p-6 border border-gray-300">
              <div className="grid grid-cols-2 items-center mb-4">
                <div className="w-24 h-24 flex items-center justify-center">
                  <img src="/forklift.png" alt="Forklift" className="w-full h-full object-contain" />
                </div>
                <div>
                  <h2 className="text-xl font-semibold text-gray-800">{vehicle.vehicle_info.vehicleName}</h2>
                  <p className="text-gray-600 text-sm"><strong>Serial:</strong> {vehicle.vehicle_info.serialNumber}</p>
                  <p className="text-gray-600 text-sm"><strong>Department:</strong> {vehicle.vehicle_info.department}</p>
                  <p className="text-gray-600 text-sm"><strong>Screen Version:</strong> {vehicle.vehicle_info.screenVersion}</p>
                  <p className="text-gray-600 text-sm"><strong>ExpModu Version:</strong> {vehicle.vehicle_info.expansionVersion}</p>
                  <p className="text-gray-600 text-sm"><strong>Firmware Version:</strong> {vehicle.vehicle_info.firmwareVersion}</p>
                  <p className="text-gray-600 text-sm"><strong>Last Connection:</strong> {vehicle.vehicle_info.lastConnection}</p>
                  <p
                    className={`text-sm font-bold ${
                      vehicle.status === 'Connected' ? 'text-green-500' : 'text-red-500'
                    }`}
                  >
                    <strong>Status:</strong> {vehicle.vehicle_info.lastConnection}
                  </p>
                </div>
              </div>
              <hr className="border-gray-300 mb-4" />
              <div className="grid grid-cols-2 gap-4 text-sm text-gray-600">
                <p
                  className={` ${
                    vehicle.vehicle_info.vor_setting === 'false' ? 'text-green-500' : 'text-red-500'
                  }`}
                >
                  <strong>VOR:</strong> {vehicle.vehicle_info.vor_setting}
                </p>
                <p
                  className={` ${
                    vehicle.vehicle_info.lockout_code === '0' ? 'text-green-500' : 'text-red-500'
                  }`}
                >
                  <strong>Lockout:</strong> {vehicle.vehicle_info.lockout_code}
                </p>
                <p
                  className={` ${
                    vehicle.vehicle_info.dList === 'Synced' ? 'text-green-500' : 'text-red-500'
                  }`}
                >
                  <strong>D-List:</strong> {vehicle.vehicle_info.dList}
                </p>
                <p
                  className={` ${
                    vehicle.vehicle_info.checklist === 'Synced' ? 'text-green-500' : 'text-red-500'
                  }`}
                >
                  <strong>Checklist:</strong> {vehicle.vehicle_info.checklist}
                </p>
                <p>
                  <strong>LO Reason:</strong> {vehicle.vehicle_info.loReason}
                </p>
                <p
                  className={` ${
                    vehicle.vehicle_info.mm === 'Off' ? 'text-green-500' : 'text-red-500'
                  }`}
                >
                  <strong>MM:</strong> {vehicle.vehicle_info.mm}
                </p>
                <p
                  className={` ${
                    vehicle.vehicle_info.mList === 'Synced' ? 'text-green-500' : 'text-red-500'
                  }`}
                >
                  <strong>M-List:</strong> {vehicle.vehicle_info.mList}
                </p>
                <p>
                  <strong>Checklist Schedule:</strong> {vehicle.vehicle_info.checklistSchedule}
                </p>
                <p
                  className={` ${
                    vehicle.vehicle_info.calibrated === '0' ?  'text-red-500' : 'text-green-500'
                  }`}
                >
                  <strong>Calibration:</strong> {vehicle.vehicle_info.calibrated}
                </p>
                <p>
                  <strong>LO Ene:</strong> {vehicle.vehicle_info.IMPACT_LOCKOUT}
                </p>

                <p className="text-gray-600 text-sm"><strong>Red Impact Threshold:</strong> {vehicle.vehicle_info.redImpactThreshold}</p>
                <p className="text-gray-600 text-sm"><strong>Impact Recalibration Date:</strong> {vehicle.vehicle_info.impact_recalibration_date}</p>
                <p className="text-gray-600 text-sm"><strong>Idle Timeout(s):</strong> {vehicle.vehicle_info.seat_idle}</p>
                <p className="text-gray-600 text-sm"><strong>Survey Timeout(s):</strong> {vehicle.vehicle_info.survey_timeout}</p>
                <p className="text-gray-600 text-sm"><strong>Can-Rules Loaded:</strong> {vehicle.vehicle_info.canRulesLoaded ? 'Yes' : 'No'}</p>
                <p className="text-gray-600 text-sm"><strong>Canhours/Accumulated Key Hours:</strong> {vehicle.vehicle_info.canHours}</p>

                {/* Master Codes Popup */}
                <button
                  className="text-blue-500 hover:underline mt-2"
                  onClick={() => togglePopup("masterCodes", vehicle.VEHICLE_CD)}
                >
                  Master Codes
                </button>

                {showPopup.masterCodes && activeVehicleId === vehicle.VEHICLE_CD && (
                  <div className="fixed inset-0 bg-black bg-opacity-50 flex justify-center items-center z-50">
                    <div className="bg-white p-6 rounded-lg shadow-lg w-1/2">
                      <h3 className="text-lg font-semibold mb-4">
                        Master Codes for {activeVehicleId}
                      </h3>
                      
                      <ul className="list-disc pl-6">
                        {vehicle.master_codes.length > 0 ? (
                          vehicle.master_codes.map((user, idx) => (
                            <li key={idx}>
                              {user.masterCodeUser}
                            </li>
                          ))
                        ) : (
                          <p className="text-gray-600">No master codes found.</p>
                        )}
                      </ul>

                      <button
                        className="mt-4 bg-blue-500 text-white px-4 py-2 rounded-md hover:bg-blue-700"
                        onClick={() => togglePopup("masterCodes")}
                      >
                        Close
                      </button>
                    </div>
                  </div>
                )}

                {/* Driver List Popup */}
                <button
                  className="text-blue-500 hover:underline mt-2"
                  onClick={() => togglePopup('driverList')}
                >
                  Driver List
                </button>
                {showPopup.driverList && (
                  <div className="fixed inset-0 bg-black bg-opacity-50 flex justify-center items-center z-50">
                    <div className="bg-white p-6 rounded-lg shadow-lg w-3/4">
                      <h3 className="text-lg font-semibold mb-4">Driver List</h3>
                      <ul className="list-disc pl-6">
                        {driverList.map((driver, idx) => (
                          <li key={idx}>{driver.firstName} {driver.lastName}</li>
                        ))}
                      </ul>
                      <button
                        className="mt-4 bg-blue-500 text-white px-4 py-2 rounded-md hover:bg-blue-700"
                        onClick={() => togglePopup('driverList')}
                      >
                        Close
                      </button>
                    </div>
                  </div>
                )}

                {/* Drivers on Blacklist Popup */}
                <button
                  className="text-blue-500 hover:underline mt-2"
                  onClick={() => togglePopup('blacklistDrivers', vehicle.VEHICLE_CD)}
                >
                  Drivers on Blacklist
                </button>
                {showPopup.blacklistDrivers && activeVehicleId === vehicle.VEHICLE_CD && (
                  <div className="fixed inset-0 bg-black bg-opacity-50 flex justify-center items-center z-50">
                    <div className="bg-white p-6 rounded-lg shadow-lg w-1/2">
                      <h3 className="text-lg font-semibold mb-4">Drivers on Blacklist for {activeVehicleId}</h3>
                      <ul className="list-disc pl-6">
                      {vehicle.blacklisted_drivers.length > 0 ? (
                          vehicle.blacklisted_drivers.map((driver, idx) => (
                            <li key={idx}>{driver.blacklistedDriver}</li>
                          ))
                        ) : (
                          <p className="text-gray-600">No blacklisted drivers found.</p>
                        )}
                      </ul>
                      <button
                        className="mt-4 bg-blue-500 text-white px-4 py-2 rounded-md hover:bg-blue-700"
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
      </div>
    </div>
  );
};

export default VehicleDashboard;
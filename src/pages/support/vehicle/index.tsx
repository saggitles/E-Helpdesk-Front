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

interface Vehicle {
  VEHICLE_CD: string | number;
  vehicle_info: VehicleInfo;
  status?: string;
}

const VehicleDashboard: React.FC = () => {
  const [vehicles, setVehicles] = useState<Vehicle[]>([]);

  return (
    <div>
      <Navsearch onFilterChange={() => {}} />
      <div className='bg-gray-100 min-h-screen p-8'>
        <h1 className='text-4xl font-bold text-gray-800 text-center py-5'>
          Vehicle Diagnostics Dashboard
        </h1>
        <div className='grid grid-cols-3 gap-6'>
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
                    <strong>Serial:</strong> {vehicle.vehicle_info.serial_number}
                  </p>
                  <p className='text-base text-gray-600'>
                    <strong>GMPT:</strong> {vehicle.vehicle_info.gmpt_code}
                  </p>
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
};

export default VehicleDashboard;

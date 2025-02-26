'use client';

import React, { useState, useEffect } from 'react';
import Link from 'next/link';

// Define Types for Filters
interface Filters {
  client: string;
  site: string;
  gmptCode: string;
}

// Define Props Type for Navbar
interface NavbarProps {
  onFilterChange?: () => void;
}

const Navsearch: React.FC<NavbarProps> = ({ onFilterChange }) => {
  // Define state for filters
  const [filters, setFilters] = useState<Filters>({
    client: '',
    site: '',
    gmptCode: '',
  });

  const [customers, setCustomers] = useState<
    { USER_CD: string; USER_NAME: string }[]
  >([]);
  const [sites, setSites] = useState<
    { LOCATION_CD: string; NAME: string }[]
  >([]);

  // Load Local Storage Data After Component Mounts
  useEffect(() => {
    if (typeof window !== 'undefined') {
      setFilters({
        client: localStorage.getItem('selectedCustomer') || '',
        site: localStorage.getItem('selectedSite') || '',
        gmptCode: '',
      });
    }
  }, []);

  // Fetch Customers from Backend
  useEffect(() => {
    const fetchCustomers = async () => {
      try {
        const response = await fetch(
          'http://localhost:8080/api/customers'
        );
        if (!response.ok)
          throw new Error(`HTTP error! Status: ${response.status}`);

        const data = await response.json();
        setCustomers(data);

        const storedCustomer = localStorage.getItem('selectedCustomer');
        if (storedCustomer) {
          setFilters((prevFilters) => ({
            ...prevFilters,
            client: storedCustomer, // ✅ Fixed Key
          }));
        }
      } catch (error) {
        console.error('Error fetching customers:', error);
      }
    };
    fetchCustomers();
  }, []);

  // Fetch Sites when a Client is Selected
  useEffect(() => {
    if (!filters.client) {
      setSites([]);
      return;
    }

    const fetchSites = async () => {
      try {
        const response = await fetch(
          `http://localhost:8080/api/sites?customer=${filters.client}`
        );
        if (!response.ok)
          throw new Error(`HTTP error! Status: ${response.status}`);

        const data = await response.json();
        console.log('Fetched Sites:', data);
        setSites(Array.isArray(data) ? data : []);
      } catch (error) {
        console.error('Error fetching sites:', error);
        setSites([]);
      }
    };

    fetchSites();
  }, [filters.client]);

  // Handle Input Changes
  const handleFilterChange = (
    e: React.ChangeEvent<HTMLSelectElement | HTMLInputElement>
  ) => {
    const { name, value } = e.target;

    setFilters((prev) => ({
      ...prev,
      [name]: value,
    }));
  };

  // Handle Search Button Click
  const handleSearch = () => {
    if (!filters.client) {
      console.error('Customer is required for search.');
      return;
    }

    console.log('Saving to local storage:');
    console.log('Customer:', filters.client);
    console.log('Site:', filters.site || 'None selected');

    // Store customer and site in local storage
    localStorage.setItem('selectedCustomer', filters.client);
    localStorage.setItem('selectedSite', filters.site || '');

    if (typeof onFilterChange === 'function') {
      onFilterChange();
    } else {
      console.warn(
        'onFilterChange is not defined, skipping function call.'
      );
    }
  };

  return (
    <nav className='bg-teal-500 text-white p-4 shadow-md'>
      <div className='container mx-auto mt-4 bg-gray-100 p-6 rounded-lg shadow'>
        <h2 className='text-lg font-semibold text-gray-800 mb-3'>
          Filters
        </h2>
        <div className='grid grid-cols-3 gap-4'>
          {/* Customer Filter */}
          <div>
            <label className='block text-sm font-medium text-gray-700 mb-1'>
              Customer
            </label>
            <select
              name='client'
              value={filters.client}
              onChange={handleFilterChange}
              className='block w-full border-gray-300 rounded-md shadow-sm focus:ring-blue-500 focus:border-blue-500 sm:text-sm text-black' // Add text-black here
            >
              <option value=''>Select a Customer</option>
              {customers.map((customer) => (
                <option key={customer.USER_CD} value={customer.USER_CD}>
                  {customer.USER_NAME}
                </option>
              ))}
            </select>
          </div>

          {/* Site Filter */}
          <div>
            <label className='block text-sm font-medium text-gray-700 mb-1'>
              Site
            </label>
            <select
              name='site'
              value={filters.site}
              onChange={handleFilterChange}
              disabled={!filters.client}
              className='block w-full border-gray-300 rounded-md shadow-sm focus:ring-blue-500 focus:border-blue-500 sm:text-sm text-black' // Add text-black here
            >
              <option value=''>Select a Site</option>
              {sites.map((site) => (
                <option key={site.LOCATION_CD} value={site.LOCATION_CD}>
                  {site.NAME}
                </option>
              ))}
            </select>
          </div>

          {/* GMPT Code Filter */}
          <div>
            <label className='block text-sm font-medium text-gray-700 mb-1'>
              GMPT Code
            </label>
            <input
              type='text'
              name='gmptCode'
              value={filters.gmptCode}
              onChange={handleFilterChange}
              className='w-full p-2 border border-gray-300 rounded-md shadow-sm focus:ring-teal-500 focus:border-teal-500'
            />
          </div>

          {/* Search Button */}
          <div className='col-span-3 flex justify-end'>
            <button
              className='bg-teal-600 text-white px-4 py-2 rounded-md hover:bg-teal-700 transition'
              onClick={handleSearch}
            >
              Search
            </button>
          </div>
        </div>
      </div>
    </nav>
  );
};

export default Navsearch;

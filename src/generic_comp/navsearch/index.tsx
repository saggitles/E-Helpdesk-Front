'use customer';

import React, { useState, useEffect } from 'react';
import Link from 'next/link';
import {
  Filters,
  Customer,
  Site,
  VehicleData,
} from '@/types/tickets.types';

// Define Props Type for Navbar
interface NavsearchProps {
  onFilterChange?: () => void;
}

const Navsearch: React.FC<NavsearchProps> = ({ onFilterChange }) => {
  // Define state for filters
  const [filters, setFilters] = useState<Filters>({
    customer: '',
    site: '',
    gmptCode: '',
  });

  const [customers, setCustomers] = useState<Customer[]>([]);
  const [sites, setSites] = useState<Site[]>([]);

  // Loading states
  const [loadingCustomers, setLoadingCustomers] = useState<boolean>(true);
  const [loadingSites, setLoadingSites] = useState<boolean>(false);
  const [loadingData, setLoadingData] = useState<boolean>(true);
  const [multipleCompaniesFound, setMultipleCompaniesFound] =
    useState<boolean>(false);
  const [availableCompanies, setAvailableCompanies] = useState<
    Array<{ customer: string; site: string; count: number }>
  >([]);

  // Load Local Storage Data After Component Mounts
  useEffect(() => {
    if (typeof window !== 'undefined') {
      setLoadingData(true);
      try {
        const storedcustomer =
          localStorage.getItem('selectedCustomer') || '';
        const storedSite = localStorage.getItem('selectedSite') || '';
        const storedGmptCode = localStorage.getItem('selectedGmpt') || '';

        setFilters({
          customer: storedcustomer,
          site: storedSite,
          gmptCode: storedGmptCode,
        });
      } catch (error) {
        console.error('Error loading data from localStorage:', error);
      } finally {
        setTimeout(() => {
          setLoadingData(false);
        }, 500); // Pequeño retardo para que el spinner sea visible
      }
    }
  }, []);

  // Fetch Customers from Backend
  useEffect(() => {
    const fetchCustomers = async () => {
      localStorage.removeItem('siteData');

      setLoadingCustomers(true);
      try {
        const response = await fetch(
          `${process.env.NEXT_PUBLIC_API_URL}/api/customers`
        );
        if (!response.ok)
          throw new Error(`HTTP error! Status: ${response.status}`);

        const data = await response.json();
        setCustomers(data);

        const storedCustomer = localStorage.getItem('selectedCustomer');
        if (storedCustomer) {
          setFilters((prevFilters) => ({
            ...prevFilters,
            customer: storedCustomer,
          }));
        }
      } catch (error) {
        console.error('Error fetching customers:', error);
      } finally {
        setTimeout(() => {
          setLoadingCustomers(false);
        }, 500); // Pequeño retardo para que el spinner sea visible
      }
    };
    fetchCustomers();
  }, []);

  // Fetch Sites when a customer is Selected
  useEffect(() => {
    if (!filters.customer) {
      setSites([]);
      return;
    }

    const fetchSites = async () => {
      setLoadingSites(true);
      try {
        const response = await fetch(
          `${process.env.NEXT_PUBLIC_API_URL}/api/sites?customer=${filters.customer}`
        );
        if (!response.ok)
          throw new Error(`HTTP error! Status: ${response.status}`);

        const data = await response.json();
        console.log('Fetched Sites:', data);
        setSites(Array.isArray(data) ? data : []);
      } catch (error) {
        console.error('Error fetching sites:', error);
        setSites([]);
      } finally {
        setTimeout(() => {
          setLoadingSites(false);
        }, 500); // Pequeño retardo para que el spinner sea visible
      }
    };

    fetchSites();
  }, [filters.customer]);

  // Fetch Customer & Site Info When GMPT Code is Entered
  useEffect(() => {
    const fetchVehicleByGmpt = async () => {
      if (!filters.gmptCode) return;
      console.log('Fetching vehicle by GMPT code:', filters.gmptCode);
      try {
        const response = await fetch(
          `${process.env.NEXT_PUBLIC_API_URL}/api/vehicles?gmptCode=${filters.gmptCode}`
        );
        if (!response.ok)
          throw new Error(`HTTP error! Status: ${response.status}`);

        const data = await response.json();
        console.log('Vehicle Data:', data);

        // Handle multiple vehicles from different companies
        if (Array.isArray(data) && data.length > 0) {
          // Group by customer and site
          const companyGroups = data.reduce((groups, vehicle) => {
            const key = `${vehicle.customer}|${vehicle.site}`;
            if (!groups[key]) {
              groups[key] = {
                customer: vehicle.customer,
                site: vehicle.site,
                count: 0,
                vehicles: [],
              };
            }
            groups[key].count++;
            groups[key].vehicles.push(vehicle);
            return groups;
          }, {});

          const companies = Object.values(companyGroups);

          if (companies.length === 1) {
            // Single company - auto-populate and trigger search
            const company = companies[0];
            console.log('Single company found, auto-populating...');
            localStorage.setItem('selectedCustomer', company.customer);
            localStorage.setItem('selectedSite', company.site);

            setFilters((prevFilters) => ({
              ...prevFilters,
              customer: company.customer,
              site: company.site,
            }));

            // Auto-trigger search after state is updated
            setTimeout(() => {
              if (typeof onFilterChange === 'function') {
                console.log('Auto-triggering search for single company');
                onFilterChange();
              }
            }, 100);
          } else {
            // Multiple companies - show selection
            console.log(`Multiple companies found: ${companies.length}`);
            setAvailableCompanies(companies);
            setMultipleCompaniesFound(true);
          }
        } else if (data.customer && data.site) {
          // Fallback for single vehicle object response
          console.log('Updating filters based on GMPT vehicle...');
          localStorage.setItem('selectedCustomer', data.customer);
          localStorage.setItem('selectedSite', data.site);

          setFilters((prevFilters) => ({
            ...prevFilters,
            customer: data.customer,
            site: data.site,
          }));

          // Auto-trigger search after state is updated
          setTimeout(() => {
            if (typeof onFilterChange === 'function') {
              console.log('Auto-triggering search for single vehicle');
              onFilterChange();
            }
          }, 100);
        }
      } catch (error) {
        console.error('Error fetching vehicle by GMPT:', error);
      }
    };

    fetchVehicleByGmpt();
  }, [filters.gmptCode, onFilterChange]);

  // Handle company selection from modal
  const handleCompanySelection = (selectedCompany: {
    customer: string;
    site: string;
  }) => {
    console.log('User selected company:', selectedCompany);
    localStorage.setItem('selectedCustomer', selectedCompany.customer);
    localStorage.setItem('selectedSite', selectedCompany.site);

    setFilters((prevFilters) => ({
      ...prevFilters,
      customer: selectedCompany.customer,
      site: selectedCompany.site,
    }));

    setMultipleCompaniesFound(false);
    setAvailableCompanies([]);
  };

  // Handle Input Changes and save to localStorage immediately
  const handleFilterChange = (
    e: React.ChangeEvent<HTMLSelectElement | HTMLInputElement>
  ) => {
    const { name, value } = e.target;

    // Update state
    setFilters((prev) => ({
      ...prev,
      [name]: value,
    }));
    // Save to localStorage immediately
    if (name === 'gmptCode') {
      setFilters((prev) => ({
        ...prev,
        gmptCode: value,
      }));
      localStorage.setItem('selectedGmpt', value);
    } else if (name === 'customer') {
      setFilters((prev) => ({
        ...prev,
        customer: value,
        site: '',
        gmptCode: '', // Clear GMPT code when customer changes
      }));
      localStorage.removeItem('selectedSite');
      localStorage.removeItem('selectedGmpt'); // Clear GMPT from localStorage too
      localStorage.setItem('selectedCustomer', value);
    } else if (name === 'site') {
      setFilters((prev) => ({
        ...prev,
        site: value,
      }));
      localStorage.setItem('selectedSite', value);
    }

    // // Immediate callback if needed
    // if (typeof onFilterChange === 'function') {
    //   onFilterChange();
    // }
  };

  // Handle Search Button Click - mantener esta funcionalidad del compañero
  const handleSearch = () => {
    if (!filters.customer) {
      console.error('Customer is required for search.');
      return;
    }

    console.log('Saving to local storage:');
    console.log('Customer:', filters.customer);
    console.log('Site:', filters.site || 'None selected');
    console.log('GMPT:', filters.gmptCode || 'None input');

    // Store customer and site in local storage - Make sure we store the raw values
    localStorage.setItem('selectedCustomer', filters.customer);
    localStorage.setItem('selectedSite', filters.site || '');
    localStorage.setItem('selectedGmpt', filters.gmptCode || '');

    // Clear cache to ensure fresh data on parameter change
    fetch(`${process.env.NEXT_PUBLIC_API_URL}/clear-vehicle-cache`, {
      method: 'POST',
    }).catch((err) => console.error('Failed to clear cache:', err));

    if (typeof onFilterChange === 'function') {
      onFilterChange();
    } else {
      console.warn(
        'onFilterChange is not defined, skipping function call.'
      );
    }
  };

  const clearFilters = () => {
    // Reset filters state
    setFilters({
      customer: '',
      site: '',
      gmptCode: '',
    });

    // Clear localStorage
    localStorage.removeItem('selectedCustomer');
    localStorage.removeItem('selectedSite');
    localStorage.removeItem('selectedGmpt');
    localStorage.removeItem('siteData');

    // Reset sites list
    setSites([]);

    // // Trigger callback if provided
    // if (typeof onFilterChange === 'function') {
    //   onFilterChange();
    // }
  };

  // Loading spinner component with CSS
  const Spinner = () => (
    <div className='inline-block animate-spin rounded-full h-5 w-5 border-b-2 border-teal-600 border-t-2 border-transparent ml-2'></div>
  );

  // CSS para spinner
  useEffect(() => {
    if (!document.getElementById('spinner-styles')) {
      const style = document.createElement('style');
      style.id = 'spinner-styles';
      style.innerHTML = `
        @keyframes spin {
          to { transform: rotate(360deg); }
        }
        .animate-spin {
          animation: spin 1s linear infinite;
        }
      `;
      document.head.appendChild(style);
    }

    return () => {
      const styleElement = document.getElementById('spinner-styles');
      if (styleElement) {
        styleElement.remove();
      }
    };
  }, []);

  return (
    <nav className='bg-teal-500 text-white p-4 shadow-md'>
      <div className='container mx-auto mt-4 bg-gray-100 p-6 rounded-lg shadow relative'>
        {loadingData && (
          <div className='absolute inset-0 bg-gray-200 bg-opacity-50 flex items-center justify-center z-10 rounded-lg'>
            <div className='h-12 w-12 border-4 border-t-teal-600 border-b-teal-600 border-l-transparent border-r-transparent rounded-full animate-spin'></div>
          </div>
        )}
        <h2 className='text-lg font-semibold text-gray-800 mb-3 flex items-center'>
          Filters
        </h2>
        <div className='grid grid-cols-3 gap-4'>
          {/* Customer Filter */}
          <div>
            <label className='block text-base font-medium text-gray-700 mb-1 flex items-center'>
              Customer {loadingCustomers && <Spinner />}
            </label>
            <div className='flex items-center justify-center h-12 bg-white border-gray-300 rounded-md shadow-sm focus:ring-blue-500 focus:border-blue-500 rounded-lg'>
              <select
                name='customer'
                value={filters.customer}
                onChange={handleFilterChange}
                disabled={loadingCustomers}
                className='block w-full h-full sm:text-sm text-black focus:outline-none rounded-lg'
              >
                <option value=''>Select a Customer</option>
                {customers.map((customer) => (
                  <option
                    key={customer.customer_id}
                    value={customer.customer_id}
                  >
                    {customer.customer_name}
                  </option>
                ))}
              </select>
            </div>
          </div>
          {/* Site Filter */}
          <div>
            <label className='block text-base font-medium text-gray-700 mb-1 flex items-center'>
              Site {loadingSites && <Spinner />}
            </label>
            <div className='flex items-center justify-center h-12 bg-white border-gray-300 rounded-md shadow-sm focus:ring-blue-500 focus:border-blue-500 rounded-lg'>
              <select
                name='site'
                value={filters.site}
                onChange={handleFilterChange}
                disabled={!filters.customer || loadingSites}
                className='block w-full h-full sm:text-sm text-black focus:outline-none rounded-lg'
              >
                <option value=''>Select a Site</option>
                {sites.map((site) => (
                  <option key={site.site_id} value={site.site_id}>
                    {site.site_name}
                  </option>
                ))}
              </select>
            </div>
          </div>
          {/* GMPT Code Filter */}
          <div>
            <label className='block text-sm font-medium text-gray-700 mb-1'>
              GMPT Code
            </label>
            <div className='flex items-center justify-center h-12 bg-white border-gray-300 rounded-md shadow-sm focus:ring-blue-500 focus:border-blue-500 rounded-lg'>
              <input
                type='text'
                name='gmptCode'
                value={filters.gmptCode}
                onChange={handleFilterChange}
                className='block w-full h-full sm:text-sm text-black focus:outline-none rounded-lg'
              />
            </div>
          </div>
          <div className='col-span-3 flex justify-end space-x-4'>
            <button
              className='bg-gray-500 text-white px-4 py-2 rounded-md hover:bg-gray-600 transition'
              onClick={clearFilters}
            >
              Clear Filters
            </button>
            <button
              className='bg-orange-600 text-white px-4 py-2 rounded-md hover:bg-orange-700 transition flex items-center'
              onClick={handleSearch}
              title='Refresh data and clear cache'
            >
              <svg className='w-4 h-4 mr-2' fill='none' stroke='currentColor' viewBox='0 0 24 24'>
                <path strokeLinecap='round' strokeLinejoin='round' strokeWidth='2' d='M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15' />
              </svg>
              Refresh Data
            </button>
            <button
              className='bg-teal-600 text-white px-4 py-2 rounded-md hover:bg-teal-700 transition'
              onClick={handleSearch}
            >
              Search
            </button>
          </div>
        </div>
        {multipleCompaniesFound && (
          <div className='mt-4 p-4 bg-white rounded-lg shadow-md'>
            <h3 className='text-md font-semibold text-gray-800 mb-2'>
              Multiple Companies Found
            </h3>
            <div className='space-y-2'>
              {availableCompanies.map((company) => (
                <div
                  key={`${company.customer}-${company.site}`}
                  className='p-3 bg-gray-100 rounded-lg shadow cursor-pointer hover:bg-gray-200 transition'
                  onClick={() =>
                    handleCompanySelection({
                      customer: company.customer,
                      site: company.site,
                    })
                  }
                >
                  <p className='text-sm text-gray-700'>
                    {company.customer} - {company.site}
                  </p>
                  <p className='text-xs text-gray-500'>
                    {company.count} vehicle
                    {company.count !== 1 && 's'} found
                  </p>
                </div>
              ))}
            </div>
          </div>
        )}
      </div>
    </nav>
  );
};

export default Navsearch;

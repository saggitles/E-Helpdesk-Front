'use client';

import React, { useState, useEffect } from 'react';

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
  
  // Loading states - true por defecto para que se vean los spinners
  const [loadingCustomers, setLoadingCustomers] = useState<boolean>(true);
  const [loadingSites, setLoadingSites] = useState<boolean>(false);
  const [loadingData, setLoadingData] = useState<boolean>(true);

  // Load Local Storage Data After Component Mounts
  useEffect(() => {
    if (typeof window !== 'undefined') {
      setLoadingData(true);
      setTimeout(() => {
        try {
          const storedClient = localStorage.getItem('selectedCustomer') || '';
          const storedSite = localStorage.getItem('selectedSite') || '';
          const storedGmptCode = localStorage.getItem('gmptCode') || '';
          
          setFilters({
            client: storedClient,
            site: storedSite,
            gmptCode: storedGmptCode,
          });
        } catch (error) {
          console.error('Error loading data from localStorage:', error);
        } finally {
          setLoadingData(false);
        }
      }, 1000); // Delay extendido para asegurar visibilidad
    }
  }, []);

  // Fetch Customers from Backend
  useEffect(() => {
    const fetchCustomers = async () => {
      setLoadingCustomers(true);
      try {
        const response = await fetch(
          'http://localhost:8080/api/customers'
        );
        if (!response.ok)
          throw new Error(`HTTP error! Status: ${response.status}`);

        const data = await response.json();
        setCustomers(data);
      } catch (error) {
        console.error('Error fetching customers:', error);
      } finally {
        // Delay extendido para asegurar visibilidad
        setTimeout(() => {
          setLoadingCustomers(false);
        }, 1000);
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
      setLoadingSites(true);
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
      } finally {
        // Delay extendido para asegurar visibilidad
        setTimeout(() => {
          setLoadingSites(false);
        }, 1000);
      }
    };

    fetchSites();
  }, [filters.client]);

  // Handle Input Changes and save to localStorage immediately
  const handleFilterChange = (
    e: React.ChangeEvent<HTMLSelectElement | HTMLInputElement>
  ) => {
    const { name, value } = e.target;

    if (name === 'client') {
      setLoadingSites(true); // Activar spinner de sitios cuando cambia el cliente
    }

    // Update state
    setFilters((prev) => ({
      ...prev,
      [name]: value,
    }));

    // Save to localStorage immediately
    localStorage.setItem(name === 'client' ? 'selectedCustomer' : 
                         name === 'site' ? 'selectedSite' : 'gmptCode', value);
    
    // Call onFilterChange if provided
    if (typeof onFilterChange === 'function') {
      onFilterChange();
    }
  };

  return (
    <>
      {/* CSS GLOBAL para spinners - esto garantiza que los estilos siempre se apliquen */}
      <style jsx global>{`
        /* Keyframes para la animación del spinner */
        @keyframes spinner-border {
          to { transform: rotate(360deg); }
        }

        /* Estilos para el spinner principal */
        .spinner-overlay {
          position: absolute;
          top: 0;
          left: 0;
          right: 0;
          bottom: 0;
          background-color: rgba(255, 255, 255, 0.8);
          display: flex;
          justify-content: center;
          align-items: center;
          z-index: 9999;
          border-radius: 0.5rem;
        }

        .spinner-border {
          display: inline-block;
          width: 2rem;
          height: 2rem;
          vertical-align: text-bottom;
          border: 0.25em solid currentColor;
          border-right-color: transparent;
          border-radius: 50%;
          animation: spinner-border .75s linear infinite;
          color: #0d9488; /* color teal-600 */
        }

        .spinner-border-lg {
          width: 4rem;
          height: 4rem;
          border-width: 0.35em;
        }

        .spinner-label {
          margin-left: 0.5rem;
          display: inline-block;
          vertical-align: middle;
        }
      `}</style>

      <nav className='bg-teal-500 text-white p-4 shadow-md'>
        <div className='container mx-auto mt-4 bg-gray-100 p-6 rounded-lg shadow relative'>
          {/* Spinner overlay - completamente visible */}
          {loadingData && (
            <div className="spinner-overlay">
              <div className="spinner-border spinner-border-lg"></div>
            </div>
          )}
          
          <h2 className='text-lg font-semibold text-gray-800 mb-3'>
            Filtros
          </h2>
          <div className='grid grid-cols-3 gap-4'>
            {/* Customer Filter */}
            <div>
              <label className='block text-sm font-medium text-gray-700 mb-1'>
                Cliente
                {loadingCustomers && (
                  <span className="spinner-label">
                    <div className="spinner-border" style={{ width: '1.5rem', height: '1.5rem' }}></div>
                  </span>
                )}
              </label>
              <select
                name='client'
                value={filters.client}
                onChange={handleFilterChange}
                disabled={loadingCustomers}
                className='block w-full border-gray-300 rounded-md shadow-sm focus:ring-blue-500 focus:border-blue-500 sm:text-sm text-black'
              >
                <option value=''>Seleccionar Cliente</option>
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
                Sitio
                {loadingSites && (
                  <span className="spinner-label">
                    <div className="spinner-border" style={{ width: '1.5rem', height: '1.5rem' }}></div>
                  </span>
                )}
              </label>
              <select
                name='site'
                value={filters.site}
                onChange={handleFilterChange}
                disabled={!filters.client || loadingSites}
                className='block w-full border-gray-300 rounded-md shadow-sm focus:ring-blue-500 focus:border-blue-500 sm:text-sm text-black'
              >
                <option value=''>Seleccionar Sitio</option>
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
                Código GMPT
              </label>
              <input
                type='text'
                name='gmptCode'
                value={filters.gmptCode}
                onChange={handleFilterChange}
                className='w-full p-2 border border-gray-300 rounded-md shadow-sm focus:ring-teal-500 focus:border-teal-500 text-black'
              />
            </div>
          </div>
        </div>
      </nav>
    </>
  );
};

export default Navsearch;
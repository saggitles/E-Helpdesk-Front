"use client";
import React, { useState, useEffect, useRef } from 'react';

interface NavbarProps {
  onFilterChange?: () => void;
}

interface Customer {
  USER_CD: string;
  USER_NAME: string;
}

interface Site {
  LOCATION_CD: string;
  NAME: string;
}

interface FilterState {
  client: string;
  site: string;
  gmptCode: string;
}

const Navsearch: React.FC<NavbarProps> = ({ onFilterChange }) => {
  // Define state for filters
  const [filters, setFilters] = useState<FilterState>({
    client: '',
    site: '',
    gmptCode: '',
  });
  const [customers, setCustomers] = useState<Customer[]>([]);
  const [sites, setSites] = useState<Site[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [clientSearchTerm, setClientSearchTerm] = useState('');
  const [siteSearchTerm, setSiteSearchTerm] = useState('');
  const [showClientDropdown, setShowClientDropdown] = useState(false);
  const [showSiteDropdown, setShowSiteDropdown] = useState(false);
  const clientDropdownRef = useRef<HTMLDivElement>(null);
  const siteDropdownRef = useRef<HTMLDivElement>(null);
  
  // Función para filtrar clientes por término de búsqueda
  const filteredCustomers = customers.filter(customer => 
    customer.USER_NAME.toLowerCase().includes(clientSearchTerm.toLowerCase())
  );
  
  // Función para filtrar sitios por término de búsqueda
  const filteredSites = sites.filter(site => 
    site.NAME.toLowerCase().includes(siteSearchTerm.toLowerCase())
  );
  
  // Manejar clicks fuera de los dropdowns
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (clientDropdownRef.current && !clientDropdownRef.current.contains(event.target as Node)) {
        setShowClientDropdown(false);
      }
      if (siteDropdownRef.current && !siteDropdownRef.current.contains(event.target as Node)) {
        setShowSiteDropdown(false);
      }
    };
    
    document.addEventListener('mousedown', handleClickOutside);
    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
    };
  }, []);
  
  // Fetch customers and load from localStorage (client-side only)
  useEffect(() => {
    const initializeComponent = async () => {
      setIsLoading(true);
      
      // Get stored values first
      const storedCustomer = localStorage.getItem("selectedCustomer") || '';
      const storedSite = localStorage.getItem("selectedSite") || '';
      const storedGmptCode = localStorage.getItem("selectedGmptCode") || '';
      
      console.log("Loading stored values:", { storedCustomer, storedSite, storedGmptCode });
      
      try {
        // Fetch customers first
        const response = await fetch('http://localhost:8080/api/customers');
        
        if (!response.ok) {
          throw new Error(`HTTP error! Status: ${response.status}`);
        }
        
        const data = await response.json();
        setCustomers(data);
        console.log("Customers loaded:", data.length);
        
        // If we have a stored customer, fetch sites
        if (storedCustomer) {
          try {
            const sitesResponse = await fetch(`http://localhost:8080/api/sites?customer=${storedCustomer}`);
            
            if (!sitesResponse.ok) {
              throw new Error(`HTTP error! Status: ${sitesResponse.status}`);
            }
            
            const sitesData = await sitesResponse.json();
            const validSites = Array.isArray(sitesData) ? sitesData : [];
            setSites(validSites);
            console.log("Sites loaded:", validSites.length);
            
            // Now that both customers and sites are loaded, update the filters
            setFilters({
              client: storedCustomer,
              site: storedSite,
              gmptCode: storedGmptCode
            });
          } catch (error) {
            console.error("Error fetching sites:", error);
            setSites([]);
            // Still set filters even if sites failed to load
            setFilters({
              client: storedCustomer,
              site: storedSite,
              gmptCode: storedGmptCode
            });
          }
        } else {
          // No customer stored, just set the filters
          setFilters({
            client: '',
            site: '',
            gmptCode: storedGmptCode
          });
        }
      } catch (error) {
        console.error('Error fetching customers:', error);
        // Set filters even if customers failed to load
        setFilters({
          client: storedCustomer,
          site: storedSite,
          gmptCode: storedGmptCode
        });
      } finally {
        setIsLoading(false);
      }
    };
    
    // Only run this effect on the client side
    if (typeof window !== 'undefined') {
      initializeComponent();
    }
  }, []);

  // Fetch sites when a client is selected (only if different from stored value)
  useEffect(() => {
    if (!filters.client || isLoading) {
      return;
    }

    const fetchSites = async () => {
      try {
        const response = await fetch(`http://localhost:8080/api/sites?customer=${filters.client}`);
        
        if (!response.ok) {
          throw new Error(`HTTP error! Status: ${response.status}`);
        }
        
        const data = await response.json();
        setSites(Array.isArray(data) ? data : []);
      } catch (error) {
        console.error("Error fetching sites:", error);
        setSites([]);
      }
    };

    fetchSites();
  }, [filters.client, isLoading]);

  // Handle changes in the filter inputs
  const handleFilterChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
    const { name, value } = e.target;
    setFilters((prev) => ({
      ...prev,
      [name]: value,
      // Clear site if client changes
      ...(name === 'client' && { site: '' }),
    }));

    // Si cambia el cliente, actualizar localStorage
    if (name === 'client') {
      // Si el valor está vacío (opción "Select a Customer"), limpiar localStorage
      if (value === '') {
        localStorage.removeItem("selectedCustomer");
        // También limpiar el sitio ya que depende del cliente
        localStorage.removeItem("selectedSite");
      } else {
        localStorage.setItem("selectedCustomer", value);
      }
    }

    // Si cambia el sitio, actualizar localStorage
    if (name === 'site') {
      if (value === '') {
        localStorage.removeItem("selectedSite");
      } else {
        localStorage.setItem("selectedSite", value);
      }
    }

    // Store GMPT Code in localStorage as soon as it changes
    if (name === 'gmptCode') {
      if (value === '') {
        localStorage.removeItem("selectedGmptCode");
      } else {
        localStorage.setItem("selectedGmptCode", value);
      }
    }
  };

  const handleSearch = async () => {
    // Store customer and site in local storage (solo si tienen valores)
    if (filters.client) {
      localStorage.setItem("selectedCustomer", filters.client);
    } else {
      localStorage.removeItem("selectedCustomer");
    }
    
    if (filters.site) {
      localStorage.setItem("selectedSite", filters.site);
    } else {
      localStorage.removeItem("selectedSite");
    }
    
    if (filters.gmptCode) {
      localStorage.setItem("selectedGmptCode", filters.gmptCode);
    } else {
      localStorage.removeItem("selectedGmptCode");
    }

    // Check if onFilterChange exists before calling it
    if (typeof onFilterChange === "function") {
      onFilterChange();
    } else {
      console.warn("onFilterChange is not defined, skipping function call.");
    }
  };

  // Selector de cliente personalizado
// Selector de cliente personalizado
// Selector de cliente personalizado
const handleClientSelect = (userCd: string) => {
  // Si se selecciona "Select a Customer" (opción vacía)
  if (userCd === '') {
    // Primero actualizar el estado local
    setFilters(prev => ({
      ...prev,
      client: '',
      site: ''  // También limpiar el sitio
    }));
    
    // Limpiar localStorage de inmediato
    localStorage.removeItem("selectedCustomer");
    localStorage.removeItem("selectedSite");
    
    // Llamar inmediatamente a onFilterChange para mostrar todos los tickets
    setTimeout(() => {
      if (typeof onFilterChange === "function") {
        console.log("Cliente limpiado, mostrando todos los tickets");
        onFilterChange();
      }
    }, 0);
  } else {
    // Caso normal para selección de cliente
    const event = {
      target: {
        name: 'client',
        value: userCd
      }
    } as React.ChangeEvent<HTMLSelectElement>;
    
    handleFilterChange(event);
  }
  
  // Cerrar el dropdown y limpiar el término de búsqueda
  setShowClientDropdown(false);
  setClientSearchTerm('');
};

  // Selector de sitio personalizado
  const handleSiteSelect = (locationCd: string) => {
    const event = {
      target: {
        name: 'site',
        value: locationCd
      }
    } as React.ChangeEvent<HTMLSelectElement>;
    
    handleFilterChange(event);
    setShowSiteDropdown(false);
    setSiteSearchTerm('');
    
    // Si se selecciona "Select a site" (opción vacía), ejecutar la búsqueda inmediatamente
    if (locationCd === '') {
      // Eliminar del localStorage
      localStorage.removeItem("selectedSite");
      
      // Ejecutar la búsqueda para mostrar tickets filtrados solo por cliente
      if (typeof onFilterChange === "function") {
        console.log("Sitio limpiado, mostrando tickets filtrados por cliente");
        onFilterChange();
      }
    }
  };
  
  // Auto-apply stored values if available
  // useEffect(() => {
  //   if (!isLoading && 
  //       (filters.client || filters.gmptCode) && 
  //       (filters.site || sites.length === 0 || filters.gmptCode)) {
  //     // If we have stored values and data is loaded, auto-apply the search
  //     handleSearch();
  //   }
  // }, [isLoading, filters.client, filters.site, sites.length]);

  useEffect(() => {
    if (!isLoading && (filters.client || filters.site || filters.gmptCode)) {
      console.log("Auto-applying search with:", filters);
      // Allow a small delay for components to fully update
      setTimeout(() => {
        handleSearch();
      }, 300);
    }
  }, [isLoading, filters]);

  // Trigger search when GMPT code changes and meets minimum length
  useEffect(() => {
    // Set a minimum length (e.g., 3 characters) before auto-triggering search
    const minSearchLength = 3;
    
    if (filters.gmptCode && filters.gmptCode.length >= minSearchLength) {
      // Add a slight delay to avoid too many searches while typing
      const delaySearch = setTimeout(() => {
        handleSearch();
      }, 1000); // 1 second delay
      
      return () => clearTimeout(delaySearch);
    }
  }, [filters.gmptCode]);

  // Obtener el nombre del cliente seleccionado
  const selectedCustomerName = customers.find(c => c.USER_CD === filters.client)?.USER_NAME || "Select a Customer";
  
  // Obtener el nombre del sitio seleccionado
  const selectedSiteName = sites.find(s => s.LOCATION_CD === filters.site)?.NAME || "Select a site";

  return (
    <div className="bg-teal-50 py-8 px-6">
      <div className="container mx-auto">
        <div className="flex flex-row gap-4 items-center justify-center">
          {/* Cliente con búsqueda */}
          <div className="relative w-80" ref={clientDropdownRef}>
            <div 
              className="w-full h-10 bg-white text-gray-700 border border-gray-200 rounded-full px-4 text-sm flex items-center cursor-pointer"
              onClick={() => !isLoading && setShowClientDropdown(!showClientDropdown)}
            >
              {selectedCustomerName}
            </div>
            
            {showClientDropdown && (
              <div className="absolute z-50 w-full mt-1 bg-white border border-gray-200 rounded-md shadow-lg">
                <input
                  className="w-full p-2 border-b border-gray-200 focus:outline-none"
                  placeholder="Buscar cliente..."
                  value={clientSearchTerm}
                  onChange={(e) => setClientSearchTerm(e.target.value)}
                />
                <div className="max-h-60 overflow-y-auto">
                  <div 
                    className="p-2 hover:bg-teal-50 cursor-pointer"
                    onClick={() => handleClientSelect('')}
                  >
                    Select a Customer
                  </div>
                  {filteredCustomers.map((customer) => (
                    <div 
                      key={customer.USER_CD}
                      className="p-2 hover:bg-teal-50 cursor-pointer"
                      onClick={() => handleClientSelect(customer.USER_CD)}
                    >
                      {customer.USER_NAME}
                    </div>
                  ))}
                </div>
              </div>
            )}
          </div>

          {/* Sitio con búsqueda */}
          <div className="relative w-80" ref={siteDropdownRef}>
            <div 
              className={`w-full h-10 border rounded-full px-4 text-sm flex items-center ${
                !filters.client || isLoading 
                  ? 'bg-gray-100 text-gray-400 cursor-not-allowed' 
                  : 'bg-white text-gray-700 cursor-pointer'
              }`}
              onClick={() => filters.client && !isLoading && setShowSiteDropdown(!showSiteDropdown)}
            >
              {selectedSiteName}
            </div>
            
            {showSiteDropdown && (
              <div className="absolute z-50 w-full mt-1 bg-white border border-gray-200 rounded-md shadow-lg">
                <input
                  className="w-full p-2 border-b border-gray-200 focus:outline-none"
                  placeholder="Buscar sitio..."
                  value={siteSearchTerm}
                  onChange={(e) => setSiteSearchTerm(e.target.value)}
                />
                <div className="max-h-60 overflow-y-auto">
                  <div 
                    className="p-2 hover:bg-teal-50 cursor-pointer"
                    onClick={() => handleSiteSelect('')}
                  >
                    Select a site
                  </div>
                  {filteredSites.map((site) => (
                    <div 
                      key={site.LOCATION_CD}
                      className="p-2 hover:bg-teal-50 cursor-pointer"
                      onClick={() => handleSiteSelect(site.LOCATION_CD)}
                    >
                      {site.NAME}
                    </div>
                  ))}
                </div>
              </div>
            )}
          </div>

          {/* GMPT Code Filter (sin cambios) */}
          <input
            type="text"
            id="gmptCode"
            name="gmptCode"
            placeholder="GMPT Code"
            value={filters.gmptCode}
            onChange={handleFilterChange}
            className="w-80 h-10 bg-white text-gray-700 border border-gray-200 rounded-full px-4 text-sm focus:outline-none focus:ring-2 focus:ring-teal-500"
          />

          <button
            className="bg-teal-500 text-white h-10 px-5 rounded-full hover:bg-teal-600 transition text-sm font-medium"
            onClick={handleSearch}
            disabled={isLoading}
          >
            Search
          </button>
        </div>
      </div>
    </div>
  );
};

export default Navsearch;
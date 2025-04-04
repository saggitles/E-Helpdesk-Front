'use client';
import { useState, useEffect, ChangeEvent, FormEvent } from 'react';
import { useRouter } from 'next/router';
import { useUser } from '@auth0/nextjs-auth0/client';
import { ToastContainer, toast } from 'react-toastify';
import 'react-toastify/dist/ReactToastify.css';
import Navbar from '@/generic_comp/navbar';
import { PendingTickets } from '../../../components/filtros';
import TicketModal from '../../../components/modalCreate'; // Importa el componente modal

interface Customer {
  USER_CD: number;
  USER_NAME: string;
}

interface Site {
  LOCATION_CD: number;
  NAME: string;
}

interface Ticket {
  IDTicket: number;
  Title: string;
  Description: string;
  Status: string;
  Category: string;
  Priority: string;
  AssignedUserID?: number;
  CustomerID?: number;
  Site?: string;
  LocationCD?: number;
  Department?: string;
  createdAt: string;
  updatedAt: string;
  VehicleID?: string;
  Dealer: string;
  Contact: string;
  Supported: string;
  isEscalated?: string;
  Solution?: string;
  Platform?: string;
  CustomerName: string;
  Email?: string;
  Reporter?: string;
  Comments?: string;
}

interface FormData {
  customerName: string | null;
  customer_id: number | null;
  siteName: string | null;
  site_id: number | null;
  contactName: string;
  phone: string;
}

const CreateTicketPage = () => {
  const router = useRouter();
  const { user } = useUser();

  const [customers, setCustomers] = useState<Customer[]>([]);
  const [filteredCustomers, setFilteredCustomers] = useState<Customer[]>(
    []
  );
  const [showCustomerDropdown, setShowCustomerDropdown] = useState(false);
  const [selectedCustomerId, setSelectedCustomerId] = useState<
    number | null
  >(null);

  const [sites, setSites] = useState<Site[]>([]);
  const [showSiteDropdown, setShowSiteDropdown] = useState(false);
  const [customerOptions, setCustomerOptions] = useState<Customer[]>([]);
  const [siteOptions, setSiteOptions] = useState<Site[]>([]);
  const [selectedCustomer, setSelectedCustomer] = useState<string>('');
  const [selectedSite, setSelectedSite] = useState<Site | string>('');

  const [filteredTickets, setFilteredTickets] = useState<Ticket[]>([]);

  // Estado para controlar la visibilidad del modal
  const [showTicketModal, setShowTicketModal] = useState(false);

  const [formData, setFormData] = useState<FormData>({
    customerName: null,
    customer_id: null,
    siteName: null,
    site_id: null,
    contactName: '',
    phone: '',
  });

  useEffect(() => {
    const savedSiteString = localStorage.getItem('selectedSite');
    const savedSite = savedSiteString ? JSON.parse(savedSiteString) : null;
    const savedCustomerString = localStorage.getItem('selectedCustomer');
    const savedCustomer = savedCustomerString
      ? JSON.parse(savedCustomerString)
      : null;
    console.log('setting the saved customer', savedCustomer);

    setFormData((prev) => ({
      ...prev,
      customerName: savedCustomer ? savedCustomer.USER_NAME : null,
      customer_id: savedCustomer ? savedCustomer.USER_CD : null,
      site: savedSite,
    }));
    setSelectedCustomer(savedCustomer ? savedCustomer.USER_NAME : '');
  }, []);

  useEffect(() => {
    const fetchCustomers = async () => {
      try {
        const res = await fetch('http://localhost:8080/api/customers');
        const data = await res.json();
        setCustomerOptions(data);

        // Set selectedCustomer if localStorage has value
        const savedCustomer = localStorage.getItem('selectedCustomer');
        if (savedCustomer) setSelectedCustomer(savedCustomer);
      } catch (err) {
        console.error('Error fetching customers:', err);
      }
    };

    fetchCustomers();
  }, []);

  useEffect(() => {
    if (!formData.customer_id) {
      setSiteOptions([]);
      return;
    }

    const fetchSites = async () => {
      try {
        const res = await fetch(
          `http://localhost:8080/api/sites?customer=${formData.customer_id}`
        );
        const data = await res.json();
        setSiteOptions(data);
        console.log('Fetched sites:', data);

        // Set selectedSite if localStorage has value AND belongs to customer
        const savedSite = localStorage.getItem('selectedSite');
        console.log('Saved site from localStorage:', savedSite);
        interface SavedSiteChecker {
          (site: Site): boolean;
        }

        if (
          savedSite &&
          data.find(
            (site: Site): boolean => String(site.LOCATION_CD) === savedSite
          )
        ) {
          setSelectedSite(savedSite);
        } else {
          console.log("Saved site doesn't match current customer");
          setSelectedSite(''); // Reset if it doesn't match
          localStorage.removeItem('selectedSite');
        }
      } catch (err) {
        console.error('Error fetching sites:', err);
      }
    };

    fetchSites();
  }, [formData.customer_id]);

  const handleCustomerChange = (
    e: React.ChangeEvent<HTMLSelectElement>
  ) => {
    // Get the selected customer ID as a number
    const value = Number(e.target.value);
    // Find the customer object from customerOptions
    const customer = customerOptions.find((c) => c.USER_CD === value);

    if (customer) {
      setFormData((prev) => ({
        ...prev,
        customerName: customer.USER_NAME,
        customer_id: customer.USER_CD,
        // Optionally, reset site fields:
        siteName: null,
        site_id: null,
      }));
      setSelectedCustomer(customer.USER_NAME);
      setSelectedCustomerId(customer.USER_CD);
      console.log(
        'Selected customer, name, number:',
        customer.USER_NAME,
        customer.USER_CD
      );
      localStorage.setItem(
        'selectedCustomer',
        JSON.stringify({
          USER_NAME: customer.USER_NAME,
          USER_CD: customer.USER_CD,
        })
      );

      // When customer changes, also clear any saved site data.
      localStorage.removeItem('selectedSite');
      setSelectedSite('');
      window.dispatchEvent(new Event('storage'));
    } else {
      // If none found, you may want to clear fields
      setFormData((prev) => ({
        ...prev,
        customerName: null,
        customer_id: null,
      }));
    }
  };

  const handleSiteChange = async (
    e: React.ChangeEvent<HTMLSelectElement>
  ) => {
    const value = e.target.value; // The site's LOCATION_CD as a string.
    const selectedObj = siteOptions.find(
      (site) => String(site.LOCATION_CD) === value
    );

    if (selectedObj && selectedObj.LOCATION_CD) {
      console.log('Selecting site:', selectedObj);
      console.log('LOCATION_CD:', selectedObj.LOCATION_CD);

      // Update formData to include both siteName and site_id:
      setFormData((prev) => ({
        ...prev,
        siteName: selectedObj.NAME,
        site_id: Number(selectedObj.LOCATION_CD),
      }));
      // Store the full site object in selectedSite as well.
      setSelectedSite(selectedObj);
      localStorage.setItem('selectedSite', JSON.stringify(selectedObj));
      window.dispatchEvent(new Event('storage'));

      console.log('Selected Site Object:', selectedObj);
      console.log(
        'LocationCD to be used:',
        Number(selectedObj.LOCATION_CD)
      );

      try {
        const locationCD = Number(selectedObj.LOCATION_CD);
        if (!isNaN(locationCD) && locationCD !== 0) {
          const response = await fetch(
            `http://localhost:8080/api/ticket/site?locationCD=${locationCD}`
          );
          console.log('API Response:', response);

          if (!response.ok) {
            throw new Error('Error fetching tickets');
          }

          const tickets = await response.json();
          console.log('Received tickets:', tickets.length);
          console.log('Received tickets:', tickets);
          setFilteredTickets(tickets);
        } else {
          throw new Error('Invalid locationCD');
        }
      } catch (error) {
        console.error('Error loading tickets:', error);
        // Optionally display a toast error.
      }
    } else {
      // Reset if no valid site is selected
      setFormData((prev) => ({ ...prev, siteName: null, site_id: null }));
      console.log('No valid site selected');
      setSelectedSite('');
      localStorage.removeItem('selectedSite');
      window.dispatchEvent(new Event('storage'));
    }
  };

  const handleCustomerSelect = (customer: Customer) => {
    setFormData((prev) => ({
      ...prev,
      customerName: customer.USER_NAME,
      customer_id: customer.USER_CD, // Ensure this is a number
      siteName: null,
      site_id: null,
    }));
    setSelectedCustomer(customer.USER_NAME);
    setSelectedCustomerId(customer.USER_CD);
    localStorage.setItem(
      'selectedCustomer',
      JSON.stringify({
        USER_NAME: customer.USER_NAME,
        USER_CD: customer.USER_CD,
      })
    );

    // Clear saved site data
    localStorage.removeItem('selectedSite');
    setSelectedSite('');
    window.dispatchEvent(new Event('storage'));
  };

  const handleChange = (e: ChangeEvent<HTMLInputElement>) => {
    setFormData({
      ...formData,
      [e.target.name]: e.target.value,
    });
  };

  const handleSubmit = async (e: FormEvent) => {
    e.preventDefault();
    console.log('Form submitted');
    console.log('Form Data that is being saved', formData);

    if (
      !formData.customerName ||
      !formData.site_id ||
      !formData.contactName
    ) {
      toast.error('Please fill out all required fields');
      return;
    }

    // Abrimos el modal
    setShowTicketModal(true);
  };

  return (
    <>
      <Navbar />

      <div className='min-h-screen bg-gray-100 p-4'>
        <div className='max-w-2xl mx-auto'>
          <div className='bg-white rounded-lg shadow-sm'>
            <div className='bg-teal-500 px-4 py-3 rounded-t-lg flex justify-between items-center'>
              <h1 className='text-lg font-medium text-white'>
                Create New Ticket
              </h1>
            </div>

            <form onSubmit={handleSubmit} className='p-4'>
              <div className='mb-6'>
                <div className='bg-teal-50 border-l-4 border-teal-500 p-2 mb-4'>
                  <h2 className='text-teal-700 font-medium'>
                    Customer details
                  </h2>
                </div>

                <div className='grid grid-cols-1 md:grid-cols-2 gap-4'>
                  <div className='relative'>
                    <label
                      htmlFor='customer'
                      className='block text-sm font-normal text-teal-700 mb-1'
                    >
                      Customer
                    </label>
                    <select
                      value={formData.customer_id || 0}
                      onChange={handleCustomerChange}
                    >
                      <option value=''>Select Customer</option>
                      {customerOptions.map((c) => (
                        <option key={c.USER_CD} value={c.USER_CD}>
                          {c.USER_NAME}
                        </option>
                      ))}
                    </select>
                    {showCustomerDropdown &&
                      filteredCustomers.length > 0 && (
                        <div className='absolute z-10 w-full mt-1 bg-white border border-gray-200 rounded-md shadow-lg max-h-60 overflow-auto'>
                          {filteredCustomers.map((customer) => (
                            <div
                              key={customer.USER_CD}
                              className='px-4 py-2 hover:bg-teal-50 cursor-pointer'
                              onClick={() =>
                                handleCustomerSelect(customer)
                              }
                            >
                              {customer.USER_NAME}
                            </div>
                          ))}
                        </div>
                      )}
                  </div>

                  <div className='relative'>
                    <label
                      htmlFor='site'
                      className='block text-sm font-normal text-teal-700 mb-1'
                    >
                      Site
                    </label>
                    <select
                      value={formData.site_id || ''}
                      onChange={handleSiteChange}
                    >
                      <option value=''>Select Site</option>
                      {siteOptions.map((s) => (
                        <option key={s.LOCATION_CD} value={s.LOCATION_CD}>
                          {s.NAME}
                        </option>
                      ))}
                    </select>
                    {showSiteDropdown && sites.length > 0 && (
                      <div className='absolute z-10 w-full mt-1 bg-white border border-gray-200 rounded-md shadow-lg max-h-60 overflow-auto'>
                        {sites.map((site) => (
                          <option
                            key={site.LOCATION_CD}
                            value={site.LOCATION_CD}
                          >
                            {site.NAME}
                          </option>
                        ))}
                      </div>
                    )}
                  </div>

                  <div>
                    <label
                      htmlFor='contactName'
                      className='block text-sm font-normal text-teal-700 mb-1'
                    >
                      Contact Name
                    </label>
                    <input
                      type='text'
                      id='contactName'
                      name='contactName'
                      value={formData.contactName}
                      onChange={handleChange}
                      placeholder='Type contact name'
                      className='w-full p-2.5 text-sm border border-teal-300 rounded-lg focus:ring-teal-500 focus:border-teal-500 bg-gray-50 placeholder-gray-400'
                      required
                    />
                  </div>

                  <div>
                    <label
                      htmlFor='phone'
                      className='block text-sm font-normal text-teal-700 mb-1'
                    >
                      Phone
                    </label>
                    <input
                      type='text'
                      id='phone'
                      name='phone'
                      value={formData.phone}
                      onChange={handleChange}
                      placeholder='Type your phone'
                      className='w-full p-2.5 text-sm border border-teal-300 rounded-lg focus:ring-teal-500 focus:border-teal-500 bg-gray-50 placeholder-gray-400'
                    />
                  </div>
                </div>
              </div>

              <div className='flex justify-end'>
                <button
                  type='submit'
                  className='px-4 py-2 bg-teal-500 text-white rounded-lg hover:bg-teal-600 focus:outline-none focus:ring-2 focus:ring-teal-500 focus:ring-offset-2'
                >
                  New Ticket
                </button>
              </div>
            </form>
          </div>
        </div>

        {/* Tabla de tickets */}
        {selectedSite && (
          <PendingTickets
            locationCD={
              typeof selectedSite === 'object'
                ? selectedSite.LOCATION_CD
                : Number(selectedSite)
            }
          />
        )}

        {showTicketModal && (
          <TicketModal
            isOpen={showTicketModal}
            onClose={() => setShowTicketModal(false)}
            formData={{
              customerName: formData.customerName || '',
              customer_id: formData.customer_id || 0,
              siteName: formData.siteName || '',
              site_id: formData.site_id || 0,
              contactName: formData.contactName,
              phone: formData.phone,
            }}
            selectedSite={
              formData.site_id
                ? { site: formData.site_id, NAME: formData.siteName || '' }
                : null
            }
          />
        )}

        <ToastContainer />
      </div>
    </>
  );
};

export default CreateTicketPage;

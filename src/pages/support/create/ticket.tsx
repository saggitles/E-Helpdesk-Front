'use client';
import { useState, useEffect, ChangeEvent, FormEvent } from 'react';
import { useRouter } from 'next/router';
import { useUser } from '@auth0/nextjs-auth0/client';
import { ToastContainer, toast } from 'react-toastify';
import 'react-toastify/dist/ReactToastify.css';
import Navbar from '@/generic_comp/navbar';
import { PendingTickets } from '../../../components/filtros';
import TicketModal from '../../../components/modalCreate'; // Importa el componente modal
import {
  Ticket,
  Site,
  Customer,
  CreateTicketFormData,
} from '@/types/tickets.types';

const CreateTicketPage = () => {
  const router = useRouter();
  const { user } = useUser();

  const [showCustomerDropdown, setShowCustomerDropdown] = useState(false);
  const [showSiteDropdown, setShowSiteDropdown] = useState(false);
  const [customerOptions, setCustomerOptions] = useState<Customer[]>([]);
  const [siteOptions, setSiteOptions] = useState<Site[]>([]);
  const [filteredTickets, setFilteredTickets] = useState<Ticket[]>([]);
  const [showTicketModal, setShowTicketModal] = useState(false);

  const [formData, setFormData] = useState<CreateTicketFormData>({
    customer_name: '',
    customer_id: null,
    site_name: '',
    site_id: null,
    contact_name: '',
    phone: '',
  });

  // Load saved data from localStorage on mount
  useEffect(() => {
    const savedSiteString = localStorage.getItem('selectedSite');
    const savedSite = savedSiteString ? JSON.parse(savedSiteString) : null;
    const savedCustomerString = localStorage.getItem('selectedCustomer');
    const savedCustomer = savedCustomerString
      ? JSON.parse(savedCustomerString)
      : null;

    setFormData((prev) => ({
      ...prev,
      customer_name: savedCustomer ? savedCustomer.customer_name : '',
      customer_id: savedCustomer ? savedCustomer.customer_id : null,
      site_name: savedSite ? savedSite.site_name : '',
      site_id: savedSite ? savedSite.site_id : null,
    }));
  }, []);

  // Fetch customers
  useEffect(() => {
    const fetchCustomers = async () => {
      try {
        const res = await fetch('http://localhost:8080/api/customers');
        const data = await res.json();
        setCustomerOptions(data);
      } catch (err) {
        console.error('Error fetching customers:', err);
      }
    };
    fetchCustomers();
  }, []);

  // Fetch sites when customer changes
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
        if (!res.ok) throw new Error(`HTTP error! Status: ${res.status}`);
        const data = await res.json();

        if (!Array.isArray(data)) {
          console.error(
            'Expected sites to be an array but received:',
            data
          );
          setSiteOptions([]);
          return;
        }

        setSiteOptions(data);

        // Check if saved site belongs to this customer
        const savedSiteString = localStorage.getItem('selectedSite');
        if (savedSiteString) {
          const parsedSite = JSON.parse(savedSiteString);
          const matchingSite = data.find(
            (site: Site) =>
              String(site.site_id) === String(parsedSite.site_id)
          );

          if (!matchingSite) {
            // Site doesn't belong to current customer, clear it
            setFormData((prev) => ({
              ...prev,
              site_name: '',
              site_id: null,
            }));
            localStorage.removeItem('selectedSite');
          }
        }
      } catch (err) {
        console.error('Error fetching sites:', err);
        setSiteOptions([]);
      }
    };

    fetchSites();
  }, [formData.customer_id]);

  // Customer selection handler
  const handleCustomerChange = (
    e: React.ChangeEvent<HTMLSelectElement>
  ) => {
    const value = Number(e.target.value);
    const customer = customerOptions.find((c) => c.customer_id === value);

    if (customer) {
      // Update formData with customer and clear site
      setFormData((prev) => ({
        ...prev,
        customer_name: customer.customer_name,
        customer_id: customer.customer_id,
        site_name: '', // Reset site fields
        site_id: null,
      }));

      // Save customer to localStorage
      localStorage.setItem(
        'selectedCustomer',
        JSON.stringify({
          customer_name: customer.customer_name,
          customer_id: customer.customer_id,
        })
      );

      // Clear site from localStorage
      localStorage.removeItem('selectedSite');
      window.dispatchEvent(new Event('storage'));
    } else {
      setFormData((prev) => ({
        ...prev,
        customer_name: '',
        customer_id: null,
      }));
    }
  };

  // Site selection handler
  const handleSiteChange = async (
    e: React.ChangeEvent<HTMLSelectElement>
  ) => {
    const value = e.target.value;
    const selectedSite = siteOptions.find(
      (site) => String(site.site_id) === value
    );

    if (selectedSite && selectedSite.site_id) {
      // Update formData with site
      setFormData((prev) => ({
        ...prev,
        site_name: selectedSite.site_name,
        site_id: Number(selectedSite.site_id),
      }));

      // Save site to localStorage
      localStorage.setItem('selectedSite', JSON.stringify(selectedSite));
      window.dispatchEvent(new Event('storage'));

      // Fetch tickets for this site
      try {
        const site_id = Number(selectedSite.site_id);
        if (!isNaN(site_id) && site_id !== 0) {
          const response = await fetch(
            `http://localhost:8080/api/ticket/site?site_id=${site_id}`
          );

          if (!response.ok) {
            throw new Error('Error fetching tickets');
          }

          const tickets = await response.json();
          setFilteredTickets(tickets);
        }
      } catch (error) {
        console.error('Error loading tickets:', error);
      }
    } else {
      // Reset site fields
      setFormData((prev) => ({ ...prev, site_name: '', site_id: null }));
      localStorage.removeItem('selectedSite');
      window.dispatchEvent(new Event('storage'));
    }
  };

  // Form input change handler
  const handleChange = (e: ChangeEvent<HTMLInputElement>) => {
    setFormData({
      ...formData,
      [e.target.name]: e.target.value,
    });
  };

  // Form submit handler
  const handleSubmit = async (e: FormEvent) => {
    e.preventDefault();
    console.log('Form Data that is being saved', formData);

    if (
      !formData.customer_name ||
      !formData.site_id ||
      !formData.contact_name
    ) {
      toast.error('Please fill out all required fields');
      return;
    }

    setShowTicketModal(true);
  };

  // render JSX remains mostly the same, but now uses formData directly
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
                        <option key={c.customer_id} value={c.customer_id}>
                          {c.customer_name}
                        </option>
                      ))}
                    </select>
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
                        <option key={s.site_id} value={s.site_id}>
                          {s.site_name}
                        </option>
                      ))}
                    </select>
                  </div>

                  <div>
                    <label
                      htmlFor='Contact Name'
                      className='block text-sm font-normal text-teal-700 mb-1'
                    >
                      Contact name
                    </label>
                    <input
                      type='text'
                      id='contact_name'
                      name='contact_name'
                      value={formData.contact_name}
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
        {formData.site_id && <PendingTickets site_id={formData.site_id} />}

        {showTicketModal && (
          <TicketModal
            isOpen={showTicketModal}
            onClose={() => setShowTicketModal(false)}
            formData={{
              customer_name: formData.customer_name || '',
              customer_id: formData.customer_id || 0,
              site_name: formData.site_name || '',
              site_id: formData.site_id || 0,
              contact_name: formData.contact_name,
              phone: formData.phone,
            }}
          />
        )}

        <ToastContainer />
      </div>
    </>
  );
};

export default CreateTicketPage;

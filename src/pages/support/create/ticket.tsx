'use client';
import { useState, useEffect, ChangeEvent, FormEvent } from "react";
import { useRouter } from 'next/router';
import { useUser } from '@auth0/nextjs-auth0/client';
import { ToastContainer, toast } from 'react-toastify';
import 'react-toastify/dist/ReactToastify.css';
import Navbar from '@/generic_comp/navbar';
import { PendingTickets } from '../../../components/filtros';
import TicketModal from '../../../components/modalCreate'; // Importa el componente modal

interface Company {
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
    Companyname: string;
    Email?: string;
    Reporter?: string;
    Comments?: string;
}

const CreateTicketPage = () => {
    const router = useRouter();
    const { user } = useUser();
    
    const [companies, setCompanies] = useState<Company[]>([]);
    const [filteredCompanies, setFilteredCompanies] = useState<Company[]>([]);
    const [showCompanyDropdown, setShowCompanyDropdown] = useState(false);
    const [selectedCompanyId, setSelectedCompanyId] = useState<number | null>(null);
    
    const [sites, setSites] = useState<Site[]>([]);
    const [showSiteDropdown, setShowSiteDropdown] = useState(false);
    const [selectedSite, setSelectedSite] = useState<Site | null>(null);
    const [filteredTickets, setFilteredTickets] = useState<Ticket[]>([]);
    
    // Estado para controlar la visibilidad del modal
    const [showTicketModal, setShowTicketModal] = useState(false);
    
    const [formData, setFormData] = useState({
        company: '',
        site: '',
        contactName: '',
        phone: ''
    });

    const handleSiteSelect = async (site: Site) => {
        setFormData(prev => ({ ...prev, site: site.NAME }));
        setSelectedSite(site);
        setShowSiteDropdown(false);
        try {
          console.log("Selecting site:", site);
          console.log("LOCATION_CD:", site.LOCATION_CD);
          
          const response = await fetch(`http://localhost:8080/api/ticket/site?locationCD=${site.LOCATION_CD}`);
          
          console.log("API Response:", response);
          
          if (!response.ok) {
            throw new Error('Error fetching tickets');
          }
          
          const tickets = await response.json();
          console.log("Received tickets:", tickets.length);
          
          setFilteredTickets(tickets);
        } catch (error) {
          console.error('Error loading tickets:', error);
          // toast.error('Error loading tickets for this site');
        }
    };

    useEffect(() => {
        const fetchCompanies = async () => {
            try {
                const response = await fetch('http://localhost:8080/api/customers');
                const data = await response.json();
                setCompanies(data);
                console.log(data)
            } catch (error) {
                console.error('Error fetching companies:', error);
                toast.error('Error loading companies');
            }
        };

        fetchCompanies();
    }, []);

    useEffect(() => {
        const fetchSites = async () => {
            if (selectedCompanyId) {
                try {
                    const response = await fetch(`http://localhost:8080/api/sites?customer=${selectedCompanyId}`);
                    if (!response.ok) {
                        throw new Error('Error fetching sites');
                    }
                    const data = await response.json();
                    console.log(data)
                    setSites(data);
                    setShowSiteDropdown(true); // Mostrar dropdown de sitios automáticamente
                } catch (error) {
                    console.error('Error fetching sites:', error);
                    toast.error('Error loading sites');
                    setSites([]);
                }
            } else {
                setSites([]);
            }
        };

        fetchSites();
    }, [selectedCompanyId]);

    const handleCompanyInputChange = (e: ChangeEvent<HTMLInputElement>) => {
        const value = e.target.value;
        setFormData(prev => ({ ...prev, company: value }));
        
        const filtered = companies.filter(company => 
            company.USER_NAME.toLowerCase().includes(value.toLowerCase())
        );
        setFilteredCompanies(filtered);
        setShowCompanyDropdown(true);
    };

    const handleCompanySelect = (company: Company) => {
        setFormData(prev => ({ 
            ...prev, 
            company: company.USER_NAME,
            site: '' // Limpiar el site cuando se selecciona nueva compañía
        }));
        setSelectedCompanyId(company.USER_CD);
        setShowCompanyDropdown(false);
    };

    const handleChange = (e: ChangeEvent<HTMLInputElement>) => {
        if (!['company', 'site'].includes(e.target.name)) {
            setFormData({
                ...formData,
                [e.target.name]: e.target.value,
            });
        }
    };

    const handleSubmit = async (e: FormEvent) => {
        e.preventDefault();
        
        // Validamos que los campos requeridos estén completos
        if (!formData.company || !formData.site || !formData.contactName) {
            toast.error('Please fill out all required fields');
            return;
        }
        
        // Abrimos el modal
        setShowTicketModal(true);
    };

    return (
        <>
            <Navbar/>

            <div className="min-h-screen bg-gray-100 p-4">
                <div className="max-w-2xl mx-auto">
                    <div className="bg-white rounded-lg shadow-sm">
                        <div className="bg-teal-500 px-4 py-3 rounded-t-lg flex justify-between items-center">
                            <h1 className="text-lg font-medium text-white">Create New Ticket</h1>
                            <button 
                                onClick={() => router.back()}
                                className="text-white hover:text-teal-100"
                            >
                                <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M6 18L18 6M6 6l12 12" />
                                </svg>
                            </button>
                        </div>

                        <form onSubmit={handleSubmit} className="p-4">
                            <div className="mb-6">
                                <div className="bg-teal-50 border-l-4 border-teal-500 p-2 mb-4">
                                    <h2 className="text-teal-700 font-medium">Customer details</h2>
                                </div>

                                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                    <div className="relative">
                                        <label htmlFor="company" className="block text-sm font-normal text-teal-700 mb-1">
                                            Company
                                        </label>
                                        <input
                                            type="text"
                                            id="company"
                                            name="company"
                                            value={formData.company}
                                            onChange={handleCompanyInputChange}
                                            onFocus={() => setShowCompanyDropdown(true)}
                                            placeholder="Select a company"
                                            className="w-full p-2.5 text-sm border border-teal-300 rounded-lg focus:ring-teal-500 focus:border-teal-500 bg-gray-50 placeholder-gray-400"
                                            required
                                        />
                                        {showCompanyDropdown && filteredCompanies.length > 0 && (
                                            <div className="absolute z-10 w-full mt-1 bg-white border border-gray-200 rounded-md shadow-lg max-h-60 overflow-auto">
                                                {filteredCompanies.map((company) => (
                                                    <div
                                                        key={company.USER_CD}
                                                        className="px-4 py-2 hover:bg-teal-50 cursor-pointer"
                                                        onClick={() => handleCompanySelect(company)}
                                                    >
                                                        {company.USER_NAME}
                                                    </div>
                                                ))}
                                            </div>
                                        )}
                                    </div>

                                    <div className="relative">
                                        <label htmlFor="site" className="block text-sm font-normal text-teal-700 mb-1">
                                            Site
                                        </label>
                                        <input
                                            type="text"
                                            id="site"
                                            name="site"
                                            value={formData.site}
                                            readOnly
                                            placeholder={selectedCompanyId ? "Select a site" : "First select a company"}
                                            className="w-full p-2.5 text-sm border border-teal-300 rounded-lg focus:ring-teal-500 focus:border-teal-500 bg-gray-50 placeholder-gray-400 cursor-pointer"
                                            onClick={() => selectedCompanyId && setShowSiteDropdown(true)}
                                            required
                                        />
                                        {showSiteDropdown && sites.length > 0 && (
                                            <div className="absolute z-10 w-full mt-1 bg-white border border-gray-200 rounded-md shadow-lg max-h-60 overflow-auto">
                                                {sites.map((site) => (
                                                    <div
                                                        key={site.LOCATION_CD}
                                                        className="px-4 py-2 hover:bg-teal-50 cursor-pointer"
                                                        onClick={() => handleSiteSelect(site)}
                                                    >
                                                        {site.NAME}
                                                    </div>
                                                ))}
                                            </div>
                                        )}
                                    </div>

                                    <div>
                                        <label htmlFor="contactName" className="block text-sm font-normal text-teal-700 mb-1">
                                            Contact Name
                                        </label>
                                        <input
                                            type="text"
                                            id="contactName"
                                            name="contactName"
                                            value={formData.contactName}
                                            onChange={handleChange}
                                            placeholder="Type contact name"
                                            className="w-full p-2.5 text-sm border border-teal-300 rounded-lg focus:ring-teal-500 focus:border-teal-500 bg-gray-50 placeholder-gray-400"
                                            required
                                        />
                                    </div>

                                    <div>
                                        <label htmlFor="phone" className="block text-sm font-normal text-teal-700 mb-1">
                                            Phone
                                        </label>
                                        <input
                                            type="text"
                                            id="phone"
                                            name="phone"
                                            value={formData.phone}
                                            onChange={handleChange}
                                            placeholder="Type your phone"
                                            className="w-full p-2.5 text-sm border border-teal-300 rounded-lg focus:ring-teal-500 focus:border-teal-500 bg-gray-50 placeholder-gray-400"
                                            required
                                        />
                                    </div>
                                </div>
                            </div>

                            <div className="flex justify-end">
                                <button
                                    type="submit"
                                    className="px-4 py-2 bg-teal-500 text-white rounded-lg hover:bg-teal-600 focus:outline-none focus:ring-2 focus:ring-teal-500 focus:ring-offset-2"
                                >
                                    Create Ticket
                                </button>
                            </div>
                        </form>
                    </div>
                </div>
                
                {/* Tabla de tickets */}
                {selectedSite?.LOCATION_CD && (
                    <PendingTickets locationCD={selectedSite.LOCATION_CD} />
                )}
                
                {/* Modal de ticket */}
                {showTicketModal && (
                    <TicketModal 
                        isOpen={showTicketModal} 
                        onClose={() => setShowTicketModal(false)}
                        formData={formData}
                        selectedSite={selectedSite}
                    />
                )}
                
                <ToastContainer />
            </div>
        </>
    );
};

export default CreateTicketPage;
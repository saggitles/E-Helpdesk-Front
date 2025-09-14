import React, { useState, useEffect, ChangeEvent, FormEvent } from 'react';
import ModalCreateTicket from './ModalCreateTicket';
import axios from 'axios';

interface VehicleDetail {
  GMTP_ID: string;
  HireNo: string;
  Serial: string;
  Model: string;
  OnHire: boolean;
  IsVOR: boolean;
  supervisors: any;

  FSSS_BASE: any;
  FSSSMULTI: any;

  Questions: any;

  IMPACT_LOCKOUT: boolean;
  IdleTimeoutTimer: string;
  IsCanBus: boolean;
  FullLockoutEnabled: boolean;
  ImpactSetting: {
    BlueImpactGForce: number;
    AmberImpactGForce: number;
    RedImpactGForce: number;
    RedImpactThreshold: number;
    ImpactLockout: boolean;
    rows: {
      FSSS_BASE: string;
      IMPACT_LOCKOUT: boolean;
      FSSSMULTI: any;
    };
  };
  ChecklistSetting: {
    DriverBaseOrTimebase: string;
    Timeslot1: string;
    Timeslot2: string;
    Timeslot3: string;
    Timeslot4: string;
    ChecklistTimeoutInSec: number;
  };
  IdleSetting: {
    IdleTimeoutEnabled: boolean;
    IdleTimeoutTimer: number;
    IsCanBus: boolean;
  };
  LastSessionDetails: {
    SessionStartDateTime: string;
    SessionEndDateTime: string;
    DriverName: string;
  };
  DriverList: any[];
  generalInformationRes: any[];
  SupervisorList: any[];
  PreopChecklists: {
    Order: number;
    Questions: string;
    Type: string;
    ExpectedAnswer: string;
    IsCriticalQuestion: boolean;

    //FleetIQ
    QUESTION: any;
    EXP_ANS: any;
    CRITICAL_ANS: any;
  }[];
}

interface Dealer {
  id: number;
  client_name: string;
}

interface Company {
  USER_NAME: string;
}

interface Supervisor {
  USER_CD: number;
  driver_name: string;
  DEPT_NAME: string;
  NAME: string;
  CARD_ID: string;
  CARD_PREFIX: string;
  DRIVER_ID: string;
  Weigand: string;
}

interface CreateTicketsProps {
  gmptCodeUpdated?: boolean;
}

export const CreateTickets: React.FC<CreateTicketsProps> = ({
  gmptCodeUpdated,
}) => {
  const [selectedPlatform, setSelectedPlatform] = useState<string>('');
  const [selectedCompany, setSelectedCompany] = useState<string>('');
  const [selectedType, setSelectedType] = useState<string>(''); // Nuevo estado para el tipo seleccionado
  const [dealers, setDealers] = useState<Dealer[]>([]);
  const [companies, setCompanies] = useState<Company[]>([]);
  const [query, setQuery] = useState<string>('');
  const [results, setResults] = useState<VehicleDetail[]>([]);
  const [showModal, setShowModal] = useState(false);
  const G_FORCE_COEFFICIENT = 0.00388;
  const BLUE_IMPACT_COEFFICIENT = 1;
  const AMBER_IMPACT_COEFFICIENT = 5;
  const RED_IMPACT_COEFFICIENT = 10;

  const [hasCheckedUser, setHasCheckedUser] = useState(false);

  const handleSelectChange = async (
    event: React.ChangeEvent<HTMLSelectElement>
  ) => {
    const token = localStorage.getItem('accessToken');
    if (!token) {
      console.error('Access token not found');
      return;
    }
    const dealerId = event.target.value;
    setSelectedPlatform(event.target.value);
    try {
      const response = await axios.get(
        `${process.env.NEXT_PUBLIC_API_URL}/api/getCompanyFromDealer/${dealerId}`,
        {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        }
      );
      setCompanies(response.data);
    } catch (error) {
      console.error('Error fetching companies:', error);
    }
  };

  const handleCompanyChange = (
    event: React.ChangeEvent<HTMLSelectElement>
  ) => {
    setSelectedCompany(event.target.value);
  };

  const handleTypeChange = (
    event: React.ChangeEvent<HTMLSelectElement>
  ) => {
    setSelectedType(event.target.value);
  };

  const handleSearch = async (e: FormEvent<HTMLFormElement>) => {
    e.preventDefault();

    if (!selectedPlatform) {
      alert('Please select a platform');
      return;
    }

    const userToken = localStorage.getItem('accessToken');
    if (!userToken) {
      console.error('Access token not found');
      return;
    }
    try {
      let response;
      if (selectedPlatform === 'FleetXQ') {
        response = await axios.post(
          `${process.env.NEXT_PUBLIC_API_URL}/api/getvehicledetail`,
          { id: query },
          {
            headers: {
              'Content-Type': 'multipart/form-data',
              Authorization: `Bearer ${userToken}`,
            },
          }
        );
      } else if (selectedPlatform === 'FleetIQ') {
        if (query.startsWith('cii_')) {
          try {
            const response = await axios.get(
              `${process.env.NEXT_PUBLIC_API_URL}/api/fleetiq?vehicleId=${query}`,
              {
                headers: {
                  Authorization: `Bearer ${userToken}`,
                },
              }
            );

            if (response.data) {
              setResults([response.data]);
            } else {
              alert('GMTPID no encontrado en la respuesta.');
            }
          } catch (error) {
            // Type narrowing for 'error'
            if (axios.isAxiosError(error)) {
              if (error.response && error.response.status === 404) {
                alert(
                  'No encontrado: El vehículo con el ID especificado no fue encontrado.'
                );
              } else {
                console.error('Error fetching data:', error);
                alert('Ocurrió un error al intentar obtener los datos.');
              }
            } else {
              console.error('An unexpected error occurred:', error);
              alert('Ocurrió un error inesperado.');
            }
          }
        } else {
          if (selectedType === 'Serial') {
            response = await axios.post(
              `${process.env.NEXT_PUBLIC_API_URL}/api/fleetiqserial/${query}/${selectedCompany}`,
              {},
              {
                headers: {
                  Authorization: `Bearer ${userToken}`,
                },
              }
            );
          } else if (selectedType === 'Name') {
            response = await axios.post(
              `${process.env.NEXT_PUBLIC_API_URL}/api/fleetiqname/${query}/${selectedCompany}`,
              {},
              {
                headers: {
                  Authorization: `Bearer ${userToken}`,
                },
              }
            );
            setResults([response.data]);
          }
        }
      }
      if (response) {
        setResults([response.data]);
      }
    } catch (error: any) {
      console.error('Error fetching vehicle details:', error);
      if (axios.isAxiosError(error)) {
        console.error(
          'Server responded with status:',
          error.response?.status
        );
        console.error('Response data:', error.response?.data);
      } else {
        console.error('Unexpected error:', error);
      }
    }
  };

  const handleShowModal = () => {
    setShowModal(!showModal);
  };

  const handleChange = (e: ChangeEvent<HTMLInputElement>) => {
    setQuery(e.target.value);
  };

  const executeFleetIQSearch = async (gmptCode: string) => {
    try {
      const token = localStorage.getItem('accessToken');
      if (!token) {
        console.error('Access token not found');
        return;
      }

      const response = await axios.get(
        `${process.env.NEXT_PUBLIC_API_URL}/api/fleetiq?vehicleId=${gmptCode}`,
        {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        }
      );

      if (response.data) {
        setResults([response.data]);
      } else {
        console.warn('GMTPID no encontrado en la respuesta.');
      }
    } catch (error) {
      if (axios.isAxiosError(error)) {
        if (error.response && error.response.status === 404) {
          console.error(
            'No encontrado: El vehículo con el ID especificado no fue encontrado.'
          );
        } else {
          console.error('Error fetching data:', error);
        }
      } else {
        console.error('An unexpected error occurred:', error);
      }
    }
  };

  useEffect(() => {
    const checkStoredGmptCode = async () => {
      try {
        const storedGmptCode = localStorage.getItem('selectedGmptCode');

        if (storedGmptCode && storedGmptCode.trim() !== '') {
          setQuery(storedGmptCode);

          // Si el GMPT ID comienza con "cii_", asumimos que es para FleetIQ
          if (storedGmptCode.startsWith('cii_')) {
            setSelectedPlatform('FleetIQ');
            executeFleetIQSearch(storedGmptCode);
          } else {
            // En otro caso, podríamos configurarlo para FleetXQ u otra plataforma
            setSelectedPlatform('FleetXQ');
            // Implementar lógica para FleetXQ si es necesario
          }
        }
      } catch (error) {
        console.error('Error checking stored GMPT ID:', error);
      }
    };

    // Solo ejecutamos si estamos en el cliente y no hay resultados ya cargados
    if (typeof window !== 'undefined' && results.length === 0) {
      checkStoredGmptCode();
    }
  }, [results.length]);

  useEffect(() => {
    const checkStoredGmptCode = async () => {
      try {
        const storedGmptCode = localStorage.getItem('selectedGmptCode');

        if (storedGmptCode && storedGmptCode.trim() !== '') {
          setQuery(storedGmptCode);

          // Si el GMPT ID comienza con "cii_", asumimos que es para FleetIQ
          if (storedGmptCode.startsWith('cii_')) {
            setSelectedPlatform('FleetIQ');
            executeFleetIQSearch(storedGmptCode);
          } else {
            // En otro caso, configura para FleetXQ u otra plataforma según necesites
            setSelectedPlatform('FleetXQ');
            // Implementar lógica para FleetXQ si es necesario
          }
        }
      } catch (error) {
        console.error('Error checking stored GMPT ID:', error);
      }
    };

    // Ejecutar la verificación cada vez que se recibe una notificación
    checkStoredGmptCode();
  }, [gmptCodeUpdated]);

  return (
    <>
      <div className='bg-teal-50 min-h-screen text-center text-lg w-full'>
        {/* <h1 className="text-gray-600">
          Welcome to <span className="text-teal-700 font-bold">Collective Intelligence E-Helpdesk!</span> 
        </h1> */}
        {/* <form className="max-w-4xl mx-auto mt-5" onSubmit={handleSearch}>
          <div className="flex">
            <select className="bg-teal-100 text-sm font-medium text-teal-800 rounded-s-md text-center border border-teal-300" onChange={handleSelectChange}>
              <option value="">Dashboard</option>
              {dealers.map(dealer => (
                <option key={dealer.id} value={dealer.id}>
                  {dealer.client_name}
                </option>
              ))}
            </select>

            <select className="bg-teal-100 text-sm font-medium text-teal-800 text-center border border-teal-300" value={selectedCompany} onChange={handleCompanyChange}>
              <option value="">Company</option>
              {companies.map((company, index) => (
                <option key={index} value={company.USER_NAME}>
                  {company.USER_NAME}
                </option>
              ))}
            </select>

            <select className="bg-teal-100 text-sm font-medium text-teal-800 text-center border border-teal-300">
              <option value="">Vehicle</option>
              <option value="Driver">Driver</option>
            </select>
            <select
              className="bg-teal-100 text-sm font-medium text-teal-800 text-center border border-teal-300"
              value={selectedPlatform}
              onChange={(e) => setSelectedPlatform(e.target.value)}
            >
              <option value="" disabled>
                Platform
              </option>
              <option value="FleetXQ">FleetXQ</option>
              <option value="FleetIQ">FleetIQ</option>
              <option value="Fleet Focus">Fleet Focus</option>  
            </select>

            <select
              className="bg-teal-100 text-sm font-medium text-teal-800 text-center border border-teal-300"
              value={selectedType}
              onChange={handleTypeChange} // Nuevo manejador de cambio
            >
              <option value="" disabled>
                Type
              </option>
              <option value="Serial">Serial</option>
              <option value="Name">Name</option>
            </select>

            <div className="relative w-full">
              <input
                type="search"
                id="location-search"
                className="block p-2.5 w-full z-20 text-sm text-teal-900 bg-teal-50 rounded-e-lg border-s-teal-50 border-s-2 border border-teal-300 focus:ring-blue-500 focus:border-blue-500"
                placeholder="Search for Vehicle ID, serial ID or GMTP ID"
                value={query}
                onChange={handleChange}
                required
              />
              <button
                type="submit"
                className="absolute top-0 end-0 h-full px-3.5 text-sm font-medium text-white bg-teal-400 rounded-e-lg border border-teal-500 hover:bg-teal-500 focus:ring-4 focus:outline-none focus:ring-blue-300"
              >
                <svg
                  className="w-4 h-4"
                  aria-hidden="true"
                  xmlns="http://www.w3.org/2000/svg"
                  fill="none"
                  viewBox="0 0 20 20"
                >
                  <path
                    stroke="currentColor"
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth="2"
                    d="m19 19-4-4m0-7A7 7 0 1 1 1 8a7 7 0 0 1 14 0Z"
                  />
                </svg>
                <span className="sr-only">Search</span>
              </button>
            </div>
          </div>
        </form> */}

        <div className='w-full flex justify-center pb-2 mt-5 relative border border-teal-50 overflow-x-auto sm:rounded-lg '>
          <div className='bg-teal-50 w-1/2 m-auto'>
            <div className='flex items-center justify-between py-5 px-8'>
              <p className='border-l-2 border-teal-700 pl-3 text-teal-700 font-semibold'>
                Equipment details
              </p>
              <div>
                {/* <button onClick={handleShowModal} className="bg-teal-50 border-2 border-teal-200 hover:bg-teal-500 hover:text-gray-50 px-4 py-2 rounded-md text-sm text-teal-900">
                  Create Ticket
                </button> */}
              </div>
            </div>
          </div>
        </div>

        {/* SECTION 1 */}
        <div className='w-full text-sm text-left rounded-md rtl:text-right text-gray-500 flex justify-center pb-4'>
          {/* General Information */}
          <div className='w-1/2 mr-4'>
            <div>
              <div className='text-lg text-gray-100 rounded uppercase bg-teal-500 p-1 font-semibold'>
                <span className='px-4 py-3.5'>General Information</span>
              </div>
              {results.length > 0 ? (
                results.map((result, index) => (
                  <div
                    className='px-4 py-4 flex justify-evenly text-base border-x-2 border-b-2 border-gray-400 bg-white h-24'
                    key={index}
                  >
                    <div className='text-center'>
                      <label className='font-bold flex'>GTMP ID: </label>
                      <span>{result.GMTP_ID}</span>
                    </div>
                    <div className='text-center'>
                      <label className='font-bold flex'>Hire No: </label>
                      <span>{result.HireNo}</span>
                    </div>
                    <div className='text-center'>
                      <label className='font-bold flex'>Serial: </label>
                      <span>{result.Serial}</span>
                    </div>
                    <div className='text-center'>
                      <label className='font-bold flex'>Model: </label>
                      <span>{result.Model}</span>
                    </div>
                    <div className='text-center'>
                      <label className='font-bold flex'>IsVor: </label>
                      <span>{result.IsVOR ? 'Yes' : 'No'}</span>
                    </div>
                    <div className='text-center'>
                      <label className='font-bold flex'>
                        Full Lockout Enabled:{' '}
                      </label>
                      <span>
                        {result.FullLockoutEnabled ? 'Yes' : 'No'}
                      </span>
                    </div>
                  </div>
                ))
              ) : (
                <div className='bg-white border-b hover:bg-gray-50'>
                  <span className='px-6 py-4'>No results found</span>
                </div>
              )}
            </div>
          </div>
          {/* Idle Setting */}
          <div className='w-1/3'>
            <div>
              <div className='text-lg text-gray-100 rounded uppercase bg-teal-500 p-1 font-semibold'>
                <span className='px-4 py-3.5'>Idle Setting</span>
              </div>
              {results.length > 0 ? (
                results.map((result, index) => (
                  <div
                    className='px-4 py-4 flex justify-around text-base border-x-2 border-b-2 border-gray-400 bg-white h-24'
                    key={index}
                  >
                    <div className='text-center'>
                      <label className='font-bold flex'>
                        Idle Timeout Enabled:{' '}
                      </label>
                      <span>
                        {result.FullLockoutEnabled ? 'Yes' : 'No'}
                      </span>
                    </div>
                    <div className='text-center'>
                      <label className='font-bold flex'>
                        Idle Timeout Timer:{' '}
                      </label>
                      <span>{result.IdleSetting?.IdleTimeoutTimer}</span>
                    </div>
                    <div className='text-center'>
                      <label className='font-bold flex'>Canbus: </label>
                      <span>
                        {result.IdleSetting?.IsCanBus ? 'Yes' : 'No'}
                      </span>
                    </div>
                  </div>
                ))
              ) : (
                <div className='bg-white border-b hover:bg-gray-50'>
                  <span className='px-6 py-4'>No results found</span>
                </div>
              )}
            </div>
          </div>
        </div>
        {/* SECTION 2 */}
        <div className='w-full text-sm text-left rounded-md rtl:text-right text-gray-500 flex justify-center pb-4'>
          {/* ChecklistSetting */}
          <div className='w-1/2 mr-4'>
            <div>
              <div className='text-lg text-gray-100 rounded uppercase bg-teal-500 p-1 font-semibold'>
                <span className='px-4 py-3.5'>Checklist Setting</span>
              </div>
              {results.length > 0 ? (
                results.map((result, index) => (
                  <div
                    className='px-4 py-4 flex justify-evenly text-base border-x-2 border-b-2 border-gray-400 bg-white h-24'
                    key={index}
                  >
                    <div className='text-center'>
                      <label className='font-bold flex'>
                        Driverbase/Timebase:{' '}
                      </label>
                      <span>
                        {result.ChecklistSetting?.DriverBaseOrTimebase}
                      </span>
                    </div>
                    <div className='text-center'>
                      <label className='font-bold flex'>Timeslot1: </label>
                      <span>{result.ChecklistSetting?.Timeslot1}</span>
                    </div>
                    <div className='text-center'>
                      <label className='font-bold flex'>Timeslot2: </label>
                      <span>{result.ChecklistSetting?.Timeslot2}</span>
                    </div>
                    <div className='text-center'>
                      <label className='font-bold flex'>Timeslot3: </label>
                      <span>{result.ChecklistSetting?.Timeslot3}</span>
                    </div>
                    <div className='text-center'>
                      <label className='font-bold flex'>Timeslot4: </label>
                      <span>{result.ChecklistSetting?.Timeslot4}</span>
                    </div>
                    <div className='text-center'>
                      <label className='font-bold flex'>
                        ChecklistTimeoutInSec:{' '}
                      </label>
                      <span>
                        {result.ChecklistSetting?.ChecklistTimeoutInSec}
                      </span>
                    </div>
                  </div>
                ))
              ) : (
                <div className='bg-white border-b hover:bg-gray-50'>
                  <span className='px-6 py-4'>No results found</span>
                </div>
              )}
            </div>
          </div>
          {/* Impact Setting */}
          <div className='w-1/3'>
            <div>
              <div className='text-lg text-gray-100 rounded uppercase bg-teal-500 p-1 font-semibold'>
                <span className='px-4 py-3.5'>Impact Setting</span>
              </div>
              {results.length > 0 ? (
                results.map((result, index) => {
                  const impactThreshold =
                    result.FSSS_BASE * result.FSSSMULTI;

                  const blueImpactGForce = (
                    G_FORCE_COEFFICIENT *
                    Math.sqrt(impactThreshold * BLUE_IMPACT_COEFFICIENT)
                  ).toFixed(1);
                  const amberImpactGForce = (
                    G_FORCE_COEFFICIENT *
                    Math.sqrt(impactThreshold * AMBER_IMPACT_COEFFICIENT)
                  ).toFixed(1);
                  const redImpactGForce = (
                    G_FORCE_COEFFICIENT *
                    Math.sqrt(impactThreshold * RED_IMPACT_COEFFICIENT)
                  ).toFixed(1);

                  return (
                    <div
                      className='px-4 py-4 flex justify-around text-base border-x-2 border-b-2 border-gray-400 bg-white text-sm h-24'
                      key={index}
                    >
                      <div className='text-center'>
                        <label className='font-bold flex'>
                          Blue Impact:{' '}
                        </label>
                        <span>{blueImpactGForce}</span>
                      </div>
                      <div className='text-center'>
                        <label className='font-bold flex'>
                          Amber Impact:{' '}
                        </label>
                        <span>{amberImpactGForce}</span>
                      </div>
                      <div className='text-center'>
                        <label className='font-bold flex'>
                          Red Impact:{' '}
                        </label>
                        <span>{redImpactGForce}</span>
                        {/* <span>{redImpactThreshold}</span> */}
                      </div>
                      <div className='text-center'>
                        <label className='font-bold flex'>
                          Red Impact Threshold:{' '}
                        </label>
                        <span>{result.FSSS_BASE + '0'}</span>
                      </div>
                      <div className='text-center'>
                        <label className='font-bold flex'>
                          Impact Lockout{' '}
                        </label>
                        <span>
                          {result?.IMPACT_LOCKOUT ? 'Yes' : 'No'}
                        </span>
                      </div>
                    </div>
                  );
                })
              ) : (
                <div className='bg-white border-b hover:bg-gray-50'>
                  <span className='px-6 py-4'>No results found</span>
                </div>
              )}
            </div>
          </div>
        </div>
        {/* SECTION 3 */}
        <div className='w-full text-sm text-left rounded-md rtl:text-right text-gray-500 flex justify-center pb-4'>
          {/* DriverList */}
          <div className='w-84'>
            <div>
              <div className='text-lg text-gray-100 rounded uppercase bg-teal-500 p-1 font-semibold'>
                <span className='px-4 py-3.5'>Driver List</span>
              </div>
              {results.length > 0 ? (
                results.map((result, index) => (
                  <div key={index}>
                    {result.DriverList?.length > 0 ? (
                      <div className='h-64 overflow-y-auto border-x-2 border-b-2 border-gray-400 bg-white'>
                        <div className='py-4 flex justify-center text-base font-bold text-xl'>
                          <label className='font-bold flex w-1/6 flex flex-col items-center text-lg'>
                            Fullname:{' '}
                          </label>
                          <label className='font-bold flex w-1/6 flex flex-col items-center text-lg'>
                            Site:{' '}
                          </label>
                          <label className='font-bold flex w-1/6 flex flex-col items-center text-lg'>
                            Department:{' '}
                          </label>
                          <label className='font-bold flex w-1/6 flex flex-col items-center text-lg'>
                            Facility Code:{' '}
                          </label>
                          <label className='font-bold flex w-1/6 flex flex-col items-center text-lg'>
                            Card Pin No:{' '}
                          </label>
                          <label className='font-bold flex w-1/6 flex flex-col items-center text-lg'>
                            Weigand:
                          </label>
                        </div>
                        {result.DriverList.map((driver, driverIndex) => (
                          <div
                            key={driverIndex}
                            className='py-4 flex justify-center text-base'
                          >
                            <div className='w-1/6 flex flex-col items-center'>
                              <span>{driver.Fullname}</span>
                              <span>{driver.driver_name}</span>
                            </div>
                            <div className='w-1/6 flex flex-col items-center'>
                              <span>{driver.DEPT_NAME}</span>
                            </div>
                            <div className='w-1/6 flex flex-col items-center'>
                              <span>{driver.NAME}</span>
                            </div>
                            <div className='w-1/6 flex flex-col items-center'>
                              <span>{driver.FacilityCode}</span>
                              <span>{driver.CARD_PREFIX}</span>
                            </div>
                            <div className='w-1/6 flex flex-col items-center'>
                              <span>{driver.CardPinNo}</span>
                              <span>{driver.DRIVER_ID}</span>
                            </div>
                            <div className='w-1/6 flex flex-col items-center'>
                              <span>{driver.Weigand}</span>
                              <span>{driver.CARD_ID}</span>
                            </div>
                          </div>
                        ))}
                      </div>
                    ) : (
                      <div className='bg-white border-b hover:bg-gray-50'>
                        <span className='px-6 py-4'>No drivers found</span>
                      </div>
                    )}
                  </div>
                ))
              ) : (
                <div className='bg-white border-b hover:bg-gray-50'>
                  <span className='px-6 py-4'>No results found</span>
                </div>
              )}
            </div>
          </div>
        </div>
        {/* SECTION 4 */}
        <div className='w-full text-sm text-left rounded-md rtl:text-right text-gray-500 flex justify-center pb-4'>
          {/* SupervisorList */}
          <div className='w-84'>
            <div>
              <div className='text-lg text-gray-100 rounded uppercase bg-teal-500 p-1 font-semibold'>
                <span className='px-4 py-3.5'>Supervisor List</span>
              </div>
              {results.length > 0 ? (
                results.map((result, index) => (
                  <div key={index}>
                    {result.supervisors?.length > 0 ? (
                      <div className='h-64 overflow-y-auto border-x-2 border-b-2 border-gray-400 bg-white'>
                        {result.supervisors.map(
                          (
                            supervisor: Supervisor,
                            supervisorIndex: number
                          ) => (
                            <div
                              key={supervisorIndex}
                              className='py-4 flex justify-center text-base'
                            >
                              <div className='w-1/6 flex flex-col items-center'>
                                <label className='font-bold flex'>
                                  Fullname:{' '}
                                </label>
                                <span>{supervisor.driver_name}</span>
                              </div>
                              <div className='w-1/6 flex flex-col items-center'>
                                <label className='font-bold flex'>
                                  Site:{' '}
                                </label>
                                <span>{supervisor.NAME}</span>
                              </div>
                              <div className='w-1/6 flex flex-col items-center'>
                                <label className='font-bold flex'>
                                  Department:{' '}
                                </label>
                                <span>{supervisor.DEPT_NAME}</span>
                              </div>
                              <div className='w-1/6 flex flex-col items-center'>
                                <label className='font-bold flex'>
                                  Facility Code:{' '}
                                </label>
                                <span>{supervisor.CARD_PREFIX}</span>
                              </div>
                              <div className='w-1/6 flex flex-col items-center'>
                                <label className='font-bold flex'>
                                  Card Pin No:{' '}
                                </label>
                                <span>{supervisor.DRIVER_ID}</span>
                              </div>
                              <div className='w-1/6 flex flex-col items-center'>
                                <label className='font-bold flex'>
                                  Weigand:{' '}
                                </label>
                                <span>{supervisor.CARD_ID}</span>
                              </div>
                            </div>
                          )
                        )}
                      </div>
                    ) : (
                      <div className='bg-white border-b hover:bg-gray-50'>
                        <span className='px-6 py-4'>
                          No supervisors found
                        </span>
                      </div>
                    )}
                  </div>
                ))
              ) : (
                <div className='bg-white border-b hover:bg-gray-50'>
                  <span className='px-6 py-4'>No results found</span>
                </div>
              )}
            </div>
          </div>
        </div>
        {/* SECTION 5 */}
        <div className='w-full text-sm text-left rounded-md rtl:text-right text-gray-500 flex justify-center pb-4'>
          {/* PreopChecklists */}
          <div className='w-84'>
            <div>
              <div className='text-lg text-gray-100 rounded uppercase bg-teal-500 p-1 font-semibold'>
                <span className='px-4 py-3.5'>Pre-op Checklists</span>
              </div>
              {results.length > 0 ? (
                results.map((result, index) => (
                  <div key={index}>
                    {result.PreopChecklists?.length > 0 ? (
                      <div className='h-64 overflow-y-auto border-x-2 border-b-2 border-gray-400 bg-white'>
                        {result.PreopChecklists.map(
                          (checklist, checklistIndex) => (
                            <div
                              key={checklistIndex}
                              className='py-4 flex justify-center text-base'
                            >
                              <div className='w-1/5 flex flex-col items-center'>
                                <label className='font-bold flex'>
                                  Order:{' '}
                                </label>
                                <span>{checklist.Order}</span>
                              </div>
                              <div className='w-1/5 flex flex-col items-center'>
                                <label className='font-bold flex'>
                                  Question:{' '}
                                </label>
                                <span>{checklist.QUESTION}</span>
                              </div>
                              <div className='w-1/5 flex flex-col items-center'>
                                <label className='font-bold flex'>
                                  Type:{' '}
                                </label>
                                <span>{checklist.Type}</span>
                                <span>Yes/no</span>
                              </div>
                              <div className='w-1/5 flex flex-col items-center'>
                                <label className='font-bold flex'>
                                  Expected Answer:{' '}
                                </label>
                                <span>{checklist.ExpectedAnswer}</span>
                                <span>{checklist.EXP_ANS}</span>
                              </div>
                              <div className='w-1/5 flex flex-col items-center'>
                                <label className='font-bold flex'>
                                  Critical:{' '}
                                </label>
                                {/* <span>{checklist.IsCriticalQuestion ? 'Yes' : 'No'}</span> */}
                                <span>{checklist.CRITICAL_ANS}</span>
                              </div>
                            </div>
                          )
                        )}
                      </div>
                    ) : (
                      <div className='bg-white border-b hover:bg-gray-50'>
                        <span className='px-6 py-4'>
                          No pre-op checklists found
                        </span>
                      </div>
                    )}
                  </div>
                ))
              ) : (
                <div className='bg-white border-b hover:bg-gray-50'>
                  <span className='px-6 py-4'>No results found</span>
                </div>
              )}
            </div>
          </div>
        </div>
      </div>
      {showModal && (
        <ModalCreateTicket handleModalTicket={handleShowModal} />
      )}
    </>
  );
};

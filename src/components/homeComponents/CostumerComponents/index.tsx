import React, { useState, useEffect } from 'react';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faCheck } from '@fortawesome/free-solid-svg-icons';
import Box from '@mui/material/Box';
import Grid from '@mui/material/Grid';
import AllDrivers from './components/allDrivers';
import { createTheme, ThemeProvider } from '@mui/material/styles';
import Container from '@mui/material/Container';
import CssBaseline from '@mui/material/CssBaseline';
import Toolbar from '@mui/material/Toolbar';
import AppBar from '@mui/material/AppBar';
import Typography from '@mui/material/Typography';
import TextField from '@mui/material/TextField';
import { Alert } from '@/components/generalComponents';
import { EquipmentInfo, useGenerateDetails } from '@/contexts';
import { TicketInfo } from '@/reducers/UnresolvedTickets/types';


import {
  getCustomerDetails,
  getDriversByEquipment,  
  getEquipment,
  newTicket,
} from '@/services/api';

interface GeneralDetailsProps {
  setSearch: React.Dispatch<React.SetStateAction<boolean>>;
  search: boolean;
  ticketInfo?: TicketInfo; // TODO - edit this
  clearForm: boolean;
  setClearForm: React.Dispatch<React.SetStateAction<boolean>>;
}

interface AllDrivers {
  driver_name: string;
}

// GD = General Details
function GeneralDetails({
  setSearch,
  search,
  ticketInfo,
  clearForm,
  setClearForm,
}: GeneralDetailsProps) {
  const {
    setCustomer,
    customer: customerName,
    setEquipmentID,
    equipmentID,
    setEquipmentInfo,
    setDisplaySiteDetails,
    setDisplayEquipmentDetails,
    setDisplayTimeline,
    setDisplayDriverHistory,
    displayDriverHistory,
    setDisplayEvent,
    eventCategories,
    setEventCategories,
    setDisplayWebsiteSettings,
  } = useGenerateDetails();

  console.log('ticketInfo', ticketInfo);

  const [driverHistory, setDriverHistory] = useState(false);
  const [impacts, setImpacts] = useState(false);
  const [preop, setPreop] = useState(false);
  const [sessions, setSessions] = useState(false);
  const [wrongCallerName, setWrongCallerName] = useState(false);
  const [wrongCustomerName, setWrongCustomerName] = useState(false);
  const [wrongEquipmentID, setWrongEquipmentID] = useState(false);
  const [displayInput, setDisplayInput] = useState(false);
  const [allDrivers, setAllDrivers] = useState<AllDrivers[]>([]);
  const [alert, setAlert] = useState(false);
  const [checkCategory, setCheckCategory] = useState(false);
  const [callerName, setCallerName] = useState('');
  const [selectedDriver, setSelectedDriver] = useState('');
  const [eventTime, setEventTime] = useState('');
  const [story, setStory] = useState('');
  const [location, setLocation] = useState('');
  const [department, setDepartment] = useState('');
  const [saveError, setSaveError] = useState(false);
  const [showSuggestions, setShowSuggestions] = useState(false);
  const [filteredSuggestions, setFilteredSuggestions] = useState<string[]>(
    []
  );
  const [list, setList] = useState<string[]>([]);
  const [autocomplete, setAutocomplete] = useState(false);
  const [region, setRegion] = useState('-');
  const [hasDrivers, setHastDrivers] = useState(false);
  const [savedTicket, setSavedTicket] = useState(false);

  useEffect(() => {
    getEquipmentData(equipmentID).catch((err) => {
      console.log(err);
    });

    const clearField = (type?: 'all') => {
      setCallerName('');
      setCustomer('');
      setEquipmentID('');
      setLocation('');
      setDepartment('');
      setStory('');
      setSelectedDriver('');
      setEventTime('');
      setImpacts(false);
      setPreop(false);
      setSessions(false);
      setSearch(false);
      setDisplayInput(false);

      if (type === 'all') {
        setClearForm(false);
        setWrongEquipmentID(false);
        setWrongCustomerName(false);
        setWrongCallerName(false);
        setDriverHistory(false);
        setRegion('-');
      } else {
        setDriverHistory(false);
      }
    };

    const changeGeneral = () => {
      if (ticketInfo) {
        setCallerName(ticketInfo.callerName);
        setCustomer(ticketInfo.customerName);
        setDisplaySiteDetails(true);
        setEquipmentID(ticketInfo.equipment);
        setLocation(ticketInfo.location);
        setDepartment(ticketInfo.department);
        setStory(ticketInfo.story);
        setSelectedDriver(ticketInfo.driverName);
        setEventTime(ticketInfo.eventTime);
        getAllDrivers(ticketInfo.equipment);
        getEquipmentData(ticketInfo.equipment);
        setWrongEquipmentID(false);
        setWrongCustomerName(false);
        setWrongCallerName(false);
        setDriverHistory(false);
        setImpacts(false);
        setPreop(false);
        setSessions(false);
        setSearch(false);
      } else {
        // clearField();
      }

      if (clearForm === true) {
        clearField('all');
      }
    };

    changeGeneral();
  }, [ticketInfo, clearForm, customerName]);

  useEffect(() => {
    const createList = () => {
      let preview = [] as string[];

      hasDrivers &&
        equipmentID !== '' &&
        allDrivers.map((suggestion) => {
          return preview.push(suggestion.driver_name);
        });
      setList(preview);
    };
    if (!ticketInfo) {
      createList();
    }
  }, [allDrivers, equipmentID, hasDrivers]);

  const getEquipmentData = async (id: string) => {
    const data = await getEquipment<EquipmentInfo[]>(id);
    if (data) {
      setEquipmentInfo(data);
      getAllDrivers(id);
      setDisplayEquipmentDetails(true);
      setDisplayTimeline(true);
      setDisplayWebsiteSettings(true);
    } else {
      setWrongEquipmentID(true);
    }
  };

  const getAllDrivers = async (equipmentID: string) => {
    setAutocomplete(false);
    const data = await getDriversByEquipment<AllDrivers[]>(equipmentID);
    if (data) {
      setAllDrivers(data);
      setAutocomplete(true);
      setHastDrivers(true);
    } else {
      setAutocomplete(false);
    }
  };

  const testingField = (type: string, value: string) => {
    let regex;
    let res;
    switch (type) {
      case 'callerName':
        regex = new RegExp(/[a-z ,.'-]+$/i);
        res = regex.test(value);
        if (res === true) {
          setWrongCallerName(false);
          setCallerName(value);
        } else {
          setWrongCallerName(true);
        }
        return res;
      case 'customerName':
        regex = new RegExp(/[a-z ,.'-]+$/i);
        res = regex.test(value);
        if (res === true) {
          setWrongCustomerName(false);
          setCustomer(value);
          setDisplaySiteDetails(true);
        } else {
          setWrongCustomerName(true);
        }
        return res;
      case 'equipment_id':
        setDisplayEquipmentDetails(false);
        setDisplayTimeline(false);
        setDisplayWebsiteSettings(false);
        setWrongEquipmentID(false);
        setEquipmentID(value);
        getEquipmentData(value);
        return res;
      default:
        return false;
    }
  };

  const asignDriverHistory = () => {
    setDriverHistory(!driverHistory);
    setDisplayDriverHistory(!displayDriverHistory);
  };

  const asignEvent = (type: string) => {
    let temp = false;
    if (type === 'Impact') {
      setImpacts(!impacts);
      const change = eventCategories;
      change.impacts = !eventCategories.impacts;
      setEventCategories(eventCategories);
      temp = !impacts || preop || sessions;
    } else if (type === 'Preop') {
      setPreop(!preop);
      const change = eventCategories;
      change.preop = !eventCategories.preop;
      setEventCategories(eventCategories);
      temp = impacts || !preop || sessions;
    } else if (type === 'Sessions') {
      setSessions(!sessions);
      const change = eventCategories;
      change.sessions = !eventCategories.sessions;
      setEventCategories(eventCategories);
      temp = impacts || preop || !sessions;
    }

    if (temp) {
      setDisplayEvent(true);
    } else {
      setDisplayEvent(false);
    }
  };

  const saveTicket = async () => {
    setSaveError(false);
    const token = localStorage.getItem('token');
    const data = {
      callerName,
      customerName,
      department,
      driverName: selectedDriver,
      equipmentID,
      eventTime,
      id: 0,
      location,
      saveDAte: new Date(Date.now()).toISOString(),
      status: 0,
      story,
      ticketId: 0,
      user: 0,
    };

    await newTicket(data);
  };

  const checkSuggestions = () => {
    const check = list.filter(
      (suggestion) =>
        suggestion.toLowerCase().indexOf(selectedDriver.toLowerCase()) > -1
    );
    setFilteredSuggestions(check);
    setShowSuggestions(true);
  };

  const addLocationData = async () => {
    const data = await getCustomerDetails({
      customer: customerName,
      equipmentId: equipmentID,
    });

    if (data) {
      setLocation(data.location);
      setDepartment(data.department);
      setDisplayInput(true);
      setCustomer(data.customer);
      setRegion(data.region);
    }
  };

  const theme = createTheme();

  return (
    <ThemeProvider theme={theme}>
      <Container component='main' maxWidth='xl'>
        <CssBaseline />

        <AppBar
          position='absolute'
          color='default'
          elevation={0}
          sx={{
            position: 'relative',
            borderBottom: (t) => `1px solid ${t.palette.divider}`,
            marginTop: 3,
          }}
        >
          <Toolbar>
            <Typography variant='h5' color='inherit' noWrap>
              Welcome to Collective Inteligence E-Helpdesk
            </Typography>
          </Toolbar>
        </AppBar>
        <Box
          sx={{
            display: 'flex',
            flexDirection: 'column',
            alignItems: 'center',
            border: 1,
            borderTop: 0,
            boxShadow: 1,
            borderColor: 'grey.300',
            padding: 3,
          }}
        >
          <Grid container spacing={2}>
            <Grid item xs={12} md={6}>
              <div className='w-full'>
                <Typography component='h4' variant='h6'>
                  Incoming Customer Details
                </Typography>
                <div className='flex items-center px-0 py-2'>
                  <p className='min-w-[150px]'>Caller’s Name*</p>
                  <TextField
                    size='small'
                    type='text'
                    spellCheck={false}
                    placeholder=''
                    value={callerName}
                    required
                    label=''
                    aria-required='true'
                    onBlur={(e) => {
                      testingField('callerName', e.target.value);
                    }}
                    onChange={(e) => {
                      setCallerName(e.target.value);
                      setSearch(false);
                    }}
                  />

                  {wrongCallerName && ticketInfo === null && (
                    <p className='ml-2 text-red-600'>
                      Invalid caller's name
                    </p>
                  )}
                </div>
                <div className='flex items-center px-0 py-2'>
                  <p className='min-w-[150px]'>Gmtp   ID*</p>{' '}
                  <TextField
                    size='small'
                    type='text'
                    spellCheck={false}
                    value={equipmentID}
                    required
                    placeholder=''
                    onChange={(e) => {
                      setEquipmentID(e.target.value);
                      setSearch(false);
                    }}
                    onBlur={(e) => {
                      testingField('equipment_id', e.target.value);
                    }}
                  />
                  {wrongEquipmentID && (  
                    <p className='ml-2 text-red-600'>Alo</p>
                  )}
                </div>
                <div className='flex items-center px-0 py-2'>
                  <p className='min-w-[150px]'>Customer Name</p>{' '}
                  <TextField
                    size='small'
                    type='text'
                    spellCheck={false}
                    placeholder=''
                    value={customerName}
                    aria-required='true'
                    onChange={(e) => {
                      setCustomer(e.target.value);
                      setSearch(false);
                    }}
                    onBlur={(e) => {
                      testingField('customerName', e.target.value);
                    }}
                  />
                  {wrongCustomerName && (
                    <p className='ml-2 text-red-600'>
                      Put NA if not Available
                    </p>
                  )}
                </div>
                <div className='flex items-center px-0 py-2'>
                  <p className='min-w-[150px]'>Location Name</p>{' '}
                  <TextField
                    size='small'
                    type='text'
                    spellCheck={false}
                    placeholder=''
                    value={location}
                    onChange={(e) => {
                      setLocation(e.target.value);
                      setSearch(false);
                    }}
                  />
                </div>
                <div className='flex items-center px-0 py-2'>
                  <p className='min-w-[150px]'>Department Name</p>{' '}
                  <TextField
                    size='small'
                    type='text'
                    spellCheck={false}
                    placeholder=''
                    value={department}
                    onChange={(e) => {
                      setDepartment(e.target.value);
                      setSearch(false);
                    }}
                  />
                </div>
                <div className='flex items-center px-0 py-2'>
                  <p className='min-w-[150px]'>Region</p> <p>{region}</p>
                </div>
              </div>
            </Grid>
            <Grid item xs={12} md={6}>
              <div className='w-full'>
                <Typography component='h4' variant='h6'>
                  Issue Details
                </Typography>
                <div className='flex items-center px-0 py-2'>
                  <p className='min-w-[90px]'>Story</p>{' '}
                  <TextField
                    multiline
                    rows={4}
                    value={story}
                    onChange={(e) => {
                      setStory(e.target.value);
                      setSearch(false);
                    }}
                  />
                </div>
                <div className='flex items-center px-0 py-2'>
                  <p className='self-start min-w-[90px]'>Categories</p>
                  <div className='max-w-[600px] flex flex-wrap justify-start items-center mb-2'>
                    <div className='w-[220px] flex justify-start items-center mb-2'>
                      <input
                        style={{
                          clip: 'rect(0 0 0 0)',
                          clipPath: 'inset(50%)',
                        }}
                        className='border-0 h-[1px] -m-[1px] overflow-hidden p-0 absolute whitespace-nowrap w-[1px]'
                        checked={driverHistory}
                        onChange={() => {
                          setDriverHistory(!driverHistory);
                        }}
                      />
                      <div
                        className={`inline-block w-[16px] h-[16px] text-center border border-solid border-[#bbbbbb] rounded-sm transition-all duration-150 cursor-pointer ${
                          driverHistory ? 'bg-[#1d72e1]' : 'bg-transparent'
                        }`}
                        onChange={() => {
                          setDriverHistory(!driverHistory);
                        }}
                        onClick={() => {
                          asignDriverHistory();
                          setSearch(false);
                        }}
                      >
                        <FontAwesomeIcon
                          icon={faCheck}
                          // checked={driverHistory}
                          className={
                            driverHistory
                              ? 'GDCheckboxIconSelected'
                              : 'GDCheckboxIcon'
                          }
                        />
                      </div>
                      <span className='ml-[10px]'>
                        Driver Access History
                      </span>
                    </div>
                    <div className='w-[220px] flex justify-start items-center py-2 px-0'>
                      <input
                        style={{
                          clip: 'rect(0 0 0 0)',
                          clipPath: 'inset(50%)',
                        }}
                        className='border-0 h-[1px] -m-[1px] overflow-hidden p-0 absolute whitespace-nowrap w-[1px]'
                        checked={impacts}
                        onChange={() => setImpacts(!impacts)}
                      />
                      <div
                        className={`inline-block w-[16px] h-[16px] text-center border border-solid border-[#bbbbbb] rounded-sm transition-all duration-150 cursor-pointer ${
                          impacts ? 'bg-[#1d72e1]' : 'bg-transparent'
                        }`}
                        onChange={() => {
                          setImpacts(!impacts);
                          setSearch(false);
                        }}
                        onClick={() => {
                          asignEvent('Impact');
                          setSearch(false);
                        }}
                      >
                        <FontAwesomeIcon
                          icon={faCheck}
                          // checked={impacts}
                          className={
                            impacts
                              ? 'GDCheckboxIconSelected'
                              : 'GDCheckboxIcon'
                          }
                        />
                      </div>
                      <span className='ml-[10px]'>Impacts</span>
                    </div>
                    <div className='w-[220px] flex justify-start items-center py-2 px-0'>
                      <input
                        style={{
                          clip: 'rect(0 0 0 0)',
                          clipPath: 'inset(50%)',
                        }}
                        className='border-0 h-[1px] -m-[1px] overflow-hidden p-0 absolute whitespace-nowrap w-[1px]'
                        checked={preop}
                        onChange={() => {
                          setPreop(!preop);
                          setSearch(false);
                        }}
                      />
                      <div
                        className={`inline-block w-[16px] h-[16px] text-center border border-solid border-[#bbbbbb] rounded-sm transition-all duration-150 cursor-pointer ${
                          preop ? 'bg-[#1d72e1]' : 'bg-transparent'
                        }`}
                        onChange={() => {
                          setPreop(!preop);
                          setSearch(false);
                        }}
                        onClick={() => {
                          asignEvent('Preop');
                          setSearch(false);
                        }}
                      >
                        <FontAwesomeIcon
                          icon={faCheck}
                          // checked={preop}
                          className={
                            preop
                              ? 'GDCheckboxIconSelected'
                              : 'GDCheckboxIcon'
                          }
                        />
                      </div>
                      <span className='ml-[10px]'>Preop Check</span>
                    </div>
                    <div className='w-[220px] flex justify-start items-center py-2 px-0'>
                      <input
                        style={{
                          clip: 'rect(0 0 0 0)',
                          clipPath: 'inset(50%)',
                        }}
                        className='border-0 h-[1px] -m-[1px] overflow-hidden p-0 absolute whitespace-nowrap w-[1px]'
                        checked={sessions}
                        onChange={() => setSessions(!sessions)}
                      />
                      <div
                        className={`inline-block w-[16px] h-[16px] text-center border border-solid border-[#bbbbbb] rounded-sm transition-all duration-150 cursor-pointer ${
                          sessions ? 'bg-[#1d72e1]' : 'bg-transparent'
                        }`}
                        onChange={() => setSessions(!sessions)}
                        onClick={() => {
                          asignEvent('Sessions');
                          setSearch(false);
                        }}
                      >
                        <FontAwesomeIcon
                          icon={faCheck}
                          // checked={sessions}
                          className={
                            sessions
                              ? 'GDCheckboxIconSelected'
                              : 'GDCheckboxIcon'
                          }
                        />
                      </div>
                      <span className='ml-[10px]'>Sessions</span>
                    </div>
                  </div>
                </div>
                <div className='flex items-center px-0 py-2'>
                  <p className='min-w-[90px]'>Driver Name</p>{' '}
                  {!ticketInfo ? (
                    <div style={{ display: 'flex', flexFlow: 'column' }}>
                      <TextField
                        size='small'
                        type='text'
                        spellCheck={false}
                        placeholder=''
                        value={selectedDriver}
                        onChange={(e) => {
                          setSelectedDriver(e.target.value);
                          checkSuggestions();
                        }}
                      />
                      {showSuggestions &&
                        selectedDriver !== '' &&
                        autocomplete && (
                          <div className='w-[184px] bg-[rgb(245, 245, 245)] max-h-[177px] mt-7 absolute border border-solid border-[#bbbbbb] overflow-y-scroll'>
                            {filteredSuggestions.map((suggestion, i) => {
                              return (
                                <p
                                  key={i}
                                  className='p-2 w-fit hover:cursor-pointer'
                                  onClick={(e) => {
                                    setSelectedDriver(suggestion);
                                    setShowSuggestions(false);
                                  }}
                                >
                                  {suggestion}
                                </p>
                              );
                            })}
                          </div>
                        )}
                    </div>
                  ) : (
                    <TextField
                      size='small'
                      type='text'
                      spellCheck={false}
                      placeholder=''
                      value={selectedDriver}
                      onChange={(e) => {
                        setSelectedDriver(e.target.value);
                        checkSuggestions();
                      }}
                      InputProps={{
                        readOnly: true,
                      }}
                    />
                  )}
                  <p
                    className='ml-[10px] cursor-pointer text-[#008cba]'
                    onClick={(e) => {
                      setAlert(true);
                    }}
                  >
                    Show all drivers
                  </p>
                  {alert && (
                    <Alert type='All drivers' setAlert={setAlert}>
                      <AllDrivers
                        drivers={allDrivers}
                        setSelectedDriver={setSelectedDriver}
                        setAlert={setAlert}
                      />
                    </Alert>
                  )}
                </div>
                <div className='flex items-center px-0 py-2'>
                  <p className='min-w-[90px]'>Time</p>{' '}
                  {!ticketInfo ? (
                    <TextField
                      type='datetime-local'
                      onChange={(e) => {
                        setEventTime(e.target.value);
                      }}
                    />
                  ) : (
                    <TextField
                      size='small'
                      type='text'
                      spellCheck={false}
                      placeholder=''
                      value={ticketInfo.eventTime}
                      InputProps={{
                        readOnly: true,
                      }}
                    />
                  )}
                </div>
                <button
                  className='w-fit h-8 cursor-pointer mt-4 mr-4 py-0 px-8 rounded-md border border-solid border-[#4caf50] bg-[#4caf50] text-white focus:outline-none hover:bg-white hover:text-black'
                  onClick={(_: any) => {
                    saveTicket();
                  }}
                >
                  Save
                </button>
                {savedTicket && (
                  <Alert type='Saved Ticket' setAlert={setSavedTicket}>
                    <div className='flex flex-col items-center justify-center px-16 py-20'>
                      <p className='text-center'>
                        Ticket Successfully Saved
                      </p>
                      <button
                        className='w-fit h-8 cursor-pointer mt-4 py-0 px-8 rounded-md border border-solid border-[#008cba] bg-[#008cba] text-white focus:outline-none hover:bg-white hover:text-black'
                        onClick={(_) => {
                          setSavedTicket(false);
                        }}
                      >
                        Ok
                      </button>
                    </div>
                  </Alert>
                )}
                <button
                  className='w-fit h-8 cursor-pointer mt-4 py-0 px-8 rounded-md border border-solid border-[#008cba] bg-[#008cba] text-white focus:outline-none hover:bg-white hover:text-black'
                  onClick={(e) => {
                    setSearch(true);
                    setCheckCategory(true);
                    addLocationData();
                  }}
                  disabled={
                    callerName === '' ||
                    customerName === '' ||
                    wrongEquipmentID
                      ? true
                      : false
                  }
                >
                  Search
                </button>
                {saveError && (
                  <p className='mt-2 text-red-600'>
                    Please enter all the information required to save a
                    ticket
                  </p>
                )}
              </div>
            </Grid>
          </Grid>
        </Box>
      </Container>
      {search &&
        equipmentID !== '' &&
        !driverHistory &&
        !impacts &&
        !preop &&
        !sessions &&
        checkCategory && (
          <Alert type='Category notification' setAlert={setCheckCategory}>
            <div className='flex flex-col items-center justify-center px-16 py-20'>
              <p className='text-center'>
                Please, pay attention that No category was selected. By
                default, in this case, information about all categories
                will be shown
              </p>
              <button
                className='w-fit h-8 cursor-pointer mt-4 py-0 px-8 rounded-md border border-solid border-[#008cba] bg-[#008cba] text-white focus:outline-none hover:bg-white hover:text-black'
                onClick={(_) => {
                  setDriverHistory(true);
                  setDisplayDriverHistory(true);
                  setImpacts(true);
                  setPreop(true);
                  setSessions(true);
                  setDisplayEvent(true);
                  setEventCategories({
                    impacts: true,
                    preop: true,
                    sessions: true,
                  });
                  setCheckCategory(false);
                }}
              >
                Ok
              </button>
            </div>
          </Alert>
        )}
    </ThemeProvider>
  );
}

export default GeneralDetails;

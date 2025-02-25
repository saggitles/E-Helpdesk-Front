import React, { useState, useEffect } from 'react';

interface AllDriversProps {
  drivers: any; // TODO - edit type
  setSelectedDriver: React.Dispatch<React.SetStateAction<string>>;
  setAlert: React.Dispatch<React.SetStateAction<boolean>>;
}

function AllDrivers({
  drivers,
  setSelectedDriver,
  setAlert,
}: AllDriversProps) {
  const [currentPage, setCurrentPage] = useState(1);
  const [currentDisplayed, setCurrentDisplayed] = useState([]);
  const [finalPage, setFinalPage] = useState(false);

  useEffect(() => {
    // TODO - edit type
    const getNames = (drivers: any) => {
      let totalDisplayed = 10;
      let final = totalDisplayed * currentPage - 1;
      let i = final - totalDisplayed + 1;
      let newArray = [] as any; // TODO - edit type
      for (i; i <= final; i++) {
        if (i < drivers.length) {
          newArray.push(drivers[i].driver_name);
          setFinalPage(false);
        } else {
          setFinalPage(true);
        }
      }
      setCurrentDisplayed(newArray);
    };
    getNames(drivers);
  }, [currentPage, drivers]);

  return (
    <div>
      {currentDisplayed.map((driver, index) => {
        return (
          <p
            className='pt-4 pb-2 pl-4 pr-4 cursor-pointer w-fit'
            key={index}
            onClick={(_) => {
              setSelectedDriver(driver);
              setAlert(false);
            }}
          >
            {driver}
          </p>
        );
      })}
      <div className='flex justify-between p-4'>
        <button
          className='w-fit h-8 cursor-pointer mt-4 py-0 px-8 rounded-md border border-solid border-[#bbbbbb] bg-transparent focus:outline-none'
          onClick={(_) => {
            setCurrentPage(currentPage - 1);
          }}
          disabled={currentPage === 1 && true}
        >
          Previous
        </button>
        <button
          className='w-fit h-8 cursor-pointer mt-4 py-0 px-8 rounded-md border border-solid border-[#bbbbbb] bg-transparent focus:outline-none'
          onClick={(_) => {
            setCurrentPage(currentPage + 1);
          }}
          disabled={finalPage}
        >
          Next
        </button>
      </div>
    </div>
  );
}

export default AllDrivers;

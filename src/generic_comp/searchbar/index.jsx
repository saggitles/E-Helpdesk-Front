import React, { useState, useEffect } from 'react';

const Searchbar = ({ data, setData }) => {
  const [searchResponse, setSearchResponse] = useState([]);

  const searchData = (query) => {
    const trimmedQuery = query.trim().toLowerCase();

    if (trimmedQuery === '') {
      setSearchResponse([]);
      setData(data); // Restablecer los datos originales cuando la búsqueda está vacía
    } else {
      const filteredData = data.filter((item) => {
        return (
          item.Title.toLowerCase().includes(trimmedQuery) ||
          item.Contact.toLowerCase().includes(trimmedQuery) ||
          item.Dealer.toLowerCase().includes(trimmedQuery) ||
          item.Companyname.toLowerCase().includes(trimmedQuery)||
          item.Supported.toLowerCase().includes(trimmedQuery) ||
          item.VehicleID.toLowerCase().includes(trimmedQuery)
        );
      });

      setSearchResponse(filteredData);
      setData(filteredData);
    }
  };

  useEffect(() => {
    // Restablecer los resultados y datos originales al cargar el componente
    setSearchResponse([]);
    setData(data);
  }, [data, setData]);

  return (
    <form className='w-[200px]'>
      <div className='relative'>
        <input
          type='search'
          onChange={(e) => searchData(e.target.value)}
          placeholder='Search'
          className='p-2 mb-5 bg-gray-200 bg-slate-800 text-black text-sm'
          style={{ borderRadius: '5px', border: '1px solid #e5e7eb', background: 'white' }}
        />
        <button className='absolute right-1 top-1/2 -translate-y-1/2 p-2 bg-slate-900 rounded-full'></button>
      </div>
      <div className='absolute top-10 p-2 bg-slate-800 text-black w-full left-1/2 -translate-x-1/2 flex flex-col gap-2 text-sm'>

      </div>
    </form>
  );
};

export default Searchbar;

import React, { useState } from 'react';
import { useRouter } from 'next/router';
import axios from 'axios';
import { ToastContainer, toast } from 'react-toastify';
import 'react-toastify/dist/ReactToastify.css';

import NavBar from '@/generic_comp/navbar';

// onClick={() => router.push('/api/auth/logout')}


const GuestTicketForm: React.FC = () => {
  const [formData, setFormData] = useState({
    yourName: '',
    yourEmail: '',
    vehicleIdOrDriverName: '',
    reportedBy: '',
    companyName: '',
    issue: '',
    issueTime: '',
  });

  const router = useRouter();

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    const { name, value } = e.target;
    setFormData({
      ...formData,
      [name]: value,
    });
  };


  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      // Convertir issueTime a objeto Date para asegurar el formato correcto
      const issueDateTime = new Date(formData.issueTime);
      const formattedIssueTime = issueDateTime.toISOString();
  
      const dataToSend = {
        yourName: formData.yourName,
        yourEmail: formData.yourEmail,
        issue: formData.issue,
        issueTime: formattedIssueTime, // Enviar la fecha en formato ISO
      };
  
      // Enviar datos al backend
      // const response = await axios.post(`${process.env.NEXT_PUBLIC_API_URL}/api/createGuestTicket`, dataToSend);
      // console.log(response);
      const sendEmail = await axios.post(`http://localhost:3000/api/sendEmail`, dataToSend);
      console.log(sendEmail);
  
      // Mostrar toast y recargar la página al cerrarse
      toast('😁 Ticket Created Successfully!', {
        position: "bottom-right",
        autoClose: 2000,
        hideProgressBar: false,
        closeOnClick: true,
        pauseOnHover: true,
        draggable: true,
        progress: undefined,
        progressStyle: { background: 'white' },
        style: {
          backgroundColor: '#00897B',
          color: 'white'
        },
        onClose: () => window.setTimeout(() => window.location.reload(), 0) 
      });
  
    } catch (error) {
      console.error('Error al enviar el formulario:', error);
    }
  };


  const handleExit = async () => {
   
    router.push('/')
    
};

  return (
    <>
      <NavBar/>
        <div className="bg-gradient-to-r from-teal-100 via-teal-200 to-teal-300 min-h-[100vh] overflow-x-hidden flex fixed top-0 right-0 left-0 z-50 justify-center items-center w-full">
          <div className="p-4 w-full max-w-2xl">
            <div className="relative flex flex-col justify-center items-center rounded-lg min-h-[100vh] overflow-y-auto custom-scrollbar">
              <div className="w-full max-w-lg flex items-center bg-teal-600 justify-between p-4 md:p-5 border-b rounded-t">
                <h3 className="text-lg font-semibold text-teal-50">Create New Ticket</h3>
              </div>

            
            <form onSubmit={handleSubmit} className="p-4 md:p-5 shadow bg-teal-50 w-full max-w-lg">
              <div className="grid gap-4 mb-4 grid-cols-2">
                <div className="w-full">
                  <label htmlFor="yourName" className="block mb-1 font-normal text-teal-700">Your Name</label>
                  <input
                    type="text"
                    id="yourName"
                    name="yourName"
                    value={formData.yourName}
                    onChange={handleChange}
                    required
                    className="bg-gray-50 border border-teal-300 text-teal-900 font-normal placeholder:text-gray-400 text-sm rounded-lg focus:ring-teal-600 focus:border-teal-600 block w-full p-2.5"
                  />
                </div>
                <div className="w-full">
                  <label htmlFor="yourEmail" className="block mb-1 font-normal text-teal-700">Your Email</label>
                  <input
                    type="email"
                    id="yourEmail"
                    name="yourEmail"
                    value={formData.yourEmail}
                    onChange={handleChange}
                    required
                    className="bg-gray-50 border border-teal-300 text-teal-900 font-normal placeholder:text-gray-400 text-sm rounded-lg focus:ring-teal-600 focus:border-teal-600 block w-full p-2.5"
                  />
                </div>
                <div className="w-full">
                  <label htmlFor="vehicleIdOrDriverName" className="block mb-1 font-normal text-teal-700">Vehicle ID/Driver Name</label>
                  <input
                    type="text"
                    id="vehicleIdOrDriverName"
                    name="vehicleIdOrDriverName"
                    value={formData.vehicleIdOrDriverName}
                    onChange={handleChange}
                    required
                    className="bg-gray-50 border border-teal-300 text-teal-900 font-normal placeholder:text-gray-400 text-sm rounded-lg focus:ring-teal-600 focus:border-teal-600 block w-full p-2.5"
                  />
                </div>
                <div className="w-full">
                  <label htmlFor="reportedBy" className="block mb-1 font-normal text-teal-700">Reported by (Customer)</label>
                  <input
                    type="text"
                    id="reportedBy"
                    name="reportedBy"
                    value={formData.reportedBy}
                    onChange={handleChange}
                    required
                    className="bg-gray-50 border border-teal-300 text-teal-900 font-normal placeholder:text-gray-400 text-sm rounded-lg focus:ring-teal-600 focus:border-teal-600 block w-full p-2.5"
                  />
                </div>
                <div className="w-full">
                  <label htmlFor="companyName" className="block mb-1 font-normal text-teal-700">Company Name</label>
                  <input
                    type="text"
                    id="companyName"
                    name="companyName"
                    value={formData.companyName}
                    onChange={handleChange}
                    required
                    className="bg-gray-50 border border-teal-300 text-teal-900 font-normal placeholder:text-gray-400 text-sm rounded-lg focus:ring-teal-600 focus:border-teal-600 block w-full p-2.5"
                  />
                </div>
                <div className="w-full">
                  <label htmlFor="issue" className="block mb-1 font-normal text-teal-700">Issue</label>
                  <textarea
                    id="issue"
                    name="issue"
                    value={formData.issue}
                    onChange={handleChange}
                    required
                    className="bg-gray-50 border border-teal-300 text-teal-900 font-normal placeholder:text-gray-400 text-sm rounded-lg focus:ring-teal-600 focus:border-teal-600 block w-full p-2.5"
                    style={{ minHeight: '100px' }}
                  />
                </div>
                <div className="w-full">
                  <label htmlFor="issueTime" className="block mb-1 font-normal text-teal-700">Time (when issue occurred)</label>
                  <input
                    type="datetime-local"
                    id="issueTime"
                    name="issueTime"
                    value={formData.issueTime}
                    onChange={handleChange}
                    required
                    className="bg-gray-50 border border-teal-300 text-teal-900 font-normal placeholder:text-gray-400 text-sm rounded-lg focus:ring-teal-600 focus:border-teal-600 block w-full p-2.5"
                  />
                </div>
              </div>
              <div className="flex justify-between mt-10">
                <button onClick={handleSubmit} type="submit" className="text-teal-700 bg-gray-50 hover:bg-teal-500 hover:text-gray-50 focus:ring-4 focus:outline-none focus:ring-teal-300 font-medium rounded-lg text-sm px-5 py-2.5 text-center border border-teal-400">
                  Submit
                </button>

                <button onClick={handleExit} type="submit" className="text-teal-700 bg-gray-50 hover:bg-teal-500 hover:text-gray-50 focus:ring-4 focus:outline-none focus:ring-teal-300 font-medium rounded-lg text-sm px-5 py-2.5 text-center border border-teal-400">
                  Exit
                </button>
              </div>
            </form>
          </div>
        </div>
      </div>
      <ToastContainer />
      <style jsx global>{`
        .custom-scrollbar::-webkit-scrollbar {
          display: none; /* para Chrome, Safari y Opera */
        }

        .custom-scrollbar {
          -ms-overflow-style: none;  /* IE y Edge */
          scrollbar-width: none;  /* Firefox */
        }
      `}</style>
    </>
  );
};

export default GuestTicketForm;

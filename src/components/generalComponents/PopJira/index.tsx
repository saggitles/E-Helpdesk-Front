import React, { useState } from 'react';
import { useRouter } from 'next/router';

interface PopJiraProps {
  onClose: () => void;
  escalate: (selectedProject: string) => void; 
}

const PopJira: React.FC<PopJiraProps> = ({ onClose, escalate }) => {

  const router = useRouter();

  const [selectedProject, setSelectedProject] = useState<string>(''); 

  const handleEscalate = () => {
    if (selectedProject) {

      escalate(selectedProject);
      router.push('/support/tickets/pending');

    } else {

      console.error('Please select a project before escalating.');
    }
  };

  

  return (
    <div className="fixed top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2 bg-white p-10 rounded-md shadow-xl border-2 border-gray-300 flex flex-col items-center justify-center">

      <div className="absolute top-0 right-0 p-2 text-red-500 cursor-pointer" onClick={onClose}>
          X
      </div>
      

      <div className="mb-4 text-lg font-semibold">Escalated ticket to Jira</div>

      <select
        id="projectDropdown"
        className="mr-4 p-2 border border-gray-300 rounded-md "
        onChange={(e) => setSelectedProject(e.target.value)}
      >
        <option value="-">Choose</option>
        <option value="FXQ">Fleet XQ</option>
        <option value="EH">E-Helpdesk</option>
        <option value="FF">Fleet IQ/Focus</option>

        {/* You just have to add an option with its key to be able to add the ticket to the project */}

      </select>

      <br />
      <br />

      <button
        className="bg-transparent border-primary text-primary text-md font-semibold rounded-full block outline-none py-2.5 px-5 mr-5"
        onClick={handleEscalate} 
      >
        Escalate
      </button>
     
    </div>
  );
};

export default PopJira;

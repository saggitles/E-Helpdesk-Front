import React from 'react';

const User: React.FC = () => {
  const handleContactClick = () => {
    window.location.href = 'mailto:e-helpdesk@tolintelligence.com';
  };

  return (
    <div className="flex flex-col justify-center items-center h-screen bg-gray-100 p-6">
      <h1 className="text-4xl font-bold mb-4 text-gray-800">Contact with Admin</h1>
      <p className="text-lg mb-6 text-gray-600 text-center">
            Please write an email to support requesting permissions
      </p>
      <button
        onClick={handleContactClick}
        className="bg-blue-500 text-white font-semibold py-2 px-4 rounded hover:bg-blue-600 transition duration-300"
      >
        Contact Now
      </button>
    </div>
  );
};

export default User;

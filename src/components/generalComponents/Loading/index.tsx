import React from 'react';
import Image from 'next/image';

const Loading: React.FC = () => {
  const handleLogout = () => {
    window.location.href = '/api/auth/logout';
  };

  return (
    <div
      style={{
        display: 'flex',
        justifyContent: 'center',
        alignItems: 'center',
        height: '100vh',
      }}
    >
      <Image
        src='/loading.png' // Asegúrate de poner la ruta correcta desde la carpeta 'public'
        alt='Loading' // Proporciona un texto alternativo para accesibilidad
        width={100} // Tamaño reducido a 100
        height={100} // Tamaño reducido a 100
      />
    </div>
  );
};

export default Loading;

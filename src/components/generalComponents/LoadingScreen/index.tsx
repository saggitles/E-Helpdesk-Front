import React from 'react';
import Image from 'next/image'; // Importa el componente Image de Next.js

const LoadingScreen: React.FC = () => {
  // Estilos para el contenedor de la pantalla de carga
  const loadingContainerStyle: React.CSSProperties = {
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    position: 'fixed', // Esto es para posicionar sobre todo lo demás
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    backgroundColor: 'rgba(255, 255, 255, 0.7)', // Fondo semi-transparente
    zIndex: 9999 // Asegúrate de que esté sobre otros elementos
  };

  return (
    <div style={loadingContainerStyle}>
      {/* Utiliza el componente Image de Next.js en lugar de img */}
      <Image
        src="/loading.png" // Ruta de la imagen desde la carpeta 'public'
        alt="Loading..." // Texto alternativo para accesibilidad
        width={100} // Ancho de la imagen en píxeles
        height={100} // Altura de la imagen en píxeles
        // OPCIONAL: Agrega propiedades adicionales de Image como priority o placeholder
        priority // Carga la imagen lo más pronto posible
        placeholder="blur" // Opción para mostrar una imagen de baja calidad hasta que cargue la completa
        blurDataURL="/path_to_low_quality_image" // Ruta de la imagen de baja calidad si se utiliza placeholder
      />
    </div>
  );
};

export default LoadingScreen;

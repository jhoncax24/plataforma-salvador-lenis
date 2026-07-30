import React from 'react';
import { Link } from 'react-router-dom';

const Header = ({ user }) => {

  const headerStyle = {
    backgroundColor: '#3b4799', 
    backgroundImage: `
      linear-gradient(135deg, 
        #3b4799 0px, #3b4799 35px,   
        #ffffff 35px, #ffffff 70px,  
        #d32f2f 70px, #d32f2f 105px, 
        transparent 105px            
      ),
      linear-gradient(-135deg, 
        #3b4799 0px, #3b4799 35px,   
        #ffffff 35px, #ffffff 70px,  
        #d32f2f 70px, #d32f2f 105px, 
        transparent 105px            
      )
    `,
    backgroundPosition: 'top left, top right',
    backgroundRepeat: 'no-repeat',
  };

  return (
    <header 
      style={headerStyle} 
      className="w-full relative flex items-center justify-between px-32 md:px-40 py-4 shadow-lg"
    >
      {/* SECCIÓN IZQUIERDA: Texto Portal */}
      <div className="flex-1 flex justify-start items-center">
        <h2  className="text-white text-xl md:text-3xl font-extrabold tracking-wide hover:opacity-90 transition-opacity">
          Portal Administrativo
        </h2>
      </div>

      {/* SECCIÓN CENTRAL: Escudo Institucional */}
      <div className="flex-1 flex justify-center items-center z-10">
        <img 
          src="https://res.cloudinary.com/dmzq2qw0t/image/upload/v1776445496/logo_g99cn4.svg" 
          alt="Escudo Institucional" 
          className="h-16 md:h-24 object-contain drop-shadow-md hover:scale-105 transition-transform"
        />
      </div>

      {/* SECCIÓN DERECHA: Texto CESL */}
      <div className="flex-1 flex justify-end items-center gap-6">
        <h1 className="text-white text-xl md:text-3xl font-extrabold tracking-wide hidden sm:block">
          CESL Académico
        </h1>
      </div>
    </header>
  );
};

export default Header;
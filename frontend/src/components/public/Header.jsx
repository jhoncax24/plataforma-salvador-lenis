import React from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { FaQuestionCircle, FaSignInAlt } from 'react-icons/fa';

const Header = () => {
  // const navigate = useNavigate();

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
      className="w-full relative flex flex-col xl:flex-row items-center justify-between px-10 lg:px-32 xl:px-40 py-4 shadow-lg"
    >
      {/* SECCIÓN IZQUIERDA: Nombre Institucional */}
      <div className="flex-1 flex justify-start items-center w-full xl:w-auto mb-4 xl:mb-0">
        <Link 
          to="/" 
          // Se cambió hover:opacity-90 por hover:text-blue-100 para un efecto más brillante
          className="text-white text-2xl md:text-3xl font-extrabold tracking-wide hover:text-blue-100 transition-colors"
        >
          CESL Académico
        </Link>
      </div>

      {/* SECCIÓN CENTRAL: Escudo Institucional */}
      <div className="flex-1 flex justify-center items-center z-10 mb-4 xl:mb-0">
        <img 
          src="https://res.cloudinary.com/dmzq2qw0t/image/upload/v1776445496/logo_g99cn4.svg" 
          alt="Escudo Institucional" 
          className="h-16 md:h-20 object-contain drop-shadow-md hover:scale-105 transition-transform"
        />
      </div>

      {/* SECCIÓN DERECHA: Menú de Navegación */}
      <div className="flex-1 flex justify-end items-center z-10 w-full xl:w-auto">
        {/* Se aumentó el tamaño a text-lg y md:text-xl */}
        <nav className="flex items-center gap-4 md:gap-6 flex-wrap justify-center font-medium text-lg md:text-xl">
          
          {/* Se agregó text-white a cada enlace individualmente */}
          <Link to="/" className="text-white hover:text-blue-200 transition-colors">
            Inicio
          </Link>
          <Link to="/quienes-somos" className="text-white hover:text-blue-200 transition-colors">
            ¿Quiénes somos?
          </Link>
          <Link to="/contacto" className="text-white hover:text-blue-200 transition-colors">
            Contacto
          </Link>
          <Link to="/ayuda" className="text-white hover:text-blue-200 transition-colors flex items-center gap-2">
            Ayuda
          </Link>

        </nav>
      </div>
    </header>
  );
};

export default Header;
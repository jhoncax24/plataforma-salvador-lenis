import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';

const Header = () => {
  // const navigate = useNavigate();
  const [isMenuOpen, setIsMenuOpen] = useState(false);

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
      className="w-full relative flex flex-col sm:flex-row items-center justify-between px-4 sm:px-6 lg:px-8 py-4 shadow-lg"
    >
      <div className="flex sm:hidden items-center justify-between w-full">
        <div className="flex-1 flex justify-center">
          <img
            src="https://res.cloudinary.com/dmzq2qw0t/image/upload/v1776445496/logo_g99cn4.svg"
            alt="Escudo Institucional"
            className="h-12 object-contain"
          />
        </div>
        <button
          onClick={() => setIsMenuOpen(!isMenuOpen)}
          className="text-white p-2 focus:outline-none"
          aria-label="Abrir menú"
        >
          <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 6h16M4 12h16M4 18h16" />
          </svg>
        </button>
      </div>

      {isMenuOpen && (
        <div className="sm:hidden w-full bg-[#3b4799] py-4 flex flex-col items-center gap-4">
          <Link to="/" className="text-white text-lg hover:text-blue-200 transition-colors">
            Inicio
          </Link>
          <Link to="/quienes-somos" className="text-white text-lg hover:text-blue-200 transition-colors">
            ¿Quiénes somos?
          </Link>
          <Link to="/contacto" className="text-white text-lg hover:text-blue-200 transition-colors">
            Contacto
          </Link>
          <Link to="/ayuda" className="text-white text-lg hover:text-blue-200 transition-colors flex items-center gap-2">
            Ayuda
          </Link>
        </div>
      )}

      <div className="hidden sm:flex w-full items-center justify-between">
        <div className="flex-1 flex justify-start items-center">
          <Link
            to="/"
            className="text-white text-2xl md:text-3xl font-extrabold tracking-wide hover:text-blue-100 transition-colors"
          >
            CESL Académico
          </Link>
        </div>

        <div className="flex-1 flex justify-center items-center z-10">
          <img
            src="https://res.cloudinary.com/dmzq2qw0t/image/upload/v1776445496/logo_g99cn4.svg"
            alt="Escudo Institucional"
            className="h-16 md:h-20 object-contain drop-shadow-md hover:scale-105 transition-transform"
          />
        </div>

        <div className="flex-1 flex justify-end items-center z-10">
          <nav className="flex items-center gap-4 md:gap-6 flex-wrap justify-center font-medium text-lg md:text-xl">
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
      </div>
    </header>
  );
};

export default Header;

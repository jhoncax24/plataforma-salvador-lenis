import React, { useState, useEffect, useRef } from 'react';
import { Link } from 'react-router-dom';

const Header = () => {
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const headerRef = useRef(null);
  useEffect(() => {
    const handleClickOutside = (event) => {
      if (headerRef.current && !headerRef.current.contains(event.target)) {
        setIsMenuOpen(false);
      }
    };
    const handleEsc = (event) => {
      if (event.key === 'Escape') setIsMenuOpen(false);
    };
    if (isMenuOpen) {
      document.addEventListener('click', handleClickOutside);
      document.addEventListener('keydown', handleEsc);
    }
    return () => {
      document.removeEventListener('click', handleClickOutside);
      document.removeEventListener('keydown', handleEsc);
    };
  }, [isMenuOpen]);

  return (
    <header
      ref={headerRef}
      className="diagonal-header w-full relative flex flex-col sm:flex-row items-center justify-between px-4 sm:px-6 lg:px-8 py-4 shadow-lg"
    >
      <div className="flex sm:hidden items-center justify-center w-full gap-3 pr-2">
        <div className="min-w-0">
          <span className="block truncate text-center text-lg font-extrabold tracking-wide text-white">
            CESL Académico
          </span>
        </div>
        <div className="flex items-center gap-1 shrink-0">
          <img
            src="/logo.svg"
            alt="Escudo Institucional"
            className="h-8 w-8 object-contain"
          />
          <button
          aria-label={isMenuOpen ? "Cerrar menú" : "Abrir menú"}
          onClick={(e) => {
            e.stopPropagation();
            setIsMenuOpen(prev => !prev);
          }}
          className="md:hidden relative z-[60] p-2 text-white focus:outline-none transition-transform duration-200"
        >
          {isMenuOpen ? (
            <svg className="w-8 h-8" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M6 18L18 6M6 6l12 12" />
            </svg>
          ) : (
            <svg className="w-8 h-8" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M4 6h16M4 12h16M4 18h16" />
            </svg>
          )}
          </button>
        </div>
      </div>

      {isMenuOpen && (
        <div className="sm:hidden w-full bg-[#3b4799] py-4 flex flex-col items-center gap-4 transition-all duration-200 ease-in-out">
          <Link to="/docente" className="text-white text-lg font-medium hover:text-blue-200 transition-colors">
            Inicio
          </Link>
          <Link to="/docente/calendario" className="text-white text-lg font-medium hover:text-blue-200 transition-colors">
            Calendario
          </Link>
          <Link to="/docente/notas" className="text-white text-lg font-medium hover:text-blue-200 transition-colors">
            Notas
          </Link>
          <Link to="/docente/asistencia" className="text-white text-lg font-medium hover:text-blue-200 transition-colors">
            Asistencia
          </Link>
        </div>
      )}

      <div className="hidden sm:flex w-full items-center justify-between px-8 md:px-16 lg:px-24">
        <div className="flex-1 flex justify-start items-center">
          <Link to="/docente" className="text-white text-xl md:text-3xl font-extrabold tracking-wide hover:opacity-90 transition-opacity">
            Portal Docente
          </Link>
        </div>

        <div className="flex-1 flex justify-center items-center z-10">
          <img
            src="/logo.svg"
            alt="Escudo Institucional"
            className="h-16 md:h-24 object-contain drop-shadow-md hover:scale-105 transition-transform"
          />
        </div>

        <div className="flex-1 flex justify-end items-center gap-6">
          <h1 className="text-white text-xl md:text-3xl font-extrabold tracking-wide">
            CESL Académico
          </h1>
        </div>
      </div>
    </header>
  );
};

export default Header;

import React, { useState, useEffect, useRef } from 'react';
import { Link } from 'react-router-dom';

const Header = ({ user }) => {
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const menuRef = useRef(null);

  useEffect(() => {
    const handleClickOutside = (event) => {
      if (menuRef.current && !menuRef.current.contains(event.target)) {
        setIsMenuOpen(false);
      }
    };
    const handleEsc = (event) => {
      if (event.key === 'Escape') setIsMenuOpen(false);
    };
    if (isMenuOpen) {
      document.addEventListener('mousedown', handleClickOutside);
      document.addEventListener('keydown', handleEsc);
    }
    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
      document.removeEventListener('keydown', handleEsc);
    };
  }, [isMenuOpen]);

  return (
    <header
      className="w-full relative flex flex-col sm:flex-row items-center justify-between px-4 sm:px-6 lg:px-8 py-4 shadow-lg bg-gradient-to-r from-[#0033a0] to-blue-800"
    >
      <div className="flex sm:hidden items-center justify-between w-full">
        <div className="flex-1 flex justify-center">
          <img
            src="/logo.svg"
            alt="Escudo Institucional"
            className="h-12 object-contain"
          />
        </div>
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

      {isMenuOpen && (
        <div ref={menuRef} className="sm:hidden w-full bg-[#3b4799] py-4 flex flex-col items-center gap-4">
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

      <div className="hidden sm:flex w-full items-center justify-between">
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

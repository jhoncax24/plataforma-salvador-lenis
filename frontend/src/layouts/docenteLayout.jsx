import React from 'react';
import { Outlet, useNavigate } from 'react-router-dom';
// Importamos el Header que vive en la carpeta del docente
import Header from '../components/docente/Header';

const DocenteLayout = () => {
  const navigate = useNavigate();
  
  // Obtenemos los datos del usuario logueado para pasarlos al Header
  const user = JSON.parse(localStorage.getItem('user')); 

  // Lógica de seguridad para cerrar la sesión
  const handleLogout = () => {
    localStorage.removeItem('token'); // Borramos el JWT
    localStorage.removeItem('user');  // Borramos los datos
    navigate('/login');               // Redirigimos al inicio de sesión
  };

  return (
    <div className="min-h-screen flex flex-col bg-[#f4f6f9]">
      
      {/* HEADER SUPERIOR (Basado en el mockup) */}
      <header className="bg-[#0033a0] text-white p-6 flex justify-between items-center shadow-md">
        <div className="flex flex-col">
          <h1 className="text-3xl font-bold">Bienvenidos al</h1>
          <h1 className="text-3xl font-bold">Centro Educativo Salvador Lenis</h1>
        </div>
        <div>
          {/* Asegúrate de que la ruta de tu logo sea correcta */}
          <img 
            src="/assets/logo.webp" 
            alt="Logo CESL" 
            className="h-20 w-20 bg-white rounded-full p-1" 
          />
        </div>
      </header>

      {/* CONTENIDO PRINCIPAL */}
      <main className="flex-1 p-8 max-w-[1900px] mx-auto w-full">
        <Outlet />
      </main>
    </div>
  );
};

export default DocenteLayout;
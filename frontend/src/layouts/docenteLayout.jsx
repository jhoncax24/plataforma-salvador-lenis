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
      <header>
        <Header/>
      </header>

      {/* CONTENIDO PRINCIPAL */}
      <main className="flex-1 p-8 max-w-[1900px] mx-auto w-full">
        <Outlet />
      </main>
    </div>
  );
};

export default DocenteLayout;
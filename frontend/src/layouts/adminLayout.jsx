import React from 'react';
import { Outlet, useNavigate } from 'react-router-dom';
// Importamos el Header que vivirá en la carpeta del administrativo (admin)
import Header from '../components/admin/Header';
// Importamos el componente de la burbuja de chat
import { ChatWidget } from '../components/ChatWidget';

const AdminLayout = () => {
  const navigate = useNavigate();
  
  // Obtenemos los datos del usuario logueado para pasarlos al Header y al Chat
  const user = JSON.parse(localStorage.getItem('cesl_user'));

  // Lógica de seguridad para cerrar la sesión
  const handleLogout = () => {
    localStorage.removeItem('token'); // Borramos el JWT
    localStorage.removeItem('cesl_user'); // Borramos los datos correctos del user
    navigate('/login');               // Redirigimos al inicio de sesión
  };

  return (
    <div className="min-h-screen flex flex-col bg-[#f4f6f9]">
      
      {/* HEADER SUPERIOR */}
      <header>
        <Header onLogout={handleLogout} />
      </header>

      {/* CONTENIDO PRINCIPAL */}
      <main className="flex-1 p-4 sm:p-6 lg:p-8 max-w-[1900px] mx-auto w-full relative">
        {/* Aquí se renderizarán las páginas del admin, como la vista de matrículas */}
        <Outlet />
      </main>


      
    </div>
  );
};

export default AdminLayout;
import React from 'react';
import { Outlet } from 'react-router-dom';
// Importamos el Header que vive en la carpeta del docente
import Header from '../components/docente/Header';
// 1. Importamos el componente de la burbuja de chat
import { ChatWidget } from '../components/ChatWidget';

const DocenteLayout = () => {
  // Obtenemos los datos del usuario logueado para pasarlos al Header y al Chat
  // Leemos la clave correcta que aparece en DevTools: 'cesl_user'
const user = JSON.parse(localStorage.getItem('cesl_user'));

  return (
    <div className="min-h-screen flex flex-col bg-[#f4f6f9]">
      
      {/* HEADER SUPERIOR (Basado en el mockup) */}
      <header>
        <Header/>
      </header>

      {/* CONTENIDO PRINCIPAL */}
      <main className="flex-1 p-4 sm:p-6 lg:p-8 max-w-[1900px] mx-auto w-full relative">
        <Outlet />
      </main>

      {/* Renderizamos el chat solo si existe un usuario logueado */}
      {user && (
        <ChatWidget 
          usuarioActual={user} 
          /* 
            Utilizamos .replace() para eliminar un posible '/api' duplicado al final 
            de tu variable de entorno, asegurando que la ruta quede limpia.
          */
          API_URL={
            import.meta.env.VITE_API_URL 
              ? `${import.meta.env.VITE_API_URL.replace(/\/api$/, '')}/api/chat` 
              : 'http://localhost:4000/api/chat'
          } 
        />
      )}
      
    </div>
  );
};

export default DocenteLayout;
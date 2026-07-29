import React from "react";
import { Outlet } from "react-router-dom";
import Header from "../components/acudiente/Header";
// 1. Importamos el componente de la burbuja de chat
import { ChatWidget } from "../components/ChatWidget";

export default function AcudienteLayout() {
  // 2. Obtenemos los datos del usuario logueado dinámicamente
  // Leemos la clave correcta que aparece en DevTools: 'cesl_user'
const user = JSON.parse(localStorage.getItem('cesl_user'));

  return (
    <div className="min-h-screen flex flex-col bg-gray-50">
      {/* Cabecera general del Acudiente */}
      <Header />

      {/* Contenido dinámico (Ocupando todo el ancho) */}
      <main className="flex-grow w-full p-6 relative">
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
}
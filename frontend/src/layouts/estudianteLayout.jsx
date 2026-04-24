import { Outlet } from "react-router-dom";

export default function EstudianteLayout() {
  return (
    <div className="min-h-screen flex flex-col bg-[#f4f6f9]">
      
      {/* HEADER SUPERIOR (Idéntico al mockup) */}
      <header className="bg-[#0033a0] text-white p-6 flex justify-between items-center shadow-md">
        <div className="flex flex-col">
          <h1 className="text-3xl font-bold">Bienvenidos al</h1>
          <h1 className="text-3xl font-bold">Centro Educativo Salvador Lenis</h1>
        </div>
        {/* 👇 CONTENEDOR DEL LOGO INSTITUCIONAL 👇 */}
      <div className="w-16 h-16 rounded-full bg-white flex items-center justify-center overflow-hidden border-2 border-white shadow-inner p-0.5">
        <img 
          src="https://res.cloudinary.com/dmzq2qw0t/image/upload/q_auto/f_auto/v1776445496/logo_g99cn4.svg" // 👈 ⚠️ ¡REEMPLAZA ESTO CON TU LINK! ⚠️
          alt="Logo Institucional" 
          className="w-full h-full object-contain" // 'object-contain' asegura que todo el logo se vea sin estirarse
          // Esta línea es un seguro: si el link se rompe, el círculo no se ve vacío
          onError={(e) => {
            e.target.style.display = 'none'; // Oculta la imagen rota
            e.target.parentNode.style.backgroundColor = 'white'; // Asegura que el fondo sea blanco
          }}
        />
      </div>
      </header>

      {/* CONTENIDO PRINCIPAL */}
      {/* 👇 ELIMINAMOS el max-w-7xl. Ahora permitimos que crezca hasta 1800px (casi todo tu monitor) */}
      <main className="flex-1 p-4 md:p-8 max-w-[1900px] mx-auto w-full">
        <Outlet />
      </main>
      
    </div>
  );
}
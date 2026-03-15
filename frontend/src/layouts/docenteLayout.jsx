import { Outlet } from "react-router-dom";

export default function DocenteLayout() {
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
      <main className="flex-1 p-8 max-w-7xl mx-auto w-full">
        <Outlet />
      </main>
      
    </div>
  );
}
import { Outlet } from "react-router-dom";

export default function EstudianteLayout() {
  return (
    <div className="min-h-screen flex bg-gray-100">

      

      {/* CONTENIDO */}
      <main className="flex-1 p-8">
        <Outlet />
      </main>
    </div>

    
  );
}

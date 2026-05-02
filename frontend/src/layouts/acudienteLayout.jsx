import { Outlet } from "react-router-dom";
import Header from "../components/acudiente/Header";

export default function AcudienteLayout() {
  return (
    <div className="min-h-screen flex flex-col bg-gray-50">
      {/* Cabecera general del Acudiente */}
      <Header />

      {/* Contenido dinámico (Aquí se renderizará pages/acudiente/inicio.jsx) */}
      <main className="flex-grow w-full max-w-7xl mx-auto p-6">
        <Outlet />
      </main>
    </div>
  );
}
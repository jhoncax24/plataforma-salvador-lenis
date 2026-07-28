import { Outlet } from "react-router-dom";
import Header from "../components/acudiente/Header";

export default function AcudienteLayout() {
  return (
    <div className="min-h-screen flex flex-col bg-gray-50">
      {/* Cabecera general del Acudiente */}
      <Header />

      {/* Contenido dinámico (Se eliminó max-w-7xl y mx-auto para que ocupe todo el ancho) */}
      <main className="flex-grow w-full p-6">
        <Outlet />
      </main>
    </div>
  );
}
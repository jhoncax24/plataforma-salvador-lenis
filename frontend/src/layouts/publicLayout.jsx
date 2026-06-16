import { Outlet } from "react-router-dom";
import logo from "../assets/logo.webp";
import Header from "../components/public/Header";

export default function PublicLayout() {
  return (
    <div className="min-h-screen flex flex-col bg-gray-50">

      {/* --- NUEVO HEADER --- */}
      {/* Aquí inyectamos tu nuevo diseño moderno que unifica el logo y la barra de navegación */}
      <Header />

      {/* AQUÍ VA EL CONTENIDO DE CADA PÁGINA (Intacto) */}
      <main className="flex-1 flex flex-col md:flex-row overflow-hidden">
        <Outlet />
      </main>

      {/* FOOTER (Intacto) */}
      <footer className="bg-[#191970] text-white flex flex-col md:flex-row items-center justify-between px-6 py-3 text-sm">
        <div className="text-center md:text-left space-y-0.5">
          <p>Centro Educativo Salvador Lenis</p>
          <p>Dirección: Avenida 9 # 8 - 353, Rozo Centro</p>
          <p>Rozo, Valle del Cauca</p>
        </div>
        <img src={logo} alt="Logo" className="w-16 mx-auto md:mx-0" />
        <div className="text-center md:text-right space-y-0.5">
          <p>Desarrolladores: Jhon, Brayan, Jefry</p>
          <p>© 2026</p>
        </div>
      </footer>
    </div>
  );
}
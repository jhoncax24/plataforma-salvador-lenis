import { Outlet } from "react-router-dom";
import logo from "../assets/logo.webp";

export default function PrivateLayout() {
  return (
    <div className="min-h-screen bg-gray-100">
      {/* Aquí luego pones sidebar o navbar del rol */}
      <Outlet />

      {/* FOOTER (igual) */}
      <footer className="bg-[#0033a0] text-white flex flex-col md:flex-row items-center justify-between px-6 py-3 text-sm">
        <div className="text-center md:text-left space-y-0.5">
          <p>Centro Educativo Salvador Lenis</p>
          <p>Rozo, Valle del Cauca</p>
        </div>
        <img src={logo} alt="Logo" className="w-16 mx-auto md:mx-0" />
        <div className="text-center md:text-right space-y-0.5">
          <p>Desarrolladores: Jhon, Brayan, Jefry</p>
          <p>© 2025</p>
        </div>
      </footer>
    </div>
  );
}

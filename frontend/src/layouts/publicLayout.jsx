import { Outlet, NavLink } from "react-router-dom";
import logo from "../assets/logo.webp";

export default function PublicLayout() {
  return (
    <div className="min-h-screen flex flex-col bg-gray-50">

      {/* HEADER (igual que antes) */}
      <header className="bg-[#0033a0] text-white p-6 flex flex-col md:flex-row items-center justify-between shadow-md">
        <div>
          <h1 className="text-3xl font-bold text-white">Bienvenidos al</h1>
          <h2 className="text-2xl font-semibold text-white">
            Centro Educativo Salvador Lenis
          </h2>
        </div>
        <img src={logo} alt="Logo" className="w-24 mt-4 md:mt-0" />
      </header>

      {/* NAVBAR (igual) */}
      <nav className="bg-[#104268] text-white flex justify-center gap-2 md:gap-6 py-2 shadow-lg">
        {[
          { name: "Inicio", path: "/" },
          { name: "¿Quiénes somos?", path: "/quienes-somos" },
          { name: "Contacto", path: "/contacto" },
          { name: "Ayuda", path: "/ayuda" },
        ].map((item) => (
          <NavLink
            key={item.path}
            to={item.path}
            className={({ isActive }) =>
              `px-4 py-2 rounded-md transition ${
                isActive
                  ? "bg-white text-[#104268]"
                  : "text-white hover:bg-white hover:text-[#104268]"
              }`
            }
          >
            {item.name}
          </NavLink>
        ))}
      </nav>

      {/* AQUÍ VA EL CONTENIDO DE CADA PÁGINA */}
      <main className="flex-1 flex flex-col md:flex-row overflow-hidden">
        <Outlet />
      </main>

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

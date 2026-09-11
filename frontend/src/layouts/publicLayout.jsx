import { Outlet } from "react-router-dom";
import logo from "../assets/logo.webp";
import Header from "../components/public/Header";
import Footer from "../components/public/Footer";

export default function PublicLayout() {
  return (
    <div className="min-h-screen flex flex-col bg-gray-50">

      {/* --- NUEVO HEADER --- */}
      {/* Aquí inyectamos tu nuevo diseño moderno que unifica el logo y la barra de navegación */}
      <Header />

      {/* AQUÍ VA EL CONTENIDO DE CADA PÁGINA (Intacto) */}
      <main className="flex-1 flex flex-col md:flex-row overflow-auto">
        <Outlet />
      </main>

      {/* FOOTER (Intacto) */}
      <footer>

        <Footer />

      </footer>
        
      
    </div>
  );
}
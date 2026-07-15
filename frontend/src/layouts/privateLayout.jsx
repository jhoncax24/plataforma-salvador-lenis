import { Outlet } from "react-router-dom";
import logo from "../assets/logo.webp";
import Footer from '../components/public/Footer';

export default function PrivateLayout() {
  return (
    <div className="min-h-screen bg-gray-100">
      {/* Aquí luego pones sidebar o navbar del rol */}
      <Outlet />

      {/* FOOTER (igual) */}
      <Footer />
    </div>
  );
}

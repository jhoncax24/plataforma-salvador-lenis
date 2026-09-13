import { Outlet } from "react-router-dom";
import Footer from '../components/public/Footer';

export default function PrivateLayout() {
  return (
    <div className="min-h-screen bg-gray-100 flex flex-col">
      <div className="flex-1">
        <Outlet />
      </div>
      <Footer />
    </div>
  );
}

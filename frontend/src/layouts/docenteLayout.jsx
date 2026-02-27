import { Outlet } from "react-router-dom";

export default function DocenteLayout() {
  return (
    <div className="min-h-screen flex">
      {/* Aquí luego irá tu sidebar del docente */}
      <aside className="w-64 bg-blue-900 text-white p-4">
        <p className="font-bold text-lg">Panel Docente</p>
        {/* aquí pondrás el menú */}
      </aside>

      <main className="flex-1 p-6 bg-gray-100">
        <Outlet />
      </main>
    </div>
  );
}

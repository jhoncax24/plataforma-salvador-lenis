import { Routes, Route } from "react-router-dom";

// Layouts
import PublicLayout from "../layouts/publicLayout";
import PrivateLayout from "../layouts/privateLayout";
import EstudianteLayout from "../layouts/estudianteLayout";
import DocenteLayout from "../layouts/docenteLayout";
import AcudienteLayout from "../layouts/acudienteLayout";

// Guards
import PrivateRoute from "./privateRoute";
import RoleRoute from "./roleRoute";

// Public pages
import Inicio from "../pages/public/inicio";
import QuienesSomos from "../pages/public/quienesSomos";
import InicioContacto from "../pages/public/contacto";
import InicioAyuda from "../pages/public/ayuda";

// 👇 AQUÍ ESTÁ LA CORRECCIÓN: Importamos desde components/public/
import Login from "../components/public/login";

// Private pages

//Estudiante
import EstudianteInicio from "../pages/estudiante/inicio";
import NotasDetalle from "../pages/estudiante/NotasDetalle";
import MateriaConsolidado from "../pages/estudiante/MateriaConsolidado";
import HistorialAcademico from "../pages/estudiante/HistorialAcademico";
import TareasCalendario from "../pages/estudiante/TareasCalendario";
// Agrega esta línea en la parte superior junto a tus otras importaciones
import AsistenciasEstudiante from "../pages/estudiante/AsistenciasEstudiante"; 
// 👆 Nota: Cambia "./pages/estudiante/..." por la ruta real si lo guardaste en otro lado.
//Docente

import DocenteInicio from "../pages/docente/inicio";
import AcudienteInicio from "../pages/acudiente/inicio";



export default function AppRouter() {
  return (
    <Routes>

      {/* PUBLIC ROUTES */}
      <Route element={<PublicLayout />}>
        <Route index element={<Inicio />} />
        <Route path="/" element={<Inicio />} />
        <Route path="/quienes-somos" element={<QuienesSomos />} />
        <Route path="/contacto" element={<InicioContacto />} />
        <Route path="/ayuda" element={<InicioAyuda />} />
        
        {/* Ruta para el componente Login */}
        <Route path="/login" element={<Login />} />
      </Route>

      {/* PRIVATE ROUTES */}
      <Route
        element={
          <PrivateRoute>
            <PrivateLayout />
          </PrivateRoute>
        }
      >

        {/* ESTUDIANTE */}
        <Route
          path="/estudiante"
          element={
            <RoleRoute role="estudiante">
              <EstudianteLayout />
            </RoleRoute>
          }
        >
          <Route index element={<EstudianteInicio />} />
          <Route path="/estudiante/notas" element={<NotasDetalle />} />
          <Route path="/estudiante/historial" element={<HistorialAcademico />} />
          <Route path="/estudiante/notas/:materia" element={<MateriaConsolidado />} />
          <Route path="/estudiante/calendario" element={<TareasCalendario />} />
          <Route path="/estudiante/asistencia" element={<AsistenciasEstudiante />} />

        </Route>

        {/* DOCENTE */}
        <Route
          path="/docente"
          element={
            <RoleRoute role="docente">
              <DocenteLayout />
            </RoleRoute>
          }
        >
          <Route index element={<DocenteInicio />} />
        </Route>

        {/* ACUDIENTE */}
        <Route
          path="/acudiente"
          element={
            <RoleRoute role="acudiente">
              <AcudienteLayout />
            </RoleRoute>
          }
        >
          <Route index element={<AcudienteInicio />} />
        </Route>

      </Route>

    </Routes>
  );
}
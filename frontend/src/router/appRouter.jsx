import { Routes, Route } from "react-router-dom";

// Layouts
import PublicLayout from "../layouts/publicLayout";
import PrivateLayout from "../layouts/privateLayout";
import EstudianteLayout from "../layouts/estudianteLayout";
import DocenteLayout from "../layouts/docenteLayout";
import AcudienteLayout from "../layouts/acudienteLayout";
// 👇 IMPORTACIÓN DEL LAYOUT ADMIN
import AdminLayout from "../layouts/adminLayout"; 

// Guards
import PrivateRoute from "./privateRoute";
import RoleRoute from "./roleRoute";

// Public pages
import Inicio from "../pages/public/inicio";
import QuienesSomos from "../pages/public/quienesSomos";
import InicioContacto from "../pages/public/contacto";
import InicioAyuda from "../pages/public/ayuda";
import Login from "../components/public/login";

// Private pages

// Estudiante
import EstudianteInicio from "../pages/estudiante/inicio";
import NotasDetalle from "../pages/estudiante/NotasDetalle";
import MateriaConsolidado from "../pages/estudiante/MateriaConsolidado";
import HistorialAcademico from "../pages/estudiante/HistorialAcademico";
import TareasCalendarioEstudiante from "../pages/estudiante/TareasCalendario";
import AsistenciasEstudiante from "../pages/estudiante/AsistenciasEstudiante"; 

// Docente
import DocenteInicio from "../pages/docente/inicio";
import TareasCalendarioDocente from "../pages/docente/TareasCalendario";
import NotasPlanilla from "../pages/docente/NotasDocente";
import ObservadorDocente from "../pages/docente/ObservadorDocente";
import AsistenciaDocente from "../pages/docente/AsistenciaDocente"; 

// Acudiente
import AcudienteInicio from "../pages/acudiente/inicio";
import NotasVista from "../pages/acudiente/NotasVista";
import CertificadoVista from "../pages/acudiente/CertificadoVista";
import CambiarPasswordVista from "../pages/acudiente/CambiarPasswordVista";
import MatriculaVista from "../pages/acudiente/MatriculaVista";
import CalendarioVista from "../pages/acudiente/CalendarioVista";
import ObservadorAsistenciaVista from "../pages/acudiente/ObservadorAsistenciaVista";

// 👇 IMPORTACIÓN DE LA PÁGINA ADMIN
import AdminInicio from "../pages/admin/inicio";


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
          <Route path="/estudiante/calendario" element={<TareasCalendarioEstudiante />} />
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
          <Route path="/docente/calendario" element={<TareasCalendarioDocente />} />
          <Route path="/docente/notas" element={<NotasPlanilla />} />
          <Route path="/docente/observador" element={<ObservadorDocente />} />
          <Route path="/docente/asistencia" element={<AsistenciaDocente />} />
        </Route>

        {/* ACUDIENTE */}
        <Route path="/acudiente" element={<RoleRoute role="acudiente"><AcudienteLayout /></RoleRoute>}>
          <Route index element={<AcudienteInicio />} />
          <Route path="/acudiente/notas" element={<NotasVista />} />
          <Route path="/acudiente/comportamiento" element={<ObservadorAsistenciaVista />} />
          <Route path="/acudiente/certificado" element={<CertificadoVista />} />
          <Route path="/acudiente/password" element={<CambiarPasswordVista />} />
          <Route path="/acudiente/matricula" element={<MatriculaVista />} />
          <Route path="/acudiente/calendario" element={<CalendarioVista />} />
        </Route>

        {/* 👇 NUEVA RUTA: ADMIN 👇 */}
        <Route
          path="/admin"
          element={
            <RoleRoute role="admin">
              <AdminLayout />
            </RoleRoute>
          }
        >
          {/* El index cargará AdminInicio que a su vez contiene el componente MatriculasPendientes */}
          <Route index element={<AdminInicio />} />
        </Route>

      </Route>

    </Routes>
  );
}
import { lazy, Suspense } from "react";
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
const Inicio = lazy(() => import("../pages/public/inicio"));
const QuienesSomos = lazy(() => import("../pages/public/quienesSomos"));
const InicioContacto = lazy(() => import("../pages/public/contacto"));
const InicioAyuda = lazy(() => import("../pages/public/ayuda"));
const Login = lazy(() => import("../components/public/login"));

// Private pages

// Estudiante
const EstudianteInicio = lazy(() => import("../pages/estudiante/inicio"));
const NotasDetalle = lazy(() => import("../pages/estudiante/NotasDetalle"));
const MateriaConsolidado = lazy(() => import("../pages/estudiante/MateriaConsolidado"));
const HistorialAcademico = lazy(() => import("../pages/estudiante/HistorialAcademico"));
const TareasCalendarioEstudiante = lazy(() => import("../pages/estudiante/TareasCalendario"));
const AsistenciasEstudiante = lazy(() => import("../pages/estudiante/AsistenciasEstudiante"));

// Docente
const DocenteInicio = lazy(() => import("../pages/docente/inicio"));
const TareasCalendarioDocente = lazy(() => import("../pages/docente/TareasCalendario"));
const NotasPlanilla = lazy(() => import("../pages/docente/NotasDocente"));
const ObservadorDocente = lazy(() => import("../pages/docente/ObservadorDocente"));
const AsistenciaDocente = lazy(() => import("../pages/docente/AsistenciaDocente"));

// Acudiente
const AcudienteInicio = lazy(() => import("../pages/acudiente/inicio"));
const NotasVista = lazy(() => import("../pages/acudiente/NotasVista"));
const CertificadoVista = lazy(() => import("../pages/acudiente/CertificadoVista"));
const CambiarPasswordVista = lazy(() => import("../pages/acudiente/CambiarPasswordVista"));
const MatriculaVista = lazy(() => import("../pages/acudiente/MatriculaVista"));
const CalendarioVista = lazy(() => import("../pages/acudiente/CalendarioVista"));
const ObservadorAsistenciaVista = lazy(() => import("../pages/acudiente/ObservadorAsistenciaVista"));

// 👇 IMPORTACIÓN DE LA PÁGINA ADMIN
const AdminInicio = lazy(() => import("../pages/admin/inicio"));


export default function AppRouter() {
  return (
    <Suspense fallback={
      <div className="flex min-h-[50vh] items-center justify-center">
        <div className="animate-spin rounded-full h-12 w-12 border-t-4 border-b-4 border-[#0033a0]"></div>
      </div>
    }>
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
    </Suspense>
  );
}
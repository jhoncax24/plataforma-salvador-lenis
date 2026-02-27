// src/layouts/acudienteLayout.jsx
import { Outlet } from "react-router-dom";
import { useEffect, useState } from "react";

import Header from "../components/acudiente/Header";
import Footer from "../components/acudiente/Footer";
import PerfilModal from "../components/acudiente/PerfilModal";
import EditarDatosModal from "../components/acudiente/EditarDatosModal";
import CambiarPasswordModal from "../components/acudiente/CambiarPasswordModal";
import NotasModal from "../components/acudiente/NotasModal";

import {
  obtenerPerfilAcudiente,
  obtenerHijos,
  actualizarAcudiente,
  actualizarEstudiante,
  cambiarPasswordAcudiente,
  cambiarPasswordEstudiante,
  obtenerNotasEstudiante,
} from "../api/perfilApi";

export default function AcudienteLayout() {
  const [profile, setProfile] = useState(null);
  const [hijos, setHijos] = useState([]);

  const [perfilOpen, setPerfilOpen] = useState(false);
  const [editarOpen, setEditarOpen] = useState(false);
  const [passOpen, setPassOpen] = useState(false);
  const [editarDataTarget, setEditarDataTarget] = useState(null);
  const [tipoEdicion, setTipoEdicion] = useState(null);
  const [tipoPassword, setTipoPassword] = useState(null);
  const [passwordTargetId, setPasswordTargetId] = useState(null);

  const [notasOpen, setNotasOpen] = useState(false);
  const [notasEstudiante, setNotasEstudiante] = useState(null);
  const [notasData, setNotasData] = useState([]);

  // 🔹 Cargar perfil
  useEffect(() => {
    const load = async () => {
      try {
        const [acudienteData, hijosData] = await Promise.all([
          obtenerPerfilAcudiente(),
          obtenerHijos(),
        ]);

        setProfile(acudienteData);
        setHijos(hijosData);
      } catch (err) {
        console.error(err);
        alert("Error cargando datos");
      }
    };
    load();
  }, []);

  // 🔹 Abrir panel de editar
  const handleEdit = (target) => {
    const tipo = target.grado !== undefined ? "hijo" : "acudiente";
    setEditarDataTarget(target);
    setTipoEdicion(tipo);
    setEditarOpen(true);
  };

  const handleSaveDatos = async (form) => {
    try {
      if (tipoEdicion === "acudiente") {
        const updated = await actualizarAcudiente(form);
        setProfile(updated);
      } else {
        const updated = await actualizarEstudiante(editarDataTarget.id, form);
        setHijos((prev) =>
          prev.map((h) => (h.id === updated.id ? updated : h))
        );
      }
      setEditarOpen(false);
    } catch (err) {
      console.error(err);
      alert("Error guardando datos");
    }
  };

  const handleChangePassword = async (form) => {
    try {
      const payload = { actual: form.actual, nueva: form.nueva };

      if (tipoPassword === "acudiente")
        await cambiarPasswordAcudiente(passwordTargetId, payload);
      else
        await cambiarPasswordEstudiante(passwordTargetId, payload);

      alert("Contraseña actualizada");
      setPassOpen(false);
    } catch (err) {
      console.error(err);
      alert("Error al cambiar contraseña");
    }
  };

  // 🔹 Ver notas de un hijo
  const handleVerNotas = async (idEstudiante) => {
    try {
      const estudiante = hijos.find((h) => h.id === idEstudiante);
      const notas = await obtenerNotasEstudiante(idEstudiante);

      setNotasEstudiante(estudiante);
      setNotasData(notas);
      setNotasOpen(true);
    } catch (err) {
      console.error(err);
      alert("Error cargando notas");
    }
  };

  if (!profile)
    return (
      <div className="min-h-screen flex justify-center items-center">
        Cargando...
      </div>
    );

  return (
    <div className="min-h-screen bg-gray-100 flex flex-col">
      <Header onOpenPerfil={() => setPerfilOpen(true)} />

      <main className="max-w-7xl mx-auto p-6 flex-1">
        <Outlet context={{ profile, hijos, handleVerNotas }} />
      </main>

      <Footer />

      <PerfilModal
        isOpen={perfilOpen}
        onClose={() => setPerfilOpen(false)}
        profile={profile}
        hijos={hijos}
        onEdit={handleEdit}
        onChangePassword={(data) => {
          setTipoPassword(data.tipo);
          setPasswordTargetId(data.id);
          setPassOpen(true);
        }}
      />

      <EditarDatosModal
        isOpen={editarOpen}
        onClose={() => setEditarOpen(false)}
        data={editarDataTarget}
        onSave={handleSaveDatos}
      />

      <CambiarPasswordModal
        isOpen={passOpen}
        onClose={() => setPassOpen(false)}
        onChange={handleChangePassword}
      />

      <NotasModal
        isOpen={notasOpen}
        onClose={() => setNotasOpen(false)}
        estudiante={notasEstudiante}
        notas={notasData}
      />
    </div>
  );
}

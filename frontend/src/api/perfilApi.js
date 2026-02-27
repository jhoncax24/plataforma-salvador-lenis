// src/api/perfilApi.js
import axios from "axios";

const API = axios.create({
  baseURL: "http://localhost:4000/api",
});

// ID del acudiente "logueado"
const ACUDIENTE_ID = 1;

export const obtenerPerfilAcudiente = async () => {
  return (await API.get(`/acudiente/${ACUDIENTE_ID}`)).data;
};

export const obtenerHijos = async () => {
  return (await API.get(`/acudiente/${ACUDIENTE_ID}/estudiantes`)).data;
};

export const actualizarAcudiente = async (data) => {
  return (await API.put(`/acudiente/${ACUDIENTE_ID}`, data)).data;
};

export const actualizarEstudiante = async (idEstudiante, data) => {
  return (await API.put(`/estudiante/${idEstudiante}`, data)).data;
};

export const cambiarPasswordAcudiente = async (id, data) => {
  return API.put(`/acudiente/${id}/password`, data);
};

export const cambiarPasswordEstudiante = async (id, data) => {
  return API.put(`/estudiante/${id}/password`, data);
};

export const obtenerNotasEstudiante = async (idEstudiante) => {
  const res = await API.get(`/estudiante/${idEstudiante}/notas`);
  return res.data;
};

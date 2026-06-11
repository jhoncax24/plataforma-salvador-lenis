import axios from "axios";

// 1. Configuramos la URL dinámica
// Vite utiliza import.meta.env para leer las variables de entorno
const API_URL = import.meta.env.VITE_API_URL || "http://localhost:4000/api";

const api = axios.create({
  baseURL: API_URL,
});

// Interceptor para enviar token automáticamente
api.interceptors.request.use((config) => {
  const token = localStorage.getItem("cesl_token");
  if (token) {
    config.headers.Authorization = `Bearer ${token}`;
  }
  return config;
});

export default api;
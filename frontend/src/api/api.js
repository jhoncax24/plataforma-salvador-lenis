import axios from "axios";

// 1. Configuramos la URL dinámica
// Vite utiliza import.meta.env para leer las variables de entorno
const API_URL = import.meta.env.VITE_API_URL || "http://localhost:4000/api";

const api = axios.create({
  baseURL: API_URL,
});

// ... (tu interceptor actual de request se queda igual) ...

// NUEVO: Interceptor para escuchar respuestas del backend
api.interceptors.response.use(
  (response) => {
    // Si la petición fue exitosa, la dejamos pasar normal
    return response;
  },
  (error) => {
    // Si el backend nos responde con un error 401 (No autorizado / Token vencido)
    if (error.response && error.response.status === 401) {
      console.warn("Sesión caducada. Redirigiendo al login...");
      
      // Limpiamos la basura del localStorage
      localStorage.removeItem("cesl_token");
      localStorage.removeItem("cesl_user");
      
      // Forzamos la redirección a la pantalla de login
      window.location.href = "/login"; 
    }
    
    // Devolvemos el error para que el resto del código lo maneje si lo necesita
    return Promise.reject(error);
  }
);

export default api;
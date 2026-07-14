import axios from "axios";

// 1. Configuramos la URL dinámica
// Vite utiliza import.meta.env para leer las variables de entorno
const API_URL = import.meta.env.VITE_API_URL || "http://localhost:4000/api";

const api = axios.create({
  baseURL: API_URL,
});

// ==========================================
// 1. INTERCEPTOR DE PETICIÓN (REQUEST) - ¡Faltaba esto!
// ==========================================
// Esto se ejecuta ANTES de que la petición salga hacia el backend
api.interceptors.request.use(
  (config) => {
    // Buscamos el token en el almacenamiento local
    const token = localStorage.getItem("cesl_token");
    
    // Si el usuario tiene un token guardado, lo inyectamos en las cabeceras
    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }
    
    return config;
  },
  (error) => {
    return Promise.reject(error);
  }
);

// ==========================================
// 2. INTERCEPTOR DE RESPUESTA (RESPONSE)
// ==========================================
// Esto se ejecuta cuando el backend nos responde
api.interceptors.response.use(
  (response) => {
    // Si la petición fue exitosa, la dejamos pasar normal
    return response;
  },
  (error) => {
    // Si el backend nos responde con un error 401 (No autorizado / Token vencido)
    if (error.response && error.response.status === 401) {
      console.warn("Sesión caducada. Redirigiendo al login...");
      
      // Limpiamos los datos del usuario del localStorage
      localStorage.removeItem("cesl_token");
      localStorage.removeItem("cesl_user");
      
      // Forzamos la redirección al inicio (ruta raíz)
      window.location.href = "/"; 
    }
    
    // Devolvemos el error para que el resto del código lo maneje si lo necesita
    return Promise.reject(error);
  }
);

export default api;
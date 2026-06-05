import React from 'react';
import { Outlet, useNavigate } from 'react-router-dom';
// Importamos el Header que vive en la carpeta del estudiante
import Header from '../components/estudiante/Header';

const EstudianteLayout = () => {
  const navigate = useNavigate();
  
  // Obtenemos los datos del estudiante logueado
  const user = JSON.parse(localStorage.getItem('user')); 

  // Lógica de seguridad para cerrar la sesión
  const handleLogout = () => {
    localStorage.removeItem('token'); // Borramos el JWT
    localStorage.removeItem('user');  // Borramos los datos
    navigate('/login');               // Redirigimos al inicio de sesión
  };

  return (
    <div>
      {/* El Header del estudiante recibe sus propiedades 
      */}
      <Header user={user} logout={handleLogout} />
      
      {/* Aquí React inyectará el Horario, Notas, etc. */}
      <main>
        <Outlet /> 
      </main>
    </div>
  );
};

export default EstudianteLayout;
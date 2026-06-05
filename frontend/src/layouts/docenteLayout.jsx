import React from 'react';
import { Outlet, useNavigate } from 'react-router-dom';
// Importamos el Header que vive en la carpeta del docente
import Header from '../components/docente/Header';

const DocenteLayout = () => {
  const navigate = useNavigate();
  
  // Obtenemos los datos del usuario logueado para pasarlos al Header
  const user = JSON.parse(localStorage.getItem('user')); 

  // Lógica de seguridad para cerrar la sesión
  const handleLogout = () => {
    localStorage.removeItem('token'); // Borramos el JWT
    localStorage.removeItem('user');  // Borramos los datos
    navigate('/login');               // Redirigimos al inicio de sesión
  };

  return (
    <div>
      {/* Le pasamos las props "user" y "logout" al Header 
        para que pueda mostrar el nombre y cerrar sesión
      */}
      <Header user={user} logout={handleLogout} />
      
      {/* Todo el contenido de la página del docente irá debajo del Header */}
      <main>
        <Outlet /> 
      </main>
    </div>
  );
};

export default DocenteLayout;
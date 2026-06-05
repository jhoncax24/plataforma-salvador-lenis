import React from 'react';
import { Outlet, useNavigate } from 'react-router-dom';
import Header from '../components/acudiente/HeaderInicio';

const AcudienteLayout = () => {
  const navigate = useNavigate();
  const user = JSON.parse(localStorage.getItem('user')); 

  const handleLogout = () => {
    localStorage.removeItem('token');
    localStorage.removeItem('user');
    navigate('/login');
  };

  // Definimos los estilos del contenedor principal para dar el espacio
  const styles = {
    contenedorGlobal: {
      display: 'flex',
      flexDirection: 'column',
      minHeight: '100vh', // Asegura que ocupe toda la altura de la pantalla
      backgroundColor: '#f4f6f8' // Un fondo gris claro opcional para resaltar las tarjetas blancas
    },
    contenidoPrincipal: {
      padding: '2.5rem', // ESTA ES LA MAGIA: 2.5rem de espacio arriba, abajo y a los lados
      flex: 1 // Hace que este contenedor empuje todo hacia abajo si luego agregas un Footer
    }
  };

  return (
    <div style={styles.contenedorGlobal}>
      <Header user={user} logout={handleLogout} />
      
      {/* Aplicamos el padding al contenedor main que envuelve tus vistas */}
      <main style={styles.contenidoPrincipal}>
        <Outlet /> 
      </main>
    </div>
  );
};

export default AcudienteLayout;
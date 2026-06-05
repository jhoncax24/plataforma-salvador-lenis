import React from 'react';
import { Link } from 'react-router-dom';
import { FaQuestionCircle, FaSignInAlt } from 'react-icons/fa';

const Header = () => {
  //const navigate = useNavigate();

  // Estilos en línea para asegurar la consistencia de colores
  const styles = {
    header: {
      backgroundColor: '#191970', // Azul Medianoche
      color: 'white',
      padding: '0.8rem 2rem',
      display: 'flex',
      justifyContent: 'space-between',
      alignItems: 'center',
      boxShadow: '0 4px 6px rgba(0,0,0,0.1)',
      borderBottom: '4px solid #D32F2F', // Detalle en Rojo
      fontFamily: 'Arial, sans-serif'
    },
    logo: {
      fontSize: '1.5rem',
      fontWeight: 'bold',
      color: 'white',
      textDecoration: 'none',
      display: 'flex',
      alignItems: 'center'
    },
    nav: {
      display: 'flex',
      gap: '20px',
      alignItems: 'center'
    },
    link: {
      color: 'white',
      textDecoration: 'none',
      fontSize: '0.95rem',
      fontWeight: '500',
      transition: 'color 0.3s'
    },
    btnLogin: {
      backgroundColor: '#D32F2F',
      color: 'white',
      border: 'none',
      padding: '8px 15px',
      borderRadius: '5px',
      cursor: 'pointer',
      display: 'flex',
      alignItems: 'center',
      gap: '5px',
      fontWeight: 'bold'
    }
  };

  return (
    <header style={styles.header}>
      {/* Logo de la Institución */}
      <Link to="/frontend/src/assets/logo.webp" style={styles.logo}>
        <span style={{ color: '#D32F2F', marginRight: '5px' }}>CESL</span> ACADÉMICO
      </Link>

      {/* Menú de Navegación (Rescatado de tu diseño anterior) */}
      <nav style={styles.nav}>
        <Link to="/" style={styles.link}>Inicio</Link>
        <Link to="/quienes-somos" style={styles.link}>¿Quiénes somos?</Link>
        <Link to="/contacto" style={styles.link}>Contacto</Link>
        <Link to="/ayuda" style={styles.link}>
          <FaQuestionCircle style={{ marginRight: '5px' }} /> Ayuda
        </Link>

        {/* Botón para ingresar a la plataforma
        /*<button style={styles.btnLogin} onClick={() => navigate('/login')}>
          <FaSignInAlt /> Iniciar Sesión
        </button>*/}
      </nav>
    </header>
  );
};

export default Header;
import React from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { FaUserCircle, FaSignOutAlt, FaQuestionCircle } from 'react-icons/fa';

const Header = ({ user, logout }) => {
  const navigate = useNavigate();

  const styles = {
    header: {
      backgroundColor: '#191970', color: 'white', padding: '0.8rem 2rem',
      display: 'flex', justifyContent: 'space-between', alignItems: 'center',
      boxShadow: '0 4px 6px rgba(0,0,0,0.1)', borderBottom: '4px solid #D32F2F', fontFamily: 'Arial, sans-serif'
    },
    logo: { fontSize: '1.2rem', fontWeight: 'bold', color: 'white', textDecoration: 'none' },
    nav: { display: 'flex', gap: '20px', alignItems: 'center' },
    link: { color: 'white', textDecoration: 'none', fontSize: '0.95rem', fontWeight: '500' },
    userSection: { display: 'flex', alignItems: 'center', gap: '15px', borderLeft: '1px solid rgba(255,255,255,0.3)', paddingLeft: '15px' }
  };

  return (
    <header style={styles.header}>
      <Link to="/docente/inicio" style={styles.logo}><span style={{ color: '#D32F2F' }}>Portal</span> Docente</Link>
      <nav style={styles.nav}>
        <Link to="/docente/asistencia" style={styles.link}>Asistencia</Link>
        <Link to="/docente/observador" style={styles.link}>Observador</Link>
        <Link to="/docente/reportes" style={styles.link}>Reportes</Link>
        <button onClick={() => navigate('/ayuda')} style={{ background: 'none', border: 'none', color: '#D32F2F', cursor: 'pointer', fontWeight: 'bold' }}>
          <FaQuestionCircle /> Ayuda
        </button>
        <div style={styles.userSection}>
          <div style={{ textAlign: 'right', fontSize: '0.9rem', fontWeight: 'bold' }}>{user?.nombre || 'Docente'}</div>
          <FaUserCircle size={25} />
          <button onClick={logout} style={{ background: 'none', border: 'none', color: 'white', cursor: 'pointer' }}><FaSignOutAlt size={20} /></button>
        </div>
      </nav>
    </header>
  );
};

export default Header;
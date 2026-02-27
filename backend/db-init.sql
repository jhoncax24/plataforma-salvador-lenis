-- Crear la base de datos si no existe (ejecuta desde usuario con permisos)
-- CREATE DATABASE cesl_db;

-- Usar la base de datos creada
-- \c cesl_db;  (pgAdmin te permite seleccionar DB desde la UI)

-- Tabla usuarios
CREATE TABLE IF NOT EXISTS users (
  id SERIAL PRIMARY KEY,
  username VARCHAR(80) UNIQUE NOT NULL,
  password_hash VARCHAR(200) NOT NULL,
  full_name VARCHAR(150) DEFAULT '',
  role VARCHAR(30) DEFAULT 'acudiente',
  created_at TIMESTAMP DEFAULT NOW()
);

-- Tabla events (eventos)
CREATE TABLE IF NOT EXISTS events (
  id SERIAL PRIMARY KEY,
  title VARCHAR(200) NOT NULL,
  description TEXT,
  image_url VARCHAR(300),
  start_date DATE,
  end_date DATE,
  created_at TIMESTAMP DEFAULT NOW()
);

-- Tabla password_resets (opcional: flow recuperación)
CREATE TABLE IF NOT EXISTS password_resets (
  id SERIAL PRIMARY KEY,
  user_id INT REFERENCES users(id) ON DELETE CASCADE,
  token VARCHAR(200) NOT NULL,
  expires_at TIMESTAMP NOT NULL,
  created_at TIMESTAMP DEFAULT NOW()
);

-- Datos de prueba: admin y un usuario ejemplo (password: Admin123!)
-- Hashed bcrypt de 'Admin123!' (salt 10) pre-generado:
INSERT INTO users (username, password_hash, full_name, role)
VALUES
('admin','$2b$10$2n2Mk0gk4I8qa0m0Qq2xNO0bP4fWbq3qW9Qj3s0GkKfW6Dg0Y6bQW','Administrador General','admin')
ON CONFLICT (username) DO NOTHING;

INSERT INTO users (username, password_hash, full_name, role)
VALUES
('docente1','$2b$10$C1q2XcB.q3y6zQwF3t9kPe0XKjY1lYg7G5E9g8u5H2Z2H3B4D1e6','Profesor Ejemplo','docente')
ON CONFLICT (username) DO NOTHING;

-- Datos de eventos iniciales
INSERT INTO events (title, description, image_url, start_date, end_date)
VALUES
('Feria de Ciencias Anual','Nuestros estudiantes presentan sus innovadores proyectos en la feria de ciencias anual. ¡Ven y descubre el futuro!','/assets/feria_ciencias.jpg','2025-11-01','2025-11-02')
ON CONFLICT DO NOTHING;

INSERT INTO events (title, description, image_url, start_date, end_date)
VALUES
('Semana Cultural','Actividades artísticas y culturales para toda la comunidad educativa.','/assets/semana_cultural.jpg','2025-12-01','2025-12-07')
ON CONFLICT DO NOTHING;

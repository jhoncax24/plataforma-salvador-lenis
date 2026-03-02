-- ==============================================================================
-- BASE DE DATOS UNIFICADA: CENTRO EDUCATIVO SALVADOR LENIS
-- ==============================================================================

-- 1. LIMPIEZA DE TABLAS (Orden estricto por dependencias)
DROP TABLE IF EXISTS mensajes CASCADE;
DROP TABLE IF EXISTS boletines CASCADE;
DROP TABLE IF EXISTS asistencias CASCADE;
DROP TABLE IF EXISTS evidencias CASCADE;
DROP TABLE IF EXISTS observaciones CASCADE;
DROP TABLE IF EXISTS notas_estudiante CASCADE;
DROP TABLE IF EXISTS materias CASCADE;
DROP TABLE IF EXISTS matriculas CASCADE;
DROP TABLE IF EXISTS estudiantes CASCADE;
DROP TABLE IF EXISTS acudientes CASCADE;
DROP TABLE IF EXISTS docentes CASCADE;
DROP TABLE IF EXISTS admins CASCADE;
DROP TABLE IF EXISTS users CASCADE;

-- ==============================================================================
-- 2. SISTEMA CENTRAL DE AUTENTICACIÓN (LOGIN UNIFICADO - SPRINT 5)
-- ==============================================================================
CREATE TABLE users (
    id_usuario SERIAL PRIMARY KEY,
    username VARCHAR(50) UNIQUE NOT NULL,
    password_hash VARCHAR(255) NOT NULL, -- RNF-06 (Bcrypt)
    role VARCHAR(20) NOT NULL CHECK (role IN ('admin', 'docente', 'acudiente', 'estudiante')),
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    estado VARCHAR(20) DEFAULT 'Activo' -- Para suspender cuentas sin borrarlas
);

-- ==============================================================================
-- 3. PERFILES DE USUARIOS (Mapeados al usuario central)
-- ==============================================================================

CREATE TABLE admins (
    id_admin SERIAL PRIMARY KEY,
    id_usuario INTEGER UNIQUE REFERENCES users(id_usuario) ON DELETE CASCADE,
    nombre_completo VARCHAR(150) NOT NULL,
    correo VARCHAR(120) UNIQUE
);

CREATE TABLE acudientes (
    id_acudiente SERIAL PRIMARY KEY,
    id_usuario INTEGER UNIQUE REFERENCES users(id_usuario) ON DELETE CASCADE,
    nombre_completo VARCHAR(150) NOT NULL,
    tipo_doc VARCHAR(5),
    documento VARCHAR(20) UNIQUE NOT NULL,
    telefono VARCHAR(20),
    correo VARCHAR(120),
    direccion VARCHAR(150)
);

CREATE TABLE estudiantes (
    id_estudiante SERIAL PRIMARY KEY,
    id_usuario INTEGER UNIQUE REFERENCES users(id_usuario) ON DELETE CASCADE,
    id_acudiente INTEGER REFERENCES acudientes(id_acudiente) ON DELETE SET NULL,
    nombre_completo VARCHAR(150) NOT NULL,
    tipo_doc VARCHAR(5),
    documento VARCHAR(20) UNIQUE NOT NULL,
    fecha_nacimiento DATE,
    grado VARCHAR(20),
    grupo VARCHAR(10) -- Ejemplo: 9A, 9B
);

CREATE TABLE docentes (
    id_docente SERIAL PRIMARY KEY,
    id_usuario INTEGER UNIQUE REFERENCES users(id_usuario) ON DELETE CASCADE,
    nombre_completo VARCHAR(150) NOT NULL,
    documento VARCHAR(20) UNIQUE,
    especialidad VARCHAR(100),
    telefono VARCHAR(20),
    correo VARCHAR(120)
);

-- ==============================================================================
-- 4. MATRÍCULA Y FIRMA DIGITAL (SPRINTS 8 Y 9)
-- ==============================================================================
CREATE TABLE matriculas (
    id_matricula SERIAL PRIMARY KEY,
    id_estudiante INTEGER REFERENCES estudiantes(id_estudiante) ON DELETE CASCADE,
    año_lectivo VARCHAR(10) NOT NULL, -- Ejemplo: '2024'
    estado VARCHAR(30) DEFAULT 'Pendiente', -- Pendiente, Aprobada, Rechazada
    documentos_url TEXT, -- Link a carpeta de Google Drive / AWS S3
    firma_digital_hash TEXT, -- R06: Firma encriptada del acudiente
    fecha_matricula TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- ==============================================================================
-- 5. MÓDULO ACADÉMICO Y DE EVALUACIÓN (SPRINTS 7 Y 10)
-- ==============================================================================
CREATE TABLE materias (
    id_materia SERIAL PRIMARY KEY,
    nombre VARCHAR(100) NOT NULL,
    id_docente INTEGER REFERENCES docentes(id_docente) ON DELETE SET NULL
);

CREATE TABLE notas_estudiante (
    id_nota SERIAL PRIMARY KEY,
    id_estudiante INTEGER REFERENCES estudiantes(id_estudiante) ON DELETE CASCADE,
    id_materia INTEGER REFERENCES materias(id_materia) ON DELETE CASCADE,
    periodo VARCHAR(20) DEFAULT 'Periodo 1',
    nota_p1 NUMERIC(3,1) DEFAULT 0.0,
    nota_p2 NUMERIC(3,1) DEFAULT 0.0,
    nota_p3 NUMERIC(3,1) DEFAULT 0.0,
    nota_final NUMERIC(3,1) DEFAULT 0.0,
    UNIQUE(id_estudiante, id_materia, periodo) -- Un estudiante solo tiene una nota final por periodo
);

-- Para las tareas y subida de archivos (R03)
CREATE TABLE evidencias (
    id_evidencia SERIAL PRIMARY KEY,
    id_estudiante INTEGER REFERENCES estudiantes(id_estudiante) ON DELETE CASCADE,
    id_materia INTEGER REFERENCES materias(id_materia) ON DELETE CASCADE,
    titulo VARCHAR(150) NOT NULL,
    descripcion TEXT,
    archivo_url TEXT NOT NULL, -- Link al archivo subido
    fecha_subida TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    calificacion NUMERIC(3,1) -- La nota específica de esa tarea
);

-- ==============================================================================
-- 6. ASISTENCIA Y OBSERVACIONES (SPRINTS 6 Y 8)
-- ==============================================================================
CREATE TABLE asistencias (
    id_asistencia SERIAL PRIMARY KEY,
    id_estudiante INTEGER REFERENCES estudiantes(id_estudiante) ON DELETE CASCADE,
    id_materia INTEGER REFERENCES materias(id_materia) ON DELETE CASCADE,
    fecha DATE NOT NULL,
    estado VARCHAR(20) NOT NULL CHECK (estado IN ('Presente', 'Ausente', 'Excusa')),
    observacion TEXT
);

CREATE TABLE observaciones (
    id_observacion SERIAL PRIMARY KEY,
    id_estudiante INTEGER REFERENCES estudiantes(id_estudiante) ON DELETE CASCADE,
    id_docente INTEGER REFERENCES docentes(id_docente) ON DELETE CASCADE,
    fecha TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    tipo VARCHAR(50) NOT NULL, -- 'Académica', 'Disciplinaria', 'Felicitación'
    descripcion TEXT NOT NULL
);

-- ==============================================================================
-- 7. COMUNICACIÓN (SPRINT 11)
-- ==============================================================================
CREATE TABLE mensajes (
    id_mensaje SERIAL PRIMARY KEY,
    id_remitente INTEGER REFERENCES users(id_usuario) ON DELETE CASCADE,
    id_destinatario INTEGER REFERENCES users(id_usuario) ON DELETE CASCADE,
    asunto VARCHAR(150),
    cuerpo TEXT NOT NULL,
    fecha_envio TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    leido BOOLEAN DEFAULT FALSE
);

-- ==============================================================================
-- INSERCIÓN DE DATOS BASE (Hash bcrypt para '123456')
-- ==============================================================================

-- Usuarios
INSERT INTO users (id_usuario, username, password_hash, role) VALUES 
(1, 'admin', '$2b$10$C1q2XcB.q3y6zQwF3t9kPe0XKjY1lYg7G5E9g8u5H2Z2H3B4D1e6', 'admin'),
(2, 'docente1', '$2b$10$C1q2XcB.q3y6zQwF3t9kPe0XKjY1lYg7G5E9g8u5H2Z2H3B4D1e6', 'docente'),
(3, 'acudiente1', '$2b$10$C1q2XcB.q3y6zQwF3t9kPe0XKjY1lYg7G5E9g8u5H2Z2H3B4D1e6', 'acudiente'),
(4, 'estudiante1', '$2b$10$C1q2XcB.q3y6zQwF3t9kPe0XKjY1lYg7G5E9g8u5H2Z2H3B4D1e6', 'estudiante');

-- Perfiles
INSERT INTO admins (id_usuario, nombre_completo, correo) VALUES (1, 'Admin General', 'admin@salvadorlenis.edu.co');
INSERT INTO docentes (id_usuario, nombre_completo, documento, especialidad) VALUES (2, 'Profesor Prueba', '12345678', 'Matemáticas');
INSERT INTO acudientes (id_usuario, nombre_completo, documento) VALUES (3, 'Papa Prueba', '87654321');
INSERT INTO estudiantes (id_usuario, id_acudiente, nombre_completo, documento, grado) VALUES (4, 1, 'Hijo Prueba', '11223344', 'Noveno');

-- Académico
INSERT INTO materias (id_materia, nombre, id_docente) VALUES (1, 'Matemáticas Básicas', 1);
INSERT INTO notas_estudiante (id_estudiante, id_materia, nota_p1) VALUES (1, 1, 4.5);

-- Secuencias
SELECT setval('users_id_usuario_seq', 4, true);
SELECT setval('materias_id_materia_seq', 1, true);
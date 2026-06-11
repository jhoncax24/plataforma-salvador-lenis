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


-- =========================================================================
-- 1. LIMPIEZA DE TABLAS ANTIGUAS (Fantasmas)
-- Usamos CASCADE por si tenían alguna relación vieja colgada por ahí
-- =========================================================================
DROP TABLE IF EXISTS estudiante CASCADE;
DROP TABLE IF EXISTS events CASCADE;


-- =========================================================================
-- 2. ACTUALIZACIÓN DE LA TABLA PRINCIPAL (users)
-- Agregamos el campo email para poder enviar los códigos de recuperación.
-- Usamos "IF NOT EXISTS" para que no dé error si ya lo habías creado.
-- =========================================================================
ALTER TABLE users ADD COLUMN IF NOT EXISTS email VARCHAR(255) UNIQUE;


-- =========================================================================
-- 3. NUEVA TABLA: RECUPERACIÓN DE CONTRASEÑAS (password_resets)
-- Aquí se guardarán temporalmente los códigos de 6 dígitos encriptados.
-- =========================================================================
CREATE TABLE IF NOT EXISTS password_resets (
    id SERIAL PRIMARY KEY,
    id_usuario INTEGER REFERENCES users(id_usuario) ON DELETE CASCADE,
    code_hash VARCHAR(255) NOT NULL,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    expires_at TIMESTAMP NOT NULL
);


-- Agregamos la columna email a la tabla users
ALTER TABLE users ADD COLUMN IF NOT EXISTS email VARCHAR(255) UNIQUE;

-- Agregamos la columna tipo_doc a la tabla docentes (por si no la tiene)
ALTER TABLE docentes ADD COLUMN IF NOT EXISTS tipo_doc VARCHAR(20);





-- 1. Borramos las tablas viejas (CASCADE borra todo lo que dependa de ellas)
DROP TABLE IF EXISTS notas CASCADE;
DROP TABLE IF EXISTS cursos CASCADE;
DROP TABLE IF EXISTS materias CASCADE;

-- 2. Creamos la tabla Materias (¡Ahora sí con la regla UNIQUE!)
CREATE TABLE materias (
    id_materia SERIAL PRIMARY KEY,
    nombre VARCHAR(100) NOT NULL UNIQUE,
    descripcion TEXT
);

-- 3. Creamos la tabla Cursos
CREATE TABLE cursos (
    id_curso SERIAL PRIMARY KEY,
    nombre VARCHAR(50) NOT NULL UNIQUE,
    nivel VARCHAR(50)
);

-- 4. Creamos la tabla Notas
CREATE TABLE notas (
    id_nota SERIAL PRIMARY KEY,
    id_estudiante INTEGER REFERENCES estudiantes(id_estudiante) ON DELETE CASCADE,
    id_materia INTEGER REFERENCES materias(id_materia) ON DELETE CASCADE,
    id_docente INTEGER REFERENCES docentes(id_docente) ON DELETE SET NULL,
    periodo INTEGER CHECK (periodo BETWEEN 1 AND 4),
    nota_final NUMERIC(3,1) CHECK (nota_final >= 0.0 AND nota_final <= 5.0),
    fecha_registro TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    UNIQUE (id_estudiante, id_materia, periodo)
);

-- 5. Insertamos las Materias (Ya no dará error)
INSERT INTO materias (nombre) VALUES 
('Lengua Castellana'), 
('Matemáticas'), 
('Ciencias Naturales'), 
('Ciencias Sociales');

-- 6. Insertamos el Curso
INSERT INTO cursos (nombre, nivel) VALUES 
('9-1', 'Básica Secundaria');




-- Asumiendo que tu estudiante de prueba tiene id_estudiante = 1
-- y que las materias creadas arriba tomaron los IDs 1, 2, 3 y 4.

-- en id_estudiante pones el ID del estudiante al que quieres asignar las notas

INSERT INTO notas (id_estudiante, id_materia, periodo, nota_final) VALUES 
(1, 1, 1, 4.2), -- Materia 1, Periodo 1, Nota 4.2
(1, 2, 1, 3.8), -- Materia 2, Periodo 1, Nota 3.8
(1, 3, 1, 4.5), -- Materia 3, Periodo 1, Nota 4.5
(1, 4, 1, 3.5); -- Materia 4, Periodo 1, Nota 3.5




-- 1. Creamos la tabla de horarios
CREATE TABLE IF NOT EXISTS horarios (
    id_horario SERIAL PRIMARY KEY,
    grado VARCHAR(20) NOT NULL,
    dia_semana VARCHAR(15) NOT NULL,
    bloque_hora VARCHAR(20) NOT NULL,
    materia VARCHAR(100) NOT NULL
);

-- 2. Insertamos un horario de prueba para el grado 'Noveno'
INSERT INTO horarios (grado, dia_semana, bloque_hora, materia) VALUES
('Noveno', 'Lunes', '07:00 - 08:30', 'Matemáticas'),
('Noveno', 'Lunes', '08:30 - 10:00', 'Ciencias Sociales'),
('Noveno', 'Martes', '07:00 - 08:30', 'Lengua Castellana'),
('Noveno', 'Martes', '08:30 - 10:00', 'Matemáticas'),
('Noveno', 'Miércoles', '07:00 - 08:30', 'Ciencias Naturales'),
('Noveno', 'Miércoles', '08:30 - 10:00', 'Edu. Física'),
('Noveno', 'Jueves', '07:00 - 08:30', 'Inglés'),
('Noveno', 'Jueves', '08:30 - 10:00', 'Lengua Castellana'),
('Noveno', 'Viernes', '07:00 - 08:30', 'Informática'),
('Noveno', 'Viernes', '08:30 - 10:00', 'Ética y Valores');


-- 1. Crear la tabla referenciando a 'users'
CREATE TABLE tareas (
    id_tarea SERIAL PRIMARY KEY,
    id_usuario INTEGER REFERENCES users(id_usuario) ON DELETE CASCADE,
    titulo VARCHAR(255) NOT NULL,
    fecha_entrega DATE NOT NULL,
    color VARCHAR(50) DEFAULT 'green' -- Opciones: 'green', 'yellow', 'red', 'blue'
);

-- 2. Insertar tareas de prueba para el usuario 7 (Mes actual para el calendario)
-- Nota: Usamos + entero en PostgreSQL para sumar días a una fecha (CURRENT_DATE)
INSERT INTO tareas (id_usuario, titulo, fecha_entrega, color) VALUES
(7, 'Entrega Proyecto Final', CURRENT_DATE + 2, 'green'),
(7, 'Examen Final Biología', CURRENT_DATE + 5, 'yellow'),
(7, 'Examen Final Matemáticas', CURRENT_DATE + 8, 'green');


-- 1. Insertar todas las materias (Ignora si ya existen)
INSERT INTO materias (nombre) VALUES 
('Matemáticas'), ('Lengua Castellana'), ('Ciencias Naturales'), ('Ciencias Sociales'),
('Inglés'), ('Educación Física'), ('Informática'), ('Ética y Valores'), ('Artística'),
('Filosofía'), ('Física'), ('Química'), ('Emprendimiento')
ON CONFLICT (nombre) DO NOTHING;

-- 2. Limpiar los horarios viejos para meter los nuevos limpios
TRUNCATE TABLE horarios RESTART IDENTITY;

-- 3. SCRIPT MASIVO DE HORARIOS (De 7:00 AM a 1:00 PM con descanso a las 9:30)

-- ================== SEXTO Y SÉPTIMO (Ciclo Básico) ==================
DO $$
DECLARE 
    grado_actual VARCHAR;
    grados VARCHAR[] := ARRAY['Sexto', 'Séptimo'];
BEGIN
    FOREACH grado_actual IN ARRAY grados LOOP
        -- LUNES
        INSERT INTO horarios (grado, dia_semana, bloque_hora, materia) VALUES (grado_actual, 'Lunes', '07:00 - 07:50', 'Matemáticas'), (grado_actual, 'Lunes', '07:50 - 08:40', 'Matemáticas'), (grado_actual, 'Lunes', '08:40 - 09:30', 'Inglés'), (grado_actual, 'Lunes', '09:30 - 10:00', 'DESCANSO'), (grado_actual, 'Lunes', '10:00 - 11:00', 'Ciencias Naturales'), (grado_actual, 'Lunes', '11:00 - 12:00', 'Ciencias Sociales'), (grado_actual, 'Lunes', '12:00 - 13:00', 'Informática');
        -- MARTES
        INSERT INTO horarios (grado, dia_semana, bloque_hora, materia) VALUES (grado_actual, 'Martes', '07:00 - 07:50', 'Lengua Castellana'), (grado_actual, 'Martes', '07:50 - 08:40', 'Lengua Castellana'), (grado_actual, 'Martes', '08:40 - 09:30', 'Educación Física'), (grado_actual, 'Martes', '09:30 - 10:00', 'DESCANSO'), (grado_actual, 'Martes', '10:00 - 11:00', 'Matemáticas'), (grado_actual, 'Martes', '11:00 - 12:00', 'Artística'), (grado_actual, 'Martes', '12:00 - 13:00', 'Ética y Valores');
        -- MIÉRCOLES
        INSERT INTO horarios (grado, dia_semana, bloque_hora, materia) VALUES (grado_actual, 'Miércoles', '07:00 - 07:50', 'Ciencias Naturales'), (grado_actual, 'Miércoles', '07:50 - 08:40', 'Ciencias Naturales'), (grado_actual, 'Miércoles', '08:40 - 09:30', 'Ciencias Sociales'), (grado_actual, 'Miércoles', '09:30 - 10:00', 'DESCANSO'), (grado_actual, 'Miércoles', '10:00 - 11:00', 'Lengua Castellana'), (grado_actual, 'Miércoles', '11:00 - 12:00', 'Inglés'), (grado_actual, 'Miércoles', '12:00 - 13:00', 'Emprendimiento');
        -- JUEVES
        INSERT INTO horarios (grado, dia_semana, bloque_hora, materia) VALUES (grado_actual, 'Jueves', '07:00 - 07:50', 'Inglés'), (grado_actual, 'Jueves', '07:50 - 08:40', 'Inglés'), (grado_actual, 'Jueves', '08:40 - 09:30', 'Informática'), (grado_actual, 'Jueves', '09:30 - 10:00', 'DESCANSO'), (grado_actual, 'Jueves', '10:00 - 11:00', 'Matemáticas'), (grado_actual, 'Jueves', '11:00 - 12:00', 'Ciencias Naturales'), (grado_actual, 'Jueves', '12:00 - 13:00', 'Lengua Castellana');
        -- VIERNES
        INSERT INTO horarios (grado, dia_semana, bloque_hora, materia) VALUES (grado_actual, 'Viernes', '07:00 - 07:50', 'Ciencias Sociales'), (grado_actual, 'Viernes', '07:50 - 08:40', 'Ciencias Sociales'), (grado_actual, 'Viernes', '08:40 - 09:30', 'Matemáticas'), (grado_actual, 'Viernes', '09:30 - 10:00', 'DESCANSO'), (grado_actual, 'Viernes', '10:00 - 11:00', 'Educación Física'), (grado_actual, 'Viernes', '11:00 - 12:00', 'Ética y Valores'), (grado_actual, 'Viernes', '12:00 - 13:00', 'Artística');
    END LOOP;
END $$;

-- ================== OCTAVO Y NOVENO (Añaden más ciencias exactas) ==================
DO $$
DECLARE 
    grado_actual VARCHAR;
    grados VARCHAR[] := ARRAY['Octavo', 'Noveno'];
BEGIN
    FOREACH grado_actual IN ARRAY grados LOOP
        -- LUNES
        INSERT INTO horarios (grado, dia_semana, bloque_hora, materia) VALUES (grado_actual, 'Lunes', '07:00 - 07:50', 'Ciencias Naturales'), (grado_actual, 'Lunes', '07:50 - 08:40', 'Ciencias Naturales'), (grado_actual, 'Lunes', '08:40 - 09:30', 'Informática'), (grado_actual, 'Lunes', '09:30 - 10:00', 'DESCANSO'), (grado_actual, 'Lunes', '10:00 - 11:00', 'Matemáticas'), (grado_actual, 'Lunes', '11:00 - 12:00', 'Matemáticas'), (grado_actual, 'Lunes', '12:00 - 13:00', 'Inglés');
        -- MARTES
        INSERT INTO horarios (grado, dia_semana, bloque_hora, materia) VALUES (grado_actual, 'Martes', '07:00 - 07:50', 'Matemáticas'), (grado_actual, 'Martes', '07:50 - 08:40', 'Educación Física'), (grado_actual, 'Martes', '08:40 - 09:30', 'Lengua Castellana'), (grado_actual, 'Martes', '09:30 - 10:00', 'DESCANSO'), (grado_actual, 'Martes', '10:00 - 11:00', 'Ciencias Sociales'), (grado_actual, 'Martes', '11:00 - 12:00', 'Ciencias Sociales'), (grado_actual, 'Martes', '12:00 - 13:00', 'Artística');
        -- MIÉRCOLES
        INSERT INTO horarios (grado, dia_semana, bloque_hora, materia) VALUES (grado_actual, 'Miércoles', '07:00 - 07:50', 'Lengua Castellana'), (grado_actual, 'Miércoles', '07:50 - 08:40', 'Lengua Castellana'), (grado_actual, 'Miércoles', '08:40 - 09:30', 'Inglés'), (grado_actual, 'Miércoles', '09:30 - 10:00', 'DESCANSO'), (grado_actual, 'Miércoles', '10:00 - 11:00', 'Ciencias Naturales'), (grado_actual, 'Miércoles', '11:00 - 12:00', 'Ética y Valores'), (grado_actual, 'Miércoles', '12:00 - 13:00', 'Emprendimiento');
        -- JUEVES
        INSERT INTO horarios (grado, dia_semana, bloque_hora, materia) VALUES (grado_actual, 'Jueves', '07:00 - 07:50', 'Inglés'), (grado_actual, 'Jueves', '07:50 - 08:40', 'Inglés'), (grado_actual, 'Jueves', '08:40 - 09:30', 'Ciencias Sociales'), (grado_actual, 'Jueves', '09:30 - 10:00', 'DESCANSO'), (grado_actual, 'Jueves', '10:00 - 11:00', 'Matemáticas'), (grado_actual, 'Jueves', '11:00 - 12:00', 'Informática'), (grado_actual, 'Jueves', '12:00 - 13:00', 'Lengua Castellana');
        -- VIERNES
        INSERT INTO horarios (grado, dia_semana, bloque_hora, materia) VALUES (grado_actual, 'Viernes', '07:00 - 07:50', 'Matemáticas'), (grado_actual, 'Viernes', '07:50 - 08:40', 'Matemáticas'), (grado_actual, 'Viernes', '08:40 - 09:30', 'Educación Física'), (grado_actual, 'Viernes', '09:30 - 10:00', 'DESCANSO'), (grado_actual, 'Viernes', '10:00 - 11:00', 'Lengua Castellana'), (grado_actual, 'Viernes', '11:00 - 12:00', 'Ciencias Naturales'), (grado_actual, 'Viernes', '12:00 - 13:00', 'Ética y Valores');
    END LOOP;
END $$;

-- ================== DÉCIMO Y ONCE (Media Técnica / Filosofía, Física, Química) ==================
DO $$
DECLARE 
    grado_actual VARCHAR;
    grados VARCHAR[] := ARRAY['Décimo', 'Once'];
BEGIN
    FOREACH grado_actual IN ARRAY grados LOOP
        -- LUNES
        INSERT INTO horarios (grado, dia_semana, bloque_hora, materia) VALUES (grado_actual, 'Lunes', '07:00 - 07:50', 'Física'), (grado_actual, 'Lunes', '07:50 - 08:40', 'Física'), (grado_actual, 'Lunes', '08:40 - 09:30', 'Filosofía'), (grado_actual, 'Lunes', '09:30 - 10:00', 'DESCANSO'), (grado_actual, 'Lunes', '10:00 - 11:00', 'Matemáticas'), (grado_actual, 'Lunes', '11:00 - 12:00', 'Matemáticas'), (grado_actual, 'Lunes', '12:00 - 13:00', 'Inglés');
        -- MARTES
        INSERT INTO horarios (grado, dia_semana, bloque_hora, materia) VALUES (grado_actual, 'Martes', '07:00 - 07:50', 'Química'), (grado_actual, 'Martes', '07:50 - 08:40', 'Química'), (grado_actual, 'Martes', '08:40 - 09:30', 'Inglés'), (grado_actual, 'Martes', '09:30 - 10:00', 'DESCANSO'), (grado_actual, 'Martes', '10:00 - 11:00', 'Lengua Castellana'), (grado_actual, 'Martes', '11:00 - 12:00', 'Ciencias Sociales'), (grado_actual, 'Martes', '12:00 - 13:00', 'Educación Física');
        -- MIÉRCOLES
        INSERT INTO horarios (grado, dia_semana, bloque_hora, materia) VALUES (grado_actual, 'Miércoles', '07:00 - 07:50', 'Matemáticas'), (grado_actual, 'Miércoles', '07:50 - 08:40', 'Matemáticas'), (grado_actual, 'Miércoles', '08:40 - 09:30', 'Informática'), (grado_actual, 'Miércoles', '09:30 - 10:00', 'DESCANSO'), (grado_actual, 'Miércoles', '10:00 - 11:00', 'Física'), (grado_actual, 'Miércoles', '11:00 - 12:00', 'Filosofía'), (grado_actual, 'Miércoles', '12:00 - 13:00', 'Emprendimiento');
        -- JUEVES
        INSERT INTO horarios (grado, dia_semana, bloque_hora, materia) VALUES (grado_actual, 'Jueves', '07:00 - 07:50', 'Lengua Castellana'), (grado_actual, 'Jueves', '07:50 - 08:40', 'Lengua Castellana'), (grado_actual, 'Jueves', '08:40 - 09:30', 'Química'), (grado_actual, 'Jueves', '09:30 - 10:00', 'DESCANSO'), (grado_actual, 'Jueves', '10:00 - 11:00', 'Inglés'), (grado_actual, 'Jueves', '11:00 - 12:00', 'Inglés'), (grado_actual, 'Jueves', '12:00 - 13:00', 'Ética y Valores');
        -- VIERNES
        INSERT INTO horarios (grado, dia_semana, bloque_hora, materia) VALUES (grado_actual, 'Viernes', '07:00 - 07:50', 'Ciencias Sociales'), (grado_actual, 'Viernes', '07:50 - 08:40', 'Ciencias Sociales'), (grado_actual, 'Viernes', '08:40 - 09:30', 'Educación Física'), (grado_actual, 'Viernes', '09:30 - 10:00', 'DESCANSO'), (grado_actual, 'Viernes', '10:00 - 11:00', 'Matemáticas'), (grado_actual, 'Viernes', '11:00 - 12:00', 'Informática'), (grado_actual, 'Viernes', '12:00 - 13:00', 'Artística');
    END LOOP;
END $$;


-- Este script toma TODAS las materias que existen y le crea un registro de nota 
-- en el Periodo 1 al estudiante 1 (solo si no la tiene ya registrada).

INSERT INTO notas (id_estudiante, id_materia, periodo, nota_final)
SELECT 1, id_materia, 1, 0.0 -- 0.0 es la nota por defecto hasta que el profesor califique
FROM materias
WHERE id_materia NOT IN (
    SELECT id_materia FROM notas WHERE id_estudiante = 1 AND periodo = 1
);



-- Insertar en la tabla de notas las materias que corresponden al grado Noveno
INSERT INTO notas (id_estudiante, id_materia, periodo, nota_final)
SELECT 1, id_materia, 1, 0.0
FROM materias
WHERE nombre IN (
    'Ciencias Naturales', 
    'Informática', 
    'Matemáticas', 
    'Inglés', 
    'Educación Física', 
    'Lengua Castellana', 
    'Ciencias Sociales', 
    'Artística', 
    'Ética y Valores', 
    'Emprendimiento'
)
-- Esto evita que se dupliquen si ya le habías metido alguna antes
AND id_materia NOT IN (
    SELECT id_materia FROM notas WHERE id_estudiante = 1 AND periodo = 1
);


-- 1. Crear la tabla de historial académico
CREATE TABLE IF NOT EXISTS historial_academico (
    id_historial SERIAL PRIMARY KEY,
    id_estudiante INTEGER REFERENCES estudiantes(id_estudiante),
    grado VARCHAR(50),
    materia VARCHAR(100),
    docente VARCHAR(100),
    nota_p1 NUMERIC(3,1),
    nota_p2 NUMERIC(3,1),
    nota_p3 NUMERIC(3,1),
    nota_p4 NUMERIC(3,1),
    nota_definitiva NUMERIC(3,1),
    anio_lectivo INTEGER
);

-- 2. Insertar datos de prueba dinámicamente para el estudiante actual (el que está en Noveno)
DO $$
DECLARE 
    v_id_estudiante INTEGER;
BEGIN
    -- Obtenemos el ID del estudiante de prueba
    SELECT id_estudiante INTO v_id_estudiante FROM estudiantes LIMIT 1;

    -- Limpiamos por si lo corres dos veces
    DELETE FROM historial_academico WHERE id_estudiante = v_id_estudiante;

    -- Insertamos boletín de OCTAVO (Año 2023)
    INSERT INTO historial_academico (id_estudiante, grado, materia, docente, nota_p1, nota_p2, nota_p3, nota_p4, nota_definitiva, anio_lectivo) VALUES
    (v_id_estudiante, 'Octavo', 'Matemáticas', 'Profesor Prueba', 4.0, 3.8, 4.2, 4.5, 4.1, 2023),
    (v_id_estudiante, 'Octavo', 'Lengua Castellana', 'Ana López', 3.5, 3.6, 4.0, 4.2, 3.8, 2023),
    (v_id_estudiante, 'Octavo', 'Ciencias Naturales', 'Carlos Ruiz', 4.5, 4.3, 4.8, 4.5, 4.5, 2023),
    (v_id_estudiante, 'Octavo', 'Educación Física', 'Mario Yepes', 5.0, 4.8, 5.0, 5.0, 5.0, 2023);

    -- Insertamos boletín de SÉPTIMO (Año 2022)
    INSERT INTO historial_academico (id_estudiante, grado, materia, docente, nota_p1, nota_p2, nota_p3, nota_p4, nota_definitiva, anio_lectivo) VALUES
    (v_id_estudiante, 'Séptimo', 'Matemáticas', 'Profesor Prueba', 3.2, 3.0, 3.5, 3.8, 3.4, 2022),
    (v_id_estudiante, 'Séptimo', 'Lengua Castellana', 'Ana López', 4.0, 4.2, 4.0, 4.5, 4.2, 2022),
    (v_id_estudiante, 'Séptimo', 'Ciencias Naturales', 'Carlos Ruiz', 3.8, 3.5, 4.0, 4.2, 3.9, 2022);
END $$;



DO $$
DECLARE 
    v_id_estudiante INTEGER;
BEGIN
    -- 👇 AHORA SÍ: Buscamos específicamente a tu usuario 7 👇
    SELECT id_estudiante INTO v_id_estudiante FROM estudiantes WHERE id_usuario = 7 LIMIT 1;

    -- Limpiamos por si había basura antes
    DELETE FROM historial_academico WHERE id_estudiante = v_id_estudiante;

    -- Insertamos boletín de OCTAVO (Año 2023)
    INSERT INTO historial_academico (id_estudiante, grado, materia, docente, nota_p1, nota_p2, nota_p3, nota_p4, nota_definitiva, anio_lectivo) VALUES
    (v_id_estudiante, 'Octavo', 'Matemáticas', 'Profesor Prueba', 4.0, 3.8, 4.2, 4.5, 4.1, 2023),
    (v_id_estudiante, 'Octavo', 'Lengua Castellana', 'Ana López', 3.5, 3.6, 4.0, 4.2, 3.8, 2023),
    (v_id_estudiante, 'Octavo', 'Ciencias Naturales', 'Carlos Ruiz', 4.5, 4.3, 4.8, 4.5, 4.5, 2023),
    (v_id_estudiante, 'Octavo', 'Educación Física', 'Mario Yepes', 5.0, 4.8, 5.0, 5.0, 5.0, 2023);

    -- Insertamos boletín de SÉPTIMO (Año 2022)
    INSERT INTO historial_academico (id_estudiante, grado, materia, docente, nota_p1, nota_p2, nota_p3, nota_p4, nota_definitiva, anio_lectivo) VALUES
    (v_id_estudiante, 'Séptimo', 'Matemáticas', 'Profesor Prueba', 3.2, 3.0, 3.5, 3.8, 3.4, 2022),
    (v_id_estudiante, 'Séptimo', 'Lengua Castellana', 'Ana López', 4.0, 4.2, 4.0, 4.5, 4.2, 2022),
    (v_id_estudiante, 'Séptimo', 'Ciencias Naturales', 'Carlos Ruiz', 3.8, 3.5, 4.0, 4.2, 3.9, 2022);
END $$;




--Ultimos cambios para el usuario de docente

-- 1. Crear tabla puente para la Asignación Académica (Qué dicta cada profe)
CREATE TABLE public.asignacion_academica (
    id_asignacion SERIAL PRIMARY KEY,
    id_docente INTEGER NOT NULL REFERENCES public.docentes(id_docente) ON DELETE CASCADE,
    id_materia INTEGER NOT NULL REFERENCES public.materias(id_materia) ON DELETE CASCADE,
    grado VARCHAR(20) NOT NULL,
    grupo VARCHAR(10),
    anio_lectivo VARCHAR(10) DEFAULT '2026'
);

-- 2. Modificar la tabla 'tareas' para soportar tareas globales de profesores
ALTER TABLE public.tareas
ADD COLUMN id_materia INTEGER REFERENCES public.materias(id_materia) ON DELETE CASCADE,
ADD COLUMN grado VARCHAR(20);

-- 3. INSERTAR DATOS DE PRUEBA (Para poder testear de inmediato)
-- Le asignamos al "Profesor Prueba" (id_docente 1) la materia "Matemáticas" (id_materia 2) en grado "Noveno"
INSERT INTO public.asignacion_academica (id_docente, id_materia, grado, grupo, anio_lectivo)
VALUES (1, 2, 'Noveno', NULL, '2026');

-- Tomamos la tarea de prueba que tenías llamada "Examen Final de Matemáticas" (id_tarea 6)
-- y la convertimos en una tarea global del docente para todo el grado Noveno.
UPDATE public.tareas 
SET id_usuario = 2, -- id del usuario 'docente1'
    id_materia = 2, 
    grado = 'Noveno' 
WHERE id_tarea = 6;
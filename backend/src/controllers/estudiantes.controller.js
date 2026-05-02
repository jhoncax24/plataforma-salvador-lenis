import { pool } from "../config/db.js";

export const getPerfilEstudiante = async (req, res, next) => {
  const { idUsuario } = req.params;

  try {
    // 👇 Añadimos u.foto_perfil y el LEFT JOIN a la tabla users
    const query = `
      SELECT 
        e.nombre_completo AS nombre,
        e.documento,
        e.fecha_nacimiento,
        e.grado,
        a.nombre_completo AS acudiente,
        u.foto_perfil 
      FROM estudiantes e
      LEFT JOIN acudientes a ON e.id_acudiente = a.id_acudiente
      LEFT JOIN users u ON e.id_usuario = u.id_usuario
      WHERE e.id_usuario = $1
    `;
    
    const { rows } = await pool.query(query, [idUsuario]);

    if (rows.length === 0) {
      return res.status(404).json({ message: "Perfil de estudiante no encontrado" });
    }

    const estudiante = rows[0];

    // Calcular la edad real si tiene fecha de nacimiento
    let edad = "No registrada";
    if (estudiante.fecha_nacimiento) {
      const birthDate = new Date(estudiante.fecha_nacimiento);
      const today = new Date();
      let age = today.getFullYear() - birthDate.getFullYear();
      const m = today.getMonth() - birthDate.getMonth();
      if (m < 0 || (m === 0 && today.getDate() < birthDate.getDate())) {
        age--;
      }
      edad = age;
    }

    res.json({
      ...estudiante,
      edad: edad
    });

  } catch (error) {
    next(error);
  }
};

// Obtener las notas de un estudiante específico
export const getNotasEstudiante = async (req, res, next) => {
  const { idUsuario } = req.params;
  try {
    const { rows } = await pool.query(
      `SELECT 
          m.nombre AS materia,
          COALESCE(MAX(d.nombre_completo), 'Sin asignar') AS docente,
          MAX(CASE WHEN n.periodo = 1 THEN n.nota_final ELSE 0 END) AS p1,
          MAX(CASE WHEN n.periodo = 2 THEN n.nota_final ELSE 0 END) AS p2,
          MAX(CASE WHEN n.periodo = 3 THEN n.nota_final ELSE 0 END) AS p3,
          MAX(CASE WHEN n.periodo = 4 THEN n.nota_final ELSE 0 END) AS p4,
          ROUND(
              (
                  MAX(CASE WHEN n.periodo = 1 THEN n.nota_final ELSE 0 END) +
                  MAX(CASE WHEN n.periodo = 2 THEN n.nota_final ELSE 0 END) +
                  MAX(CASE WHEN n.periodo = 3 THEN n.nota_final ELSE 0 END) +
                  MAX(CASE WHEN n.periodo = 4 THEN n.nota_final ELSE 0 END)
              ) / 4.0, 1
          ) AS definitiva
       FROM materias m
       JOIN notas n ON m.id_materia = n.id_materia
       JOIN estudiantes e ON n.id_estudiante = e.id_estudiante
       LEFT JOIN docentes d ON n.id_docente = d.id_docente
       WHERE e.id_usuario = $1
       GROUP BY m.nombre
       ORDER BY m.nombre`,
      [idUsuario]
    );
    res.json(rows);
  } catch (error) {
    console.error("Error obteniendo notas:", error);
    next(error);
  }
};

  export const getHorarioEstudiante = async (req, res, next) => {
  const { idUsuario } = req.params;
  try {
    // 1. Saber en qué grado está el estudiante
    const userQuery = await pool.query('SELECT grado FROM estudiantes WHERE id_usuario = $1', [idUsuario]);
    if (userQuery.rows.length === 0) return res.status(404).json({ message: "Estudiante no encontrado" });

    const grado = userQuery.rows[0].grado;
    if (!grado) return res.json([]); // Si no tiene grado, no hay horario

    // 2. Buscar el horario para ese grado específico
   // 2. Buscar el horario ignorando mayúsculas/minúsculas y espacios
    const { rows } = await pool.query(
      `SELECT dia_semana, bloque_hora, materia 
       FROM horarios 
       WHERE TRIM(grado) ILIKE TRIM($1) 
       ORDER BY bloque_hora ASC`, 
      [grado]
    );
    res.json(rows);
  } catch (error) { next(error); }
};

// Obtener las tareas del estudiante
export const getTareasEstudiante = async (req, res, next) => {
  const { idUsuario } = req.params;
  try {
    const { rows } = await pool.query(
      // 👇 MIRA AQUÍ: Agregamos "tipo" al final de la lista de columnas
      `SELECT id_tarea, titulo, descripcion, TO_CHAR(fecha_entrega, 'YYYY-MM-DD') as fecha_entrega, color, tipo 
       FROM tareas 
       WHERE id_usuario = $1
       ORDER BY fecha_entrega ASC`,
      [idUsuario]
    );
    res.json(rows);
  } catch (error) {
    console.error("Error obteniendo tareas:", error);
    next(error);
  }
};

// Guardar un nuevo recordatorio (Ajustado a tu tabla real)
export const crearTareaEstudiante = async (req, res, next) => {
  const { idUsuario } = req.params;
  // Recibimos también el color desde React
  const { titulo, descripcion, fecha_entrega, color } = req.body; 
  
  try {
    // Insertamos directamente con tu id_usuario y el color
    const { rows } = await pool.query(
      `INSERT INTO tareas (id_usuario, titulo, descripcion, fecha_entrega, color) 
       VALUES ($1, $2, $3, $4, $5) RETURNING *`,
      [idUsuario, titulo, descripcion, fecha_entrega, color || 'blue']
    );
    
    res.json(rows[0]);
  } catch (error) {
    console.error("Error guardando tarea:", error);
    next(error);
  }
};

export const getHistorialAcademico = async (req, res, next) => {
  const { idUsuario } = req.params;
  try {
    const { rows } = await pool.query(
      `SELECT h.grado, h.materia, h.docente, h.nota_p1 AS p1, h.nota_p2 AS p2, 
              h.nota_p3 AS p3, h.nota_p4 AS p4, h.nota_definitiva AS definitiva, h.anio_lectivo
       FROM historial_academico h
       JOIN estudiantes e ON h.id_estudiante = e.id_estudiante
       WHERE e.id_usuario = $1
       ORDER BY h.anio_lectivo DESC, h.materia ASC`,
      [idUsuario]
    );
    res.json(rows);
  } catch (error) {
    console.error("Error obteniendo historial académico:", error);
    next(error);
  }
};

// Editar un recordatorio existente
export const actualizarTareaEstudiante = async (req, res, next) => {
  const { idTarea } = req.params;
  const { titulo, descripcion, fecha_entrega, color } = req.body;
  
  try {
    // El candado de seguridad: Solo actualiza si el tipo es 'Recordatorio'
    const { rows } = await pool.query(
      `UPDATE tareas 
       SET titulo = $1, descripcion = $2, fecha_entrega = $3, color = $4 
       WHERE id_tarea = $5 AND tipo = 'Recordatorio' 
       RETURNING *`,
      [titulo, descripcion, fecha_entrega, color, idTarea]
    );
    
    if (rows.length === 0) {
      return res.status(403).json({ message: "No se puede editar esta tarea o no existe." });
    }
    
    res.json(rows[0]);
  } catch (error) {
    console.error("Error actualizando tarea:", error);
    next(error);
  }
};

// Obtener el total de faltas/retrasos del estudiante
export const getFaltasEstudiante = async (req, res, next) => {
  const { idUsuario } = req.params;
  try {
    const { rows } = await pool.query(
      `SELECT COUNT(*) AS total_faltas
       FROM asistencias
       WHERE id_estudiante = (SELECT id_estudiante FROM estudiantes WHERE id_usuario = $1)
       AND estado IN ('Ausente', 'Retraso')`,
      [idUsuario]
    );
    
    // PostgreSQL devuelve el COUNT como string, lo pasamos a entero
    const total = parseInt(rows[0].total_faltas, 10);
    res.json({ totalFaltas: total });
  } catch (error) {
    console.error("Error obteniendo faltas:", error);
    next(error);
  }
};
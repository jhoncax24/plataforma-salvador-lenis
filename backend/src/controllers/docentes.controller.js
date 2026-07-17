import { pool } from "../config/db.js";

// ==========================================
// 1. OBTENER MATERIAS Y CURSOS (Filtrados por Docente)
// ==========================================
export const getAsignacionesDocente = async (req, res, next) => {
  const { idUsuario } = req.params;

  try {
    // 1. Las materias quedan exactamente igual
    const materiasQuery = await pool.query(`
      SELECT DISTINCT m.id_materia, m.nombre 
      FROM materias m
      JOIN asignacion_academica aa ON m.id_materia = aa.id_materia
      JOIN docentes d ON aa.id_docente = d.id_docente
      WHERE d.id_usuario = $1
      ORDER BY m.nombre ASC
    `, [idUsuario]);
    
    // 2. 👇 AQUÍ ESTÁ LA MAGIA: Agregamos aa.id_materia a la selección
    const cursosQuery = await pool.query(`
      SELECT DISTINCT c.id_curso, c.nombre, c.nivel, aa.id_materia 
      FROM cursos c
      JOIN asignacion_academica aa ON c.id_curso = aa.id_curso
      JOIN docentes d ON aa.id_docente = d.id_docente
      WHERE d.id_usuario = $1
      ORDER BY c.nombre ASC
    `, [idUsuario]);
    
    res.json({
      materias: materiasQuery.rows,
      cursos: cursosQuery.rows
    });
  } catch (error) {
    console.error("Error al obtener asignaciones filtradas:", error);
    next(error);
  }
};

// ==========================================
// 2. CREAR RECORDATORIO PERSONAL DEL DOCENTE
// ==========================================
export const crearTareaDocente = async (req, res, next) => {
  const { idUsuario } = req.params;
  // Solo extraemos los datos básicos del recordatorio
  const { titulo, descripcion, fecha_entrega, color } = req.body;
  
  try {
    const query = `
      INSERT INTO tareas (
        id_usuario, titulo, descripcion, fecha_entrega, color, tipo, id_materia, id_curso
      ) 
      VALUES ($1, $2, $3, $4, $5, 'Recordatorio', NULL, NULL) 
      RETURNING *
    `;
    
    const valores = [
      idUsuario, 
      titulo, 
      descripcion || null, 
      fecha_entrega, 
      color || 'blue'
    ];

    const { rows } = await pool.query(query, valores);
    res.json(rows[0]);
  } catch (error) {
    console.error("Error guardando recordatorio del docente:", error);
    next(error);
  }
};

// ==========================================
// 3. OBTENER TAREAS DEL DOCENTE (Personales y de Cursos)
// ==========================================
export const getTareasDocente = async (req, res, next) => {
  const { idUsuario } = req.params;
  
  try {
    // Usamos LEFT JOIN para que las tareas que no tienen curso (Recordatorios)
    // también sean incluidas en el resultado final.
    const query = `
      SELECT 
        t.id_tarea, 
        t.titulo, 
        t.descripcion, 
        TO_CHAR(t.fecha_entrega, 'YYYY-MM-DD') AS fecha_entrega, 
        t.color, 
        t.tipo,
        c.nombre AS grado,
        m.nombre AS nombre_materia
      FROM tareas t
      LEFT JOIN cursos c ON t.id_curso = c.id_curso
      LEFT JOIN materias m ON t.id_materia = m.id_materia
      WHERE t.id_usuario = $1
      ORDER BY t.fecha_entrega ASC
    `;
    
    const { rows } = await pool.query(query, [idUsuario]);
    
    // Enviamos la lista de tareas corregida al frontend
    res.json(rows);
    
  } catch (error) {
    console.error("Error obteniendo tareas del docente:", error);
    next(error);
  }
};

// ==========================================
// 4. OBTENER PLANILLA (Actividades y Estudiantes - Actualizado para PDFs)
// ==========================================
export const getPlanillaNotas = async (req, res, next) => {
  const { idCurso, idMateria, periodo } = req.query;

  try {
    // 1. Traer las actividades incluyendo el nuevo campo "requiere_pdf"
    const actQuery = await pool.query(
      `SELECT id_actividad, titulo, porcentaje, requiere_pdf 
       FROM actividades 
       WHERE id_curso = $1 AND id_materia = $2 AND periodo = $3 
       ORDER BY fecha_creacion ASC`,
      [idCurso, idMateria, periodo]
    );
    const actividades = actQuery.rows;

    // 2. Traer los estudiantes matriculados
    const estQuery = await pool.query(
      `SELECT DISTINCT e.id_estudiante, e.nombre_completo 
       FROM estudiantes e 
       JOIN matriculas m ON e.id_estudiante = m.id_estudiante 
       WHERE m.id_curso = $1 AND m.estado = 'Activa' 
       ORDER BY e.nombre_completo ASC`,
      [idCurso]
    );
    const estudiantes = estQuery.rows;

    // 3. Traer las notas, los PDFs y la retroalimentación
    const notasQuery = await pool.query(
      `SELECT na.id_estudiante, na.id_actividad, na.nota, na.archivo_pdf, na.fecha_entrega, na.retroalimentacion 
       FROM notas_actividades na 
       JOIN actividades a ON na.id_actividad = a.id_actividad 
       WHERE a.id_curso = $1 AND a.id_materia = $2 AND a.periodo = $3`,
      [idCurso, idMateria, periodo]
    );
    
    // 4. Armar el objeto para React. Ahora guardamos un objeto con todos los datos, no solo el número.
    const planilla = estudiantes.map(est => {
      const notasDelEstudiante = {};
      notasQuery.rows.forEach(n => {
        if (n.id_estudiante === est.id_estudiante) {
          notasDelEstudiante[n.id_actividad] = {
            nota: n.nota !== null ? parseFloat(n.nota) : null,
            archivoPdf: n.archivo_pdf,
            fechaEntrega: n.fecha_entrega,
            retroalimentacion: n.retroalimentacion
          };
        }
      });
      return { ...est, notas: notasDelEstudiante };
    });

    res.json({ actividades, planilla });
  } catch (error) {
    next(error);
  }
};

// ==========================================
// 5. CREAR ACTIVIDAD Y SINCRONIZAR CON TAREAS
// ==========================================
export const crearActividad = async (req, res, next) => {
  const { idUsuario } = req.params;
  const { id_curso, id_materia, periodo, titulo, porcentaje, requiere_pdf, fecha_entrega } = req.body;

  try {
    // Iniciamos la transacción para asegurar que ambos inserts ocurran al mismo tiempo
    await pool.query('BEGIN');

    // 1. Insertamos en la tabla actividades
    const queryActividad = `
      INSERT INTO actividades (id_curso, id_materia, id_docente, periodo, titulo, porcentaje, requiere_pdf, fecha_entrega) 
      VALUES ($1, $2, $3, $4, $5, $6, $7, $8) 
      RETURNING *
    `;
    const requierePdfValidado = requiere_pdf === true;
    const { rows: rowsActividad } = await pool.query(queryActividad, [
      id_curso, id_materia, idUsuario, periodo, titulo, porcentaje, requierePdfValidado, fecha_entrega
    ]);

    // Capturamos el ID de la actividad recién creada
    const idActividadCreada = rowsActividad[0].id_actividad;

    // 2. Insertamos en la tabla tareas para el calendario del estudiante
    const queryTarea = `
      INSERT INTO tareas (id_usuario, titulo, descripcion, fecha_entrega, color, tipo, id_materia, id_curso, id_actividad) 
      VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9)
    `;
    
    const descripcionAutomatica = requierePdfValidado 
      ? "Esta actividad requiere que subas un archivo (PDF) a través de la plataforma." 
      : "Actividad evaluativa registrada por el docente en la planilla.";

    await pool.query(queryTarea, [
      idUsuario, // El autor es el docente
      titulo, 
      descripcionAutomatica, 
      fecha_entrega, 
      'blue', // Color por defecto
      'Tarea Docente', // Tipo que lee el estudiante
      id_materia, 
      id_curso,
      idActividadCreada // Relación directa con la actividad
    ]);

    // Confirmamos la transacción
    await pool.query('COMMIT');
    res.json(rowsActividad[0]);

  } catch (error) {
    // Si algo falla, deshacemos ambos inserts
    await pool.query('ROLLBACK');
    console.error("Error al crear actividad y sincronizar tarea:", error);
    next(error);
  }
};

// ==========================================
// 6. GUARDAR NOTAS Y RETROALIMENTACIÓN (Masivo o Individual)
// ==========================================
export const guardarNotasActividades = async (req, res, next) => {
  const { notasArray } = req.body; 
  // Ahora espera: [{ id_actividad: 1, id_estudiante: 10, nota: 4.5, retroalimentacion: "Buen análisis" }, ...]

  try {
    await pool.query('BEGIN');
    
    const query = `
      INSERT INTO notas_actividades (id_actividad, id_estudiante, nota, retroalimentacion)
      VALUES ($1, $2, $3, $4)
      ON CONFLICT (id_actividad, id_estudiante) 
      DO UPDATE SET 
        nota = EXCLUDED.nota,
        retroalimentacion = COALESCE(EXCLUDED.retroalimentacion, notas_actividades.retroalimentacion);
    `;
    
    for (let item of notasArray) {
      // Convertimos los strings vacíos a null para limpiar la base de datos
      const notaValida = (item.nota !== null && item.nota !== "") ? parseFloat(item.nota) : null;
      const retroValida = (item.retroalimentacion && item.retroalimentacion.trim() !== "") ? item.retroalimentacion : null;

      // Solo insertamos si al menos hay una nota o una retroalimentación que guardar
      if (notaValida !== null || retroValida !== null) {
        await pool.query(query, [item.id_actividad, item.id_estudiante, notaValida, retroValida]);
      }
    }
    
    await pool.query('COMMIT');
    res.json({ message: "Notas y comentarios guardados con éxito" });
  } catch (error) {
    await pool.query('ROLLBACK');
    next(error);
  }
};

// ==========================================
// 7. OBTENER RESUMEN DE CURSOS DEL DOCENTE (VERSIÓN CORREGIDA)
// ==========================================
export const getResumenCursosDocente = async (req, res, next) => {
  const { idUsuario } = req.params;
  
  try {
    const query = `
      SELECT 
        c.nombre AS curso_nombre,
        c.nivel,
        m.nombre AS materia_nombre,
        -- 👉 EL TRUCO ESTÁ AQUÍ: COUNT(DISTINCT ...)
        COUNT(DISTINCT mat.id_estudiante) AS total_estudiantes
      FROM asignacion_academica aa
      JOIN docentes d ON aa.id_docente = d.id_docente
      JOIN cursos c ON aa.id_curso = c.id_curso
      JOIN materias m ON aa.id_materia = m.id_materia
      LEFT JOIN matriculas mat ON c.id_curso = mat.id_curso AND mat.estado = 'Activa'
      WHERE d.id_usuario = $1
      GROUP BY c.id_curso, m.id_materia, c.nombre, c.nivel, m.nombre
      ORDER BY c.nombre ASC;
    `;
    
    const { rows } = await pool.query(query, [idUsuario]);
    res.json(rows);
  } catch (error) {
    console.error("Error al obtener resumen de cursos:", error);
    next(error);
  }
};

// ==========================================
// 8. OBTENER ESTUDIANTES DE UN CURSO ESPECÍFICO (Para el Observador/Asistencia)
// ==========================================
export const getEstudiantesPorCurso = async (req, res, next) => {
  const { idCurso } = req.params;
  try {
    const query = `
      SELECT DISTINCT e.id_estudiante, e.nombre_completo, e.documento
      FROM estudiantes e
      JOIN matriculas m ON e.id_estudiante = m.id_estudiante
      WHERE m.id_curso = $1 AND m.estado = 'Activa'
      ORDER BY e.nombre_completo ASC
    `;
    const { rows } = await pool.query(query, [idCurso]);
    res.json(rows);
  } catch (error) {
    next(error);
  }
};

// ==========================================
// 9. GESTIÓN DEL OBSERVADOR (Leer y Crear) - VERSIÓN CORREGIDA
// ==========================================
export const getObservacionesEstudiante = async (req, res, next) => {
  const { idEstudiante } = req.params;
  try {
    // Hacemos JOIN con docentes y users. Usamos username para evitar el error de columna inexistente.
    const query = `
      SELECT 
        o.*, 
        u.username AS nombre_docente, 
        TO_CHAR(o.fecha, 'YYYY-MM-DD HH24:MI') as fecha_formato
      FROM observaciones o
      JOIN docentes d ON o.id_docente = d.id_docente
      JOIN users u ON d.id_usuario = u.id_usuario
      WHERE o.id_estudiante = $1
      ORDER BY o.fecha DESC
    `;
    const { rows } = await pool.query(query, [idEstudiante]);
    res.json(rows);
  } catch (error) {
    console.error("Error al obtener observaciones:", error);
    next(error);
  }
};

export const crearObservacion = async (req, res, next) => {
  const { idUsuario } = req.params; // ID de usuario (Ej: 7)
  const { id_estudiante, id_curso, descripcion, tipo } = req.body;
  
  try {
    // Usamos una subconsulta para convertir el id_usuario en id_docente automáticamente
    const query = `
      INSERT INTO observaciones (id_estudiante, id_docente, id_curso, descripcion, tipo, fecha)
      VALUES (
        $1, 
        (SELECT id_docente FROM docentes WHERE id_usuario = $2), 
        $3, 
        $4, 
        $5, 
        CURRENT_TIMESTAMP
      )
      RETURNING *
    `;
    const valores = [id_estudiante, idUsuario, id_curso, descripcion, tipo];
    const { rows } = await pool.query(query, valores);
    res.json(rows[0]);
  } catch (error) {
    console.error("Error al crear observación:", error);
    next(error);
  }
};

// ==========================================
// 10. GESTIÓN DE ASISTENCIA
// ==========================================
export const guardarAsistenciaMasiva = async (req, res, next) => {
  const { idUsuario } = req.params; 
  // 👈 NUEVO: Recibimos id_materia
  const { id_curso, id_materia, fecha, asistenciasArray } = req.body; 

  try {
    await pool.query('BEGIN');

    const query = `
      INSERT INTO asistencias (id_estudiante, id_curso, id_materia, id_docente, fecha, estado)
      VALUES (
        $1, $2, $3, 
        (SELECT id_docente FROM docentes WHERE id_usuario = $4), 
        $5, $6
      )
      ON CONFLICT (id_estudiante, id_curso, id_materia, fecha) 
      DO UPDATE SET estado = EXCLUDED.estado;
    `;

    for (let alumno of asistenciasArray) {
      await pool.query(query, [alumno.id_estudiante, id_curso, id_materia, idUsuario, fecha, alumno.estado]);
    }

    await pool.query('COMMIT'); 
    res.json({ message: "Asistencia guardada correctamente" });
  } catch (error) {
    await pool.query('ROLLBACK'); 
    console.error("Error guardando asistencia:", error);
    next(error);
  }
};

// ==========================================
// 11. OBTENER ASISTENCIA GUARDADA
// ==========================================
export const getAsistenciaGuardada = async (req, res, next) => {
  const { idCurso, idMateria, fecha } = req.query; // 👈 NUEVO: idMateria
  try {
    const query = `
      SELECT id_estudiante, estado 
      FROM asistencias 
      WHERE id_curso = $1 AND id_materia = $2 AND fecha = $3
    `;
    const { rows } = await pool.query(query, [idCurso, idMateria, fecha]);
    res.json(rows);
  } catch (error) {
    console.error("Error al obtener asistencia:", error);
    next(error);
  }
};

// ==========================================
// 12. OBTENER RESUMEN ACUMULADO DE ASISTENCIA
// ==========================================
export const getResumenAsistenciaCurso = async (req, res, next) => {
  const { idCurso, idMateria } = req.params; // 👈 NUEVO: idMateria en params
  try {
    const query = `
      SELECT 
        e.id_estudiante, 
        e.nombre_completo,
        COUNT(CASE WHEN a.estado = 'Presente' THEN 1 END) as total_presentes,
        COUNT(CASE WHEN a.estado = 'Ausente' THEN 1 END) as total_ausencias,
        COUNT(CASE WHEN a.estado = 'Llegada Tarde' THEN 1 END) as total_retardos,
        COUNT(CASE WHEN a.estado = 'Excusa' THEN 1 END) as total_excusas
      FROM estudiantes e
      JOIN matriculas m ON e.id_estudiante = m.id_estudiante
      LEFT JOIN asistencias a ON e.id_estudiante = a.id_estudiante AND a.id_curso = m.id_curso AND a.id_materia = $2
      WHERE m.id_curso = $1 AND m.estado = 'Activa'
      GROUP BY e.id_estudiante, e.nombre_completo
      ORDER BY e.nombre_completo ASC
    `;
    const { rows } = await pool.query(query, [idCurso, idMateria]);
    res.json(rows);
  } catch (error) {
    console.error("Error al obtener resumen de asistencia:", error);
    next(error);
  }
};

// ==========================================
// EDITAR TAREA O RECORDATORIO DEL DOCENTE
// ==========================================
export const actualizarTareaDocente = async (req, res, next) => {
  const { idTarea } = req.params;
  const { titulo, descripcion, fecha_entrega, color, id_materia, id_curso } = req.body;
  
  try {
    // Verificamos si al editar, la dejó personal o la asignó a un curso
    const tipoTarea = id_curso ? 'Tarea Docente' : 'Recordatorio';
    const cursoDB = id_curso ? id_curso : null;
    const materiaDB = id_materia ? id_materia : null;

    const query = `
      UPDATE tareas 
      SET 
        titulo = $1, 
        descripcion = $2, 
        fecha_entrega = $3, 
        color = $4, 
        tipo = $5, 
        id_materia = $6, 
        id_curso = $7
      WHERE id_tarea = $8
      RETURNING *
    `;
    
    const valores = [
      titulo, 
      descripcion || null, 
      fecha_entrega, 
      color || 'blue', 
      tipoTarea, 
      materiaDB, 
      cursoDB, 
      idTarea
    ];

    const { rows } = await pool.query(query, valores);
    
    if (rows.length === 0) {
      return res.status(404).json({ message: "No se encontró la tarea para editar." });
    }

    res.json(rows[0]);
  } catch (error) {
    console.error("Error actualizando tarea de docente:", error);
    next(error);
  }
};
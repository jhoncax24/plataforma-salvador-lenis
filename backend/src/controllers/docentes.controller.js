import { pool } from "../config/db.js";
import { enviarCorreoNuevaActividad, enviarCorreoCalificacion } from '../services/mailer.service.js';
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
      `SELECT id_actividad, titulo, porcentaje, requiere_pdf, fecha_entrega
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
    
    // 3.5 Obtener el docente asignado a esta materia/curso
    const docenteQuery = await pool.query(
      `SELECT d.nombre_completo AS docente 
       FROM asignacion_academica aa 
       JOIN docentes d ON aa.id_docente = d.id_docente 
       WHERE aa.id_curso = $1 AND aa.id_materia = $2 AND aa.anio_lectivo = '2026' 
       LIMIT 1`,
      [idCurso, idMateria]
    );
    const nombreDocente = docenteQuery.rows[0]?.docente || "No asignado";

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

    res.json({ actividades, planilla, nombreDocente });
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
    // Iniciamos la transacción principal
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
      idUsuario, titulo, descripcionAutomatica, fecha_entrega, 'blue', 'Tarea Docente', id_materia, id_curso, idActividadCreada
    ]);

    // Confirmamos la transacción y respondemos rápidamente al frontend
    await pool.query('COMMIT');
    res.json(rowsActividad[0]);

    // ==========================================
    // 3. ENVÍO DE CORREOS EN SEGUNDO PLANO
    // ==========================================
    try {
        // A. Obtenemos los correos de estudiantes activos y sus acudientes
        const queryCorreos = `
            SELECT 
                ue.email AS email_estudiante,
                ua.email AS email_acudiente
            FROM estudiantes e
            JOIN matriculas m ON e.id_estudiante = m.id_estudiante AND m.estado = 'Activa'
            LEFT JOIN users ue ON e.id_usuario = ue.id_usuario
            LEFT JOIN acudientes a ON e.id_acudiente = a.id_acudiente
            LEFT JOIN users ua ON a.id_usuario = ua.id_usuario
            WHERE m.id_curso = $1
        `;
        const { rows: rowsCorreos } = await pool.query(queryCorreos, [id_curso]);

        // B. Obtenemos nombre de materia y docente para la tarjeta del correo
        const queryContexto = `
            SELECT m.nombre AS nombre_materia, d.nombre_completo AS nombre_docente
            FROM materias m, docentes d
            WHERE m.id_materia = $1 AND d.id_usuario = $2
        `;
        const { rows: rowsContexto } = await pool.query(queryContexto, [id_materia, idUsuario]);

        // C. Preparamos y enviamos los correos si hay datos válidos
        if (rowsContexto.length > 0 && rowsCorreos.length > 0) {
            // Usamos Set para evitar enviar correos duplicados
            const listaCorreos = new Set();
            
            rowsCorreos.forEach(row => {
                if (row.email_estudiante) listaCorreos.add(row.email_estudiante);
                if (row.email_acudiente) listaCorreos.add(row.email_acudiente);
            });

            const correosDestino = Array.from(listaCorreos);

            if (correosDestino.length > 0) {
                const datosActividad = {
                    docente: rowsContexto[0].nombre_docente,
                    materia: rowsContexto[0].nombre_materia,
                    titulo: titulo,
                    fecha_entrega: fecha_entrega,
                    requiere_pdf: requierePdfValidado
                };

                // Llamamos a la función de enviar correo (se ejecuta sin pausar el código)
                enviarCorreoNuevaActividad(correosDestino, datosActividad);
            }
        }
    } catch (mailError) {
        // Capturamos cualquier error del correo de forma aislada para que no afecte la creación de la actividad
        console.error("Error al recopilar y enviar correos masivos:", mailError);
    }

  } catch (error) {
    await pool.query('ROLLBACK');
    console.error("Error al crear actividad y sincronizar tarea:", error);
    next(error);
  }
};

// ==========================================
// 6. GUARDAR NOTAS Y NOTIFICAR SOLO PRIMERA CALIFICACIÓN
// ==========================================
export const guardarNotasActividades = async (req, res, next) => {
  const { notasArray } = req.body; 

  try {
    // ---------------------------------------------------------
    // PASO 1: Identificar previamente qué actividades NO tenían nota
    // ---------------------------------------------------------
    // Filtramos las notas que vienen del frontend con un valor numérico válido
    const notasConValor = notasArray.filter(item => 
      item.nota !== null && item.nota !== undefined && item.nota !== ""
    );

    // Lista para almacenar únicamente las combinaciones (estudiante + actividad) que son NUEVAS
    const nuevasCalificaciones = [];

    if (notasConValor.length > 0) {
      // Consultamos el estado actual en la base de datos antes de sobrescribir
      const checkQuery = `
        SELECT id_actividad, id_estudiante, nota 
        FROM notas_actividades 
        WHERE (id_actividad, id_estudiante) IN (
          ${notasConValor.map((_, i) => `($${i * 2 + 1}, $${i * 2 + 2})`).join(', ')}
        )
      `;
      
      const paramsCheck = notasConValor.flatMap(n => [parseInt(n.id_actividad, 10), parseInt(n.id_estudiante, 10)]);
      const { rows: notasExistentes } = await pool.query(checkQuery, paramsCheck);

      // Verificamos cuáles de las notas enviadas no existían o tenían valor NULL previamente
      notasConValor.forEach(itemEnviado => {
        const idAct = parseInt(itemEnviado.id_actividad, 10);
        const idEst = parseInt(itemEnviado.id_estudiante, 10);

        const registroPrevio = notasExistentes.find(
          r => r.id_actividad === idAct && r.id_estudiante === idEst
        );

        // Si no existía registro o la nota previa era NULL, se considera PRIMERA CALIFICACIÓN
        if (!registroPrevio || registroPrevio.nota === null) {
          nuevasCalificaciones.push({ id_actividad: idAct, id_estudiante: idEst });
        }
      });
    }

    // ---------------------------------------------------------
    // PASO 2: Guardar o actualizar las notas en la Base de Datos
    // ---------------------------------------------------------
    await pool.query('BEGIN');
    
    const insertQuery = `
      INSERT INTO notas_actividades (id_actividad, id_estudiante, nota, retroalimentacion)
      VALUES ($1, $2, $3, $4)
      ON CONFLICT (id_actividad, id_estudiante) 
      DO UPDATE SET 
        nota = EXCLUDED.nota,
        retroalimentacion = COALESCE(EXCLUDED.retroalimentacion, notas_actividades.retroalimentacion);
    `;
    
    for (let item of notasArray) {
      const notaValida = (item.nota !== null && item.nota !== undefined && item.nota !== "") ? parseFloat(item.nota) : null;
      const retroValida = (item.retroalimentacion && item.retroalimentacion.trim() !== "") ? item.retroalimentacion : null;

      if (notaValida !== null || retroValida !== null) {
        await pool.query(insertQuery, [item.id_actividad, item.id_estudiante, notaValida, retroValida]);
      }
    }
    
    await pool.query('COMMIT');
    // Respondemos rápidamente al cliente HTTP
    res.json({ message: "Notas y comentarios guardados con éxito" });

    // ---------------------------------------------------------
    // PASO 3: Notificar por correo SOLO a las primeras calificaciones
    // ---------------------------------------------------------
    try {
      console.log(`📊 [NOTIFICACIÓN] Calificaciones nuevas/primeras detectadas: ${nuevasCalificaciones.length}`);

      if (nuevasCalificaciones.length > 0) {
        // Agrupamos los estudiantes por actividad
        const actividadesMap = {};
        nuevasCalificaciones.forEach(n => {
          if (!actividadesMap[n.id_actividad]) {
            actividadesMap[n.id_actividad] = [];
          }
          actividadesMap[n.id_actividad].push(n.id_estudiante);
        });

        // Enviamos correos únicamente para cada actividad con nuevas calificaciones
        for (const [idActividadStr, estudiantesIDs] of Object.entries(actividadesMap)) {
          const idActividad = parseInt(idActividadStr, 10);

          // Obtener nombre de la actividad, materia y docente
          const actQuery = `
            SELECT 
              a.titulo AS actividad_nombre, 
              m.nombre AS materia_nombre, 
              COALESCE(d.nombre_completo, 'Docente CESL') AS docente_nombre
            FROM actividades a
            JOIN materias m ON a.id_materia = m.id_materia
            LEFT JOIN docentes d ON a.id_docente = d.id_docente
            WHERE a.id_actividad = $1
          `;
          const { rows: actRows } = await pool.query(actQuery, [idActividad]);
          if (actRows.length === 0) continue;
          
          const infoActividad = actRows[0];

          // Obtener correos de los estudiantes recién calificados y sus acudientes
          const correosQuery = `
            SELECT 
              ue.email AS email_estudiante,
              ua.email AS email_acudiente
            FROM estudiantes e
            LEFT JOIN users ue ON e.id_usuario = ue.id_usuario
            LEFT JOIN acudientes ac ON e.id_acudiente = ac.id_acudiente
            LEFT JOIN users ua ON ac.id_usuario = ua.id_usuario
            WHERE e.id_estudiante = ANY($1::int[])
          `;
          const { rows: correosRows } = await pool.query(correosQuery, [estudiantesIDs]);

          const listaCorreos = new Set();
          correosRows.forEach(row => {
            if (row.email_estudiante) listaCorreos.add(row.email_estudiante);
            if (row.email_acudiente) listaCorreos.add(row.email_acudiente);
          });

          const correosFinales = Array.from(listaCorreos);

          if (correosFinales.length > 0) {
            console.log(`✉️ [NOTIFICACIÓN] Enviando correo de PRIMERA calificación a (${correosFinales.length}) usuarios:`, correosFinales);
            
            const datosCalificacion = {
              actividad: infoActividad.actividad_nombre,
              materia: infoActividad.materia_nombre,
              docente: infoActividad.docente_nombre
            };

            enviarCorreoCalificacion(correosFinales, datosCalificacion);
          }
        }
      }
    } catch (mailError) {
      console.error("❌ Error en el proceso de notificación por correo:", mailError);
    }

  } catch (error) {
    await pool.query('ROLLBACK');
    console.error("Error al guardar notas:", error);
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
      WHERE m.id_curso = $1 AND m.estado IN ('Activa', 'Matriculado')
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

// ==========================================
// 13. ACTUALIZAR ACTIVIDAD (Y SU TAREA VINCULADA)
// ==========================================
export const actualizarActividad = async (req, res, next) => {
  const { idActividad } = req.params;
  const { titulo, porcentaje, requiere_pdf, fecha_entrega } = req.body;

  try {
    await pool.query('BEGIN');

    // 1. Actualizar la actividad en la planilla
    const requierePdfValidado = requiere_pdf === true;
    const queryActividad = `
      UPDATE actividades 
      SET titulo = $1, porcentaje = $2, requiere_pdf = $3, fecha_entrega = $4
      WHERE id_actividad = $5
      RETURNING *
    `;
    const { rows: actRows } = await pool.query(queryActividad, [
      titulo, porcentaje, requierePdfValidado, fecha_entrega, idActividad
    ]);

    if (actRows.length === 0) {
      await pool.query('ROLLBACK');
      return res.status(404).json({ message: "Actividad no encontrada." });
    }

    // 2. Actualizar la tarea asociada en el calendario del estudiante
    const descripcionAutomatica = requierePdfValidado 
      ? "Esta actividad requiere que subas un archivo (PDF) a través de la plataforma." 
      : "Actividad evaluativa registrada por el docente en la planilla.";

    const queryTarea = `
      UPDATE tareas
      SET titulo = $1, descripcion = $2, fecha_entrega = $3
      WHERE id_actividad = $4
    `;
    await pool.query(queryTarea, [titulo, descripcionAutomatica, fecha_entrega, idActividad]);

    await pool.query('COMMIT');
    res.json({ message: "Actividad actualizada correctamente", actividad: actRows[0] });
  } catch (error) {
    await pool.query('ROLLBACK');
    console.error("Error al actualizar actividad:", error);
    next(error);
  }
};

// ==========================================
// 14. ELIMINAR ACTIVIDAD
// ==========================================
export const eliminarActividad = async (req, res, next) => {
  const { idActividad } = req.params;

  try {
    // Gracias al ON DELETE CASCADE de la base de datos, eliminar la actividad 
    // borrará automáticamente las notas y la tarea del calendario.
    const query = `DELETE FROM actividades WHERE id_actividad = $1 RETURNING *`;
    const { rows } = await pool.query(query, [idActividad]);

    if (rows.length === 0) {
      return res.status(404).json({ message: "Actividad no encontrada." });
    }

    res.json({ message: "Actividad y dependencias eliminadas correctamente." });
  } catch (error) {
    console.error("Error al eliminar actividad:", error);
    next(error);
  }
};
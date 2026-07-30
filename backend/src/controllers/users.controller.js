import { pool } from "../config/db.js";
import bcrypt from "bcryptjs";
import cloudinary from "../config/cloudinary.js";

export const getAcudienteProfile = async (req, res) => {
  try {
    const idUsuario = req.params.id || req.params.idUsuario;
    const q = 'SELECT * FROM acudientes WHERE id_usuario = $1';
    const { rows } = await pool.query(q, [idUsuario]);
    if (rows.length === 0) return res.status(404).json({ error: "Perfil no encontrado" });
    res.json(rows[0]);
  } catch (err) { res.status(500).json({ error: "Error interno" }); }
};

export const getEstudiantesByAcudiente = async (req, res) => {
  try {
    const { idAcudiente } = req.params;
    const q = `
      SELECT DISTINCT ON (e.id_estudiante)
        e.id_estudiante AS id, e.nombre_completo AS nombre, e.tipo_doc AS "tipoDoc", 
        e.documento, e.telefono, e.correo, e.direccion, COALESCE(c.nombre, 'Sin grado asignado') AS grado, 
        m.id_curso, u.foto_perfil
      FROM estudiantes e
      LEFT JOIN matriculas m ON e.id_estudiante = m.id_estudiante
      LEFT JOIN cursos c ON m.id_curso = c.id_curso
      LEFT JOIN users u ON e.id_usuario = u.id_usuario
      WHERE e.id_acudiente = $1 ORDER BY e.id_estudiante, m.id_matricula DESC
    `;
    const { rows } = await pool.query(q, [idAcudiente]);
    res.json(rows);
  } catch (err) { res.status(500).json({ error: "Error interno" }); }
};

export const updateAcudienteProfile = async (req, res) => {
  const idUsuario = Number(req.params.id || req.params.idUsuario); 
  const nombre = req.body.nombre || req.body.nombre_completo;
  const tipoDoc = req.body.tipoDoc || req.body.tipo_doc;
  const { documento, telefono, correo, direccion } = req.body;
  try {
    const q = `UPDATE acudientes SET nombre_completo = $1, tipo_doc = $2, documento = $3, telefono = $4, correo = $5, direccion = $6 WHERE id_usuario = $7 RETURNING *`;
    const { rows } = await pool.query(q, [nombre, tipoDoc, documento, telefono, correo, direccion, idUsuario]);
    if (rows.length === 0) return res.status(404).json({ error: "No encontrado" });
    res.json({ message: "Acudiente actualizado", data: rows[0] });
  } catch (err) { res.status(500).json({ error: "Error de BD" }); }
};

export const updateEstudianteProfile = async (req, res) => {
  const id = req.params.id || req.params.idEstudiante;
  const { nombre, tipoDoc, documento, telefono, correo, direccion, foto_perfil } = req.body;
  try {
    const { rows: studentRows } = await pool.query('SELECT id_usuario FROM estudiantes WHERE id_estudiante = $1', [id]);
    const idUsuario = studentRows[0]?.id_usuario;

    await pool.query(`UPDATE estudiantes SET nombre_completo = $1, tipo_doc = $2, documento = $3, telefono = $4, correo = $5, direccion = $6 WHERE id_estudiante = $7`, [nombre, tipoDoc, documento, telefono, correo, direccion, id]);

    if (idUsuario && foto_perfil !== undefined) {
      await pool.query(`UPDATE users SET foto_perfil = $1 WHERE id_usuario = $2`, [foto_perfil, idUsuario]);
    }
    res.json({ message: "Estudiante actualizado", data: { id_estudiante: id, nombre_completo: nombre, tipo_doc: tipoDoc, documento, telefono, correo, direccion, foto_perfil } });
  } catch (err) { res.status(500).json({ error: "Error de BD" }); }
};

export const changePassword = async (req, res) => {
  const { tipo, id, actual, nueva } = req.body;
  try {
    let id_usuario;
    if (tipo === "acudiente") { id_usuario = id; } 
    else {
      const resEstudiante = await pool.query('SELECT id_usuario FROM estudiantes WHERE id_estudiante = $1', [id]);
      if (resEstudiante.rows.length > 0) id_usuario = resEstudiante.rows[0].id_usuario;
    }
    if (!id_usuario) return res.status(404).json({ error: "Usuario no encontrado" });

    const userRes = await pool.query('SELECT password_hash FROM users WHERE id_usuario = $1', [id_usuario]);
    const match = await bcrypt.compare(actual, userRes.rows[0].password_hash);
    if (!match) return res.status(400).json({ error: "Contraseña incorrecta" });

    const salt = await bcrypt.genSalt(10);
    const hash = await bcrypt.hash(nueva, salt);

    await pool.query('UPDATE users SET password_hash = $1 WHERE id_usuario = $2', [hash, id_usuario]);
    res.json({ message: "Contraseña actualizada" });
  } catch (err) { res.status(500).json({ error: "Error interno" }); }
};

export const vincularEstudianteAcudiente = async (req, res) => {
  const { idEstudiante, idAcudiente } = req.body; 
  try {
    const q = `UPDATE estudiantes SET id_acudiente = $1 WHERE id_estudiante = $2 RETURNING *`;
    const { rows } = await pool.query(q, [idAcudiente, idEstudiante]);
    if (rows.length === 0) return res.status(404).json({ error: "No encontrado" });
    res.json({ message: "Vinculado", data: rows[0] });
  } catch (err) { res.status(500).json({ error: "Error BD" }); }
};

export const getNotasEstudiante = async (req, res) => {
  try {
    const idEstudiante = Number(req.params.idEstudiante);

    const q = `
      SELECT 
        m.id_materia,
        m.nombre AS materia,
        COALESCE(MAX(d.nombre_completo), 'Sin asignar') AS docente,
        COALESCE(ROUND(SUM(CASE WHEN a.periodo = 1 THEN na.nota * a.porcentaje ELSE 0 END) / NULLIF(SUM(CASE WHEN a.periodo = 1 AND na.nota IS NOT NULL THEN a.porcentaje ELSE 0 END), 0), 1), 0) AS p1,
        COALESCE(ROUND(SUM(CASE WHEN a.periodo = 2 THEN na.nota * a.porcentaje ELSE 0 END) / NULLIF(SUM(CASE WHEN a.periodo = 2 AND na.nota IS NOT NULL THEN a.porcentaje ELSE 0 END), 0), 1), 0) AS p2,
        COALESCE(ROUND(SUM(CASE WHEN a.periodo = 3 THEN na.nota * a.porcentaje ELSE 0 END) / NULLIF(SUM(CASE WHEN a.periodo = 3 AND na.nota IS NOT NULL THEN a.porcentaje ELSE 0 END), 0), 1), 0) AS p3,
        COALESCE(ROUND(SUM(CASE WHEN a.periodo = 4 THEN na.nota * a.porcentaje ELSE 0 END) / NULLIF(SUM(CASE WHEN a.periodo = 4 AND na.nota IS NOT NULL THEN a.porcentaje ELSE 0 END), 0), 1), 0) AS p4
      FROM notas_actividades na
      JOIN actividades a ON na.id_actividad = a.id_actividad
      JOIN materias m ON a.id_materia = m.id_materia
      LEFT JOIN asignacion_academica aa ON m.id_materia = aa.id_materia AND aa.id_curso = a.id_curso
      LEFT JOIN docentes d ON aa.id_docente = d.id_docente
      WHERE na.id_estudiante = $1
      GROUP BY m.id_materia, m.nombre
      ORDER BY m.nombre ASC
    `;
    const { rows } = await pool.query(q, [idEstudiante]);

    const notasFormat = rows.map(row => {
      const p1 = parseFloat(row.p1) || 0;
      const p2 = parseFloat(row.p2) || 0;
      const p3 = parseFloat(row.p3) || 0;
      const p4 = parseFloat(row.p4) || 0;
      
      const notaFinal = (p1 * 0.25) + (p2 * 0.25) + (p3 * 0.25) + (p4 * 0.25);

      return {
        id_materia: row.id_materia, materia: row.materia, docente: row.docente,
        nota_p1: p1 > 0 ? p1.toFixed(1) : "-", nota_p2: p2 > 0 ? p2.toFixed(1) : "-",
        nota_p3: p3 > 0 ? p3.toFixed(1) : "-", nota_p4: p4 > 0 ? p4.toFixed(1) : "-",
        nota_final: notaFinal > 0 ? notaFinal.toFixed(1) : "-",
        p1: p1 > 0 ? p1.toFixed(1) : "0.0", p2: p2 > 0 ? p2.toFixed(1) : "0.0",
        p3: p3 > 0 ? p3.toFixed(1) : "0.0", p4: p4 > 0 ? p4.toFixed(1) : "0.0",
        definitiva: notaFinal > 0 ? notaFinal.toFixed(1) : "0.0"
      };
    });

    res.json(notasFormat);
  } catch (err) { res.status(500).json({ error: "Error en el servidor al cargar notas" }); }
};

export const getTodasLasMaterias = async (req, res) => {
  try {
    const { rows } = await pool.query('SELECT * FROM materias ORDER BY nombre ASC');
    res.json(rows);
  } catch (err) { res.status(500).json({ error: "Error al cargar materias" }); }
};

export const getMateriasPorCurso = async (req, res) => {
  const { idCurso } = req.params;
  try {
    const { rows } = await pool.query(
      `SELECT DISTINCT m.id_materia, m.nombre 
       FROM asignacion_academica aa 
       JOIN materias m ON aa.id_materia = m.id_materia 
       WHERE aa.id_curso = $1 AND aa.anio_lectivo = '2026'
       ORDER BY m.nombre ASC`,
      [idCurso]
    );
    res.json(rows);
  } catch (err) { res.status(500).json({ error: "Error al cargar materias del curso" }); }
};

export const getPlanillaDetalle = async (req, res) => {
  try {
    const { idCurso, idMateria, periodo } = req.params;
    const actQ = 'SELECT id_actividad, titulo, porcentaje FROM actividades WHERE id_curso = $1 AND id_materia = $2 AND periodo = $3';
    const { rows: actividades } = await pool.query(actQ, [idCurso, idMateria, periodo]);

    // 🚨 ARREGLO: Sin filtro restrictivo de estado
    const estQ = `SELECT DISTINCT e.id_estudiante, e.nombre_completo FROM estudiantes e JOIN matriculas m ON e.id_estudiante = m.id_estudiante WHERE m.id_curso = $1`;
    const { rows: estudiantes } = await pool.query(estQ, [idCurso]);

    const notasQ = `SELECT na.id_estudiante, na.id_actividad, na.nota FROM notas_actividades na JOIN actividades a ON na.id_actividad = a.id_actividad WHERE a.id_curso = $1 AND a.id_materia = $2 AND a.periodo = $3`;
    const { rows: notas } = await pool.query(notasQ, [idCurso, idMateria, periodo]);

    const planilla = estudiantes.map(est => {
      const notasEstudiante = {};
      notas.filter(n => Number(n.id_estudiante) === Number(est.id_estudiante)).forEach(n => {
        notasEstudiante[n.id_actividad] = parseFloat(n.nota);
      });
      return { id_estudiante: est.id_estudiante, nombre_completo: est.nombre_completo, notas: notasEstudiante };
    });

    res.json({ actividades, planilla });
  } catch (error) { res.status(500).json({ error: "Error interno" }); }
};

export const getEventosCalendario = async (req, res) => {
  try {
    const idAcudiente = Number(req.params.idAcudiente);
    const userRes = await pool.query('SELECT id_usuario FROM acudientes WHERE id_acudiente = $1', [idAcudiente]);
    const idUsuario = userRes.rows[0]?.id_usuario;

    if (!idUsuario) return res.json([]);

    const q = `
      SELECT 
        CONCAT('ev_', id_tarea) AS id_evento, TO_CHAR(fecha_entrega, 'YYYY-MM-DD') AS fecha, 
        titulo, descripcion, color, '07:00' AS hora
      FROM tareas 
      WHERE id_usuario = $1 AND tipo = 'Recordatorio'
      ORDER BY fecha_entrega ASC
    `;
    const { rows } = await pool.query(q, [idUsuario]);
    res.json(rows);
  } catch (err) { res.status(500).json({ error: "Error interno" }); }
};

export const crearEventoCalendario = async (req, res) => {
  try {
    const { id_acudiente, fecha, titulo, descripcion, color, hora } = req.body;
    const userRes = await pool.query('SELECT id_usuario FROM acudientes WHERE id_acudiente = $1', [id_acudiente]);
    const idUsuario = userRes.rows[0]?.id_usuario;
    if (!idUsuario) return res.status(404).json({ error: "Acudiente no encontrado" });

    const cleanColor = color.replace('bg-', '').replace('-500', '');
    const q = `INSERT INTO tareas (id_usuario, titulo, descripcion, fecha_entrega, color, tipo) VALUES ($1, $2, $3, $4, $5, 'Recordatorio') RETURNING id_tarea AS id_evento`;
    const { rows } = await pool.query(q, [idUsuario, titulo, descripcion, fecha, cleanColor]);
    res.json({ message: "Evento guardado", data: rows[0] });
  } catch (err) { res.status(500).json({ error: "Error interno" }); }
};

export const deleteEventoCalendario = async (req, res) => {
  try {
    const idEventoRaw = String(req.params.idEvento);
    const idClean = Number(idEventoRaw.replace('ev_', '').replace('tar_', ''));
    if (isNaN(idClean)) return res.status(400).json({ error: "Error de ID." });

    await pool.query("DELETE FROM tareas WHERE id_tarea = $1 AND tipo = 'Recordatorio'", [idClean]);
    res.json({ message: "Evento eliminado con éxito" });
  } catch (err) { res.status(500).json({ error: "Error al eliminar" }); }
};

export const getEstadoMatricula = async (req, res) => {
  try {
    const { idEstudiante } = req.params;
    const q = 'SELECT * FROM matriculas WHERE id_estudiante = $1 ORDER BY id_matricula DESC LIMIT 1';
    const { rows } = await pool.query(q, [idEstudiante]);
    if (rows.length === 0) return res.json({ estado: "No Iniciado" });
    res.json(rows[0]);
  } catch (err) { res.status(500).json({ error: "Error interno" }); }
};

export const registrarMatriculaLinea = async (req, res) => {
  try {
    const { id_estudiante, documentos_url, firma_digital_hash, anio_lectivo, id_curso } = req.body;
    const estId = Number(id_estudiante);
    const cursoId = Number(id_curso) || 1;
    const anioStr = String(anio_lectivo || "2026");

    const checkQ = 'SELECT id_matricula FROM matriculas WHERE id_estudiante = $1 AND anio_lectivo = $2';
    const checkRes = await pool.query(checkQ, [estId, anioStr]);

    if (checkRes.rows.length > 0) {
      const updateQ = `UPDATE matriculas SET documentos_url = $1, firma_digital_hash = $2, estado = 'Pendiente', id_curso = $3, fecha_matricula = CURRENT_TIMESTAMP WHERE id_estudiante = $4 AND anio_lectivo = $5 RETURNING *`;
      const { rows } = await pool.query(updateQ, [documentos_url, firma_digital_hash, cursoId, estId, anioStr]);
      return res.json({ message: "Actualizada", data: rows[0] });
    } else {
      const insertQ = `INSERT INTO matriculas (id_estudiante, estado, documentos_url, firma_digital_hash, anio_lectivo, id_curso, fecha_matricula) VALUES ($1, 'Pendiente', $2, $3, $4, $5, CURRENT_TIMESTAMP) RETURNING *`;
      const { rows } = await pool.query(insertQ, [estId, documentos_url, firma_digital_hash, anioStr, cursoId]);
      return res.json({ message: "Registrada", data: rows[0] });
    }
  } catch (err) { res.status(500).json({ error: "Error interno" }); }
};

export const getEstudianteProfile = async (req, res) => {
  try {
    const idUsuario = req.params.idUsuario || req.params.id;
    const q = `SELECT e.*, u.foto_perfil FROM estudiantes e INNER JOIN users u ON e.id_usuario = u.id_usuario WHERE e.id_usuario = $1`;
    const { rows } = await pool.query(q, [idUsuario]);
    if (rows.length === 0) return res.status(404).json({ error: "No encontrado" });
    res.json(rows[0]);
  } catch (err) { res.status(500).json({ error: "Error" }); }
};

export const getHorarioEstudiante = async (req, res) => {
  try {
    const q = `
      SELECT h.dia_semana, h.bloque_hora, m.nombre AS materia 
      FROM horarios h 
      JOIN materias m ON h.id_materia = m.id_materia 
      ORDER BY CASE h.dia_semana WHEN 'Lunes' THEN 1 WHEN 'Martes' THEN 2 WHEN 'Miércoles' THEN 3 WHEN 'Jueves' THEN 4 WHEN 'Viernes' THEN 5 ELSE 6 END, h.bloque_hora ASC
    `;
    const { rows } = await pool.query(q);
    res.json(rows);
  } catch (err) { res.status(500).json({ error: "Error" }); }
};

export const getObservacionesAcudiente = async (req, res) => {
  try {
    const idEstudiante = Number(req.params.idEstudiante);
    const q = `SELECT o.*, u.username AS nombre_docente, TO_CHAR(o.fecha, 'YYYY-MM-DD HH24:MI') as fecha_formato FROM observaciones o JOIN docentes d ON o.id_docente = d.id_docente JOIN users u ON d.id_usuario = u.id_usuario WHERE o.id_estudiante = $1 ORDER BY o.fecha DESC`;
    const { rows } = await pool.query(q, [idEstudiante]);
    res.json(rows);
  } catch (err) { res.status(500).json({ error: "Error" }); }
};

export const getAsistenciaAcudiente = async (req, res) => {
  try {
    const idEstudiante = Number(req.params.idEstudiante);
    const q = `SELECT a.estado, m.nombre AS materia, d.nombre_completo AS docente, TO_CHAR(a.fecha, 'YYYY-MM-DD') AS fecha_formato FROM asistencias a JOIN materias m ON a.id_materia = m.id_materia JOIN docentes d ON a.id_docente = d.id_docente WHERE a.id_estudiante = $1 ORDER BY a.fecha DESC`;
    const { rows } = await pool.query(q, [idEstudiante]);
    res.json(rows);
  } catch (err) { res.status(500).json({ error: "Error" }); }
};

export const getFechaLimiteMatricula = async (req, res, next) => {
  try {
    // Tomamos la fecha límite configurada. Al ser transaccional, usamos MAX() 
    // para asegurar que toma la fecha más lejana/reciente configurada.
    const q = 'SELECT MAX(fecha_limite) AS limite FROM matriculas';
    const { rows } = await pool.query(q);
    
    // Si la tabla está totalmente vacía y devuelve null, usamos el valor de contingencia
    const limite = rows[0]?.limite || '2026-08-15T23:59:59';
    
    res.json({ fecha_limite: limite });
  } catch (err) { 
    console.error("Error obteniendo la fecha límite:", err);
    res.status(500).json({ error: "Error interno" });
  }
};

// ==========================================
// GUARDAR URL DEL COMPROBANTE DE PAGO
// ==========================================
export const guardarComprobanteMatricula = async (req, res, next) => {
  const { id_estudiante, documentos_url } = req.body;

  if (!id_estudiante || !documentos_url) {
    return res.status(400).json({ error: "Faltan datos obligatorios (id_estudiante o documentos_url)." });
  }

  try {
    const query = `
      UPDATE matriculas 
      SET documentos_url = $1 
      WHERE id_estudiante = $2 AND estado = 'Pendiente'
      RETURNING *;
    `;
    const { rows } = await pool.query(query, [documentos_url, Number(id_estudiante)]);

    if (rows.length === 0) {
      return res.status(404).json({ message: "No se encontró una matrícula pendiente para este estudiante." });
    }

    res.json({ message: "Comprobante de pago guardado exitosamente", matricula: rows[0] });
  } catch (error) {
    console.error("Error guardando comprobante:", error);
    next(error);
  }
};

// ==========================================
// SUBIR COMPROBANTE DE PAGO CON CLOUDINARY
// ==========================================
export const subirComprobanteMatricula = async (req, res, next) => {
  const { id_estudiante } = req.body;
  const file = req.file;

  if (!file) {
    return res.status(400).json({ error: "No se proporcionó un archivo." });
  }

  if (!id_estudiante) {
    return res.status(400).json({ error: "Falta id_estudiante." });
  }

  try {
    const subirACloudinary = () => {
      return new Promise((resolve, reject) => {
        const stream = cloudinary.uploader.upload_stream(
          {
            folder: "cesl_comprobantespago"
          },
          (error, result) => {
            if (error) reject(error);
            else resolve(result.secure_url);
          }
        );
        stream.end(file.buffer);
      });
    };

    const urlCloudinary = await subirACloudinary();

    const query = `
      UPDATE matriculas 
      SET documentos_url = $1 
      WHERE id_estudiante = $2 AND estado = 'Pendiente'
      RETURNING *;
    `;
    const { rows } = await pool.query(query, [urlCloudinary, Number(id_estudiante)]);

    if (rows.length === 0) {
      return res.status(404).json({ message: "No se encontró una matrícula pendiente para este estudiante." });
    }

    res.json({ message: "Comprobante de pago guardado exitosamente", matricula: rows[0] });
  } catch (error) {
    console.error("Error subiendo comprobante:", error);
    next(error);
  }
};
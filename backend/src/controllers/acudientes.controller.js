import { pool } from "../config/db.js";
import bcrypt from "bcryptjs";

// ==========================================
// 1. GESTIÓN DE PERFIL ACUDIENTE
// ==========================================
export const getAcudienteProfile = async (req, res, next) => {
  try {
    const idUsuario = Number(req.params.idUsuario);
    const q = `
      SELECT id_acudiente AS id, nombre_completo AS nombre, tipo_doc AS "tipoDoc", documento, telefono, correo, direccion 
      FROM acudientes 
      WHERE id_usuario = $1
    `;
    const { rows } = await pool.query(q, [idUsuario]);
    
    if (rows.length === 0) return res.status(404).json({ error: "Perfil de acudiente no encontrado" });
    res.json(rows[0]);
  } catch (err) {
    console.error("Error en getAcudienteProfile:", err);
    next(err);
  }
};

export const updateAcudienteProfile = async (req, res, next) => {
  const idUsuario = Number(req.params.idUsuario);
  const { nombre, tipoDoc, documento, telefono, correo, direccion } = req.body;

  try {
    const q = `
      UPDATE acudientes 
      SET nombre_completo = $1, tipo_doc = $2, documento = $3, telefono = $4, correo = $5, direccion = $6 
      WHERE id_usuario = $7 
      RETURNING id_acudiente AS id, nombre_completo AS nombre, tipo_doc AS "tipoDoc", documento, telefono, correo, direccion
    `;
    const { rows } = await pool.query(q, [nombre, tipoDoc, documento, telefono, correo, direccion, idUsuario]);
    
    if (rows.length === 0) return res.status(404).json({ error: "No se encontró el acudiente" });
    res.json(rows[0]);
  } catch (err) {
    console.error("Error al actualizar acudiente:", err);
    next(err);
  }
};

export const changePasswordAcudiente = async (req, res, next) => {
  const idUsuario = Number(req.params.idUsuario);
  const { actual, nueva } = req.body;
  try {
    const { rows } = await pool.query('SELECT password_hash FROM users WHERE id_usuario = $1', [idUsuario]);
    if (rows.length === 0) return res.status(404).json({ error: "Usuario no encontrado" });

    const match = await bcrypt.compare(actual, rows[0].password_hash);
    if (!match) return res.status(400).json({ error: "La contraseña actual es incorrecta" });

    const salt = await bcrypt.genSalt(10);
    const hash = await bcrypt.hash(nueva, salt);

    await pool.query('UPDATE users SET password_hash = $1 WHERE id_usuario = $2', [hash, idUsuario]);
    res.json({ message: "Contraseña actualizada exitosamente" });
  } catch (err) {
    console.error("Error al cambiar contraseña acudiente:", err);
    next(err);
  }
};

// ==========================================
// 2. GESTIÓN DE HIJOS ASIGNADOS
// ==========================================
export const getEstudiantesByAcudiente = async (req, res, next) => {
  try {
    const idAcudiente = Number(req.params.idAcudiente);
    // Agregamos teléfono, correo y dirección para que el modal los pueda leer
    const q = `
      SELECT 
        e.id_estudiante AS id, 
        e.nombre_completo AS nombre, 
        e.tipo_doc AS "tipoDoc", 
        e.documento, 
        e.telefono,
        e.correo,
        e.direccion,
        e.grado, 
        m.id_curso 
      FROM estudiantes e
      LEFT JOIN matriculas m ON e.id_estudiante = m.id_estudiante AND m.estado = 'Activa'
      WHERE e.id_acudiente = $1
      ORDER BY e.id_estudiante
    `;
    const { rows } = await pool.query(q, [idAcudiente]);
    res.json(rows);
  } catch (err) {
    console.error("Error en getEstudiantesByAcudiente:", err);
    next(err);
  }
};

export const updateEstudianteByAcudiente = async (req, res, next) => {
  const idEstudiante = Number(req.params.idEstudiante);
  // AHORA SÍ recibimos todos los datos que manda el modal
  const { nombre, tipoDoc, documento, telefono, correo, direccion, grado } = req.body;

  try {
    const q = `
      UPDATE estudiantes 
      SET nombre_completo = $1, tipo_doc = $2, documento = $3, telefono = $4, correo = $5, direccion = $6, grado = $7 
      WHERE id_estudiante = $8 
      RETURNING id_estudiante AS id, nombre_completo AS nombre, tipo_doc AS "tipoDoc", documento, telefono, correo, direccion, grado
    `;
    const { rows } = await pool.query(q, [nombre, tipoDoc, documento, telefono, correo, direccion, grado, idEstudiante]);
    
    if (rows.length === 0) return res.status(404).json({ error: "No se encontró el estudiante" });
    
    res.json(rows[0]);
  } catch (err) {
    console.error("Error al actualizar perfil de estudiante:", err);
    next(err);
  }
};

export const changePasswordEstudianteByAcudiente = async (req, res, next) => {
  const idEstudiante = Number(req.params.idEstudiante);
  const { actual, nueva } = req.body;
  try {
    const { rows: studentRows } = await pool.query('SELECT id_usuario FROM estudiantes WHERE id_estudiante = $1', [idEstudiante]);
    if (studentRows.length === 0) return res.status(404).json({ error: "Estudiante no encontrado" });
    
    const idUserEstudiante = studentRows[0].id_usuario;
    const { rows } = await pool.query('SELECT password_hash FROM users WHERE id_usuario = $1', [idUserEstudiante]);
    
    const isMatch = await bcrypt.compare(actual, rows[0].password_hash);
    if (!isMatch) return res.status(400).json({ error: "Contraseña actual incorrecta" });

    const hash = await bcrypt.hash(nueva, 10);
    await pool.query('UPDATE users SET password_hash = $1 WHERE id_usuario = $2', [hash, idUserEstudiante]);

    res.json({ message: "Contraseña del estudiante actualizada correctamente" });
  } catch (err) {
    console.error("Error al cambiar contraseña del hijo:", err);
    next(err);
  }
};

// ==========================================
// 3. CONSULTA DE PLANILLAS Y CALIFICACIONES
// ==========================================
export const getNotasEstudianteByAcudiente = async (req, res, next) => {
  try {
    const idEstudiante = Number(req.params.idEstudiante);
    const q = `
      SELECT ne.id_nota AS id, ne.id_materia, m.nombre AS materia, d.nombre_completo AS docente, 
             ne.nota_p1, ne.nota_p2, ne.nota_p3, ne.nota_final 
      FROM notas_estudiante ne 
      INNER JOIN materias m ON m.id_materia = ne.id_materia 
      LEFT JOIN docentes d ON m.id_docente = d.id_docente
      WHERE ne.id_estudiante = $1 
      ORDER BY m.nombre
    `;
    const { rows } = await pool.query(q, [idEstudiante]);
    res.json(rows);
  } catch (err) {
    console.error("Error al obtener resumen de calificaciones:", err);
    next(err);
  }
};

export const getPlanillaDetalleByAcudiente = async (req, res, next) => {
  try {
    const { idCurso, idMateria, periodo } = req.params;

    const actQ = 'SELECT id_actividad, titulo, porcentaje FROM actividades WHERE id_curso = $1 AND id_materia = $2 AND periodo = $3';
    const { rows: actividades } = await pool.query(actQ, [idCurso, idMateria, periodo]);

    const estQ = `
      SELECT DISTINCT e.id_estudiante, e.nombre_completo
      FROM estudiantes e
      JOIN matriculas m ON e.id_estudiante = m.id_estudiante
      WHERE m.id_curso = $1 AND m.estado = 'Activa'
    `;
    const { rows: estudiantes } = await pool.query(estQ, [idCurso]);

    const notasQ = `
      SELECT na.id_estudiante, na.id_actividad, na.nota 
      FROM notas_actividades na
      JOIN actividades a ON na.id_actividad = a.id_actividad
      WHERE a.id_curso = $1 AND a.id_materia = $2 AND a.periodo = $3
    `;
    const { rows: notas } = await pool.query(notasQ, [idCurso, idMateria, periodo]);

    const planilla = estudiantes.map(est => {
      const notasEstudiante = {};
      notas.filter(n => Number(n.id_estudiante) === Number(est.id_estudiante)).forEach(n => {
        notasEstudiante[n.id_actividad] = parseFloat(n.nota);
      });
      return { id_estudiante: est.id_estudiante, nombre_completo: est.nombre_completo, notas: notasEstudiante };
    });

    res.json({ actividades, planilla });
  } catch (error) {
    console.error("Error al armar planilla detallada:", error);
    next(error);
  }
};

// ==========================================
// 4. TRÁMITES DE MATRÍCULAS EN LÍNEA
// ==========================================
export const getEstadoMatriculaByAcudiente = async (req, res, next) => {
  try {
    const idEstudiante = Number(req.params.idEstudiante);
    const q = 'SELECT * FROM matriculas WHERE id_estudiante = $1 ORDER BY id_matricula DESC LIMIT 1';
    const { rows } = await pool.query(q, [idEstudiante]);
    
    if (rows.length === 0) return res.json({ estado: "No Iniciado" });
    res.json(rows[0]);
  } catch (err) {
    console.error("Error al obtener estado de matrícula:", err);
    next(err);
  }
};

export const registrarMatriculaLineaByAcudiente = async (req, res, next) => {
  try {
    const { id_estudiante, documentos_url, firma_digital_hash, anio_lectivo, id_curso } = req.body;
    
    const checkQ = 'SELECT id_matricula FROM matriculas WHERE id_estudiante = $1 AND anio_lectivo = $2';
    const checkRes = await pool.query(checkQ, [id_estudiante, anio_lectivo]);

    if (checkRes.rows.length > 0) {
      const updateQ = `
        UPDATE matriculas 
        SET documentos_url = $1, firma_digital_hash = $2, estado = 'Pendiente', id_curso = $3, fecha_matricula = CURRENT_TIMESTAMP
        WHERE id_estudiante = $4 AND anio_lectivo = $5 RETURNING *`;
      const { rows } = await pool.query(updateQ, [documentos_url, firma_digital_hash, id_curso, id_estudiante, anio_lectivo]);
      return res.json({ message: "Matrícula actualizada", data: rows[0] });
    } else {
      const insertQ = `
        INSERT INTO matriculas (id_estudiante, estado, documentos_url, firma_digital_hash, anio_lectivo, id_curso, fecha_matricula)
        VALUES ($1, 'Pendiente', $2, $3, $4, $5, CURRENT_TIMESTAMP) RETURNING *`;
      const { rows } = await pool.query(insertQ, [id_estudiante, documentos_url, firma_digital_hash, anio_lectivo, id_curso]);
      return res.json({ message: "Matrícula registrada con éxito", data: rows[0] });
    }
  } catch (err) {
    console.error("Error al procesar matrícula:", err);
    next(err);
  }
};

// ==========================================
// 5. CALENDARIO DE EVENTOS DE ACUDIENTE
// ==========================================
export const getEventosCalendarioByAcudiente = async (req, res, next) => {
  try {
    const idAcudiente = Number(req.params.idAcudiente);
    const q = 'SELECT id_evento, id_acudiente, fecha, titulo, descripcion, color, hora FROM eventos_calendario WHERE id_acudiente = $1 ORDER BY hora ASC';
    const { rows } = await pool.query(q, [idAcudiente]);
    res.json(rows);
  } catch (err) {
    console.error("Error al cargar eventos:", err);
    next(err);
  }
};

export const crearEventoCalendarioByAcudiente = async (req, res, next) => {
  try {
    const { id_acudiente, fecha, titulo, descripcion, color, hora } = req.body;
    const q = `
      INSERT INTO eventos_calendario (id_acudiente, fecha, titulo, descripcion, color, hora) 
      VALUES ($1, $2, $3, $4, $5, $6) RETURNING *`;
    const { rows } = await pool.query(q, [id_acudiente, fecha, titulo, descripcion, color, hora]);
    res.json({ message: "Evento guardado", data: rows[0] });
  } catch (err) {
    console.error("Error al guardar evento:", err);
    next(err);
  }
};

export const deleteEventoCalendarioByAcudiente = async (req, res, next) => {
  try {
    const idEvento = Number(req.params.idEvento);
    await pool.query('DELETE FROM eventos_calendario WHERE id_evento = $1', [idEvento]);
    res.json({ message: "Evento eliminado" });
  } catch (err) {
    console.error("Error al eliminar evento:", err);
    next(err);
  }
};
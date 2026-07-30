import { pool } from "../config/db.js";
import bcrypt from "bcryptjs";

export const getAcudienteProfile = async (req, res, next) => {
  try {
    const idUsuario = Number(req.params.idUsuario);
    const q = `SELECT id_acudiente AS id, nombre_completo AS nombre, tipo_doc AS "tipoDoc", documento, telefono, correo, direccion FROM acudientes WHERE id_usuario = $1`;
    const { rows } = await pool.query(q, [idUsuario]);
    if (rows.length === 0) return res.status(404).json({ error: "Perfil no encontrado" });
    res.json(rows[0]);
  } catch (err) { next(err); }
};

export const updateAcudienteProfile = async (req, res, next) => {
  const idUsuario = Number(req.params.idUsuario);
  const { nombre, tipoDoc, documento, telefono, correo, direccion } = req.body;
  try {
    const q = `UPDATE acudientes SET nombre_completo = $1, tipo_doc = $2, documento = $3, telefono = $4, correo = $5, direccion = $6 WHERE id_usuario = $7 RETURNING *`;
    const { rows } = await pool.query(q, [nombre, tipoDoc, documento, telefono, correo, direccion, idUsuario]);
    if (rows.length === 0) return res.status(404).json({ error: "No encontrado" });
    res.json(rows[0]);
  } catch (err) { next(err); }
};

export const changePasswordAcudiente = async (req, res, next) => {
  const idUsuario = Number(req.params.idUsuario);
  const { actual, nueva } = req.body;
  try {
    const { rows } = await pool.query('SELECT password_hash FROM users WHERE id_usuario = $1', [idUsuario]);
    if (rows.length === 0) return res.status(404).json({ error: "No encontrado" });
    
    const match = await bcrypt.compare(actual, rows[0].password_hash);
    if (!match) return res.status(400).json({ error: "Contraseña incorrecta" });
    
    const salt = await bcrypt.genSalt(10);
    const hash = await bcrypt.hash(nueva, salt);
    await pool.query('UPDATE users SET password_hash = $1 WHERE id_usuario = $2', [hash, idUsuario]);
    res.json({ message: "Actualizada" });
  } catch (err) { next(err); }
};

export const getEstudiantesByAcudiente = async (req, res, next) => {
  try {
    const idAcudiente = Number(req.params.idAcudiente);
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
  } catch (err) { next(err); }
};

export const updateEstudianteByAcudiente = async (req, res, next) => {
  const idEstudiante = Number(req.params.idEstudiante);
  const { nombre, tipoDoc, documento, telefono, correo, direccion, foto_perfil } = req.body;
  try {
    await pool.query(`UPDATE estudiantes SET nombre_completo = $1, tipo_doc = $2, documento = $3, telefono = $4, correo = $5, direccion = $6 WHERE id_estudiante = $7`, [nombre, tipoDoc, documento, telefono, correo, direccion, idEstudiante]);
    
    const { rows: studentRows } = await pool.query('SELECT id_usuario FROM estudiantes WHERE id_estudiante = $1', [idEstudiante]);
    const idUsuario = studentRows[0]?.id_usuario;
    
    if (idUsuario && foto_perfil !== undefined) {
      await pool.query(`UPDATE users SET foto_perfil = $1 WHERE id_usuario = $2`, [foto_perfil, idUsuario]);
    }
    res.json({ message: "Estudiante actualizado", data: { id_estudiante: idEstudiante, nombre_completo: nombre, tipo_doc: tipoDoc, documento, telefono, correo, direccion, foto_perfil } });
  } catch (err) { next(err); }
};

export const changePasswordEstudianteByAcudiente = async (req, res, next) => {
  const idEstudiante = Number(req.params.idEstudiante);
  const { actual, nueva } = req.body;
  try {
    const { rows: studentRows } = await pool.query('SELECT id_usuario FROM estudiantes WHERE id_estudiante = $1', [idEstudiante]);
    if (studentRows.length === 0) return res.status(404).json({ error: "No encontrado" });
    
    const idUserEstudiante = studentRows[0].id_usuario;
    const { rows } = await pool.query('SELECT password_hash FROM users WHERE id_usuario = $1', [idUserEstudiante]);
    
    const isMatch = await bcrypt.compare(actual, rows[0].password_hash);
    if (!isMatch) return res.status(400).json({ error: "Incorrecta" });
    
    const hash = await bcrypt.hash(nueva, 10);
    await pool.query('UPDATE users SET password_hash = $1 WHERE id_usuario = $2', [hash, idUserEstudiante]);
    res.json({ message: "Actualizada" });
  } catch (err) { next(err); }
};

// ---------------------------------------------------------
// NOTAS Y PLANILLAS
// ---------------------------------------------------------

export const getNotasEstudianteByAcudiente = async (req, res, next) => {
  try {
    const idEstudiante = Number(req.params.idEstudiante);
    const q = `
      SELECT
        m.id_materia,
        m.nombre AS materia,
        COALESCE(MAX(d.nombre_completo), 'Sin asignar') AS docente,
        COALESCE(ROUND(SUM(CASE WHEN a.periodo = 1 THEN na.nota * (a.porcentaje / 100.0) ELSE 0 END) / NULLIF(SUM(CASE WHEN a.periodo = 1 AND na.nota IS NOT NULL THEN (a.porcentaje / 100.0) ELSE 0 END), 0), 1), 0) AS p1,
        COALESCE(ROUND(SUM(CASE WHEN a.periodo = 2 THEN na.nota * (a.porcentaje / 100.0) ELSE 0 END) / NULLIF(SUM(CASE WHEN a.periodo = 2 AND na.nota IS NOT NULL THEN (a.porcentaje / 100.0) ELSE 0 END), 0), 1), 0) AS p2,
        COALESCE(ROUND(SUM(CASE WHEN a.periodo = 3 THEN na.nota * (a.porcentaje / 100.0) ELSE 0 END) / NULLIF(SUM(CASE WHEN a.periodo = 3 AND na.nota IS NOT NULL THEN (a.porcentaje / 100.0) ELSE 0 END), 0), 1), 0) AS p3,
        COALESCE(ROUND(SUM(CASE WHEN a.periodo = 4 THEN na.nota * (a.porcentaje / 100.0) ELSE 0 END) / NULLIF(SUM(CASE WHEN a.periodo = 4 AND na.nota IS NOT NULL THEN (a.porcentaje / 100.0) ELSE 0 END), 0), 1), 0) AS p4
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
  } catch (err) { next(err); }
};

export const getPlanillaDetalleByAcudiente = async (req, res, next) => {
  try {
    const { idCurso, idMateria, periodo } = req.params;
    const actQ = 'SELECT id_actividad, titulo, porcentaje FROM actividades WHERE id_curso = $1 AND id_materia = $2 AND periodo = $3';
    const { rows: actividades } = await pool.query(actQ, [idCurso, idMateria, periodo]);
    
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
  } catch (error) { next(error); }
};

// ---------------------------------------------------------
// SISTEMA DE MATRÍCULAS Y PROMOCIÓN
// ---------------------------------------------------------

export const getEstadoMatriculaByAcudiente = async (req, res, next) => {
  try {
    const idEstudiante = Number(req.params.idEstudiante);
    
    const qNotas = `
      SELECT 
        m.id_materia,
        SUM(CASE WHEN a.periodo = 1 THEN na.nota * (a.porcentaje / 100.0) ELSE 0 END) AS p1,
        SUM(CASE WHEN a.periodo = 2 THEN na.nota * (a.porcentaje / 100.0) ELSE 0 END) AS p2,
        SUM(CASE WHEN a.periodo = 3 THEN na.nota * (a.porcentaje / 100.0) ELSE 0 END) AS p3,
        SUM(CASE WHEN a.periodo = 4 THEN na.nota * (a.porcentaje / 100.0) ELSE 0 END) AS p4
      FROM actividades a
      JOIN materias m ON a.id_materia = m.id_materia
      JOIN notas_actividades na ON a.id_actividad = na.id_actividad
      WHERE na.id_estudiante = $1
      GROUP BY m.id_materia
    `;
    const { rows: notas } = await pool.query(qNotas, [idEstudiante]);

    let materiasPerdidas = 0;
    notas.forEach(n => {
      const p1 = parseFloat(n.p1) || 0;
      const p2 = parseFloat(n.p2) || 0;
      const p3 = parseFloat(n.p3) || 0;
      const p4 = parseFloat(n.p4) || 0;
      const definitiva = (p1 * 0.25) + (p2 * 0.25) + (p3 * 0.25) + (p4 * 0.25);
      
      if (definitiva > 0 && definitiva < 3.0) {
        materiasPerdidas++;
      }
    });

    const promovido = materiasPerdidas === 0;

    const qMatricula = `
      SELECT m.*, c.nombre as nombre_curso 
      FROM matriculas m 
      LEFT JOIN cursos c ON m.id_curso = c.id_curso
      WHERE m.id_estudiante = $1 
      ORDER BY m.id_matricula DESC LIMIT 1
    `;
    const { rows: matricula } = await pool.query(qMatricula, [idEstudiante]);

    if (matricula.length === 0) {
      return res.json({ estado: "No Iniciado", promovido, materias_perdidas: materiasPerdidas, grado_habilitado: 1 });
    }

    const data = matricula[0];
    let gradoActual = 1;
    
    if (data.nombre_curso) {
      const gradoStr = data.nombre_curso.split('-')[0];
      gradoActual = parseInt(gradoStr, 10);
    }

    let gradoHabilitado = promovido ? gradoActual + 1 : gradoActual;
    if (gradoHabilitado > 11) gradoHabilitado = 11; 

    res.json({ 
        ...data, 
        promovido, 
        materias_perdidas: materiasPerdidas,
        grado_actual: gradoActual,
        grado_habilitado: gradoHabilitado
    });
  } catch (err) { next(err); }
};

export const registrarMatriculaLineaByAcudiente = async (req, res, next) => {
  try {
    const { 
      id_estudiante, 
      documentos_url = '', 
      firma_digital_hash = '', 
      anio_lectivo = '2026', 
      id_curso 
    } = req.body;

    // Convertimos explícitamente a números enteros
    const idEstudianteNum = Number(id_estudiante);
    const idCursoNum = Number(id_curso);

    if (!idEstudianteNum || !idCursoNum) {
      return res.status(400).json({ error: "id_estudiante e id_curso son obligatorios y deben ser números válidos." });
    }

    // 1. Verificamos si ya existe la matrícula para ese año lectivo
    const checkQ = 'SELECT id_matricula FROM matriculas WHERE id_estudiante = $1 AND anio_lectivo = $2';
    const checkRes = await pool.query(checkQ, [idEstudianteNum, String(anio_lectivo)]);

    if (checkRes.rows.length > 0) {
      // 2. Si existe, actualizamos
      const updateQ = `
        UPDATE matriculas 
        SET 
          documentos_url = COALESCE(NULLIF($1, ''), documentos_url), 
          firma_digital_hash = COALESCE(NULLIF($2, ''), firma_digital_hash), 
          estado = 'Pendiente', 
          id_curso = $3, 
          fecha_matricula = CURRENT_TIMESTAMP 
        WHERE id_estudiante = $4 AND anio_lectivo = $5 
        RETURNING *;
      `;
      const { rows } = await pool.query(updateQ, [documentos_url, firma_digital_hash, idCursoNum, idEstudianteNum, String(anio_lectivo)]);
      return res.json({ message: "Matrícula actualizada", data: rows[0] });

    } else {
      // 3. Si no existe, insertamos un nuevo registro
      const insertQ = `
        INSERT INTO matriculas 
          (id_estudiante, estado, documentos_url, firma_digital_hash, anio_lectivo, id_curso, fecha_matricula) 
        VALUES 
          ($1, 'Pendiente', $2, $3, $4, $5, CURRENT_TIMESTAMP) 
        RETURNING *;
      `;
      const { rows } = await pool.query(insertQ, [idEstudianteNum, documentos_url, firma_digital_hash, String(anio_lectivo), idCursoNum]);
      return res.json({ message: "Matrícula registrada con éxito", data: rows[0] });
    }

  } catch (err) { 
    console.error("❌ Error en registrarMatriculaLineaByAcudiente:", err);
    next(err); 
  }
};

// ---------------------------------------------------------
// EVENTOS CALENDARIO (MIGRADO A TAREAS)
// ---------------------------------------------------------

export const getEventosCalendarioByAcudiente = async (req, res, next) => {
  try {
    const idAcudiente = Number(req.params.idAcudiente);
    const userRes = await pool.query('SELECT id_usuario FROM acudientes WHERE id_acudiente = $1', [idAcudiente]);
    const idUsuario = userRes.rows[0]?.id_usuario;
    
    if (!idUsuario) return res.json([]);
    
    const q = `
      SELECT
        CONCAT('ev_', id_tarea) AS id_evento,
        TO_CHAR(fecha_entrega, 'YYYY-MM-DD') AS fecha,
        titulo,
        descripcion,
        color,
        '07:00' AS hora
      FROM tareas
      WHERE id_usuario = $1 AND tipo = 'Recordatorio'
      ORDER BY fecha_entrega ASC
    `;
    const { rows } = await pool.query(q, [idUsuario]);
    res.json(rows);
  } catch (err) { next(err); }
};

export const crearEventoCalendarioByAcudiente = async (req, res, next) => {
  try {
    const { id_acudiente, fecha, titulo, descripcion, color, hora } = req.body;
    const userRes = await pool.query('SELECT id_usuario FROM acudientes WHERE id_acudiente = $1', [id_acudiente]);
    const idUsuario = userRes.rows[0]?.id_usuario;
    
    if (!idUsuario) return res.status(404).json({ error: "Acudiente no encontrado" });
    
    const cleanColor = color.replace('bg-', '').replace('-500', '');
    const q = `INSERT INTO tareas (id_usuario, titulo, descripcion, fecha_entrega, color, tipo) VALUES ($1, $2, $3, $4, $5, 'Recordatorio') RETURNING id_tarea AS id_evento`;
    const { rows } = await pool.query(q, [idUsuario, titulo, descripcion, fecha, cleanColor]);
    res.json({ message: "Evento guardado", data: rows[0] });
  } catch (err) { next(err); }
};

export const deleteEventoCalendarioByAcudiente = async (req, res, next) => {
  try {
    const idEventoRaw = String(req.params.idEvento);
    const idClean = Number(idEventoRaw.replace('ev_', '').replace('tar_', ''));
    if (isNaN(idClean)) return res.status(400).json({ error: "ID inválido." });
    
    await pool.query("DELETE FROM tareas WHERE id_tarea = $1 AND tipo = 'Recordatorio'", [idClean]);
    res.json({ message: "Evento eliminado con éxito" });
  } catch (err) { next(err); }
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
    // Importante: Aseguramos que el id sea numérico
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
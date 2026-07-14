import { pool } from "../config/db.js";
import bcrypt from "bcryptjs";

// ==========================================
// 1. OBTENER DATOS (GET)
// ==========================================

export const getAcudienteProfile = async (req, res) => {
  try {
    const idUsuario = req.params.id || req.params.idUsuario;
    const q = 'SELECT * FROM acudientes WHERE id_usuario = $1';
    const { rows } = await pool.query(q, [idUsuario]);
    
    if (rows.length === 0) {
      return res.status(404).json({ error: "Perfil de acudiente no encontrado" });
    }
    
    res.json(rows[0]);
  } catch (err) {
    console.error("Error en getAcudienteProfile:", err);
    res.status(500).json({ error: "Error interno del servidor" });
  }
};

export const getEstudiantesByAcudiente = async (req, res) => {
  try {
    const { idAcudiente } = req.params;
    
    // 👇 EL ARREGLO: Ya no pedimos "e.grado", lo sacamos de la tabla cursos ("c.nombre AS grado")
    const q = `
      SELECT 
        e.id_estudiante AS id, 
        e.nombre_completo AS nombre, 
        e.tipo_doc AS "tipoDoc", 
        e.documento, 
        e.telefono,
        e.correo,
        e.direccion,
        c.nombre AS grado, 
        m.id_curso 
      FROM estudiantes e
      LEFT JOIN matriculas m ON e.id_estudiante = m.id_estudiante AND m.estado = 'Activa'
      LEFT JOIN cursos c ON m.id_curso = c.id_curso
      WHERE e.id_acudiente = $1
      ORDER BY e.id_estudiante
    `;
    const { rows } = await pool.query(q, [idAcudiente]);
    res.json(rows);
  } catch (err) {
    console.error("Error en getEstudiantesByAcudiente:", err);
    res.status(500).json({ error: "Error interno del servidor" });
  }
};

// ==========================================
// 2. ACTUALIZAR DATOS (PUT)
// ==========================================

export const updateAcudienteProfile = async (req, res) => {
  const idUsuario = Number(req.params.id || req.params.idUsuario); 
  
  const nombre = req.body.nombre || req.body.nombre_completo;
  const tipoDoc = req.body.tipoDoc || req.body.tipo_doc;
  const { documento, telefono, correo, direccion } = req.body;
  
  try {
    // 👇 AQUÍ ESTABA EL ERROR: Quitamos el "OR id_acudiente", ahora solo actualiza tu usuario exacto
    const q = `
      UPDATE acudientes 
      SET nombre_completo = $1, tipo_doc = $2, documento = $3, telefono = $4, correo = $5, direccion = $6 
      WHERE id_usuario = $7 
      RETURNING *`;
    const { rows } = await pool.query(q, [nombre, tipoDoc, documento, telefono, correo, direccion, idUsuario]);
    
    if (rows.length === 0) {
      return res.status(404).json({ error: "No se encontró el acudiente en la base de datos" });
    }

    res.json({ message: "Acudiente actualizado", data: rows[0] });
  } catch (err) {
    if (err.code === '23505') {
      return res.status(400).json({ error: "Ese número de documento ya está registrado por otra persona." });
    }
    console.error("❌ ERROR SQL AL ACTUALIZAR ACUDIENTE:", err.message);
    res.status(500).json({ error: "Error de base de datos" });
  }
};

export const updateEstudianteProfile = async (req, res) => {
  const id = req.params.id || req.params.idEstudiante;
  
  // 👇 EL ARREGLO: Quitamos "grado" de la actualización, ya que ahora es automático por la matrícula
  const { nombre, tipoDoc, documento, telefono, correo, direccion } = req.body;
  
  try {
    const q = `
      UPDATE estudiantes 
      SET nombre_completo = $1, tipo_doc = $2, documento = $3, telefono = $4, correo = $5, direccion = $6 
      WHERE id_estudiante = $7 
      RETURNING *`;
      
    // Le pasamos solo las 6 variables que sí existen en la tabla estudiantes
    const { rows } = await pool.query(q, [nombre, tipoDoc, documento, telefono, correo, direccion, id]);
    
    if (rows.length === 0) {
      return res.status(404).json({ error: "No se encontró el estudiante en la base de datos" });
    }

    res.json({ message: "Estudiante actualizado", data: rows[0] });
  } catch (err) {
    console.error("❌ ERROR SQL AL ACTUALIZAR ESTUDIANTE:", err.message);
    res.status(500).json({ error: "Error de base de datos" });
  }
};

// ==========================================
// 3. CAMBIAR CONTRASEÑA (PUT)
// ==========================================

export const changePassword = async (req, res) => {
  const { tipo, id, actual, nueva } = req.body;
  try {
    let id_usuario;
    
    // 👇 También arreglamos esto para que no cambie la contraseña del usuario equivocado
    if (tipo === "acudiente") {
      id_usuario = id; // El Acudiente ya envía el id_usuario directo
    } else {
      const resEstudiante = await pool.query('SELECT id_usuario FROM estudiantes WHERE id_estudiante = $1', [id]);
      if (resEstudiante.rows.length > 0) id_usuario = resEstudiante.rows[0].id_usuario;
    }

    if (!id_usuario) return res.status(404).json({ error: "Usuario no encontrado" });

    const userRes = await pool.query('SELECT password_hash FROM users WHERE id_usuario = $1', [id_usuario]);
    const match = await bcrypt.compare(actual, userRes.rows[0].password_hash);
    
    if (!match) return res.status(400).json({ error: "La contraseña actual es incorrecta" });

    const salt = await bcrypt.genSalt(10);
    const hash = await bcrypt.hash(nueva, salt);

    await pool.query('UPDATE users SET password_hash = $1 WHERE id_usuario = $2', [hash, id_usuario]);
    res.json({ message: "Contraseña actualizada exitosamente" });
  } catch (err) {
    console.error("Error al cambiar contraseña:", err.message);
    res.status(500).json({ error: "Error en el servidor al cambiar contraseña" });
  }
};

export const vincularEstudianteAcudiente = async (req, res) => {
  const { idEstudiante, idAcudiente } = req.body; 
  try {
    const q = `
      UPDATE estudiantes 
      SET id_acudiente = $1 
      WHERE id_estudiante = $2 
      RETURNING *`;
    const { rows } = await pool.query(q, [idAcudiente, idEstudiante]);

    if (rows.length === 0) {
      return res.status(404).json({ error: "Estudiante no encontrado" });
    }
    res.json({ message: "Estudiante vinculado al acudiente exitosamente", data: rows[0] });
  } catch (err) {
    console.error("Error al vincular:", err);
    res.status(500).json({ error: "Error en la base de datos" });
  }
};

// ==========================================
// 4. PLANILLAS, NOTAS Y MATERIAS GLOBALES
// ==========================================

export const getNotasEstudiante = async (req, res) => {
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
    console.error("❌ Error al obtener notas:", err.message);
    res.status(500).json({ error: "Error en el servidor al cargar notas" });
  }
};

export const getTodasLasMaterias = async (req, res) => {
  try {
    const { rows } = await pool.query('SELECT * FROM materias ORDER BY nombre ASC');
    res.json(rows);
  } catch (err) {
    res.status(500).json({ error: "Error al cargar materias" });
  }
};

export const getPlanillaDetalle = async (req, res) => {
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
    console.error("Error al armar planilla:", error);
    res.status(500).json({ error: "Error interno del servidor" });
  }
};

// ==========================================
// 5. EVENTOS CALENDARIO
// ==========================================

export const getEventosCalendario = async (req, res) => {
  try {
    const { idAcudiente } = req.params;
    const q = 'SELECT id_evento, id_acudiente, fecha, titulo, descripcion, color, hora FROM eventos_calendario WHERE id_acudiente = $1 ORDER BY hora ASC';
    const { rows } = await pool.query(q, [idAcudiente]);
    res.json(rows);
  } catch (err) {
    console.error("Error al cargar eventos:", err);
    res.status(500).json({ error: "Error interno del servidor" });
  }
};

export const crearEventoCalendario = async (req, res) => {
  try {
    const { id_acudiente, fecha, titulo, descripcion, color, hora } = req.body;
    const q = `
      INSERT INTO eventos_calendario (id_acudiente, fecha, titulo, descripcion, color, hora) 
      VALUES ($1, $2, $3, $4, $5, $6) RETURNING *`;
    const { rows } = await pool.query(q, [id_acudiente, fecha, titulo, descripcion, color, hora]);
    res.json({ message: "Evento guardado", data: rows[0] });
  } catch (err) {
    console.error("Error al guardar evento:", err);
    res.status(500).json({ error: "Error interno del servidor" });
  }
};

export const deleteEventoCalendario = async (req, res) => {
  try {
    const { idEvento } = req.params;
    await pool.query('DELETE FROM eventos_calendario WHERE id_evento = $1', [idEvento]);
    res.json({ message: "Evento eliminado" });
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: "Error al eliminar" });
  }
};

// ==========================================
// 6. MATRÍCULA EN LÍNEA
// ==========================================

export const getEstadoMatricula = async (req, res) => {
  try {
    const { idEstudiante } = req.params;
    const q = 'SELECT * FROM matriculas WHERE id_estudiante = $1 ORDER BY id_matricula DESC LIMIT 1';
    const { rows } = await pool.query(q, [idEstudiante]);
    
    if (rows.length === 0) {
      return res.json({ estado: "No Iniciado" });
    }
    res.json(rows[0]);
  } catch (err) {
    console.error("Error al obtener estado de matrícula:", err);
    res.status(500).json({ error: "Error interno del servidor" });
  }
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
      const updateQ = `
        UPDATE matriculas 
        SET documentos_url = $1, firma_digital_hash = $2, estado = 'Pendiente', id_curso = $3, fecha_matricula = CURRENT_TIMESTAMP
        WHERE id_estudiante = $4 AND anio_lectivo = $5 RETURNING *`;
      const { rows } = await pool.query(updateQ, [documentos_url, firma_digital_hash, cursoId, estId, anioStr]);
      return res.json({ message: "Matrícula actualizada", data: rows[0] });
    } else {
      const insertQ = `
        INSERT INTO matriculas (id_estudiante, estado, documentos_url, firma_digital_hash, anio_lectivo, id_curso, fecha_matricula)
        VALUES ($1, 'Pendiente', $2, $3, $4, $5, CURRENT_TIMESTAMP) RETURNING *`;
      const { rows } = await pool.query(insertQ, [estId, documentos_url, firma_digital_hash, anioStr, cursoId]);
      return res.json({ message: "Matrícula registrada con éxito", data: rows[0] });
    }
  } catch (err) {
    console.error("❌ ERROR SQL AL PROCESAR MATRÍCULA:", err.message);
    res.status(500).json({ error: "Error interno del servidor" });
  }
};

export const getEstudianteProfile = async (req, res, next) => {
  try {
    const idUsuario = req.params.idUsuario || req.params.id;
    const q = `
      SELECT e.*, u.foto_perfil 
      FROM estudiantes e
      INNER JOIN users u ON e.id_usuario = u.id_usuario
      WHERE e.id_usuario = $1
    `;
    const { rows } = await pool.query(q, [idUsuario]);
    
    if (rows.length === 0) {
      return res.status(404).json({ error: "Perfil de estudiante no encontrado" });
    }
    
    res.json(rows[0]);
  } catch (err) {
    console.error("Error en getEstudianteProfile:", err);
    res.status(500).json({ error: "Error interno del servidor" });
  }
};

export const getHorarioEstudiante = async (req, res, next) => {
  try {
    // Consulta sencilla para traer el horario (puedes ajustarla si tenías una más compleja)
    const q = 'SELECT * FROM horarios ORDER BY dia_semana, bloque_hora';
    const { rows } = await pool.query(q);
    res.json(rows);
  } catch (err) {
    console.error("Error en getHorarioEstudiante:", err);
    res.status(500).json({ error: "Error interno del servidor" });
  }
};

// ==========================================
// OBSERVADOR Y ASISTENCIA (Solo Lectura Acudiente)
// ==========================================
export const getObservacionesAcudiente = async (req, res) => {
  try {
    const idEstudiante = Number(req.params.idEstudiante);
    const q = `
      SELECT o.*, u.username AS nombre_docente, TO_CHAR(o.fecha, 'YYYY-MM-DD HH24:MI') as fecha_formato
      FROM observaciones o
      JOIN docentes d ON o.id_docente = d.id_docente
      JOIN users u ON d.id_usuario = u.id_usuario
      WHERE o.id_estudiante = $1
      ORDER BY o.fecha DESC
    `;
    const { rows } = await pool.query(q, [idEstudiante]);
    res.json(rows);
  } catch (err) {
    console.error("Error al obtener observador acudiente:", err);
    res.status(500).json({ error: "Error en el servidor" });
  }
};

export const getAsistenciaAcudiente = async (req, res) => {
  try {
    const idEstudiante = Number(req.params.idEstudiante);
    const q = `
      SELECT 
        a.estado, 
        m.nombre AS materia, 
        d.nombre_completo AS docente,
        TO_CHAR(a.fecha, 'YYYY-MM-DD') AS fecha_formato
      FROM asistencias a
      JOIN materias m ON a.id_materia = m.id_materia
      JOIN docentes d ON a.id_docente = d.id_docente
      WHERE a.id_estudiante = $1
      ORDER BY a.fecha DESC
    `;
    const { rows } = await pool.query(q, [idEstudiante]);
    res.json(rows);
  } catch (err) {
    console.error("Error al obtener asistencia acudiente:", err);
    res.status(500).json({ error: "Error en el servidor" });
  }
};
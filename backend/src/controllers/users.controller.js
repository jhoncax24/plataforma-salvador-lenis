import { pool } from "../config/db.js";
import bcrypt from "bcryptjs";

// ==========================================
// 1. OBTENER DATOS (GET)
// ==========================================

export const getAcudienteProfile = async (req, res) => {
  try {
    const { idUsuario } = req.params;
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
    const q = 'SELECT * FROM estudiantes WHERE id_acudiente = $1';
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
  const { id } = req.params;
  const { nombre, tipoDoc, documento, telefono, correo, direccion } = req.body;
  
  console.log("=== INTENTANDO ACTUALIZAR ACUDIENTE ===");
  console.log("ID recibido:", id);
  console.log("Nuevos datos:", req.body);

  try {
    const q = `
      UPDATE acudientes 
      SET nombre_completo = $1, tipo_doc = $2, documento = $3, telefono = $4, correo = $5, direccion = $6 
      WHERE id_acudiente = $7 OR id_usuario = $7 
      RETURNING *`;
    const { rows } = await pool.query(q, [nombre, tipoDoc, documento, telefono, correo, direccion, id]);
    
    if (rows.length === 0) {
      console.log("❌ FALLO: No se encontró ningún acudiente con el ID", id);
      return res.status(404).json({ error: "No se encontró el acudiente en la base de datos" });
    }

    console.log("✅ ÉXITO: Acudiente actualizado:", rows[0].nombre_completo);
    res.json({ message: "Acudiente actualizado", data: rows[0] });
  } catch (err) {
    console.error("❌ ERROR SQL AL ACTUALIZAR ACUDIENTE:", err.message);
    res.status(500).json({ error: "Error de base de datos: " + err.message });
  }
};

export const updateEstudianteProfile = async (req, res) => {
  const { id } = req.params;
  // AHORA RECIBIMOS LOS DATOS COMPLETOS
  const { nombre, tipoDoc, documento, telefono, correo, direccion, grado } = req.body;
  
  console.log("=== INTENTANDO ACTUALIZAR ESTUDIANTE ===");
  console.log("Nuevos datos:", req.body);

  try {
    const q = `
      UPDATE estudiantes 
      SET nombre_completo = $1, tipo_doc = $2, documento = $3, telefono = $4, correo = $5, direccion = $6, grado = $7 
      WHERE id_estudiante = $8 
      RETURNING *`;
    const { rows } = await pool.query(q, [nombre, tipoDoc, documento, telefono, correo, direccion, grado, id]);
    
    if (rows.length === 0) {
      return res.status(404).json({ error: "No se encontró el estudiante en la base de datos" });
    }

    console.log("✅ ÉXITO: Estudiante actualizado");
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
    if (tipo === "acudiente") {
      const resAcudiente = await pool.query('SELECT id_usuario FROM acudientes WHERE id_acudiente = $1 OR id_usuario = $1', [id]);
      if (resAcudiente.rows.length > 0) id_usuario = resAcudiente.rows[0].id_usuario;
    } else {
      const resEstudiante = await pool.query('SELECT id_usuario FROM estudiantes WHERE id_estudiante = $1', [id]);
      if (resEstudiante.rows.length > 0) id_usuario = resEstudiante.rows[0].id_usuario;
    }

    if (!id_usuario) return res.status(404).json({ error: "Usuario no encontrado" });

    // Verificamos la contraseña actual
    const userRes = await pool.query('SELECT password_hash FROM users WHERE id_usuario = $1', [id_usuario]);
    const match = await bcrypt.compare(actual, userRes.rows[0].password_hash);
    
    if (!match) return res.status(400).json({ error: "La contraseña actual es incorrecta" });

    // Encriptamos la nueva contraseña
    const salt = await bcrypt.genSalt(10);
    const hash = await bcrypt.hash(nueva, salt);

    // Actualizamos la base de datos
    await pool.query('UPDATE users SET password_hash = $1 WHERE id_usuario = $2', [hash, id_usuario]);
    
    res.json({ message: "Contraseña actualizada exitosamente" });
  } catch (err) {
    console.error("Error al cambiar contraseña:", err);
    res.status(500).json({ error: "Error en el servidor al cambiar contraseña" });
  }
  
};

export const vincularEstudianteAcudiente = async (req, res) => {
  // Recibimos los IDs desde el frontend
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

export const getNotasEstudiante = async (req, res) => {
  try {
    const { idEstudiante } = req.params;
    
    // 1. Corregimos el nombre exacto de tu tabla
    const q = 'SELECT * FROM notas_estudiante WHERE id_estudiante = $1';
    const { rows } = await pool.query(q, [idEstudiante]);

    // 2. Adaptamos los datos para que el Modal de React los entienda perfectamente
    const notasParaElFrontend = rows.map(n => ({
      id: n.id_nota,
      materia: `Materia (ID: ${n.id_materia})`, // Muestra el ID temporalmente hasta que la unamos con la tabla materias
      docente: "Docente por asignar",           // Texto por defecto
      nota_p1: n.nota_p1,
      nota_p2: n.nota_p2,
      nota_p3: n.nota_p3,
      nota_final: n.nota_final
    }));

    res.json(notasParaElFrontend);
  } catch (err) {
    console.error("Error al obtener notas:", err);
    res.status(500).json({ error: "Error en el servidor al cargar notas" });
  }
};

// OBTENER EVENTOS
export const getEventosCalendario = async (req, res) => {
  try {
    const { idAcudiente } = req.params;
    // Traemos también la columna hora
    const q = 'SELECT id_evento, id_acudiente, fecha, titulo, descripcion, color, hora FROM eventos_calendario WHERE id_acudiente = $1 ORDER BY hora ASC';
    const { rows } = await pool.query(q, [idAcudiente]);
    res.json(rows);
  } catch (err) {
    console.error("Error al cargar eventos:", err);
    res.status(500).json({ error: "Error interno del servidor" });
  }
};

// CREAR EVENTO
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

// ELIMINAR EVENTO (Se mantiene igual)
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

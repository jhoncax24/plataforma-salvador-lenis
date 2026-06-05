import { pool } from "../config/db.js";
import bcrypt from "bcrypt";

/* =============================
   ACUDIENTE
   ============================= */
export async function getAcudienteById(req, res, next) {
  const idUsuario = Number(req.params.id); // Ahora recibimos el ID del Login (id_usuario)
  try {
    const { rows } = await pool.query(
      `SELECT id_acudiente AS id, nombre_completo AS nombre, tipo_doc AS "tipoDoc", documento, telefono, correo, direccion 
       FROM acudientes WHERE id_usuario = $1`, [idUsuario]
    );
    if (rows.length === 0) return res.status(404).json({ message: 'Acudiente no encontrado' });
    res.json(rows[0]);
  } catch (err) {
    next(err);
  }
}

export async function getHijosAcudiente(req, res, next) {
  const idUsuario = Number(req.params.id);
  try {
    // Buscamos a los hijos vinculados al id_acudiente de este id_usuario
    const { rows } = await pool.query(
      `SELECT id_estudiante AS id, nombre_completo AS nombre, tipo_doc AS "tipoDoc", documento, grado 
       FROM estudiantes 
       WHERE id_acudiente = (SELECT id_acudiente FROM acudientes WHERE id_usuario = $1) 
       ORDER BY id_estudiante`, [idUsuario]
    );
    res.json(rows);
  } catch (err) {
    next(err);
  }
}

export async function updateAcudiente(req, res, next) {
  const idUsuario = Number(req.params.id);
  const { nombre, tipoDoc, documento, telefono, correo, direccion } = req.body;
  try {
    const { rows } = await pool.query(
      `UPDATE acudientes 
       SET nombre_completo = $1, tipo_doc = $2, documento = $3, telefono = $4, correo = $5, direccion = $6 
       WHERE id_usuario = $7 
       RETURNING id_acudiente AS id, nombre_completo AS nombre, tipo_doc AS "tipoDoc", documento, telefono, correo, direccion`,
      [nombre, tipoDoc, documento, telefono, correo, direccion, idUsuario]
    );
    res.json(rows[0]);
  } catch (err) {
    next(err);
  }
}

export async function updateAcudientePassword(req, res, next) {
  const idUsuario = Number(req.params.id);
  const { actual, nueva } = req.body;
  try {
    // Las contraseñas ahora viven EXCLUSIVAMENTE en la tabla users
    const { rows } = await pool.query('SELECT password_hash FROM users WHERE id_usuario = $1', [idUsuario]);
    if (rows.length === 0) return res.status(404).json({ message: 'Usuario no encontrado' });

    const savedPassword = rows[0].password_hash;
    const isMatch = await bcrypt.compare(actual, savedPassword);
    
    if (!isMatch) return res.status(400).json({ message: 'Contraseña actual incorrecta' });

    const hashedNueva = await bcrypt.hash(nueva, 10);
    await pool.query('UPDATE users SET password_hash = $1 WHERE id_usuario = $2', [hashedNueva, idUsuario]);

    res.json({ message: 'Contraseña actualizada correctamente' });
  } catch (err) {
    next(err);
  }
}

/* =============================
   ESTUDIANTE (Notas)
   ============================= */
// Para los estudiantes, el id que viaja por parámetro desde la tarjeta de notas es el id_estudiante
export async function getNotasEstudiante(req, res, next) {
  const idEstudiante = Number(req.params.id);
  try {
    const { rows } = await pool.query(
      `SELECT n.id_nota AS id, m.nombre AS materia, d.nombre_completo AS docente, n.nota_p1, n.nota_p2, n.nota_p3, n.nota_final 
       FROM notas_estudiante n 
       INNER JOIN materias m ON m.id_materia = n.id_materia 
       LEFT JOIN docentes d ON m.id_docente = d.id_docente
       WHERE n.id_estudiante = $1 ORDER BY m.nombre`, [idEstudiante]
    );
    res.json(rows);
  } catch (err) {
    next(err);
  }
}

export async function updateEstudiante(req, res, next) {
    const idEstudiante = Number(req.params.id);
    const { nombre, tipoDoc, documento, grado } = req.body;
    try {
        const { rows } = await pool.query(
            `UPDATE estudiantes 
             SET nombre_completo = $1, tipo_doc = $2, documento = $3, grado = $4 
             WHERE id_estudiante = $5 
             RETURNING id_estudiante AS id, nombre_completo AS nombre, tipo_doc AS "tipoDoc", documento, grado`,
            [nombre, tipoDoc, documento, grado, idEstudiante]
        );
        res.json(rows[0]);
    } catch (err) {
        next(err);
    }
}

export async function updateEstudiantePassword(req, res, next) {
    const idEstudiante = Number(req.params.id);
    const { actual, nueva } = req.body;
    try {
      // 1. Buscamos cuál es el id_usuario de este estudiante
      const { rows: studentRows } = await pool.query('SELECT id_usuario FROM estudiantes WHERE id_estudiante = $1', [idEstudiante]);
      if (studentRows.length === 0) return res.status(404).json({ message: 'Estudiante no encontrado' });
      
      const idUserEstudiante = studentRows[0].id_usuario;

      // 2. Buscamos y actualizamos su contraseña en la tabla users
      const { rows } = await pool.query('SELECT password_hash FROM users WHERE id_usuario = $1', [idUserEstudiante]);
      const savedPassword = rows[0].password_hash;
      
      const isMatch = await bcrypt.compare(actual, savedPassword);
      if (!isMatch) return res.status(400).json({ message: 'Contraseña actual incorrecta' });
  
      const hashedNueva = await bcrypt.hash(nueva, 10);
      await pool.query('UPDATE users SET password_hash = $1 WHERE id_usuario = $2', [hashedNueva, idUserEstudiante]);
  
      res.json({ message: 'Contraseña actualizada correctamente' });
    } catch (err) {
      next(err);
    }
  }

  // NUEVO: Obtener el perfil de un estudiante a partir del id de usuario (Login)
export async function getEstudianteById(req, res, next) {
  const idUsuario = Number(req.params.id);
  try {
    const { rows } = await pool.query(
      `SELECT e.id_estudiante AS id, e.nombre_completo AS nombre, e.tipo_doc, e.documento, 
              e.fecha_nacimiento, e.grado, a.nombre_completo AS acudiente
       FROM estudiantes e
       LEFT JOIN acudientes a ON e.id_acudiente = a.id_acudiente
       WHERE e.id_usuario = $1`, [idUsuario]
    );
    if (rows.length === 0) return res.status(404).json({ message: 'Estudiante no encontrado' });
    res.json(rows[0]);
  } catch (err) {
    next(err);
  }
}
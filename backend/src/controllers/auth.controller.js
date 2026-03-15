import { pool } from "../config/db.js";
import bcrypt from "bcrypt";
import jwt from "jsonwebtoken";

export async function login(req, res, next) {
  const { username, password } = req.body;
  try {
    // 1. Buscar el usuario en la tabla central
    const { rows: userRows } = await pool.query(
      'SELECT id_usuario, username, password_hash, role, estado FROM users WHERE username = $1',
      [username]
    );

    if (userRows.length === 0) return res.status(401).json({ error: 'Credenciales inválidas' });

    const user = userRows[0];

    // Validar si el usuario está suspendido
    if (user.estado !== 'Activo') return res.status(403).json({ error: 'Usuario inactivo o suspendido' });

    // 2. Verificar contraseña
    const match = await bcrypt.compare(password, user.password_hash);
    if (!match) return res.status(401).json({ error: 'Credenciales inválidas' });

    // 3. Buscar el nombre completo según el rol
    let full_name = 'Usuario del Sistema';
    if (user.role === 'admin') {
        const { rows } = await pool.query('SELECT nombre_completo FROM admins WHERE id_usuario = $1', [user.id_usuario]);
        if(rows.length > 0) full_name = rows[0].nombre_completo;
    } else if (user.role === 'docente') {
        const { rows } = await pool.query('SELECT nombre_completo FROM docentes WHERE id_usuario = $1', [user.id_usuario]);
        if(rows.length > 0) full_name = rows[0].nombre_completo;
    } else if (user.role === 'acudiente') {
        const { rows } = await pool.query('SELECT nombre_completo FROM acudientes WHERE id_usuario = $1', [user.id_usuario]);
        if(rows.length > 0) full_name = rows[0].nombre_completo;
    } else if (user.role === 'estudiante') {
        const { rows } = await pool.query('SELECT nombre_completo FROM estudiantes WHERE id_usuario = $1', [user.id_usuario]);
        if(rows.length > 0) full_name = rows[0].nombre_completo;
    }

    // 4. Generar Token (Asegúrate de tener un JWT_SECRET en tu archivo .env)
    const payload = { id: user.id_usuario, username: user.username, role: user.role };
    const token = jwt.sign(payload, process.env.JWT_SECRET || 'cesl_secret_key_2024', { expiresIn: process.env.JWT_EXPIRES_IN || '8h' });

    // 5. Responder al frontend (Devolvemos id_usuario como "id" para mantener compatibilidad)
    res.json({ 
        token, 
        user: { 
            id: user.id_usuario, 
            username: user.username, 
            full_name: full_name, 
            role: user.role 
        } 
    });
  } catch (err) {
    next(err);
  }
}

export async function register(req, res, next) {
  // Recibimos los datos desde Thunder Client
  const { username, password, role, nombre_completo, documento } = req.body;
  
  try {
    // 1. Encriptamos la contraseña con el bcrypt de tu proyecto (¡Garantía de que funcionará!)
    const password_hash = await bcrypt.hash(password, 10);

    // 2. Creamos el usuario en la tabla central (users)
    const { rows: userRows } = await pool.query(
      'INSERT INTO users (username, password_hash, role) VALUES ($1, $2, $3) RETURNING id_usuario',
      [username, password_hash, role]
    );
    const idUsuario = userRows[0].id_usuario;

    // 3. Lo vinculamos a su tabla de perfil según el rol
    if (role === 'acudiente') {
      await pool.query(
        'INSERT INTO acudientes (id_usuario, nombre_completo, documento) VALUES ($1, $2, $3)',
        [idUsuario, nombre_completo, documento]
      );
    } else if (role === 'estudiante') {
      await pool.query(
        'INSERT INTO estudiantes (id_usuario, nombre_completo, documento) VALUES ($1, $2, $3)',
        [idUsuario, nombre_completo, documento]
      );
    } else if (role === 'docente') {
      await pool.query(
        'INSERT INTO docentes (id_usuario, nombre_completo, documento) VALUES ($1, $2, $3)',
        [idUsuario, nombre_completo, documento]
      );
    }

    res.status(201).json({ message: 'Usuario creado y vinculado exitosamente' });
  } catch (err) {
    console.error("Error en registro:", err);
    res.status(500).json({ error: 'Hubo un error al crear el usuario en la BD' });
  }
}
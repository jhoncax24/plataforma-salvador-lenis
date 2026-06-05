import { pool } from "../config/db.js";
import bcrypt from "bcrypt";
import jwt from "jsonwebtoken";
import crypto from "crypto";
// Importaremos el servicio de correo (que crearemos en el siguiente paso)
import { enviarCorreoCodigo } from "../services/mailer.service.js";

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

// ====================================================
// =        MÓDULO DE RECUPERACIÓN DE CONTRASEÑA      =
// ====================================================

// 1. Solicitar Código
export async function solicitarCodigo(req, res, next) {
    const { documento } = req.body;
    try {
        // A. Buscar usuario por documento (unificando tablas)
        const { rows } = await pool.query(
            `SELECT u.id_usuario, u.username, u.email 
             FROM users u 
             JOIN estudiantes e ON u.id_usuario = e.id_usuario 
             WHERE e.documento = $1
             UNION
             SELECT u.id_usuario, u.username, u.email 
             FROM users u 
             JOIN docentes d ON u.id_usuario = d.id_usuario 
             WHERE d.documento = $1
             UNION
             SELECT u.id_usuario, u.username, u.email 
             FROM users u 
             JOIN acudientes a ON u.id_usuario = a.id_usuario 
             WHERE a.documento = $1`, [documento]
        );

        if (rows.length === 0) return res.status(404).json({ message: 'Documento no encontrado' });
        
        const user = rows[0];
        // En este paso usamos el correo real del usuario (u.email). Si no lo tienes en BD, usa uno de prueba:
        const userEmail = user.email || "tu.correo.prueba@gmail.com"; 

        // B. Generar código aleatorio de 6 dígitos
        const code = crypto.randomInt(100000, 999999).toString();
        
        // C. Hashear y guardar en BD (vence en 15 min)
        const codeHash = await bcrypt.hash(code, 10);
        // Formatear fecha para PostgreSQL
        const expiresAt = new Date(Date.now() + 15 * 60 * 1000).toISOString();

        await pool.query(
            'INSERT INTO password_resets (id_usuario, code_hash, expires_at) VALUES ($1, $2, $3)',
            [user.id_usuario, codeHash, expiresAt]
        );

        // D. Enviar Email Real
        await enviarCorreoCodigo(userEmail, code);

        res.json({ message: 'Código enviado al correo', id_usuario: user.id_usuario });

    } catch (err) { next(err); }
}

// 2. Verificar Código
export async function verificarCodigo(req, res, next) {
    const { id_usuario, code } = req.body;
    try {
        const { rows } = await pool.query(
            'SELECT code_hash FROM password_resets WHERE id_usuario = $1 AND expires_at > NOW() ORDER BY created_at DESC LIMIT 1',
            [id_usuario]
        );

        if (rows.length === 0) return res.status(400).json({ message: 'Código expirado o inválido' });

        const validCode = await bcrypt.compare(code, rows[0].code_hash);
        if (!validCode) return res.status(400).json({ message: 'Código incorrecto' });

        res.json({ message: 'Código verificado exitosamente' });

    } catch (err) { next(err); }
}

// 3. Cambiar Contraseña Final
export async function cambiarPasswordFinal(req, res, next) {
    const { id_usuario, newPassword, code } = req.body;
    try {
        // Volvemos a verificar el código por seguridad estricta
        const { rows: resetRows } = await pool.query(
            'SELECT code_hash FROM password_resets WHERE id_usuario = $1 AND expires_at > NOW() ORDER BY created_at DESC LIMIT 1',
            [id_usuario]
        );

        if (resetRows.length === 0) return res.status(400).json({ message: 'Sesión expirada' });
        const validCode = await bcrypt.compare(code, resetRows[0].code_hash);
        if (!validCode) return res.status(400).json({ message: 'Seguridad violada' });

        // Hashear nueva contraseña
        const passwordHash = await bcrypt.hash(newPassword, 10);

        // Actualizar tabla users
        await pool.query('UPDATE users SET password_hash = $1 WHERE id_usuario = $2', [passwordHash, id_usuario]);

        // Borrar el código usado
        await pool.query('DELETE FROM password_resets WHERE id_usuario = $1', [id_usuario]);

        res.json({ message: 'Contraseña actualizada exitosamente' });

    } catch (err) { next(err); }
}
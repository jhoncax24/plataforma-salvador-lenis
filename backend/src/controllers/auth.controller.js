import { pool } from "../config/db.js";
import bcrypt from "bcryptjs";
import jwt from "jsonwebtoken";
import crypto from "crypto";
// Importaremos el servicio de correo
import { enviarCorreoCodigo } from "../services/mailer.service.js";

export async function login(req, res, next) {
  const { username, password } = req.body;
  try {
    // 1. Buscar el usuario en la tabla central (¡Añadimos foto_perfil aquí!)
    const { rows: userRows } = await pool.query(
      'SELECT id_usuario, username, password_hash, role, estado, foto_perfil FROM users WHERE username = $1',
      [username]
    );

    if (userRows.length === 0) return res.status(401).json({ error: 'Credenciales inválidas' });

    const user = userRows[0];

    // Validar si el usuario está suspendido
    if (user.estado !== 'Activo') return res.status(403).json({ error: 'Usuario inactivo o suspendido' });

    // 2. Verificar contraseña
    const match = await bcrypt.compare(password, user.password_hash);
    if (!match) return res.status(401).json({ error: 'Credenciales inválidas' });

 // 3. Buscar el nombre completo y datos extra según el rol
    let full_name = 'Usuario del Sistema';
    let telefono = '';
    let correo = user.email || ''; // Fallback al email de la tabla users

    if (user.role === 'admin') {
        const { rows } = await pool.query('SELECT nombre_completo, correo FROM admins WHERE id_usuario = $1', [user.id_usuario]);
        if(rows.length > 0) {
            full_name = rows[0].nombre_completo;
            correo = rows[0].correo || correo;
        }
    } else if (user.role === 'docente') {
        // 👇 AQUI TRAEMOS EL TELEFONO Y CORREO DE LA TABLA DOCENTES
        const { rows } = await pool.query('SELECT nombre_completo, telefono, correo FROM docentes WHERE id_usuario = $1', [user.id_usuario]);
        if(rows.length > 0) {
            full_name = rows[0].nombre_completo;
            telefono = rows[0].telefono;
            correo = rows[0].correo || correo;
        }
    } else if (user.role === 'acudiente') {
        const { rows } = await pool.query('SELECT nombre_completo, telefono, correo FROM acudientes WHERE id_usuario = $1', [user.id_usuario]);
        if(rows.length > 0) {
            full_name = rows[0].nombre_completo;
            telefono = rows[0].telefono;
            correo = rows[0].correo || correo;
        }
    } else if (user.role === 'estudiante') {
        const { rows } = await pool.query('SELECT nombre_completo, telefono, correo FROM estudiantes WHERE id_usuario = $1', [user.id_usuario]);
        if(rows.length > 0) {
            full_name = rows[0].nombre_completo;
            telefono = rows[0].telefono;
            correo = rows[0].correo || correo;
        }
    }

    // 4. Generar Token (Esto se queda igual)
    const payload = { id: user.id_usuario, username: user.username, role: user.role };
    const token = jwt.sign(payload, process.env.JWT_SECRET, { expiresIn: process.env.JWT_EXPIRES_IN || '24h' });

    // 5. Responder al frontend (¡Añadimos teléfono y correo al objeto final!)
    res.json({ 
        token, 
        user: { 
            id: user.id_usuario, 
            username: user.username, 
            full_name: full_name, 
            role: user.role,
            foto_perfil: user.foto_perfil,
            telefono: telefono, // <-- Nuevo dato
            correo: correo      // <-- Nuevo dato
        } 
    });
  } catch (err) {
    next(err);
  }
}

// ====================================================
// =        MÓDULO DE REGISTRO CON TRANSACCIÓN        =
// ====================================================
export async function register(req, res, next) {
  // Recibimos los datos desde Thunder Client / Frontend
  const { username, password, role, nombre_completo, documento, correo } = req.body;
  
  // Solicitamos un cliente exclusivo para garantizar la Transacción SQL
  const client = await pool.connect();

  try {
    // Iniciamos la transacción (Si algo falla más adelante, nada de esto se guarda)
    await client.query('BEGIN');

    // 1. Encriptamos la contraseña
    const password_hash = await bcrypt.hash(password, 10);

    // 2. Creamos el usuario en la tabla central (users)
    const { rows: userRows } = await client.query(
      'INSERT INTO users (username, password_hash, role) VALUES ($1, $2, $3) RETURNING id_usuario',
      [username, password_hash, role]
    );
    const idUsuario = userRows[0].id_usuario;

    // 3. Lo vinculamos a su tabla de perfil según el rol
    if (role === 'acudiente') {
      await client.query(
        'INSERT INTO acudientes (id_usuario, nombre_completo, documento) VALUES ($1, $2, $3)',
        [idUsuario, nombre_completo, documento]
      );
    } else if (role === 'estudiante') {
      await client.query(
        'INSERT INTO estudiantes (id_usuario, nombre_completo, documento) VALUES ($1, $2, $3)',
        [idUsuario, nombre_completo, documento]
      );
    } else if (role === 'docente') {
      await client.query(
        'INSERT INTO docentes (id_usuario, nombre_completo, documento) VALUES ($1, $2, $3)',
        [idUsuario, nombre_completo, documento]
      );
    } else if (role === 'admin') {
      // Los administradores no tienen documento en la BD, pero sí correo
      await client.query(
        'INSERT INTO admins (id_usuario, nombre_completo, correo) VALUES ($1, $2, $3)',
        [idUsuario, nombre_completo, correo || null]
      );
    } else {
        throw new Error("Rol no válido");
    }

    // 4. Si todo salió perfecto, confirmamos los cambios en la BD
    await client.query('COMMIT'); 

    res.status(201).json({ message: 'Usuario creado y vinculado exitosamente' });
  } catch (err) {
    // Si hubo cualquier error, cancelamos la creación del usuario en ambas tablas
    await client.query('ROLLBACK'); 
    
    console.error("Error en registro:", err);
    
    // 23505 es el código de PostgreSQL para "Violación de llave única" (Duplicados)
    if (err.code === '23505') {
        return res.status(400).json({ error: 'El nombre de usuario o el documento ya se encuentran registrados en el sistema.' });
    }
    
    res.status(500).json({ error: 'Hubo un error al crear el usuario en la BD' });
  } finally {
    // Liberamos el cliente para que otros procesos puedan usar la BD
    client.release();
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
        const userEmail = user.email || "tu.correo.prueba@gmail.com"; 

        // B. Generar código aleatorio de 6 dígitos
        const code = crypto.randomInt(100000, 999999).toString();
        
        // C. Hashear y guardar en BD (vence en 15 min)
        const codeHash = await bcrypt.hash(code, 10);
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
        const { rows: resetRows } = await pool.query(
            'SELECT code_hash FROM password_resets WHERE id_usuario = $1 AND expires_at > NOW() ORDER BY created_at DESC LIMIT 1',
            [id_usuario]
        );

        if (resetRows.length === 0) return res.status(400).json({ message: 'Sesión expirada' });
        const validCode = await bcrypt.compare(code, resetRows[0].code_hash);
        if (!validCode) return res.status(400).json({ message: 'Seguridad violada' });

        const passwordHash = await bcrypt.hash(newPassword, 10);

        await pool.query('UPDATE users SET password_hash = $1 WHERE id_usuario = $2', [passwordHash, id_usuario]);

        await pool.query('DELETE FROM password_resets WHERE id_usuario = $1', [id_usuario]);

        res.json({ message: 'Contraseña actualizada exitosamente' });

    } catch (err) { next(err); }
}
import { pool } from '../config/db.js';
// Asegúrate de que la ruta hacia mailer.service.js sea correcta según tus carpetas
import { enviarCorreoNuevoMensaje } from '../services/mailer.service.js';

/**
 * DOCUMENTACIÓN: enviarMensaje
 * Guarda un mensaje en la BD y llama al servicio de correos para notificar en segundo plano.
 */
export const enviarMensaje = async (req, res) => {
    const { id_emisor, id_receptor, mensaje } = req.body;

    if (!id_emisor || !id_receptor || !mensaje?.trim()) {
        return res.status(400).json({ 
            ok: false, 
            error: 'El emisor, receptor y mensaje son obligatorios.' 
        });
    }

    try {
        // 1. Guardar el mensaje
        const queryInsert = `
            INSERT INTO mensajes_chat (id_emisor, id_receptor, mensaje)
            VALUES ($1, $2, $3)
            RETURNING *;
        `;
        const { rows } = await pool.query(queryInsert, [id_emisor, id_receptor, mensaje.trim()]);
        const mensajeGuardado = rows[0];

        // 2. Responder INMEDIATAMENTE al frontend (experiencia fluida para el usuario)
        res.status(201).json({
            ok: true,
            mensaje: 'Mensaje enviado exitosamente.',
            data: mensajeGuardado
        });

        // 3. EN SEGUNDO PLANO: Buscar datos y enviar correo
        try {
            const queryDatosCorreo = `
                SELECT 
                    u_receptor.email AS email_receptor,
                    COALESCE(d_emisor.nombre_completo, a_emisor.nombre_completo, u_emisor.email) AS nombre_emisor
                FROM users u_receptor
                LEFT JOIN users u_emisor ON u_emisor.id_usuario = $1
                LEFT JOIN docentes d_emisor ON u_emisor.id_usuario = d_emisor.id_usuario
                LEFT JOIN acudientes a_emisor ON u_emisor.id_usuario = a_emisor.id_usuario
                WHERE u_receptor.id_usuario = $2;
            `;
            
            const datosResult = await pool.query(queryDatosCorreo, [id_emisor, id_receptor]);
            
            if (datosResult.rows.length > 0) {
                const { email_receptor, nombre_emisor } = datosResult.rows[0];
                
                // Llamamos a tu servicio centralizado de correos
                await enviarCorreoNuevoMensaje(email_receptor, nombre_emisor);
            }
        } catch (errorCorreo) {
            console.error('⚠️ Error al procesar datos para el correo de chat:', errorCorreo);
        }

    } catch (error) {
        if (error.code === '23503') {
            return res.status(404).json({
                ok: false,
                error: 'El usuario emisor o receptor no existe en la plataforma.'
            });
        }
        console.error('❌ Error no controlado al enviar mensaje:', error);
        if (!res.headersSent) {
            return res.status(500).json({ ok: false, error: 'Error interno del servidor.' });
        }
    }
};
/**
 * DOCUMENTACIÓN: obtenerConversacion
 * Retorna el historial de mensajes entre dos usuarios y marca como leídos
 * los mensajes recibidos.
 */
export const obtenerConversacion = async (req, res) => {
    const { id_usuario1, id_usuario2 } = req.params;

    try {
        // 1. Marcar como leídos los mensajes no leídos dirigidos a usuario1
        await pool.query(
            `UPDATE mensajes_chat SET leido = TRUE WHERE id_emisor = $1 AND id_receptor = $2 AND leido = FALSE`,
            [id_usuario2, id_usuario1]
        );

        // 2. Obtener historial (Cambiamos u_emisor.rol por u_emisor.role)
        const query = `
            SELECT 
                m.id_mensaje,
                m.id_emisor,
                m.id_receptor,
                m.mensaje,
                m.leido,
                m.fecha_envio,
                u_emisor.role AS rol_emisor,
                COALESCE(d_emisor.nombre_completo, a_emisor.nombre_completo, u_emisor.email) AS nombre_emisor
            FROM mensajes_chat m
            JOIN users u_emisor ON m.id_emisor = u_emisor.id_usuario
            LEFT JOIN docentes d_emisor ON u_emisor.id_usuario = d_emisor.id_usuario
            LEFT JOIN acudientes a_emisor ON u_emisor.id_usuario = a_emisor.id_usuario
            WHERE (m.id_emisor = $1 AND m.id_receptor = $2)
               OR (m.id_emisor = $2 AND m.id_receptor = $1)
            ORDER BY m.fecha_envio ASC;
        `;
        const { rows } = await pool.query(query, [id_usuario1, id_usuario2]);

        return res.json({
            ok: true,
            mensajes: rows
        });
    } catch (error) {
        console.error('❌ Error al consultar conversación:', error);
        return res.status(500).json({ ok: false, error: 'Error al consultar el historial de mensajes.' });
    }
};

/**
 * DOCUMENTACIÓN: obtenerContactos
 * Retorna la lista de usuarios con los que se ha entablado conversación.
 */
export const obtenerContactos = async (req, res) => {
    const { id_usuario } = req.params;

    try {
        // Cambiamos u.rol por u.role
        const query = `
            SELECT DISTINCT ON (contacto_id)
                contacto_id,
                nombre_contacto,
                rol_contacto,
                ultimo_mensaje,
                fecha_ultimo_mensaje,
                (
                    SELECT COUNT(*) 
                    FROM mensajes_chat 
                    WHERE id_emisor = contacto_id AND id_receptor = $1 AND leido = FALSE
                ) AS no_leidos
            FROM (
                SELECT 
                    CASE WHEN id_emisor = $1 THEN id_receptor ELSE id_emisor END AS contacto_id,
                    m.mensaje AS ultimo_mensaje,
                    m.fecha_envio AS fecha_ultimo_mensaje,
                    u.role AS rol_contacto,
                    COALESCE(d.nombre_completo, a.nombre_completo, u.email) AS nombre_contacto
                FROM mensajes_chat m
                JOIN users u ON (u.id_usuario = CASE WHEN m.id_emisor = $1 THEN m.id_receptor ELSE m.id_emisor END)
                LEFT JOIN docentes d ON u.id_usuario = d.id_usuario
                LEFT JOIN acudientes a ON u.id_usuario = a.id_usuario
                WHERE m.id_emisor = $1 OR m.id_receptor = $1
                ORDER BY m.fecha_envio DESC
            ) sub
            ORDER BY contacto_id, fecha_ultimo_mensaje DESC;
        `;
        const { rows } = await pool.query(query, [id_usuario]);

        return res.json({
            ok: true,
            contactos: rows
        });
    } catch (error) {
        console.error('❌ Error al obtener contactos:', error);
        return res.status(500).json({ ok: false, error: 'Error al cargar la lista de contactos.' });
    }
};

/**
 * DOCUMENTACIÓN: buscarContactos
 * Busca usuarios para iniciar un chat.
 * - Si es acudiente: Busca docentes por su nombre.
 * - Si es docente: Busca ESTUDIANTES por nombre, y retorna los datos de su acudiente.
 */
export const buscarContactos = async (req, res) => {
    const { id_usuario } = req.params;
    const { q } = req.query;

    if (!q || q.length < 2) {
        return res.json({ ok: true, resultados: [] });
    }

    try {
        const userQuery = await pool.query('SELECT role FROM users WHERE id_usuario = $1', [id_usuario]);
        if (userQuery.rows.length === 0) return res.status(404).json({ error: 'Usuario no encontrado' });
        const rolUsuario = userQuery.rows[0].role;

        let query = '';
        let values = [`%${q}%`];

        if (rolUsuario === 'acudiente') {
            // El acudiente busca al docente por nombre
            query = `
                SELECT 
                    u.id_usuario AS contacto_id, 
                    d.nombre_completo AS nombre_contacto, 
                    u.role AS rol_contacto
                FROM users u
                JOIN docentes d ON u.id_usuario = d.id_usuario
                WHERE d.nombre_completo ILIKE $1
                LIMIT 10;
            `;
        } else if (rolUsuario === 'docente') {
            // El docente busca al ESTUDIANTE, pero obtiene el chat del ACUDIENTE
            query = `
                SELECT 
                    u.id_usuario AS contacto_id, 
                    a.nombre_completo AS nombre_contacto, 
                    u.role AS rol_contacto,
                    e.nombre_completo AS nombre_estudiante
                FROM estudiantes e
                JOIN acudientes a ON e.id_acudiente = a.id_acudiente
                JOIN users u ON a.id_usuario = u.id_usuario
                WHERE e.nombre_completo ILIKE $1
                LIMIT 10;
            `;
        } else {
            return res.json({ ok: true, resultados: [] });
        }

        const { rows } = await pool.query(query, values);
        return res.json({ ok: true, resultados: rows });

    } catch (error) {
        console.error('❌ Error al buscar contactos:', error);
        return res.status(500).json({ ok: false, error: 'Error al buscar contactos.' });
    }
};
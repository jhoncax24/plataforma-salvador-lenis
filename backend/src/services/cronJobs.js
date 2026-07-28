import cron from 'node-cron';
import { pool } from '../config/db.js'; 
// AGREGAMOS LA FUNCIÓN FALTANTE EN LA IMPORTACIÓN 👇
import { enviarCorreoRecordatorio, enviarCorreoCierreMatricula } from './mailer.service.js';

// =========================================================
// CRON JOB 1: RECORDATORIOS DE TAREAS
// =========================================================
// Se ejecuta todos los días a las 5:00 AM
cron.schedule('0 5 * * *', async () => {
    console.log("⏰ Iniciando proceso diario de recordatorios...");

    try {
        const query = `
            -- =========================================================
            -- 1. RECORDATORIOS PRIVADOS (Creados por ESTUDIANTES)
            -- =========================================================
            SELECT 
                t.titulo, 
                t.fecha_entrega, 
                e.nombre_completo AS nombre_estudiante, 
                ue.email AS email_estudiante,
                a.nombre_completo AS nombre_acudiente, 
                ua.email AS email_acudiente,
                (t.fecha_entrega - CURRENT_DATE) AS dias_restantes
            FROM tareas t
            JOIN estudiantes e ON t.id_usuario = e.id_usuario
            JOIN users ue ON e.id_usuario = ue.id_usuario
            LEFT JOIN acudientes a ON e.id_acudiente = a.id_acudiente
            LEFT JOIN users ua ON a.id_usuario = ua.id_usuario
            WHERE 
                t.id_curso IS NULL -- Asegura que es privada
                AND (t.fecha_entrega = CURRENT_DATE + INTERVAL '3 days' OR t.fecha_entrega = CURRENT_DATE + INTERVAL '1 day')

            UNION

            -- =========================================================
            -- 2. RECORDATORIOS GLOBALES (Creados para un CURSO)
            -- =========================================================
            SELECT 
                t.titulo, 
                t.fecha_entrega, 
                e.nombre_completo AS nombre_estudiante, 
                ue.email AS email_estudiante,
                a.nombre_completo AS nombre_acudiente, 
                ua.email AS email_acudiente,
                (t.fecha_entrega - CURRENT_DATE) AS dias_restantes
            FROM tareas t
            JOIN matriculas m ON t.id_curso = m.id_curso
            JOIN estudiantes e ON m.id_estudiante = e.id_estudiante
            JOIN users ue ON e.id_usuario = ue.id_usuario
            LEFT JOIN acudientes a ON e.id_acudiente = a.id_acudiente
            LEFT JOIN users ua ON a.id_usuario = ua.id_usuario
            WHERE 
                t.id_curso IS NOT NULL -- Asegura que es global del curso
                AND (t.fecha_entrega = CURRENT_DATE + INTERVAL '3 days' OR t.fecha_entrega = CURRENT_DATE + INTERVAL '1 day')

            UNION

            -- =========================================================
            -- 3. RECORDATORIOS PRIVADOS (Creados por DOCENTES)
            -- =========================================================
            SELECT 
                t.titulo, 
                t.fecha_entrega, 
                d.nombre_completo AS nombre_estudiante, -- Reusamos la variable para la plantilla
                ud.email AS email_estudiante,           -- Enviamos al correo del docente
                NULL AS nombre_acudiente,               -- El docente no tiene acudiente
                NULL AS email_acudiente,
                (t.fecha_entrega - CURRENT_DATE) AS dias_restantes
            FROM tareas t
            JOIN docentes d ON t.id_usuario = d.id_usuario
            JOIN users ud ON d.id_usuario = ud.id_usuario
            WHERE 
                t.id_curso IS NULL -- Asegura que es privada
                AND (t.fecha_entrega = CURRENT_DATE + INTERVAL '3 days' OR t.fecha_entrega = CURRENT_DATE + INTERVAL '1 day');
        `;

        const { rows } = await pool.query(query);

        if (rows.length === 0) {
            console.log("✅ No hay tareas próximas para notificar en este momento.");
            return; // Detenemos la ejecución aquí si no hay datos
        }

        console.log(`📩 Se encontraron ${rows.length} recordatorios por enviar.`);

        for (const recordatorio of rows) {
            if (!recordatorio.email_estudiante) {
                console.log(`⚠️ Se omitió el envío a ${recordatorio.nombre_estudiante} porque no tiene correo registrado.`);
                continue; 
            }

            console.log(`🔍 Intentando enviar correo a: ${recordatorio.email_estudiante}`);
            
            await enviarCorreoRecordatorio(recordatorio, recordatorio.dias_restantes);
        }

    } catch (error) {
        console.error("❌ Error en la consulta o ejecución del Cron Job:", error);
    }
});

// =========================================================
// CRON JOB 2: VERIFICAR CIERRE DE MATRÍCULAS 
// =========================================================
cron.schedule('0 5 * * *', async () => {
    console.log("⏰ Verificando estado de cierre de matrículas...");
    
    try {
        const query = `
            SELECT DISTINCT 
                ac.nombre_completo, 
                ac.correo, 
                u.email,
                m.fecha_limite
            FROM matriculas m
            JOIN estudiantes e ON m.id_estudiante = e.id_estudiante
            JOIN acudientes ac ON e.id_acudiente = ac.id_acudiente
            LEFT JOIN users u ON ac.id_usuario = u.id_usuario
            WHERE m.fecha_limite < CURRENT_TIMESTAMP
              AND m.estado IN ('No Iniciado', 'Pendiente')
        `;
        
        const { rows } = await pool.query(query);
        console.log("🔍 Registros encontrados para cierre de matrícula:", rows);

        if (rows.length === 0) {
            console.log("✅ No hay alertas de cierre de matrícula pendientes por enviar.");
            return;
        }

        console.log(`📩 Enviando avisos de cierre de matrícula a ${rows.length} acudientes...`);

        for (const item of rows) {
            const fechaFormateada = new Date(item.fecha_limite).toLocaleDateString('es-ES', { 
                year: 'numeric', 
                month: 'long', 
                day: 'numeric' 
            });
            // Esta función ahora se ejecutará correctamente gracias a la importación
            await enviarCorreoCierreMatricula(item, fechaFormateada);
        }
    } catch (error) {
        console.error("❌ Error en Cron Job de Cierre de Matrículas:", error);
    }
});
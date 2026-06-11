import cron from 'node-cron';
import { pool } from '../config/db.js'; 
import { enviarCorreoRecordatorio } from './mailer.service.js';

// Se ejecuta todos los días a las 7:00 AM
cron.schedule('0 7 * * *', async () => {
    console.log("⏰ Iniciando proceso diario de recordatorios...");

    try {
        const query = `
            SELECT 
                t.titulo, 
                t.fecha_entrega, 
                e.nombre_completo AS nombre_estudiante, 
                e.correo AS email_estudiante, 
                a.nombre_completo AS nombre_acudiente, 
                a.correo AS email_acudiente,
                (t.fecha_entrega - CURRENT_DATE) AS dias_restantes
            FROM tareas t
            -- 👇 AQUÍ ESTÁ LA CORRECCIÓN CLAVE 👇
            JOIN estudiantes e ON t.id_usuario = e.id_usuario
            JOIN acudientes a ON e.id_acudiente = a.id_acudiente
            WHERE 
                t.fecha_entrega = CURRENT_DATE + INTERVAL '3 days'
                OR 
                t.fecha_entrega = CURRENT_DATE + INTERVAL '1 day';
        `;

        const { rows } = await pool.query(query);

        if (rows.length === 0) {
            console.log("✅ No hay tareas próximas para notificar en este momento.");
            return; // Detenemos la ejecución aquí si no hay datos
        }

        console.log(`📩 Se encontraron ${rows.length} recordatorios por enviar.`);

        // Solo AQUÍ ADENTRO existe la variable "recordatorio"
        for (const recordatorio of rows) {
            console.log(`🔍 Intentando enviar correo a: ${recordatorio.email_estudiante}`);
            
            // Llamamos a tu servicio de mailer
            await enviarCorreoRecordatorio(recordatorio, recordatorio.dias_restantes);
        }

    } catch (error) {
        console.error("❌ Error en la consulta o ejecución del Cron Job:", error);
    }
});
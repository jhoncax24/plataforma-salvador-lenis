import { Resend } from 'resend';
import dotenv from 'dotenv';

dotenv.config();

// Inicializamos el cliente de Resend con la clave de entorno
const resend = new Resend(process.env.RESEND_API_KEY);

// IMPORTANTE: Mientras estés en el modo de prueba de Resend,
// el remitente DEBE ser 'onboarding@resend.dev'
const emailRemitente = 'Soporte CESL <onboarding@resend.dev>';

// ==========================================
// FUNCIÓN 1: CÓDIGO DE RECUPERACIÓN DE CONTRASEÑA
// ==========================================
export const enviarCorreoCodigo = async (destinatario, codigo) => {
    try {
        console.log(`🔑 [RECUPERACIÓN] Intentando enviar código (${codigo}) a: ${destinatario} vía API`);

        const { data, error } = await resend.emails.send({
            from: emailRemitente,
            // En modo prueba de Resend, solo puedes enviar correos a la dirección con la que creaste tu cuenta
            to: [destinatario], 
            subject: 'Código de Recuperación de Contraseña - CESL',
            html: `
                <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto; padding: 20px; border: 1px solid #ddd; border-radius: 8px;">
                    <h2 style="color: #0033a0; text-align: center;">Centro Educativo Salvador Lenis</h2>
                    <hr style="border: none; border-top: 1px solid #eee; margin: 20px 0;" />
                    <p style="font-size: 16px; color: #333;">Hola,</p>
                    <p style="font-size: 16px; color: #333;">Hemos recibido una solicitud para restablecer tu contraseña. Ingresa el siguiente código en la plataforma:</p>
                    
                    <div style="text-align: center; margin: 30px 0;">
                        <span style="font-size: 32px; font-weight: bold; letter-spacing: 8px; color: #0033a0; background-color: #f4f6f9; padding: 15px 30px; border-radius: 8px; border: 2px dashed #0033a0; display: inline-block;">
                            ${codigo}
                        </span>
                    </div>
                    
                    <p style="font-size: 14px; color: #666; text-align: center;">Este código <strong>expirará en 15 minutos</strong>.</p>
                </div>
            `
        });

        if (error) {
            throw error;
        }

        console.log(`✉️ [RECUPERACIÓN] Correo enviado exitosamente. ID: ${data?.id}`);
        return data;

    } catch (error) {
        console.error("❌ [RECUPERACIÓN] Error al enviar el correo:", error);
        throw new Error("No se pudo enviar el correo de recuperación");
    }
};

// ==========================================
// FUNCIÓN 2: NUEVA FUNCIÓN DE RECORDATORIOS
// ==========================================
export const enviarCorreoRecordatorio = async (tarea, diasFaltantes) => {
    try {
        const mensajeDias = diasFaltantes > 1 ? '3 días' : '1 día';
        const fechaFormateada = new Date(tarea.fecha_entrega).toLocaleDateString('es-ES');
        
        // Armamos el arreglo de destinatarios
        const destinatarios = [tarea.email_estudiante];
        if (tarea.email_acudiente) destinatarios.push(tarea.email_acudiente);

        const { data, error } = await resend.emails.send({
            from: emailRemitente,
            to: destinatarios,
            subject: `⏰ Recordatorio de Tarea: ${tarea.titulo}`,
            html: `
                <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto; padding: 20px; border: 1px solid #ddd; border-radius: 8px;">
                    <h2 style="color: #0033a0; text-align: center;">Centro Educativo Salvador Lenis</h2>
                    <h3 style="color: #333;">¡Hola, ${tarea.nombre_estudiante}!</h3>
                    <p style="font-size: 16px; color: #333;">Falta exactamente <strong>${mensajeDias}</strong> para la entrega de tu tarea:</p>
                    <div style="background-color: #f4f6f9; padding: 15px; border-left: 5px solid #ffc107; margin: 20px 0;">
                        <h3 style="margin: 0; color: #0033a0;">${tarea.titulo}</h3>
                        <p style="margin: 5px 0 0 0; color: #555;">Fecha límite: <strong>${fechaFormateada}</strong></p>
                    </div>
                </div>
            `
        });

        if (error) throw error;
        console.log(`📧 Recordatorio enviado con éxito.`);
    } catch (error) {
        console.error("❌ Error al enviar recordatorio:", error);
    }
};

// ==========================================
// FUNCIÓN 3: ALERTA DE NUEVA ACTIVIDAD CREADA
// ==========================================
export const enviarCorreoNuevaActividad = async (correosDestino, datosActividad) => {
    try {
        const fechaFormateada = new Date(`${datosActividad.fecha_entrega}T00:00:00`).toLocaleDateString('es-ES');

        const { data, error } = await resend.emails.send({
            from: emailRemitente,
            to: correosDestino, // En Resend enviamos directamente en el 'to' para arreglos masivos
            subject: `📚 Nueva actividad asignada en ${datosActividad.materia}`,
            html: `
                <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto; padding: 20px; border: 1px solid #ddd; border-radius: 8px;">
                    <h2 style="color: #0033a0; text-align: center;">Centro Educativo Salvador Lenis</h2>
                    <p style="font-size: 16px; color: #333;">
                        El docente <strong>${datosActividad.docente}</strong> asignó una nueva actividad en <strong>${datosActividad.materia}</strong>.
                    </p>
                    <div style="background-color: #f8fafc; border: 1px solid #e2e8f0; padding: 20px; border-radius: 8px;">
                        <h3 style="margin: 0; color: #0033a0;">📝 ${datosActividad.titulo}</h3>
                        <p style="margin: 10px 0 5px 0; color: #475569;">📅 <strong>Fecha de entrega:</strong> ${fechaFormateada}</p>
                    </div>
                </div>
            `
        });

        if (error) throw error;
        console.log(`📧 Notificación de nueva actividad enviada.`);
    } catch (error) {
        console.error("❌ Error al enviar correo de nueva actividad:", error);
    }
};

// ==========================================
// FUNCIÓN 4: NOTIFICAR CIERRE DE MATRÍCULAS
// ==========================================
export const enviarCorreoCierreMatricula = async (acudiente, fechaLimite) => {
    try {
        if (!acudiente.correo && !acudiente.email) return;
        const destino = acudiente.correo || acudiente.email;

        const { data, error } = await resend.emails.send({
            from: emailRemitente,
            to: [destino],
            subject: '⚠️ Importante: Cierre de Matrículas en Línea - CESL',
            html: `
                <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto; padding: 20px; border: 1px solid #ddd; border-radius: 8px;">
                    <h2 style="color: #0033a0; text-align: center;">Centro Educativo Salvador Lenis</h2>
                    <p style="font-size: 16px; color: #333;">El plazo para la matrícula en línea ha finalizado (${fechaLimite}).</p>
                </div>
            `
        });

        if (error) throw error;
        console.log(`📧 Aviso de cierre enviado a: ${destino}`);
    } catch (error) {
        console.error("❌ Error al enviar cierre de matrícula:", error);
    }
};

// ==========================================
// FUNCIÓN 5: ALERTA DE ACTIVIDAD CALIFICADA
// ==========================================
export const enviarCorreoCalificacion = async (correosDestino, datosCalificacion) => {
    try {
        const { data, error } = await resend.emails.send({
            from: emailRemitente,
            to: correosDestino, 
            subject: `✅ Actividad Calificada en ${datosCalificacion.materia}`,
            html: `
                <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto; padding: 20px; border: 1px solid #e2e8f0; border-radius: 12px;">
                    <h2 style="color: #0033a0; text-align: center;">Centro Educativo Salvador Lenis</h2>
                    <p style="font-size: 16px; color: #334155;">
                        El docente <strong>${datosCalificacion.docente}</strong> ha registrado una calificación para la actividad <strong>${datosCalificacion.actividad}</strong>.
                    </p>
                </div>
            `
        });

        if (error) throw error;
        console.log(`📧 Notificación de calificación enviada.`);
    } catch (error) {
        console.error("❌ Error al enviar correo de calificación:", error);
    }
};
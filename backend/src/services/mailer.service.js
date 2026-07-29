import sgMail from '@sendgrid/mail';
import dotenv from 'dotenv';

dotenv.config();

// Inicializamos el cliente de SendGrid con tu clave de entorno
sgMail.setApiKey(process.env.SENDGRID_API_KEY);

// Este DEBE ser exactamente el correo de Gmail que verificaste en la plataforma de SendGrid
const emailRemitente = 'salvadorlenisce@gmail.com';

// ==========================================
// FUNCIÓN 1: CÓDIGO DE RECUPERACIÓN DE CONTRASEÑA
// ==========================================
export const enviarCorreoCodigo = async (destinatario, codigo) => {
    try {
        console.log(`🔑 [RECUPERACIÓN] Intentando enviar código (${codigo}) a: ${destinatario}`);

        const mensaje = {
            to: destinatario,
            from: emailRemitente,
            subject: 'Código de Recuperación de Contraseña - CESL',
            // AGREGAMOS ESTA LÍNEA: El texto plano ayuda a evadir los filtros antispam
            text: `Hola, hemos recibido una solicitud para restablecer tu contraseña. Ingresa este código en la plataforma: ${codigo}. Este código expirará en 15 minutos. Si no solicitaste este cambio, ignora este mensaje.`,
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
        };

        await sgMail.send(mensaje);
        console.log(`✉️ [RECUPERACIÓN] Correo enviado exitosamente.`);
        return true;
    } catch (error) {
        console.error("❌ [RECUPERACIÓN] Error de la API:", error.response ? error.response.body : error);
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
        
        const destinatarios = [tarea.email_estudiante];
        if (tarea.email_acudiente) destinatarios.push(tarea.email_acudiente);

        const mensaje = {
            to: destinatarios,
            from: emailRemitente,
            subject: `⏰ Recordatorio de Tarea: ${tarea.titulo}`,
            // AGREGAMOS ESTA LÍNEA: Versión en texto plano para mejorar la reputación y evitar el spam
            text: `Hola, ${tarea.nombre_estudiante}. Este es un recordatorio automático del Centro Educativo Salvador Lenis. Falta exactamente ${mensajeDias} para la entrega de tu tarea: "${tarea.titulo}". La fecha límite es el ${fechaFormateada}.`,
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
        };

        await sgMail.send(mensaje);
        console.log(`📧 Recordatorio enviado con éxito a ${destinatarios.length} destinatario(s).`);
    } catch (error) {
        console.error("❌ Error al enviar recordatorio:", error.response ? error.response.body : error);
    }
};

// ==========================================
// FUNCIÓN 3: ALERTA DE NUEVA ACTIVIDAD CREADA
// ==========================================
export const enviarCorreoNuevaActividad = async (correosDestino, datosActividad) => {
    try {
        const fechaFormateada = new Date(`${datosActividad.fecha_entrega}T00:00:00`).toLocaleDateString('es-ES');

        const mensaje = {
            to: 'soporte@cesl.edu.co', // SendGrid requiere un destinatario principal
            bcc: correosDestino, // Copia oculta masiva
            from: emailRemitente,
            subject: `📚 Nueva actividad asignada en ${datosActividad.materia}`,
            // AGREGAMOS ESTA LÍNEA: Texto simple para mejorar la entregabilidad masiva
            text: `Hola. El docente ${datosActividad.docente} asignó una nueva actividad en ${datosActividad.materia}. Título de la actividad: ${datosActividad.titulo}. Fecha de entrega: ${fechaFormateada}. Por favor, ingresa a la plataforma del Centro Educativo Salvador Lenis para ver más detalles.`,
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
        };

        await sgMail.send(mensaje);
        console.log(`📧 Notificación de nueva actividad enviada.`);
    } catch (error) {
        console.error("❌ Error al enviar correo de nueva actividad:", error.response ? error.response.body : error);
    }
};

// ==========================================
// FUNCIÓN 4: NOTIFICAR CIERRE DE MATRÍCULAS
// ==========================================
export const enviarCorreoCierreMatricula = async (acudiente, fechaLimite) => {
    try {
        if (!acudiente.correo && !acudiente.email) return;
        const destino = acudiente.correo || acudiente.email;

        const mensaje = {
            to: destino,
            from: emailRemitente,
            subject: '⚠️ Importante: Cierre de Matrículas en Línea - CESL',
            // AGREGAMOS ESTA LÍNEA: Texto plano para evitar filtros de spam
            text: `Importante: Le informamos que el plazo para la matrícula en línea en el Centro Educativo Salvador Lenis ha finalizado (${fechaLimite}).`,
            html: `
                <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto; padding: 20px; border: 1px solid #ddd; border-radius: 8px;">
                    <h2 style="color: #0033a0; text-align: center;">Centro Educativo Salvador Lenis</h2>
                    <p style="font-size: 16px; color: #333;">El plazo para la matrícula en línea ha finalizado (${fechaLimite}).</p>
                </div>
            `
        };

        await sgMail.send(mensaje);
        console.log(`📧 Aviso de cierre enviado a: ${destino}`);
    } catch (error) {
        console.error("❌ Error al enviar cierre de matrícula:", error.response ? error.response.body : error);
    }
};

// ==========================================
// FUNCIÓN 5: ALERTA DE ACTIVIDAD CALIFICADA
// ==========================================
export const enviarCorreoCalificacion = async (correosDestino, datosCalificacion) => {
    try {
        const mensaje = {
            to: 'soporte@cesl.edu.co', // SendGrid requiere un destinatario principal
            bcc: correosDestino, 
            from: emailRemitente,
            subject: `✅ Actividad Calificada en ${datosCalificacion.materia}`,
            // AGREGAMOS ESTA LÍNEA: Texto plano para asegurar la entrega en bandeja de entrada
            text: `Notificación Académica: El docente ${datosCalificacion.docente} ha registrado una calificación para la actividad "${datosCalificacion.actividad}". Por favor, ingresa a la plataforma del Centro Educativo Salvador Lenis para conocer tu resultado.`,
            html: `
                <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto; padding: 20px; border: 1px solid #e2e8f0; border-radius: 12px;">
                    <h2 style="color: #0033a0; text-align: center;">Centro Educativo Salvador Lenis</h2>
                    <p style="font-size: 16px; color: #334155;">
                        El docente <strong>${datosCalificacion.docente}</strong> ha registrado una calificación para la actividad <strong>${datosCalificacion.actividad}</strong>.
                    </p>
                </div>
            `
        };

        await sgMail.send(mensaje);
        console.log(`📧 Notificación de calificación enviada.`);
    } catch (error) {
        console.error("❌ Error al enviar correo de calificación:", error.response ? error.response.body : error);
    }
};

// ==========================================
// FUNCIÓN 6: NOTIFICAR NUEVO MENSAJE DE CHAT
// ==========================================
export const enviarCorreoNuevoMensaje = async (emailDestino, nombreEmisor) => {
    try {
        const mensaje = {
            to: emailDestino,
            from: emailRemitente,
            subject: 'Tienes un nuevo mensaje en la plataforma CESL',
            // Texto plano para evadir filtros antispam
            text: `Hola. Tienes un nuevo mensaje sin leer en la plataforma del Centro Educativo Salvador Lenis. Remitente: ${nombreEmisor}. Por favor, ingresa a tu cuenta para responder.`,
            html: `
                <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto; padding: 20px; border: 1px solid #ddd; border-radius: 8px;">
                    <h2 style="color: #0033a0; text-align: center;">Centro Educativo Salvador Lenis</h2>
                    <hr style="border: none; border-top: 1px solid #eee; margin: 20px 0;" />
                    <p style="font-size: 16px; color: #333;">Hola,</p>
                    <p style="font-size: 16px; color: #333;">Tienes un nuevo mensaje sin leer en nuestra plataforma.</p>
                    
                    <div style="background-color: #f4f6f9; padding: 15px; border-left: 5px solid #0033a0; margin: 20px 0; border-radius: 4px;">
                        <p style="margin: 0; color: #333;"><strong>Remitente:</strong> ${nombreEmisor}</p>
                    </div>
                    
                    <p style="font-size: 14px; color: #666;">Por favor, ingresa a tu cuenta en la plataforma para leer y responder a esta inquietud.</p>
                </div>
            `
        };

        await sgMail.send(mensaje);
        console.log(`📧 Notificación de chat enviada a: ${emailDestino}`);
    } catch (error) {
        console.error("❌ Error al enviar notificación de chat:", error.response ? error.response.body : error);
    }
};
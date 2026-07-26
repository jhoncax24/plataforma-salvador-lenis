import nodemailer from 'nodemailer';
import dotenv from 'dotenv';

dotenv.config();

// Configuramos el "cartero" que se conectará a tu cuenta de Gmail
const transporter = nodemailer.createTransport({
    host: process.env.EMAIL_HOST || 'smtp.gmail.com',
    port: process.env.EMAIL_PORT || 465,
    secure: true, // true para el puerto 465 (SSL)
    auth: {
        user: process.env.EMAIL_USER,
        pass: process.env.EMAIL_PASS
    }
});

export const enviarCorreoCodigo = async (destinatario, codigo) => {
    try {
        const mailOptions = {
            from: `"Soporte CESL" <${process.env.EMAIL_USER}>`,
            to: destinatario,
            subject: 'Código de Recuperación de Contraseña - CESL',
            html: `
                <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto; padding: 20px; border: 1px solid #ddd; border-radius: 8px; box-shadow: 0 4px 8px rgba(0,0,0,0.1);">
                    <h2 style="color: #0033a0; text-align: center;">Centro Educativo Salvador Lenis</h2>
                    <hr style="border: none; border-top: 1px solid #eee; margin: 20px 0;" />
                    <p style="font-size: 16px; color: #333;">Hola,</p>
                    <p style="font-size: 16px; color: #333;">Hemos recibido una solicitud para restablecer tu contraseña. Ingresa el siguiente código de 6 dígitos en la plataforma:</p>
                    
                    <div style="text-align: center; margin: 30px 0;">
                        <span style="font-size: 32px; font-weight: bold; letter-spacing: 8px; color: #0033a0; background-color: #f4f6f9; padding: 15px 30px; border-radius: 8px; border: 2px dashed #0033a0; display: inline-block;">
                            ${codigo}
                        </span>
                    </div>
                    
                    <p style="font-size: 14px; color: #666; text-align: center;">Este código <strong>expirará en 15 minutos</strong>.</p>
                    <p style="font-size: 12px; color: #999; text-align: center; margin-top: 30px;">Si no solicitaste este cambio, por favor ignora este correo por tu seguridad.</p>
                </div>
            `
        };

        await transporter.sendMail(mailOptions);
        console.log(`✉️ Correo de recuperación enviado a: ${destinatario}`);
    } catch (error) {
        console.error("❌ Error al enviar el correo:", error);
        throw new Error("No se pudo conectar con el servidor de correo");
    }
};

// --- FUNCIÓN 2: NUEVA FUNCIÓN DE RECORDATORIOS ---
export const enviarCorreoRecordatorio = async (tarea, diasFaltantes) => {
    try {
        const mensajeDias = diasFaltantes > 1 ? '3 días' : '1 día';
        const fechaFormateada = new Date(tarea.fecha_entrega).toLocaleDateString('es-ES');

        const mailOptions = {
            from: `"Centro Educativo Salvador Lenis" <${process.env.EMAIL_USER}>`,
            to: tarea.email_estudiante,
            cc: tarea.email_acudiente || undefined, 
            subject: `⏰ Recordatorio de Tarea: ${tarea.titulo}`,
            html: `
                <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto; padding: 20px; border: 1px solid #ddd; border-radius: 8px; box-shadow: 0 4px 8px rgba(0,0,0,0.1);">
                    <h2 style="color: #0033a0; text-align: center;">Centro Educativo Salvador Lenis</h2>
                    <hr style="border: none; border-top: 1px solid #eee; margin: 20px 0;" />
                    
                    <h3 style="color: #333;">¡Hola, ${tarea.nombre_estudiante}!</h3>
                    <p style="font-size: 16px; color: #333;">Este es un recordatorio automático del sistema.</p>
                    <p style="font-size: 16px; color: #333;">Falta exactamente <strong>${mensajeDias}</strong> para la entrega de tu tarea:</p>
                    
                    <div style="background-color: #f4f6f9; padding: 15px; border-left: 5px solid #ffc107; margin: 20px 0; border-radius: 0 8px 8px 0;">
                        <h3 style="margin: 0; color: #0033a0;">${tarea.titulo}</h3>
                        <p style="margin: 5px 0 0 0; color: #555;">Fecha límite: <strong>${fechaFormateada}</strong></p>
                    </div>
                    
                    ${tarea.nombre_acudiente ? `
                    <p style="font-size: 14px; color: #666; background-color: #fff3cd; padding: 10px; border-radius: 5px;">
                        <strong>Nota para el acudiente (${tarea.nombre_acudiente}):</strong> Por favor asegúrese de que el estudiante complete la asignación a tiempo.
                    </p>
                    ` : ''}
                </div>
            `
        };

        await transporter.sendMail(mailOptions);
        console.log(`📧 Recordatorio enviado a: ${tarea.email_estudiante} y ${tarea.email_acudiente}`);
    } catch (error) {
        console.error("❌ Error al enviar el correo de recordatorio:", error);
    }
};

// ==========================================
// FUNCIÓN 3: ALERTA DE NUEVA ACTIVIDAD CREADA
// ==========================================
export const enviarCorreoNuevaActividad = async (correosDestino, datosActividad) => {
    try {
        // Formateamos la fecha (agregamos hora a cero para evitar desajustes de zona horaria)
        const fechaFormateada = new Date(`${datosActividad.fecha_entrega}T00:00:00`).toLocaleDateString('es-ES', {
            weekday: 'long', 
            year: 'numeric', 
            month: 'long', 
            day: 'numeric'
        });

        const mailOptions = {
            from: `"Centro Educativo Salvador Lenis" <${process.env.EMAIL_USER}>`,
            bcc: correosDestino, // Copia oculta masiva
            subject: `📚 Nueva actividad asignada en ${datosActividad.materia}`,
            html: `
                <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto; padding: 20px; border: 1px solid #ddd; border-radius: 8px; box-shadow: 0 4px 8px rgba(0,0,0,0.1);">
                    <h2 style="color: #0033a0; text-align: center;">Centro Educativo Salvador Lenis</h2>
                    <hr style="border: none; border-top: 1px solid #eee; margin: 20px 0;" />
                    
                    <h3 style="color: #333;">¡Hola!</h3>
                    <p style="font-size: 16px; color: #333; line-height: 1.5;">
                        El docente <strong>${datosActividad.docente}</strong> acaba de asignar una nueva actividad evaluativa en la materia de <strong>${datosActividad.materia}</strong>.
                    </p>
                    
                    <!-- Tarjeta de la actividad -->
                    <div style="background-color: #f8fafc; border: 1px solid #e2e8f0; padding: 20px; border-radius: 8px; margin: 25px 0;">
                        <h3 style="margin: 0 0 10px 0; color: #0033a0; border-bottom: 2px solid #0033a0; padding-bottom: 5px; display: inline-block;">
                            📝 ${datosActividad.titulo}
                        </h3>
                        <p style="margin: 10px 0 5px 0; color: #475569; font-size: 15px;">
                            📅 <strong>Fecha de entrega:</strong> ${fechaFormateada}
                        </p>
                        
                        ${datosActividad.requiere_pdf 
                            ? `<div style="margin-top: 15px; background-color: #ffedd5; padding: 12px; border-radius: 5px; border-left: 4px solid #f97316;">
                                <p style="margin: 0; color: #c2410c; font-size: 14px;">
                                    ⚠️ <strong>Atención:</strong> Esta actividad requiere que el estudiante suba un archivo (PDF) a través de la plataforma virtual.
                                </p>
                               </div>` 
                            : `<div style="margin-top: 15px; background-color: #dcfce7; padding: 12px; border-radius: 5px; border-left: 4px solid #22c55e;">
                                <p style="margin: 0; color: #15803d; font-size: 14px;">
                                    ✅ <strong>Nota:</strong> Esta actividad no requiere entregable virtual. Su evaluación se realizará de forma presencial o directa.
                                </p>
                               </div>`
                        }
                    </div>
                    
                    <p style="font-size: 14px; color: #666; text-align: center; margin-top: 30px;">
                        Por favor, ingresa a la plataforma del colegio para revisar más detalles.
                    </p>
                </div>
            `
        };

        await transporter.sendMail(mailOptions);
        console.log(`📧 Notificación de nueva actividad enviada a ${correosDestino.length} destinatarios.`);
    } catch (error) {
        console.error("❌ Error al enviar el correo de nueva actividad:", error);
    }
};
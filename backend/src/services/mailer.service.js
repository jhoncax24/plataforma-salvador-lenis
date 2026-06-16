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
        // Formateamos la fecha para que se vea bonita (Ej: "12/5/2026")
        const fechaFormateada = new Date(tarea.fecha_entrega).toLocaleDateString('es-ES');

        const mailOptions = {
            from: `"Centro Educativo Salvador Lenis" <${process.env.EMAIL_USER}>`,
            // 👇 CAMBIO TEMPORAL PARA PRUEBAS (Secuestramos el destinatario) 👇
           // to: "tu_correo_personal@gmail.com", // Reemplaza por tu correo real
            //cc: "otro_correo_tuyo@gmail.com",   // Reemplaza por otro correo tuyo (o bórralo si no tienes dos)
            
            // Cuando termines las pruebas, lo volverás a dejar así:
            to: tarea.email_estudiante,
            cc: tarea.email_acudiente || undefined, // Solo incluimos el CC si hay correo de acudiente
            
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
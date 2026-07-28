import nodemailer from 'nodemailer';
import dotenv from 'dotenv';

dotenv.config();

// Configuramos el "cartero" que se conectará a tu cuenta de Gmail
const transporter = nodemailer.createTransport({
    host: process.env.EMAIL_HOST || 'smtp.gmail.com',
    port: 587,          // 👈 Cambiamos el puerto 465 por 587 (puerto abierto en Render)
    secure: false,       // 👈 Debe ser 'false' para el puerto 587 (utiliza STARTTLS)
    auth: {
        user: process.env.EMAIL_USER,
        pass: process.env.EMAIL_PASS
    },
    family: 4,          // Forzamos el uso de IPv4
    tls: {
        rejectUnauthorized: false // Evita bloqueos de certificados en entornos en la nube
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

// --- NUEVA FUNCIÓN PARA NOTIFICAR CIERRE DE MATRÍCULAS ---
export const enviarCorreoCierreMatricula = async (acudiente, fechaLimite) => {
    try {
        if (!acudiente.correo && !acudiente.email) return;

        const destino = acudiente.correo || acudiente.email;
        const mailOptions = {
            from: `"Centro Educativo Salvador Lenis" <${process.env.EMAIL_USER}>`,
            to: destino,
            subject: '⚠️ Importante: Cierre de Matrículas en Línea - CESL',
            html: `
                <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto; padding: 20px; border: 1px solid #ddd; border-radius: 8px; box-shadow: 0 4px 8px rgba(0,0,0,0.1);">
                    <h2 style="color: #0033a0; text-align: center;">Centro Educativo Salvador Lenis</h2>
                    <hr style="border: none; border-top: 1px solid #eee; margin: 20px 0;" />
                    
                    <h3 style="color: #333;">¡Estimado(a) Acudiente ${acudiente.nombre_completo || ''}!</h3>
                    <p style="font-size: 16px; color: #333;">Le informamos que el plazo estipulado para realizar el proceso de <strong>matrícula en línea</strong> ha finalizado el día de hoy (<strong>${fechaLimite}</strong>).</p>
                    
                    <div style="background-color: #fdf2f2; padding: 15px; border-left: 5px solid #dc3545; margin: 20px 0; border-radius: 0 8px 8px 0;">
                        <p style="margin: 0; color: #721c24; font-size: 15px;">Si su proceso quedó en estado <strong>Pendiente</strong> o no se completó a tiempo, por favor acérquese de manera presencial a la institución para regularizar la situación académica del estudiante.</p>
                    </div>

                    <p style="font-size: 12px; color: #999; text-align: center; margin-top: 30px;">Este es un mensaje automático, por favor no responda a este correo.</p>
                </div>
            `
        };

        await transporter.sendMail(mailOptions);
        console.log(`📧 Aviso de cierre de matrícula enviado a acudiente: ${destino}`);
    } catch (error) {
        console.error("❌ Error al enviar el correo de cierre de matrícula:", error);
    }
};

// ==========================================
// FUNCIÓN 5: ALERTA DE ACTIVIDAD CALIFICADA
// ==========================================
export const enviarCorreoCalificacion = async (correosDestino, datosCalificacion) => {
    try {
        const mailOptions = {
            from: `"Centro Educativo Salvador Lenis" <${process.env.EMAIL_USER}>`,
            bcc: correosDestino, // Copia oculta masiva para proteger la privacidad
            subject: `✅ Actividad Calificada en ${datosCalificacion.materia}`,
            html: `
                <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto; padding: 20px; border: 1px solid #e2e8f0; border-radius: 12px; box-shadow: 0 4px 6px rgba(0,0,0,0.05);">
                    <div style="text-align: center; margin-bottom: 20px;">
                        <h2 style="color: #0033a0; margin: 0;">Centro Educativo Salvador Lenis</h2>
                        <p style="color: #64748b; font-size: 14px; margin-top: 5px;">Notificación Académica</p>
                    </div>
                    
                    <hr style="border: none; border-top: 1px solid #e2e8f0; margin: 20px 0;" />
                    
                    <h3 style="color: #1e293b;">¡Hola!</h3>
                    <p style="font-size: 16px; color: #334155; line-height: 1.6;">
                        Te informamos que el docente <strong>${datosCalificacion.docente}</strong> ha registrado una calificación y/o retroalimentación para una de tus actividades académicas.
                    </p>
                    
                    <div style="background-color: #f8fafc; border-left: 5px solid #22c55e; padding: 15px 20px; margin: 25px 0; border-radius: 0 8px 8px 0;">
                        <p style="margin: 0 0 5px 0; color: #64748b; font-size: 13px; text-transform: uppercase; font-weight: bold;">Materia</p>
                        <p style="margin: 0 0 15px 0; color: #0f172a; font-size: 16px; font-weight: bold;">${datosCalificacion.materia}</p>
                        
                        <p style="margin: 0 0 5px 0; color: #64748b; font-size: 13px; text-transform: uppercase; font-weight: bold;">Actividad Evaluada</p>
                        <p style="margin: 0; color: #0f172a; font-size: 16px;">${datosCalificacion.actividad}</p>
                    </div>

                    <div style="background-color: #eff6ff; border: 1px dashed #93c5fd; padding: 15px; border-radius: 8px; text-align: center; margin-bottom: 25px;">
                        <p style="margin: 0; color: #1e3a8a; font-size: 14px;">
                            🔒 <em>Por motivos de privacidad, las notas exactas solo son visibles dentro de tu perfil en la plataforma.</em>
                        </p>
                    </div>
                    
                    <p style="font-size: 14px; color: #64748b; text-align: center; margin-top: 30px;">
                        Por favor, ingresa a la plataforma del colegio para conocer tu resultado y leer los comentarios del docente.
                    </p>
                </div>
            `
        };

        await transporter.sendMail(mailOptions);
        console.log(`📧 Notificación de calificación enviada a ${correosDestino.length} destinatarios (Actividad: ${datosCalificacion.actividad}).`);
    } catch (error) {
        console.error("❌ Error al enviar el correo de calificación:", error);
    }
};
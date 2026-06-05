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
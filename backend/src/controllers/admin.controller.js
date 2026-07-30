import { pool } from "../config/db.js";
import crypto from "crypto";
import PDFDocument from "pdfkit";
import { enviarCorreoMatriculaAprobada, enviarCorreoMatriculaDevuelta } from '../services/mailer.service.js';

// ==========================================
// FUNCIÓN AUXILIAR: GENERAR PDF EN BASE64
// ==========================================
const generarPDFConstancia = (matricula, materias, hashFirma) => {
  return new Promise((resolve, reject) => {
    const doc = new PDFDocument({ margin: 50, size: 'A4' });
    let buffers = [];

    doc.on('data', buffers.push.bind(buffers));
    doc.on('end', () => {
      const pdfData = Buffer.concat(buffers);
      resolve(pdfData.toString('base64')); 
    });
    doc.on('error', reject);

    // Encabezado
    doc.fillColor('#0033a0').fontSize(20).font('Helvetica-Bold').text('Centro Educativo Salvador Lenis', { align: 'center' });
    doc.fontSize(10).fillColor('#666666').font('Helvetica').text('Institución Educativa Oficial - Rozo, Valle del Cauca', { align: 'center' });
    doc.moveDown(0.5);
    doc.strokeColor('#0033a0').lineWidth(2).moveTo(50, doc.y).lineTo(545, doc.y).stroke();
    doc.moveDown(1.5);

    // Título
    doc.fontSize(15).fillColor('#1e293b').font('Helvetica-Bold').text('CONSTANCIA DE MATRÍCULA Y PLAN ACADÉMICO', { align: 'center' });
    doc.moveDown(1.5);

    // Texto
    doc.fontSize(11).fillColor('#334155').font('Helvetica').text(
      `Por medio de la presente se hace constar que el(la) estudiante `,
      { continued: true, align: 'justify' }
    )
    .font('Helvetica-Bold').text(`${matricula.nombre_estudiante}`, { continued: true })
    .font('Helvetica').text(`, identificado(a) con documento de identidad No. `)
    .font('Helvetica-Bold').text(`${matricula.documento_estudiante}`, { continued: true })
    .font('Helvetica').text(`, ha completado satisfactoriamente el proceso de auditoría administrativa y se encuentra formalmente `)
    .font('Helvetica-Bold').text(`MATRICULADO(A)`, { continued: true })
    .font('Helvetica').text(` para el curso `)
    .font('Helvetica-Bold').fillColor('#0033a0').text(`Grado ${matricula.grado}`, { continued: true })
    .fillColor('#334155').font('Helvetica').text(` durante el periodo lectivo vigente.`);

    doc.moveDown(1.5);

    // Tabla
    doc.fontSize(12).fillColor('#0033a0').font('Helvetica-Bold').text('PLAN DE ESTUDIOS / ASIGNATURAS INSCRITAS:');
    doc.moveDown(0.5);

    const tableTop = doc.y;
    doc.rect(50, tableTop, 495, 20).fill('#f1f5f9');
    doc.fillColor('#1e293b').fontSize(10).font('Helvetica-Bold');
    doc.text('#', 60, tableTop + 5, { width: 30 });
    doc.text('Asignatura / Materia', 100, tableTop + 5, { width: 300 });
    doc.text('Estado', 420, tableTop + 5, { width: 100 });

    let currentY = tableTop + 22;
    doc.font('Helvetica').fontSize(9).fillColor('#334155');

    if (materias && materias.length > 0) {
      materias.forEach((mat, index) => {
        if (index % 2 === 0) {
          doc.rect(50, currentY - 2, 495, 18).fill('#fafafa');
        }
        doc.fillColor('#334155');
        doc.text(`${index + 1}`, 60, currentY, { width: 30 });
        doc.text(`${mat.nombre_materia}`, 100, currentY, { width: 300 });
        doc.fillColor('#16a34a').font('Helvetica-Bold').text('Inscrita', 420, currentY, { width: 100 });
        doc.font('Helvetica');
        currentY += 18;
      });
    } else {
      doc.text('Materias del plan básico institucional', 100, currentY);
      currentY += 18;
    }

    doc.y = currentY + 15;

    // Firma Digital
    const firmaY = doc.y > 650 ? 650 : doc.y;
    doc.rect(50, firmaY, 495, 65).fillAndStroke('#f8fafc', '#cbd5e1');
    doc.fillColor('#0033a0').fontSize(10).font('Helvetica-Bold').text('CERTIFICADO DE FIRMA DIGITAL INSTITUCIONAL', 65, firmaY + 10);
    doc.fillColor('#475569').fontSize(8).font('Helvetica').text('Este documento ha sido firmado electrónicamente mediante un hash SHA-256 irrefutable:', 65, firmaY + 25);
    doc.fillColor('#0f172a').fontSize(8).font('Courier').text(hashFirma, 65, firmaY + 40, { width: 465 });

    doc.moveDown(3);
    doc.fontSize(8).fillColor('#94a3b8').font('Helvetica').text('Centro Educativo Salvador Lenis - Expedición Automática del Sistema CESL Académico', { align: 'center' });

    doc.end();
  });
};

// ==========================================
// OBTENER MATRÍCULAS PENDIENTES Y RECHAZADAS
// ==========================================
export const getMatriculasPendientes = async (req, res, next) => {
  try {
    // 👇 Incluimos 'Pendiente', 'Rechazada' y 'Devuelta' para que sigan apareciendo en la lista
    const query = `
      SELECT 
        m.id_matricula,
        m.estado,
        m.documentos_url,
        TO_CHAR(m.fecha_matricula, 'DD/MM/YYYY') AS fecha_solicitud,
        e.nombre_completo AS estudiante,
        e.documento,
        a.nombre_completo AS acudiente,
        a.telefono AS telefono_acudiente,
        c.nombre AS curso_destino
      FROM matriculas m
      JOIN estudiantes e ON m.id_estudiante = e.id_estudiante
      JOIN acudientes a ON e.id_acudiente = a.id_acudiente
      JOIN cursos c ON m.id_curso = c.id_curso
      WHERE m.estado IN ('Pendiente', 'Rechazada', 'Devuelta') 
      ORDER BY m.fecha_matricula ASC;
    `;
    
    const { rows } = await pool.query(query);

    const matriculasFormateadas = rows.map(row => ({
      id_matricula: row.id_matricula,
      estado: row.estado,
      estudiante: row.estudiante,
      documento: row.documento,
      curso_destino: row.curso_destino,
      acudiente: row.acudiente,
      telefono_acudiente: row.telefono_acudiente || 'No registrado',
      fecha_solicitud: row.fecha_solicitud,
      comprobante_pago: row.documentos_url,
      academico: {
        estado: 'Pendiente de auditoría',
        materias_perdidas: 0, 
        promedio: 0 
      },
      disciplina: {
        total_inasistencias: 0, 
        anotaciones_observador: 0,
        ultima_anotacion: "Sin anotaciones recientes"
      }
    }));
    
    res.json(matriculasFormateadas);
  } catch (error) {
    console.error("Error obteniendo matrículas pendientes/rechazadas:", error);
    next(error);
  }
};

// ==========================================
// APROBAR MATRÍCULA Y GENERAR FIRMA DIGITAL
// ==========================================
export const aprobarMatricula = async (req, res, next) => {
  const { idMatricula } = req.params;

  try {
    const consultaInfo = `
      SELECT 
        m.id_matricula,
        m.estado,
        m.id_curso,
        e.nombre_completo AS nombre_estudiante,
        e.documento AS documento_estudiante,
        a.nombre_completo AS nombre_acudiente,
        u.email AS correo_acudiente,
        c.nombre AS grado
      FROM matriculas m
      JOIN estudiantes e ON m.id_estudiante = e.id_estudiante
      JOIN acudientes a ON e.id_acudiente = a.id_acudiente
      JOIN users u ON a.id_usuario = u.id_usuario AND u.role = 'acudiente'
      JOIN cursos c ON m.id_curso = c.id_curso
      WHERE m.id_matricula = $1
    `;
    
    const { rows } = await pool.query(consultaInfo, [idMatricula]);

    if (rows.length === 0) {
      return res.status(404).json({ message: "Matrícula no encontrada" });
    }

    const matricula = rows[0];

    if (matricula.estado === 'Activa') {
      return res.status(400).json({ message: "La matrícula ya se encuentra activa." });
    }

    const consultaMaterias = `
      SELECT DISTINCT m.nombre AS nombre_materia
      FROM materias m
      JOIN asignacion_academica aa ON m.id_materia = aa.id_materia
      WHERE aa.id_curso = $1
      ORDER BY m.nombre ASC
    `;
    const { rows: materias } = await pool.query(consultaMaterias, [matricula.id_curso]);

    const datosParaFirma = `${matricula.id_matricula}-${matricula.documento_estudiante}-${matricula.grado}-${new Date().toISOString()}`;
    const firmaDigitalHash = crypto.createHash('sha256').update(datosParaFirma).digest('hex');

    const queryActualizar = `
      UPDATE matriculas 
      SET estado = 'Activa', firma_digital_hash = $1 
      WHERE id_matricula = $2
    `;
    await pool.query(queryActualizar, [firmaDigitalHash, idMatricula]);

    const pdfBase64 = await generarPDFConstancia(matricula, materias, firmaDigitalHash);

    if (matricula.correo_acudiente) {
      await enviarCorreoMatriculaAprobada(
        matricula.correo_acudiente, 
        matricula.nombre_estudiante, 
        matricula.grado, 
        materias.map(m => m.nombre_materia),
        firmaDigitalHash,
        pdfBase64 
      );
    }

    res.json({
      message: "Matrícula aprobada exitosamente",
      firma_digital: firmaDigitalHash,
      estado: "Activa",
      correo_notificado: matricula.correo_acudiente || 'Sin correo'
    });

  } catch (error) {
    console.error("Error aprobando la matrícula:", error);
    next(error);
  }
};

// ==========================================
// RECHAZAR O DEVOLVER MATRÍCULA Y NOTIFICAR
// ==========================================
export const rechazarMatricula = async (req, res, next) => {
  const { idMatricula } = req.params;
  const { motivo } = req.body;

  if (!motivo || motivo.trim() === '') {
    return res.status(400).json({ message: "El motivo del rechazo es obligatorio." });
  }

  try {
    // 1. Consultar el estudiante y el email del acudiente desde 'users' (role = 'acudiente')
    const consultaInfo = `
      SELECT 
        m.id_matricula,
        m.estado,
        e.nombre_completo AS nombre_estudiante,
        u.email AS correo_acudiente
      FROM matriculas m
      JOIN estudiantes e ON m.id_estudiante = e.id_estudiante
      JOIN acudientes a ON e.id_acudiente = a.id_acudiente
      JOIN users u ON a.id_usuario = u.id_usuario AND u.role = 'acudiente'
      WHERE m.id_matricula = $1
    `;
    
    const { rows } = await pool.query(consultaInfo, [idMatricula]);

    if (rows.length === 0) {
      return res.status(404).json({ message: "Matrícula no encontrada" });
    }

    const matricula = rows[0];

    if (matricula.estado === 'Activa') {
      return res.status(400).json({ message: "No se puede devolver una matrícula que ya se encuentra activa." });
    }

    // 2. Actualizamos el estado a 'Rechazada' en la base de datos
    const queryActualizar = `
      UPDATE matriculas 
      SET estado = 'Rechazada' 
      WHERE id_matricula = $1
    `;
    await pool.query(queryActualizar, [idMatricula]);

    // 3. Notificación por correo al acudiente mediante mailer.service.js
    if (matricula.correo_acudiente) {
      await enviarCorreoMatriculaDevuelta(
        matricula.correo_acudiente, 
        matricula.nombre_estudiante, 
        motivo
      );
    }

    res.json({
      message: "Matrícula devuelta correctamente y correo enviado",
      estado: "Rechazada",
      correo_notificado: matricula.correo_acudiente || 'Sin correo'
    });

  } catch (error) {
    console.error("Error al rechazar/devolver la matrícula:", error);
    next(error);
  }
};
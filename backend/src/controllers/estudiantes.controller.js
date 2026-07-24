import { pool } from "../config/db.js";
// Importamos la configuración de Cloudinary
import cloudinary from '../config/cloudinary.js';
// Ajusta la ruta y el nombre exacto de tu función de envío de correos
// import { enviarCorreoDocente } from '../services/mailer.service.js';

export const getPerfilEstudiante = async (req, res, next) => {
  const { idUsuario } = req.params;

  try {
    // 👇 Buscamos el nombre del curso a través de la matrícula
    const query = `
      SELECT 
        e.nombre_completo AS nombre,
        e.documento,
        e.fecha_nacimiento,
        c.nombre AS grado, -- Sacamos el grado de la tabla cursos
        a.nombre_completo AS acudiente,
        u.foto_perfil 
      FROM estudiantes e
      LEFT JOIN acudientes a ON e.id_acudiente = a.id_acudiente
      LEFT JOIN users u ON e.id_usuario = u.id_usuario
      LEFT JOIN matriculas m ON e.id_estudiante = m.id_estudiante AND m.estado = 'Activa'
      LEFT JOIN cursos c ON m.id_curso = c.id_curso
      WHERE e.id_usuario = $1
    `;
    
    const { rows } = await pool.query(query, [idUsuario]);

    if (rows.length === 0) {
      return res.status(404).json({ message: "Perfil de estudiante no encontrado" });
    }

    const estudiante = rows[0];

    // Calcular la edad real si tiene fecha de nacimiento
    let edad = "No registrada";
    if (estudiante.fecha_nacimiento) {
      const birthDate = new Date(estudiante.fecha_nacimiento);
      const today = new Date();
      let age = today.getFullYear() - birthDate.getFullYear();
      const m = today.getMonth() - birthDate.getMonth();
      if (m < 0 || (m === 0 && today.getDate() < birthDate.getDate())) {
        age--;
      }
      edad = age;
    }

    res.json({
      ...estudiante,
      edad: edad
    });

  } catch (error) {
    next(error);
  }
};

// ==========================================
// OBTENER LAS NOTAS DEL ESTUDIANTE (Con todas las materias visibles)
// ==========================================
export const getNotasEstudiante = async (req, res, next) => {
  const { idUsuario } = req.params;
  try {
    // La magia aquí es partir de la matrícula y la asignación académica,
    // garantizando que se listen TODAS las materias del curso usando LEFT JOIN para las notas.
    const query = `
      SELECT 
        m.nombre AS materia,
        COALESCE(MAX(d.nombre_completo), 'Sin asignar') AS docente,
        
        COALESCE(ROUND(
          SUM(CASE WHEN a.periodo = 1 THEN na.nota * a.porcentaje ELSE 0 END) / 
          NULLIF(SUM(CASE WHEN a.periodo = 1 AND na.nota IS NOT NULL THEN a.porcentaje ELSE 0 END), 0)
        , 1), 0) AS p1,
        
        COALESCE(ROUND(
          SUM(CASE WHEN a.periodo = 2 THEN na.nota * a.porcentaje ELSE 0 END) / 
          NULLIF(SUM(CASE WHEN a.periodo = 2 AND na.nota IS NOT NULL THEN a.porcentaje ELSE 0 END), 0)
        , 1), 0) AS p2,
        
        COALESCE(ROUND(
          SUM(CASE WHEN a.periodo = 3 THEN na.nota * a.porcentaje ELSE 0 END) / 
          NULLIF(SUM(CASE WHEN a.periodo = 3 AND na.nota IS NOT NULL THEN a.porcentaje ELSE 0 END), 0)
        , 1), 0) AS p3,
        
        COALESCE(ROUND(
          SUM(CASE WHEN a.periodo = 4 THEN na.nota * a.porcentaje ELSE 0 END) / 
          NULLIF(SUM(CASE WHEN a.periodo = 4 AND na.nota IS NOT NULL THEN a.porcentaje ELSE 0 END), 0)
        , 1), 0) AS p4

      FROM estudiantes e
      -- 1. Buscamos el curso activo del estudiante
      JOIN matriculas mat ON e.id_estudiante = mat.id_estudiante AND mat.estado = 'Activa'
      -- 2. Buscamos todas las materias asignadas a ese curso
      JOIN asignacion_academica aa ON aa.id_curso = mat.id_curso
      JOIN materias m ON aa.id_materia = m.id_materia
      LEFT JOIN docentes d ON aa.id_docente = d.id_docente
      -- 3. Hacemos LEFT JOIN para traer actividades y notas solo si existen
      LEFT JOIN actividades a ON a.id_materia = m.id_materia AND a.id_curso = mat.id_curso
      LEFT JOIN notas_actividades na ON na.id_actividad = a.id_actividad AND na.id_estudiante = e.id_estudiante
      
      WHERE e.id_usuario = $1
      GROUP BY m.nombre
      ORDER BY m.nombre
    `;
    
    const { rows } = await pool.query(query, [idUsuario]);
    
    // Calculamos la definitiva general en el backend para que React solo dibuje
    const resultados = rows.map(row => {
        const p1 = parseFloat(row.p1);
        const p2 = parseFloat(row.p2);
        const p3 = parseFloat(row.p3);
        const p4 = parseFloat(row.p4);
        
        let periodosEvaluados = 0;
        let sumaDefinitiva = 0;
        
        if (p1 > 0) { sumaDefinitiva += p1; periodosEvaluados++; }
        if (p2 > 0) { sumaDefinitiva += p2; periodosEvaluados++; }
        if (p3 > 0) { sumaDefinitiva += p3; periodosEvaluados++; }
        if (p4 > 0) { sumaDefinitiva += p4; periodosEvaluados++; }
        
        const definitiva = periodosEvaluados > 0 ? (sumaDefinitiva / periodosEvaluados).toFixed(1) : 0;

        return {
            ...row,
            p1, p2, p3, p4,
            definitiva: parseFloat(definitiva)
        };
    });

    res.json(resultados);
  } catch (error) {
    console.error("Error obteniendo notas del estudiante:", error);
    next(error);
  }
};

// ==========================================
// OBTENER EL HORARIO DE CLASES DEL ESTUDIANTE
// ==========================================
export const getHorarioEstudiante = async (req, res, next) => {
  const { idUsuario } = req.params;
  
  try {
    const query = `
      SELECT 
        h.dia_semana, 
        h.bloque_hora, 
        mat.nombre AS materia
      FROM estudiantes e
      JOIN matriculas m ON e.id_estudiante = m.id_estudiante AND m.estado = 'Activa'
      JOIN horarios h ON m.id_curso = h.id_curso
      JOIN materias mat ON h.id_materia = mat.id_materia
      WHERE e.id_usuario = $1
      ORDER BY 
        CASE h.dia_semana
          WHEN 'Lunes' THEN 1
          WHEN 'Martes' THEN 2
          WHEN 'Miércoles' THEN 3
          WHEN 'Jueves' THEN 4
          WHEN 'Viernes' THEN 5
          ELSE 6
        END,
        h.bloque_hora ASC
    `;
    
    const { rows } = await pool.query(query, [idUsuario]);
    res.json(rows);
    
  } catch (error) {
    console.error("Error obteniendo el horario del estudiante:", error);
    next(error);
  }
};

// ==========================================
// OBTENER TAREAS DEL ESTUDIANTE (Personales + Asignadas por Profesores)
// ==========================================
export const getTareasEstudiante = async (req, res, next) => {
  const { idUsuario } = req.params;
  try {
    const query = `
      -- 1. Buscamos los recordatorios creados por el propio estudiante
      SELECT 
        id_tarea, titulo, descripcion, 
        TO_CHAR(fecha_entrega, 'YYYY-MM-DD') as fecha_entrega, 
        color, tipo 
      FROM tareas 
      WHERE id_usuario = $1 AND tipo = 'Recordatorio'

      UNION 

      -- 2. Buscamos las tareas asignadas por sus profesores al curso donde está matriculado
      SELECT 
        t.id_tarea, t.titulo, t.descripcion, 
        TO_CHAR(t.fecha_entrega, 'YYYY-MM-DD') as fecha_entrega, 
        t.color, t.tipo 
      FROM tareas t
      JOIN matriculas m ON t.id_curso = m.id_curso
      JOIN estudiantes e ON m.id_estudiante = e.id_estudiante
      WHERE e.id_usuario = $1 AND m.estado = 'Activa' AND t.tipo = 'Tarea Docente'

      -- Ordenamos todo por fecha de entrega
      ORDER BY fecha_entrega ASC
    `;
    
    const { rows } = await pool.query(query, [idUsuario]);
    res.json(rows);
  } catch (error) {
    console.error("Error obteniendo tareas del estudiante:", error);
    next(error);
  }
};

// ==========================================
// CREAR RECORDATORIO DEL ESTUDIANTE
// ==========================================
export const crearTareaEstudiante = async (req, res, next) => {
  const { idUsuario } = req.params;
  const { titulo, descripcion, fecha_entrega, color } = req.body; 
  
  try {
    // 👇 Agregamos explícitamente el tipo 'Recordatorio'
    const { rows } = await pool.query(
      `INSERT INTO tareas (id_usuario, titulo, descripcion, fecha_entrega, color, tipo) 
       VALUES ($1, $2, $3, $4, $5, 'Recordatorio') RETURNING *`,
      [idUsuario, titulo, descripcion, fecha_entrega, color || 'blue']
    );
    
    res.json(rows[0]);
  } catch (error) {
    console.error("Error guardando tarea del estudiante:", error);
    next(error);
  }
};
// ==========================================
// OBTENER HISTORIAL ACADÉMICO (Años anteriores)
// ==========================================
export const getHistorialAcademico = async (req, res, next) => {
  const { idUsuario } = req.params;
  try {
    const query = `
      SELECT ha.grado, ha.anio_lectivo, ha.materia, ha.docente, 
             ha.nota_p1, ha.nota_p2, ha.nota_p3, ha.nota_p4, ha.nota_definitiva
      FROM historial_academico ha
      JOIN estudiantes e ON ha.id_estudiante = e.id_estudiante
      WHERE e.id_usuario = $1
      ORDER BY ha.anio_lectivo DESC, ha.materia ASC
    `;
    const { rows } = await pool.query(query, [idUsuario]);
    res.json(rows);
  } catch (error) {
    console.error("Error obteniendo el historial académico:", error);
    next(error);
  }
};

// Editar un recordatorio existente
export const actualizarTareaEstudiante = async (req, res, next) => {
  const { idTarea } = req.params;
  const { titulo, descripcion, fecha_entrega, color } = req.body;
  
  try {
    // El candado de seguridad: Solo actualiza si el tipo es 'Recordatorio'
    const { rows } = await pool.query(
      `UPDATE tareas 
       SET titulo = $1, descripcion = $2, fecha_entrega = $3, color = $4 
       WHERE id_tarea = $5 AND tipo = 'Recordatorio' 
       RETURNING *`,
      [titulo, descripcion, fecha_entrega, color, idTarea]
    );
    
    if (rows.length === 0) {
      return res.status(403).json({ message: "No se puede editar esta tarea o no existe." });
    }
    
    res.json(rows[0]);
  } catch (error) {
    console.error("Error actualizando tarea:", error);
    next(error);
  }
};

// Obtener el total de faltas/retrasos del estudiante
export const getFaltasEstudiante = async (req, res, next) => {
  const { idUsuario } = req.params;
  try {
    const { rows } = await pool.query(
      `SELECT COUNT(*) AS total_faltas
       FROM asistencias
       WHERE id_estudiante = (SELECT id_estudiante FROM estudiantes WHERE id_usuario = $1)
       AND estado IN ('Ausente', 'Llegada Tarde')`, // Ajustado a los estados reales que creamos
      [idUsuario]
    );
    
    // PostgreSQL devuelve el COUNT como string, lo pasamos a entero
    const total = parseInt(rows[0].total_faltas, 10);
    res.json({ totalFaltas: total });
  } catch (error) {
    console.error("Error obteniendo faltas:", error);
    next(error);
  }
};


// ==========================================
// OBTENER EL DETALLE DE NOTAS DE UNA MATERIA (Actualizado para tareas)
// ==========================================
export const getDetalleMateria = async (req, res, next) => {
  const { idUsuario, nombreMateria } = req.params;
  
  try {
    const query = `
      SELECT 
        a.periodo,
        a.id_actividad AS id,
        a.titulo AS actividad,
        a.porcentaje, 
        a.requiere_pdf,            -- 👇 Nuevos campos añadidos
        na.nota,
        na.archivo_pdf,
        na.fecha_entrega,
        na.retroalimentacion
      FROM estudiantes e
      JOIN notas_actividades na ON e.id_estudiante = na.id_estudiante
      JOIN actividades a ON na.id_actividad = a.id_actividad
      JOIN materias m ON a.id_materia = m.id_materia
      WHERE e.id_usuario = $1 AND m.nombre = $2
      ORDER BY a.fecha_creacion ASC
    `;
    
    const { rows } = await pool.query(query, [idUsuario, nombreMateria]);

    const periodos = { P1: [], P2: [], P3: [], P4: [] };
    
    rows.forEach(fila => {
      const notaNum = parseFloat(fila.nota);
      const porcentajeNum = parseFloat(fila.porcentaje); 
      const periodoNum = parseInt(fila.periodo, 10); 
      
      const actividad = { 
        id: fila.id, 
        actividad: fila.actividad, 
        nota: notaNum,
        porcentaje: porcentajeNum,
        // 👇 Mapeamos los nuevos datos al JSON
        requierePdf: fila.requiere_pdf,
        archivoPdf: fila.archivo_pdf,
        fechaEntrega: fila.fecha_entrega,
        retroalimentacion: fila.retroalimentacion
      };
      
      if (periodoNum === 1) periodos.P1.push(actividad);
      if (periodoNum === 2) periodos.P2.push(actividad);
      if (periodoNum === 3) periodos.P3.push(actividad);
      if (periodoNum === 4) periodos.P4.push(actividad);
    });

    res.json(periodos);
  } catch (error) {
    console.error("Error obteniendo detalle de materia:", error);
    next(error);
  }
};

// ==========================================
// OBTENER DETALLE DE ASISTENCIAS (Por Materias - Optimizado sin duplicados)
// ==========================================
export const getDetalleAsistencia = async (req, res, next) => {
  const { idUsuario } = req.params;
  
  try {
    // Usamos CTE (WITH) para asegurar que las materias no se dupliquen antes de buscar la asistencia
    const query = `
      WITH MateriasEstudiante AS (
        SELECT 
          m.id_materia,
          m.nombre AS nombre_materia,
          mat.id_curso,
          e.id_estudiante,
          COALESCE(MAX(d.nombre_completo), 'Sin asignar') AS docente
        FROM estudiantes e
        JOIN matriculas mat ON e.id_estudiante = mat.id_estudiante AND mat.estado = 'Activa'
        JOIN asignacion_academica aa ON aa.id_curso = mat.id_curso
        JOIN materias m ON aa.id_materia = m.id_materia
        LEFT JOIN docentes d ON aa.id_docente = d.id_docente
        WHERE e.id_usuario = $1
        GROUP BY m.id_materia, m.nombre, mat.id_curso, e.id_estudiante
      )
      SELECT 
        me.id_materia,
        me.nombre_materia,
        me.docente,
        (SELECT COUNT(DISTINCT fecha) FROM asistencias WHERE id_curso = me.id_curso AND id_materia = me.id_materia) AS clases_totales,
        COUNT(CASE WHEN a.estado IN ('Ausente', 'Llegada Tarde') THEN 1 END) AS fallas_acumuladas,
        COALESCE(
          json_agg(
            json_build_object(
              'id_falta', a.id_asistencia,
              'fecha', TO_CHAR(a.fecha, 'DD "de" TMMonth, YYYY'),
              'estado', a.estado
            ) ORDER BY a.fecha DESC
          ) FILTER (WHERE a.id_asistencia IS NOT NULL), '[]'
        ) AS detalle_faltas
      FROM MateriasEstudiante me
      LEFT JOIN asistencias a ON a.id_materia = me.id_materia AND a.id_estudiante = me.id_estudiante AND a.id_curso = me.id_curso
      GROUP BY me.id_materia, me.nombre_materia, me.docente, me.id_curso
      ORDER BY me.nombre_materia ASC
    `;
    
    const { rows } = await pool.query(query, [idUsuario]);
    
    const resultados = rows.map(row => {
      const clases_totales = parseInt(row.clases_totales, 10) || 0;
      const fallas_acumuladas = parseInt(row.fallas_acumuladas, 10) || 0;
      // El cálculo matemático ahora será perfecto al no haber duplicados
      const porcentaje = clases_totales > 0 ? ((clases_totales - fallas_acumuladas) / clases_totales) * 100 : 100;
      
      return {
        id_materia: row.id_materia,
        nombre_materia: row.nombre_materia,
        docente: row.docente,
        clases_totales,
        fallas_acumuladas,
        porcentaje,
        detalle_faltas: row.detalle_faltas
      };
    });

    res.json(resultados);
  } catch (error) {
    console.error("Error obteniendo asistencias:", error);
    next(error);
  }
};

// ==========================================
// ESTUDIANTE: ENTREGAR TAREA (VALIDADA Y CORREGIDA)
// ==========================================
export const entregarTareaEstudiante = async (req, res, next) => {
  const { idUsuario } = req.params;
  // OJO: Aunque la variable se llame idActividad, el frontend nos está enviando el id_tarea del calendario
  const { idActividad } = req.body; 
  const file = req.file;

  if (!file) return res.status(400).json({ message: "No se proporcionó archivo." });

  try {
    // 1. Buscamos la actividad real conectada a esta tarea
    const actividadQuery = `
      SELECT a.id_actividad, a.fecha_entrega 
      FROM tareas t
      JOIN actividades a ON t.id_actividad = a.id_actividad
      WHERE t.id_tarea = $1
    `;
    const { rows: actividadRows } = await pool.query(actividadQuery, [idActividad]);

    if (actividadRows.length === 0) {
      return res.status(404).json({ message: "No se encontró la actividad vinculada a esta tarea." });
    }

    const idActividadReal = actividadRows[0].id_actividad;

    // 2. Ajustamos el reloj: Le damos al estudiante hasta las 23:59:59 de ese día
    const fechaLimite = new Date(actividadRows[0].fecha_entrega);
    fechaLimite.setHours(23, 59, 59, 999); // Llevamos la hora al final del día
    const ahora = new Date();

    if (ahora > fechaLimite) {
      return res.status(403).json({ message: "El plazo de entrega ha vencido." });
    }

// 3. Subimos el archivo a Cloudinary
    const subirACloudinary = () => {
      return new Promise((resolve, reject) => {
        const stream = cloudinary.uploader.upload_stream(
          { 
            // Cambiamos 'auto' por 'image' (Cloudinary renderiza los PDF en el navegador bajo esta categoría)
            resource_type: "image", 
            folder: "cesl_tareas",
            // 👇 FORZAMOS EL FORMATO PDF AQUÍ 👇
            format: "pdf" 
          },
          (error, result) => {
            if (error) reject(error);
            else resolve(result.secure_url);
          }
        );
        stream.end(file.buffer);
      });
    };

    const urlPdf = await subirACloudinary();

    // 4. Guardamos en la base de datos (Usamos ON CONFLICT por si la fila aún no existe)
    const updateQuery = `
      INSERT INTO notas_actividades (id_actividad, id_estudiante, archivo_pdf, fecha_entrega)
      VALUES (
        $1, 
        (SELECT id_estudiante FROM estudiantes WHERE id_usuario = $2),
        $3,
        CURRENT_TIMESTAMP
      )
      ON CONFLICT (id_actividad, id_estudiante)
      DO UPDATE SET 
        archivo_pdf = EXCLUDED.archivo_pdf, 
        fecha_entrega = EXCLUDED.fecha_entrega;
    `;

    await pool.query(updateQuery, [idActividadReal, idUsuario, urlPdf]);

    res.json({ message: "Tarea entregada exitosamente." });

  } catch (error) {
    console.error("Error al procesar la entrega:", error);
    next(error);
  }
};
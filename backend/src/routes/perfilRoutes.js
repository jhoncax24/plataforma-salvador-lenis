// routes/perfilRoutes.js
const express = require("express");
const pool = require("../db");
const router = express.Router();

/* =============================
   ACUDIENTE
   ============================= */

// GET /api/acudiente/:id  → obtener datos del acudiente
router.get("/acudiente/:id", async (req, res) => {
  const { id } = req.params;
  try {
    const result = await pool.query(
      `
      SELECT 
        id_acudiente AS id,
        nombre,
        tipo_doc AS "tipoDoc",
        documento,
        telefono,
        correo,
        direccion
      FROM acudientes
      WHERE id_acudiente = $1
      `,
      [id]
    );

    if (result.rows.length === 0) {
      return res.status(404).json({ message: "Acudiente no encontrado" });
    }

    res.json(result.rows[0]);
  } catch (err) {
    console.error("Error obteniendo acudiente", err);
    res.status(500).json({ message: "Error del servidor" });
  }
});

// GET /api/acudiente/:id/estudiantes → obtener hijos
router.get("/acudiente/:id/estudiantes", async (req, res) => {
  const { id } = req.params;

  try {
    const result = await pool.query(
      `
      SELECT 
        id_estudiante AS id,
        nombre,
        tipo_doc AS "tipoDoc",
        documento,
        telefono,
        correo,
        direccion,
        grado
      FROM estudiante
      WHERE id_acudiente = $1
      ORDER BY id_estudiante
      `,
      [id]
    );

    res.json(result.rows);
  } catch (err) {
    console.error("Error obteniendo estudiantes", err);
    res.status(500).json({ message: "Error del servidor" });
  }
});

// PUT /api/acudiente/:id → actualizar datos del acudiente
router.put("/acudiente/:id", async (req, res) => {
  const { id } = req.params;
  const { nombre, tipoDoc, documento, telefono, correo, direccion } = req.body;

  try {
    const result = await pool.query(
      `
      UPDATE acudientes
      SET
        nombre = $1,
        tipo_doc = $2,
        documento = $3,
        telefono = $4,
        correo = $5,
        direccion = $6
      WHERE id_acudiente = $7
      RETURNING 
        id_acudiente AS id,
        nombre,
        tipo_doc AS "tipoDoc",
        documento,
        telefono,
        correo,
        direccion
      `,
      [nombre, tipoDoc, documento, telefono, correo, direccion, id]
    );

    res.json(result.rows[0]);
  } catch (err) {
    console.error("Error actualizando acudiente", err);
    res.status(500).json({ message: "Error del servidor" });
  }
});

// PUT /api/acudiente/:id/password → cambiar contraseña del acudiente (SIN bcrypt)
router.put("/acudiente/:id/password", async (req, res) => {
  const { id } = req.params;
  const { actual, nueva } = req.body;

  try {
    const result = await pool.query(
      "SELECT password FROM acudientes WHERE id_acudiente = $1",
      [id]
    );

    if (result.rows.length === 0) {
      return res.status(404).json({ message: "Acudiente no encontrado" });
    }

    const savedPassword = result.rows[0].password;

    if (String(actual) !== String(savedPassword)) {
  return res.status(400).json({ message: "Contraseña actual incorrecta" });
}


    await pool.query(
      "UPDATE acudientes SET password = $1 WHERE id_acudiente = $2",
      [nueva, id]
    );

    res.json({ message: "Contraseña actualizada correctamente" });
  } catch (err) {
    console.error("Error cambiando contraseña del acudiente", err);
    res.status(500).json({ message: "Error del servidor" });
  }
});

/* =============================
   ESTUDIANTE
   ============================= */

// PUT /api/estudiante/:id → actualizar datos del estudiante
router.put("/estudiante/:id", async (req, res) => {
  const { id } = req.params;
  const {
    nombre,
    tipoDoc,
    documento,
    telefono,
    correo,
    direccion,
    grado,
  } = req.body;

  try {
    const result = await pool.query(
      `
      UPDATE estudiante
      SET
        nombre = $1,
        tipo_doc = $2,
        documento = $3,
        telefono = $4,
        correo = $5,
        direccion = $6,
        grado = $7
      WHERE id_estudiante = $8
      RETURNING 
        id_estudiante AS id,
        nombre,
        tipo_doc AS "tipoDoc",
        documento,
        telefono,
        correo,
        direccion,
        grado
      `,
      [nombre, tipoDoc, documento, telefono, correo, direccion, grado, id]
    );

    res.json(result.rows[0]);
  } catch (err) {
    console.error("Error actualizando estudiante", err);
    res.status(500).json({ message: "Error del servidor" });
  }
});

// PUT /api/estudiante/:id/password → cambiar password del estudiante (SIN bcrypt)
router.put("/estudiante/:id/password", async (req, res) => {
  const { id } = req.params;
  const { actual, nueva } = req.body;

  try {
    const result = await pool.query(
      "SELECT password FROM estudiante WHERE id_estudiante = $1",
      [id]
    );

    if (result.rows.length === 0) {
      return res.status(404).json({ message: "Estudiante no encontrado" });
    }

    const savedPassword = result.rows[0].password;

  if (String(actual) !== String(savedPassword)) {
  return res.status(400).json({ message: "Contraseña actual incorrecta" });
}


    await pool.query(
      "UPDATE estudiante SET password = $1 WHERE id_estudiante = $2",
      [nueva, id]
    );

    res.json({ message: "Contraseña actualizada correctamente" });
  } catch (err) {
    console.error("Error cambiando contraseña del estudiante", err);
    res.status(500).json({ message: "Error del servidor" });
  }
});

// GET /api/estudiante/:id/notas  → notas por estudiante
router.get("/estudiante/:id/notas", async (req, res) => {
  const { id } = req.params;

  try {
    const result = await pool.query(
      `
      SELECT 
        n.id_nota AS id,
        m.nombre AS materia,
        m.docente,
        n.nota_p1,
        n.nota_p2,
        n.nota_p3,
        n.nota_final
      FROM notas_estudiante n
      INNER JOIN materias m ON m.id_materia = n.id_materia
      WHERE n.id_estudiante = $1
      ORDER BY m.nombre
      `,
      [id]
    );

    res.json(result.rows);
  } catch (err) {
    console.error("Error obteniendo notas del estudiante", err);
    res.status(500).json({ message: "Error del servidor" });
  }
});


module.exports = router;

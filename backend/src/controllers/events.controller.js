import { pool } from "../config/db.js";

export async function listEvents(req, res, next) {
  try {
    const { rows } = await pool.query('SELECT id, title, description, image_url, start_date, end_date FROM events ORDER BY id DESC');
    res.json(rows);
  } catch (err) {
    next(err);
  }
}

export async function getEvent(req, res, next) {
  const id = Number(req.params.id);
  try {
    const { rows } = await pool.query('SELECT id, title, description, image_url, start_date, end_date FROM events WHERE id=$1', [id]);
    if (rows.length === 0) return res.status(404).json({ error: 'Evento no encontrado' });
    res.json(rows[0]);
  } catch (err) {
    next(err);
  }
}

export async function createEvent(req, res, next) {
  const { title, description, image_url, start_date, end_date } = req.body;
  try {
    const { rows } = await pool.query(
      `INSERT INTO events (title, description, image_url, start_date, end_date) VALUES ($1,$2,$3,$4,$5) RETURNING id, title, description, image_url, start_date, end_date`,
      [title, description, image_url || null, start_date || null, end_date || null]
    );
    res.status(201).json(rows[0]);
  } catch (err) {
    next(err);
  }
}

export async function updateEvent(req, res, next) {
  const id = Number(req.params.id);
  const { title, description, image_url, start_date, end_date } = req.body;
  try {
    await pool.query(
      `UPDATE events SET title=$1, description=$2, image_url=$3, start_date=$4, end_date=$5 WHERE id=$6`,
      [title, description, image_url || null, start_date || null, end_date || null, id]
    );
    res.json({ ok: true });
  } catch (err) {
    next(err);
  }
}

export async function deleteEvent(req, res, next) {
  const id = Number(req.params.id);
  try {
    await pool.query('DELETE FROM events WHERE id=$1', [id]);
    res.json({ ok: true });
  } catch (err) {
    next(err);
  }
}

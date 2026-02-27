import { pool } from "../config/db.js";
import bcrypt from "bcrypt";

export async function createUser(req, res, next) {
  const { username, password, full_name, role } = req.body;
  try {
    const hashed = await bcrypt.hash(password, 10);
    const q = `INSERT INTO users (username, password_hash, full_name, role) VALUES ($1,$2,$3,$4) RETURNING id, username, full_name, role`;
    const { rows } = await pool.query(q, [username, hashed, full_name || '', role || 'acudiente']);
    res.status(201).json(rows[0]);
  } catch (err) {
    if (err.code === '23505') return res.status(409).json({ error: 'El nombre de usuario ya existe' });
    next(err);
  }
}

export async function getUsers(req, res, next) {
  try {
    const { rows } = await pool.query('SELECT id, username, full_name, role, created_at FROM users ORDER BY id DESC');
    res.json(rows);
  } catch (err) {
    next(err);
  }
}

export async function getUserById(req, res, next) {
  const id = Number(req.params.id);
  try {
    const { rows } = await pool.query('SELECT id, username, full_name, role, created_at FROM users WHERE id=$1', [id]);
    if (rows.length === 0) return res.status(404).json({ error: 'Usuario no encontrado' });
    res.json(rows[0]);
  } catch (err) {
    next(err);
  }
}

export async function updateUser(req, res, next) {
  const id = Number(req.params.id);
  const { full_name, role, password } = req.body;
  try {
    if (password) {
      const hashed = await bcrypt.hash(password, 10);
      await pool.query('UPDATE users SET full_name=$1, role=$2, password_hash=$3 WHERE id=$4', [full_name || '', role || 'acudiente', hashed, id]);
    } else {
      await pool.query('UPDATE users SET full_name=$1, role=$2 WHERE id=$3', [full_name || '', role || 'acudiente', id]);
    }
    res.json({ ok: true });
  } catch (err) {
    next(err);
  }
}

export async function deleteUser(req, res, next) {
  const id = Number(req.params.id);
  try {
    await pool.query('DELETE FROM users WHERE id=$1', [id]);
    res.json({ ok: true });
  } catch (err) {
    next(err);
  }
}

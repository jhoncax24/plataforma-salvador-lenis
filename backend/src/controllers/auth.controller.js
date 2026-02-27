import { pool } from "../config/db.js";
import bcrypt from "bcrypt";
import jwt from "jsonwebtoken";

export async function login(req, res, next) {
  const { username, password } = req.body;
  try {
    const q = 'SELECT id, username, password_hash, full_name, role FROM users WHERE username = $1';
    const { rows } = await pool.query(q, [username]);

    if (rows.length === 0) return res.status(401).json({ error: 'Credenciales inválidas' });

    const user = rows[0];
    const match = await bcrypt.compare(password, user.password_hash);

    if (!match) return res.status(401).json({ error: 'Credenciales inválidas' });

    const payload = { id: user.id, username: user.username, role: user.role };
    const token = jwt.sign(payload, process.env.JWT_SECRET, { expiresIn: process.env.JWT_EXPIRES_IN || '8h' });

    res.json({ token, user: { id: user.id, username: user.username, full_name: user.full_name, role: user.role } });
  } catch (err) {
    next(err);
  }
}

import pool from '../models/db.js';
import queries from '../models/queries.js';

export async function getTransactionsHandler(req, res) {
  try {
    const [rows] = await pool.query(queries.getTransactions);
    res.json(rows);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
}

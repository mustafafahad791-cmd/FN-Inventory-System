// User Model
const pool = require('../utils/db');
const bcrypt = require('bcryptjs');

class User {
  static async create(username, email, password, fullName = null, role = 'admin') {
    try {
      const saltRounds = 10;
      const passwordHash = await bcrypt.hash(password, saltRounds);

      const result = await pool.query(
        'INSERT INTO "User" (username, email, password_hash, full_name, role) VALUES ($1, $2, $3, $4, $5) RETURNING id, username, email, full_name, role, created_at',
        [username, email, passwordHash, fullName, role]
      );
      return result.rows[0];
    } catch (error) {
      if (error.code === '23505') {
        // Unique constraint violation
        throw new Error('Username or email already exists');
      }
      throw error;
    }
  }

  static async findByUsername(username) {
    const result = await pool.query('SELECT * FROM "User" WHERE username = $1 AND is_active = true', [username]);
    return result.rows[0];
  }

  static async findByEmail(email) {
    const result = await pool.query('SELECT * FROM "User" WHERE email = $1 AND is_active = true', [email]);
    return result.rows[0];
  }

  static async findById(id) {
    const result = await pool.query('SELECT id, username, email, full_name, role, is_active, created_at FROM "User" WHERE id = $1', [id]);
    return result.rows[0];
  }

  static async verifyPassword(plainPassword, passwordHash) {
    return await bcrypt.compare(plainPassword, passwordHash);
  }

  static async updateLastLogin(id) {
    await pool.query('UPDATE "User" SET updated_at = CURRENT_TIMESTAMP WHERE id = $1', [id]);
  }

  static async getAll() {
    const result = await pool.query('SELECT id, username, email, full_name, role, is_active, created_at FROM "User" WHERE is_active = true ORDER BY created_at DESC');
    return result.rows;
  }

  static async deactivate(id) {
    const result = await pool.query('UPDATE "User" SET is_active = false, updated_at = CURRENT_TIMESTAMP WHERE id = $1 RETURNING id, username, email', [id]);
    return result.rows[0];
  }

  static async updateUser(id, updates) {
    const { email, fullName, role } = updates;
    const result = await pool.query(
      'UPDATE "User" SET email = COALESCE($1, email), full_name = COALESCE($2, full_name), role = COALESCE($3, role), updated_at = CURRENT_TIMESTAMP WHERE id = $4 RETURNING id, username, email, full_name, role',
      [email, fullName, role, id]
    );
    return result.rows[0];
  }
}

module.exports = User;

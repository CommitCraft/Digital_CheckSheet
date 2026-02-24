const db = require('../config/db');

class Line {

  // ✅ CREATE
  static async create(name) {

    const q = `
      INSERT INTO lines
      VALUES (?)
    `;

    return db.execute(q, [name]);
  }


  // ✅ GET ALL
  static async getAll() {

    const q = `
      SELECT *
      FROM lines
      WHERE status = 'active'
      ORDER BY id DESC
    `;

    return db.execute(q);
  }


  // ✅ GET BY ID
  static async getById(id) {

    const q = `
      SELECT *
      FROM lines
      WHERE id = ?
    `;

    const rows = await db.execute(q, [id]);

    return rows[0] || null;
  }


  // ✅ UPDATE
  static async update(id, name, status) {

    const q = `
      UPDATE lines
      SET name = ?, status = ?
      WHERE id = ?
    `;

    return db.execute(q, [name, status, id]);
  }


  // ✅ SOFT DELETE
  static async delete(id) {

    const q = `
      UPDATE lines
      SET status = 'inactive'
      WHERE id = ?
    `;

    return db.execute(q, [id]);
  }

}

module.exports = Line;
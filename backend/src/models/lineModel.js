const db = require('../config/db');

class Line {

  // ✅ CREATE
  static async create(name, status = 'active') {

    const q = `
      INSERT INTO \`lines\` (name, status)
      VALUES (?, ?)
    `;

    return db.execute(q, [name, status]);
  }


  // ✅ GET ALL
  static async getAll() {

    const q = `
      SELECT *
      FROM \`lines\`
      WHERE status = 'active'
      ORDER BY id DESC
    `;

    return db.execute(q);
  }


  // ✅ GET BY ID
  static async getById(id) {

    const q = `
      SELECT *
      FROM \`lines\`
      WHERE id = ?
    `;

    const rows = await db.execute(q, [id]);

    return rows[0] || null;
  }


  // ✅ UPDATE
  static async update(id, name, status) {

    const setClauses = [];
    const params = [];

    if (name !== undefined) {
      setClauses.push('name = ?');
      params.push(name);
    }

    if (status !== undefined) {
      setClauses.push('status = ?');
      params.push(status);
    }

    if (!setClauses.length) return null;


    const q = `
      UPDATE \`lines\`
      SET ${setClauses.join(', ')}
      WHERE id = ?
    `;

    params.push(id);

    return db.execute(q, params);
  }


  // ✅ SOFT DELETE
  static async delete(id) {

    const q = `
      UPDATE \`lines\`
      SET status = 'inactive'
      WHERE id = ?
    `;

    return db.execute(q, [id]);
  }

}

module.exports = Line;
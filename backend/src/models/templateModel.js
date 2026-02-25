const db = require("../config/db");

class Template {

  static async create(data) {
    const q = `
      INSERT INTO templates
      (name, entity_type, entity_id, schema_json)
      VALUES (?, ?, ?, ?)
    `;
    return db.execute(q, [
      data.name,
      data.entity_type,
      data.entity_id,
      JSON.stringify(data.schema_json)
    ]);
  }

  static async getAll() {
    const q = `
      SELECT *
      FROM templates
      WHERE is_deleted = 0
      ORDER BY id DESC
    `;
    return db.execute(q);
  }

  static async getById(id) {
    const q = `
      SELECT *
      FROM templates
      WHERE id = ? AND is_deleted = 0
    `;
    const [rows] = await db.execute(q, [id]);
    return rows[0] || null;
  }

  static async update(id, data) {
    const q = `
      UPDATE templates
      SET name = ?,
          schema_json = ?,
          version = version + 1
      WHERE id = ?
    `;
    return db.execute(q, [
      data.name,
      JSON.stringify(data.schema_json),
      id
    ]);
  }

  static async softDelete(id) {
    return db.execute(
      `UPDATE templates SET is_deleted = 1, deleted_at = NOW() WHERE id = ?`,
      [id]
    );
  }

  static async restore(id) {
    return db.execute(
      `UPDATE templates SET is_deleted = 0, deleted_at = NULL WHERE id = ?`,
      [id]
    );
  }

  static async hardDelete(id) {
    return db.execute(
      `DELETE FROM templates WHERE id = ?`,
      [id]
    );
  }

}

module.exports = Template;
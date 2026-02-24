const { Line, ActivityLog } = require('../models');

class LineController {


  // ✅ GET ALL
  static async getLines(req, res) {
    try {

      const rows = await Line.getAll();

      res.json({
        success: true,
        data: rows
      });

    } catch (err) {
      console.error(err);

      res.status(500).json({
        success: false,
        message: 'Failed to fetch lines'
      });
    }
  }


  // ✅ GET ONE
  static async getLineById(req, res) {
    try {

      const id = Number(req.params.id);

      const line = await Line.getById(id);

      if (!line) {
        return res.status(404).json({
          success: false,
          message: 'Line not found'
        });
      }

      res.json({
        success: true,
        data: line
      });

    } catch (err) {
      console.error(err);

      res.status(500).json({
        success: false,
        message: 'Failed to fetch line'
      });
    }
  }


  // ✅ CREATE
  static async createLine(req, res) {
    try {

      const { name } = req.body;

      await Line.create(name);


      // Optional Log
      if (req.user) {
        await ActivityLog.logUserAction(
          req.user.id,
          req.user.username,
          'create',
          'line',
          null,
          { name },
          req
        );
      }

      res.status(201).json({
        success: true,
        message: 'Line created successfully'
      });

    } catch (err) {

      if (err.code === 'ER_DUP_ENTRY') {
        return res.status(409).json({
          success: false,
          message: 'Line already exists'
        });
      }

      console.error(err);

      res.status(500).json({
        success: false,
        message: 'Failed to create line'
      });
    }
  }


  // ✅ UPDATE
  static async updateLine(req, res) {
    try {

      const id = Number(req.params.id);
      const { name, status } = req.body;


      const exists = await Line.getById(id);

      if (!exists) {
        return res.status(404).json({
          success: false,
          message: 'Line not found'
        });
      }

      await Line.update(id, name, status);


      res.json({
        success: true,
        message: 'Line updated successfully'
      });

    } catch (err) {
      console.error(err);

      res.status(500).json({
        success: false,
        message: 'Failed to update line'
      });
    }
  }


  // ✅ DELETE
  static async deleteLine(req, res) {
    try {

      const id = Number(req.params.id);

      const exists = await Line.getById(id);

      if (!exists) {
        return res.status(404).json({
          success: false,
          message: 'Line not found'
        });
      }

      await Line.delete(id);


      res.json({
        success: true,
        message: 'Line deleted successfully'
      });

    } catch (err) {
      console.error(err);

      res.status(500).json({
        success: false,
        message: 'Failed to delete line'
      });
    }
  }

}

module.exports = LineController;
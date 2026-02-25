const Template = require("../models/templateModel");

exports.create = async (req, res) => {
  try {
    await Template.create(req.body);
    res.json({ ok: true, message: "Template created" });
  } catch (err) {
    res.status(500).json({ ok: false, message: "Server error" });
  }
};

exports.getAll = async (req, res) => {
  const [rows] = await Template.getAll();
  res.json(rows);
};

exports.getById = async (req, res) => {
  const template = await Template.getById(req.params.id);
  res.json(template);
};

exports.update = async (req, res) => {
  await Template.update(req.params.id, req.body);
  res.json({ ok: true, message: "Updated" });
};

exports.softDelete = async (req, res) => {
  await Template.softDelete(req.params.id);
  res.json({ ok: true, message: "Soft deleted" });
};

exports.restore = async (req, res) => {
  await Template.restore(req.params.id);
  res.json({ ok: true, message: "Restored" });
};

exports.hardDelete = async (req, res) => {
  await Template.hardDelete(req.params.id);
  res.json({ ok: true, message: "Permanently deleted" });
};
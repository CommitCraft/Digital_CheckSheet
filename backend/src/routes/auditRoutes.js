const express = require("express");
const { getAuditConfig } = require("../controllers/auditController");

const router = express.Router();

router.get("/config", getAuditConfig);

module.exports = router;
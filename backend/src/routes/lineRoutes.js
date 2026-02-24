const express = require('express');
const router = express.Router();

console.log('✅ lineRoutes loaded');

const LineController = require('../controllers/lineController');

const { auth } = require('../middleware/auth');

const {
  createLineValidation,
  updateLineValidation,
  lineIdValidation
} = require('../middleware/validation');


// ⚠️ Comment auth if debugging
// router.use(auth);


/* ===============================
   GET ALL
================================*/

router.get('/',
  LineController.getLines
);


/* ===============================
   GET ONE
================================*/

router.get('/:id',
  lineIdValidation,
  LineController.getLineById
);


/* ===============================
   CREATE
================================*/

router.post('/',
  createLineValidation,
  LineController.createLine
);


/* ===============================
   UPDATE
================================*/

router.put('/:id',
  updateLineValidation,
  LineController.updateLine
);


/* ===============================
   DELETE
================================*/

router.delete('/:id',
  lineIdValidation,
  LineController.deleteLine
);


module.exports = router;
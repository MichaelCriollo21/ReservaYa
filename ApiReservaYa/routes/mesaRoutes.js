const express = require('express');
const router = express.Router();
const { obtenerMesas } = require('../controllers/mesaController');

router.get('/', obtenerMesas);

module.exports = router;

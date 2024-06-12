const express = require('express');
const ticketController = require('../../controllers/ticketController');
const router = express.Router();

router.get('/:ticketId', ticketController.showTicket);

module.exports = router;
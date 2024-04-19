const express = require('express');
const messageController = require('../../controllers/MessageController');
const router = express.Router();

router.get('/messages', messageController.getAllMessages);
router.post('/messages', messageController.postMessage);

module.exports = router;
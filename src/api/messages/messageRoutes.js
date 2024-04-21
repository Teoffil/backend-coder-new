const express = require('express');
const messageController = require('../../controllers/MessageController');
const { authorize } = require('../../middleware/authorization');  
const router = express.Router();

router.get('/messages', messageController.getAllMessages);
router.post('/messages', authorize(['usuario']), messageController.postMessage);

module.exports = router;
const express = require('express');
const logger = require('../config/logger');
const router = express.Router();

router.get('/loggerTest', (req, res) => {
    logger.debug('Test debug');
    logger.info('Test info');
    logger.warn('Test warning');
    logger.error('Test error');
    res.send('Logging test completed. Check your console and logs.');
});

module.exports = router;
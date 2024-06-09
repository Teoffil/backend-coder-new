const express = require('express');
const logger = require('../config/logger');
const router = express.Router();
const { authorize } = require('../middleware/authorization');
const User = require('../dao/models/UserSchema');

router.get('/admin/users', authorize(['admin']), async (req, res) => {
    try {
        logger.debug('Ruta /admin/users accedida en generalRouter');
        const users = await User.find({}, 'first_name last_name email role');
        logger.debug('Usuarios obtenidos de la base de datos', { users });
        res.render('adminUsers', { users: users.map(user => user.toJSON()) }); // Asegurarse de pasar los datos como JSON
    } catch (error) {
        logger.error('Error loading users', { error: error.message });
        res.status(500).send('Error loading users');
    }
});

router.get('/loggerTest', (req, res) => {
    logger.debug('Test debug');
    logger.info('Test info');
    logger.warn('Test warning');
    logger.error('Test error');
    res.send('Logging test completed. Check your console and logs.');
});

module.exports = router;

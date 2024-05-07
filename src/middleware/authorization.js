// src/middleware/authorization.js
const jwt = require('jsonwebtoken');
const { JWT_SECRET } = require('../../config');
const logger = require('../config/logger');

const authorize = (roles = []) => {
    if (typeof roles === 'string') {
        roles = [roles];
    }

    return [
        (req, res, next) => {
            const authHeader = req.headers.authorization;
            if (!authHeader) {
                logger.warn('No token provided');
                return res.status(401).json({ message: 'No token provided' });
            }

            const token = authHeader.split(' ')[1];
            if (!token) {
                logger.warn('Token is not complete');
                return res.status(401).json({ message: 'Token is not complete' });
            }

            jwt.verify(token, JWT_SECRET, (err, decoded) => {
                if (err) {
                    logger.error('Unauthorized', { error: err });
                    return res.status(401).json({ message: 'Unauthorized', error: err });
                }

                logger.debug('Decoded JWT:', JSON.stringify(decoded, null, 2));
                logger.debug('Roles allowed:', JSON.stringify(roles, null, 2));
                logger.debug('User\'s role from token:', decoded.role);

                if (!roles.includes(decoded.role)) {
                    logger.warn('Forbidden, role not allowed', { allowedRoles: roles, userRole: decoded.role });
                    return res.status(403).json({ message: 'Forbidden, role not allowed' });
                }

                req.user = decoded;
                next();
            });
        }
    ];
};

module.exports = { authorize };

const jwt = require('jsonwebtoken');
const { JWT_SECRET } = require('../../config');

const authorize = (roles = []) => {
    if (typeof roles === 'string') {
        roles = [roles];
    }

    return [
        (req, res, next) => {
            const token = req.headers.authorization.split(' ')[1]; // Asume que el token se pasa como Bearer
            if (!token) {
                return res.status(401).json({ message: 'No token provided' });
            }
            jwt.verify(token, JWT_SECRET, (err, decoded) => {
                if (err) {
                    return res.status(401).json({ message: 'Unauthorized', error: err });
                }
                if (!roles.includes(decoded.role)) {
                    return res.status(403).json({ message: 'Forbidden, role not allowed' });
                }
                req.user = decoded; 
                next();
            });
        }
    ];
};

module.exports = { authorize };

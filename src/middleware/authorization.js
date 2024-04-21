const jwt = require('jsonwebtoken');
const { JWT_SECRET } = require('../../config');

const authorize = (roles = []) => {
    if (typeof roles === 'string') {
        roles = [roles];
    }

    return [
        (req, res, next) => {
            const authHeader = req.headers.authorization;
            if (!authHeader) {
                return res.status(401).json({ message: 'No token provided' });
            }

            const token = authHeader.split(' ')[1];
            if (!token) {
                return res.status(401).json({ message: 'Token is not complete' });
            }

            jwt.verify(token, JWT_SECRET, (err, decoded) => {
                if (err) {
                    return res.status(401).json({ message: 'Unauthorized', error: err });
                }

                console.log("Decoded JWT:", decoded);
                console.log("Roles allowed:", roles);
                console.log("User's role from token:", decoded.role);

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


const authorize = (roles = []) => {
    if (typeof roles === 'string') {
        roles = [roles];
    }

    return [
        (req, res, next) => {
            if (!req.isAuthenticated() || !roles.includes(req.user.role)) {
                return res.status(403).json({ message: 'Unauthorized' });
            }
            next();
        }
    ];
};

module.exports = { authorize };

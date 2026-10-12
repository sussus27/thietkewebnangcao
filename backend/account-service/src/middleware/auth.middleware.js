const { verifyToken } = require('../utils/jwt.util');
const AppError = require('../utils/error.util');

function authMiddleware(req, res, next) {
    const authorization = req.headers.authorization;
    if (!authorization) return next(new AppError(401, 'MISSING_AUTH_HEADER', 'Missing Authorization header'));

    const [scheme, token, ...extra] = authorization.split(' ');
    if (scheme !== 'Bearer' || !token || extra.length > 0) return next(new AppError(401, 'INVALID_AUTH_HEADER', 'Invalid Authorization header format'));

    try {
        const payload = verifyToken(token);
        if (typeof payload.sub !== 'string' || !/^[1-9]\d*$/.test(payload.sub)) return next(new AppError(401, 'INVALID_TOKEN', 'Invalid token subject'));

        req.user = {
            id: Number(payload.sub),
            email: payload.email,
            role: payload.role
        };

        next();
    } catch (error) {
        if (error.name === 'TokenExpiredError') return next(new AppError(401, 'TOKEN_EXPIRED', 'Token has expired'));
        return next(new AppError(401, 'INVALID_TOKEN', 'Invalid token'));
    }
}

module.exports = authMiddleware;
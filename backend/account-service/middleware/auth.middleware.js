const { verifyToken } = require('../config/jwt.config');

function authMiddleware(req, res, next) {
    const authorization = req.headers.authorization;

    if (!authorization) {
        return res.status(401).json({
            error: 'MISSING_TOKEN',
            message: 'Authorization token is required'
        });
    }

    const [scheme, token, ...extra] = authorization.split(' ');

    if (scheme !== 'Bearer' || !token || extra.length > 0) {
        return res.status(401).json({
            error: 'INVALID_AUTH_HEADER',
            message: 'Invalid Authorization header'
        });
    }

    try {
        const payload = verifyToken(token);

        if (
            typeof payload.sub !== 'string' ||
            !/^[1-9]\d*$/.test(payload.sub)
        ) {
            return res.status(401).json({
                error: 'INVALID_TOKEN',
                message: 'Invalid token subject'
            });
        }

        req.user = {
            id: Number(payload.sub),
            email: payload.email,
            role: payload.role
        };

        next();
    } catch (error) {
        if (error.name === 'TokenExpiredError') {
            return res.status(401).json({
                error: 'TOKEN_EXPIRED',
                message: 'Token has expired'
            });
        }

        return res.status(401).json({
            error: 'INVALID_TOKEN',
            message: 'Invalid token'
        });
    }
}

module.exports = authMiddleware;
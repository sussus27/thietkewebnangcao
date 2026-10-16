const jwt = require('jsonwebtoken');

const JWT_SECRET = process.env.JWT_SECRET;
const JWT_ISSUER = process.env.JWT_ISSUER || 'account-service';
const JWT_AUDIENCE = process.env.JWT_AUDIENCE || 'listener';

if (!JWT_SECRET || Buffer.byteLength(JWT_SECRET, 'utf8') < 32) {
    throw new Error('JWT_SECRET must be at least 32 characters');
}

function verifyToken(token) {
    return jwt.verify(
        token,
        JWT_SECRET,
        {
            algorithms: ['HS256'],
            issuer: JWT_ISSUER,
            audience: JWT_AUDIENCE
        }
    );
}

module.exports = {
    verifyToken
};

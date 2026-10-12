const jwt = require('jsonwebtoken');

const JWT_SECRET = process.env.JWT_SECRET;
const JWT_EXPIRES_IN = process.env.JWT_EXPIRES_IN || '1d';
const JWT_ISSUER = process.env.JWT_ISSUER || 'account-service';
const JWT_AUDIENCE = process.env.JWT_AUDIENCE || 'music-streaming-api';

if (!JWT_SECRET || Buffer.byteLength(JWT_SECRET, 'utf8') < 32) {
    throw new Error('JWT_SECRET must be at least 32 characters');
}

function generateToken(user) {
    return jwt.sign(
        {
            email: user.email,
            role: user.role
        },
        JWT_SECRET,
        {
            algorithm: 'HS256',
            subject: String(user.id),
            issuer: JWT_ISSUER,
            audience: JWT_AUDIENCE,
            expiresIn: JWT_EXPIRES_IN
        }
    );
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
    generateToken,
    verifyToken,
};
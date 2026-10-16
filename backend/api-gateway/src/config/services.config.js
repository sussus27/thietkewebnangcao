const ACCOUNT_SERVICE_URL = process.env.ACCOUNT_SERVICE_URL || 'http://localhost:4001';
const STREAMING_SERVICE_URL = process.env.STREAMING_SERVICE_URL || 'http://localhost:4002';
const UPLOAD_SERVICE_URL = process.env.UPLOAD_SERVICE_URL || 'http://localhost:4003';
const MUSIC_SERVICE_URL = process.env.MUSIC_SERVICE_URL || 'http://localhost:4004';

module.exports = {
    ACCOUNT_SERVICE_URL,
    STREAMING_SERVICE_URL,
    UPLOAD_SERVICE_URL,
    MUSIC_SERVICE_URL
};

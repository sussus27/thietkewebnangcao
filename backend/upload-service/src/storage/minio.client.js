const { Client } = require('minio');

const BUCKET = process.env.MINIO_BUCKET;

const client = new Client({
    endPoint: process.env.MINIO_ENDPOINT,
    port: Number(process.env.MINIO_PORT),
    useSSL: process.env.MINIO_USE_SSL === 'true',
    accessKey: process.env.MINIO_ACCESS_KEY,
    secretKey: process.env.MINIO_SECRET_KEY
});

async function ensureBucket() {
    const exists = await client.bucketExists(BUCKET);

    if (!exists) {
        await client.makeBucket(BUCKET);
    }

    console.log(`MinIO Connected (bucket: ${BUCKET})`);
}

module.exports = {
    client,
    BUCKET,
    ensureBucket
};

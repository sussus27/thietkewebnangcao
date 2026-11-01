const { Pool } = require('pg');

const pool = new Pool({
    connectionString: process.env.DATABASE_URL
});

async function connectDB() {
    const client = await pool.connect();
    console.log('PostgreSQL Connected');
    client.release();
}

async function withTransaction(work) {
    const client = await pool.connect();

    try {
        await client.query('BEGIN');
        const result = await work(client);
        await client.query('COMMIT');

        return result;
    } catch (error) {
        await client.query('ROLLBACK');
        throw error;
    } finally {
        client.release();
    }
}

pool.on('error', (err) => {
    console.error('Unexpected error on idle client', err);
    process.exit(-1);
});

module.exports = {
    pool,
    connectDB,
    withTransaction
};

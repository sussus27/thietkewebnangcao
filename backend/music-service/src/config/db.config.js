const { Pool } = require('pg');

const pool = new Pool({
    connectionString: process.env.DATABASE_URL
});

async function connectDB() {
    const client = await pool.connect();
    console.log('PostgreSQL Connected');
    client.release();
}

pool.on('error', (err) => {
    console.error('Unexpected error on idle client', err);
    process.exit(-1);
});

module.exports = {
    pool,
    connectDB
};

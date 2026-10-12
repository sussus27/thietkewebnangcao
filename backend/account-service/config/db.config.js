const { Pool } = require('pg');


const pool = new Pool({
    connectionString: process.env.DATABASE_URL
});

async function connectDB() {  
    try {
        const client = await pool.connect();
        console.log("PostgreSQL Connected");
        client.release();
    } catch (error) {
        console.error("Error connecting to PostgreSQL:", error.message);
        process.exit(1);
    }
}

pool.on("error", (err) => {
  console.error("Unexpected error on idle client", err);
  process.exit(-1);
});

module.exports = {
    pool,
    connectDB
};
const { Client } = require('pg');
require('dotenv').config();

const createDatabase = async () => {
    const client = new Client({
        user: process.env.DB_USER || 'postgres',
        password: process.env.DB_PASSWORD, // Uses what's exactly in .env
        host: process.env.DB_HOST || 'localhost',
        port: process.env.DB_PORT || 5432,
        database: 'postgres',
    });

    try {
        await client.connect();
        console.log(`Connected to default postgres database using .env password.`);

        // Check if db exists
        const res = await client.query("SELECT 1 FROM pg_database WHERE datname = 'wissen_seats'");
        if (res.rowCount === 0) {
            console.log("Database 'wissen_seats' not found, creating it...");
            await client.query('CREATE DATABASE wissen_seats');
            console.log("Database 'wissen_seats' created successfully.");
        } else {
            console.log("Database 'wissen_seats' already exists.");
        }
    } catch (err) {
        console.error("Failed to connect. Please check .env credentials.");
    } finally {
        await client.end().catch(() => { });
    }
};

createDatabase();

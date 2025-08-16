import pg from "pg";
import dotenv from "dotenv";

dotenv.config();

const { Pool } = pg;

// Konfiguracija za development
const localPoolConfig = {
  user: process.env.DB_USER || "postgres",
  password: process.env.DB_PASSWORD || "postgres",
  host: process.env.DB_HOST || "localhost",
  port: process.env.DB_PORT || 5432,
  database: process.env.DB_NAME || "jwtauth",
  max: 20,
  idleTimeoutMillis: 30000,
  connectionTimeoutMillis: 2000,
};

const pool = new Pool(localPoolConfig);

export default pool;

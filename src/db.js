import mysql from "mysql2/promise";

export const pool = mysql.createPool({
  host: process.env.DB_HOST || "localhost",
  port: Number(process.env.DB_PORT || 3306),
  database: process.env.DB_NAME || "tareas_db",
  user: process.env.DB_USER || "usuario_tareas",
  password: process.env.DB_PASSWORD || "clave_tareas_local",
  waitForConnections: true,
  connectionLimit: 10,
  queueLimit: 0,
  charset: "utf8mb4"
});

export async function closeDatabase() {
  await pool.end();
}

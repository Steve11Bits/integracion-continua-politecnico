import express from "express";
import os from "node:os";
import { pool } from "./db.js";
import { parseTaskId, validateTaskInput } from "./validation.js";

export const app = express();
app.disable("x-powered-by");
app.use(express.json({ limit: "100kb" }));

app.get("/", (_req, res) => {
  res.json({
    project: "Gestión de tareas - Grupo 5",
    course: "Integración Continua",
    endpoints: ["/health", "/api/tasks", "/api/tasks/:id"]
  });
});

app.get("/health", async (_req, res, next) => {
  try {
    const [rows] = await pool.query("SELECT 1 AS connection_test");
    res.json({
      status: "ok",
      api_container: os.hostname(),
      database: {
        status: "connected",
        host: process.env.DB_HOST || "localhost",
        connection_test: rows[0].connection_test
      }
    });
  } catch (error) {
    error.statusCode = 503;
    next(error);
  }
});

app.get("/api/tasks", async (_req, res, next) => {
  try {
    const [rows] = await pool.query(
      "SELECT id, title, description, status, priority, created_at, updated_at FROM tasks ORDER BY id"
    );
    res.json({ count: rows.length, data: rows });
  } catch (error) {
    next(error);
  }
});

app.get("/api/tasks/:id", async (req, res, next) => {
  try {
    const id = parseTaskId(req.params.id);
    if (!id) return res.status(400).json({ error: "El identificador debe ser un entero positivo." });

    const [rows] = await pool.execute(
      "SELECT id, title, description, status, priority, created_at, updated_at FROM tasks WHERE id = ?",
      [id]
    );
    if (rows.length === 0) return res.status(404).json({ error: "Tarea no encontrada." });
    res.json({ data: rows[0] });
  } catch (error) {
    next(error);
  }
});

app.post("/api/tasks", async (req, res, next) => {
  try {
    const { data, error } = validateTaskInput(req.body);
    if (error) return res.status(400).json({ error });

    const [result] = await pool.execute(
      `INSERT INTO tasks (title, description, status, priority)
       VALUES (?, ?, COALESCE(?, 'pendiente'), COALESCE(?, 'media'))`,
      [data.title, data.description ?? null, data.status ?? null, data.priority ?? null]
    );
    const [rows] = await pool.execute("SELECT * FROM tasks WHERE id = ?", [result.insertId]);
    res.status(201).json({ message: "Tarea creada correctamente.", data: rows[0] });
  } catch (error) {
    next(error);
  }
});

app.patch("/api/tasks/:id", async (req, res, next) => {
  try {
    const id = parseTaskId(req.params.id);
    if (!id) return res.status(400).json({ error: "El identificador debe ser un entero positivo." });

    const { data, error } = validateTaskInput(req.body, { partial: true });
    if (error) return res.status(400).json({ error });

    const fields = Object.keys(data);
    const assignments = fields.map((field) => `${field} = ?`).join(", ");
    const [result] = await pool.execute(
      `UPDATE tasks SET ${assignments} WHERE id = ?`,
      [...Object.values(data), id]
    );
    if (result.affectedRows === 0) return res.status(404).json({ error: "Tarea no encontrada." });

    const [rows] = await pool.execute("SELECT * FROM tasks WHERE id = ?", [id]);
    res.json({ message: "Tarea actualizada correctamente.", data: rows[0] });
  } catch (error) {
    next(error);
  }
});

app.delete("/api/tasks/:id", async (req, res, next) => {
  try {
    const id = parseTaskId(req.params.id);
    if (!id) return res.status(400).json({ error: "El identificador debe ser un entero positivo." });

    const [result] = await pool.execute("DELETE FROM tasks WHERE id = ?", [id]);
    if (result.affectedRows === 0) return res.status(404).json({ error: "Tarea no encontrada." });
    res.json({ message: "Tarea eliminada correctamente.", id });
  } catch (error) {
    next(error);
  }
});

app.use((_req, res) => {
  res.status(404).json({ error: "Ruta no encontrada." });
});

app.use((error, _req, res, _next) => {
  console.error(error);
  if (error.type === "entity.parse.failed") {
    return res.status(400).json({ error: "El JSON enviado no es válido." });
  }
  res.status(error.statusCode || 500).json({
    error: error.statusCode === 503
      ? "No fue posible establecer comunicación con la base de datos."
      : "Error interno del servidor."
  });
});

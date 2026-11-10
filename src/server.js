import "dotenv/config";
import { app } from "./app.js";
import { closeDatabase } from "./db.js";

const port = Number(process.env.PORT || 3000);
const server = app.listen(port, () => {
  console.log(`API de gestión de tareas disponible en el puerto ${port}`);
});

async function shutdown(signal) {
  console.log(`Señal ${signal} recibida. Cerrando la aplicación...`);
  server.close(async () => {
    await closeDatabase();
    process.exit(0);
  });
}

process.on("SIGTERM", () => shutdown("SIGTERM"));
process.on("SIGINT", () => shutdown("SIGINT"));

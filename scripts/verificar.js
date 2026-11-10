const baseUrl = process.env.BASE_URL || "http://localhost:3000";
let createdId;

async function request(method, path, body, expectedStatus) {
  const response = await fetch(`${baseUrl}${path}`, {
    method,
    headers: body ? { "Content-Type": "application/json" } : undefined,
    body: body ? JSON.stringify(body) : undefined
  });
  const payload = await response.json();
  if (response.status !== expectedStatus) {
    throw new Error(`${method} ${path}: se esperaba ${expectedStatus}, se recibió ${response.status}. ${JSON.stringify(payload)}`);
  }
  console.log(`\n[OK] ${method} ${path} -> ${response.status}`);
  console.log(JSON.stringify(payload, null, 2));
  return payload;
}

try {
  console.log(`Verificando la solución en ${baseUrl}`);
  await request("GET", "/health", null, 200);
  await request("GET", "/api/tasks", null, 200);

  const created = await request("POST", "/api/tasks", {
    title: `Prueba de integración ${new Date().toISOString()}`,
    description: "Tarea temporal creada para validar la comunicación API-MySQL.",
    status: "pendiente",
    priority: "alta"
  }, 201);
  createdId = created.data.id;

  await request("GET", `/api/tasks/${createdId}`, null, 200);
  await request("PATCH", `/api/tasks/${createdId}`, { status: "completada" }, 200);
  await request("DELETE", `/api/tasks/${createdId}`, null, 200);
  createdId = undefined;

  console.log("\nRESULTADO: verificación integral exitosa. La API se comunicó con MySQL y completó el ciclo CRUD.");
} catch (error) {
  console.error(`\nERROR: ${error.message}`);
  process.exitCode = 1;
} finally {
  if (createdId) {
    await fetch(`${baseUrl}/api/tasks/${createdId}`, { method: "DELETE" }).catch(() => {});
  }
}

export const TASK_STATUSES = ["pendiente", "en_progreso", "completada"];
export const TASK_PRIORITIES = ["baja", "media", "alta"];

function cleanText(value) {
  return typeof value === "string" ? value.trim() : value;
}

export function validateTaskInput(body, { partial = false } = {}) {
  if (!body || typeof body !== "object" || Array.isArray(body)) {
    return { error: "El cuerpo de la solicitud debe ser un objeto JSON." };
  }

  const allowed = ["title", "description", "status", "priority"];
  const unknown = Object.keys(body).filter((key) => !allowed.includes(key));
  if (unknown.length > 0) {
    return { error: `Campos no permitidos: ${unknown.join(", ")}.` };
  }

  if (partial && Object.keys(body).length === 0) {
    return { error: "Debe enviar al menos un campo para actualizar." };
  }

  const data = {};

  if (!partial || Object.hasOwn(body, "title")) {
    const title = cleanText(body.title);
    if (typeof title !== "string" || title.length < 3 || title.length > 120) {
      return { error: "El título es obligatorio y debe tener entre 3 y 120 caracteres." };
    }
    data.title = title;
  }

  if (Object.hasOwn(body, "description")) {
    const description = cleanText(body.description);
    if (description !== null && (typeof description !== "string" || description.length > 500)) {
      return { error: "La descripción debe ser texto de máximo 500 caracteres o null." };
    }
    data.description = description || null;
  }

  if (Object.hasOwn(body, "status")) {
    if (!TASK_STATUSES.includes(body.status)) {
      return { error: `El estado debe ser uno de: ${TASK_STATUSES.join(", ")}.` };
    }
    data.status = body.status;
  }

  if (Object.hasOwn(body, "priority")) {
    if (!TASK_PRIORITIES.includes(body.priority)) {
      return { error: `La prioridad debe ser una de: ${TASK_PRIORITIES.join(", ")}.` };
    }
    data.priority = body.priority;
  }

  return { data };
}

export function parseTaskId(value) {
  const id = Number(value);
  return Number.isInteger(id) && id > 0 ? id : null;
}

import test from "node:test";
import assert from "node:assert/strict";
import { parseTaskId, validateTaskInput } from "../src/validation.js";

test("acepta una tarea válida y normaliza sus textos", () => {
  const result = validateTaskInput({
    title: "  Preparar entrega 1  ",
    description: "  Documentar GitHub y Docker  ",
    status: "en_progreso",
    priority: "alta"
  });
  assert.equal(result.error, undefined);
  assert.deepEqual(result.data, {
    title: "Preparar entrega 1",
    description: "Documentar GitHub y Docker",
    status: "en_progreso",
    priority: "alta"
  });
});

test("rechaza un título demasiado corto", () => {
  const result = validateTaskInput({ title: "AB" });
  assert.match(result.error, /entre 3 y 120/);
});

test("rechaza estados no definidos", () => {
  const result = validateTaskInput({ title: "Tarea válida", status: "terminada" });
  assert.match(result.error, /El estado debe ser/);
});

test("permite una actualización parcial", () => {
  const result = validateTaskInput({ status: "completada" }, { partial: true });
  assert.equal(result.error, undefined);
  assert.deepEqual(result.data, { status: "completada" });
});

test("rechaza una actualización vacía y campos desconocidos", () => {
  assert.match(validateTaskInput({}, { partial: true }).error, /al menos un campo/);
  assert.match(validateTaskInput({ title: "Tarea", admin: true }).error, /Campos no permitidos/);
});

test("valida identificadores enteros positivos", () => {
  assert.equal(parseTaskId("15"), 15);
  assert.equal(parseTaskId("0"), null);
  assert.equal(parseTaskId("abc"), null);
  assert.equal(parseTaskId("1.5"), null);
});

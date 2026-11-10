CREATE TABLE IF NOT EXISTS tasks (
  id INT UNSIGNED AUTO_INCREMENT PRIMARY KEY,
  title VARCHAR(120) NOT NULL,
  description VARCHAR(500) NULL,
  status ENUM('pendiente', 'en_progreso', 'completada') NOT NULL DEFAULT 'pendiente',
  priority ENUM('baja', 'media', 'alta') NOT NULL DEFAULT 'media',
  created_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

INSERT INTO tasks (title, description, status, priority)
SELECT * FROM (
  SELECT 'Configurar repositorio', 'Crear el repositorio y agregar a los integrantes del grupo 5.', 'completada', 'alta'
  UNION ALL
  SELECT 'Construir contenedores', 'Ejecutar la API y MySQL mediante Docker Compose.', 'en_progreso', 'alta'
  UNION ALL
  SELECT 'Documentar evidencias', 'Agregar capturas comentadas al informe PDF con normas APA.', 'pendiente', 'media'
) AS seed
WHERE NOT EXISTS (SELECT 1 FROM tasks LIMIT 1);

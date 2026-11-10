# Gestión de tareas — Grupo 5

Proyecto de la asignatura **Integración Continua** del Politécnico Grancolombiano. La entrega 1 demuestra el uso de GitHub y Docker mediante una API REST de gestión de tareas conectada a MySQL.

## Integrantes

- Brian Castañeda Martinez
- Christian Lauck Zuluaga
- Daniel Ricardo Medina Roldan
- Juan Giraldo Loaiza
- Steven Trejos Patiño

**Docente:** Edward Reyes Corredor  
**Proyecto:** gestión de tareas  
**Alcance de esta entrega:** dos contenedores comunicados entre sí. Jenkins corresponde a la entrega 2 y no se incluye en esta fase.

## Arquitectura

```text
Usuario / Postman / navegador
            |
            | HTTP — localhost:3000
            v
+-----------------------------+
| Contenedor: grupo5_api      |
| Node.js + Express           |
+-----------------------------+
            |
            | red_tareas — db:3306
            v
+-----------------------------+
| Contenedor: grupo5_mysql    |
| MySQL 8.4 + volumen         |
+-----------------------------+
```

La red `grupo5_red_tareas` permite que la API resuelva el nombre `db` y se conecte al puerto interno `3306`. MySQL no publica un puerto en el equipo anfitrión; solo la API queda expuesta en `localhost:3000`.

## Estructura

```text
.
├── compose.yaml              # Orquestación de los dos contenedores
├── Dockerfile                # Imagen de la API
├── .env.example              # Variables de demostración local
├── db/init/01_schema.sql     # Tabla y datos iniciales
├── src/                      # Código de la API
├── scripts/verificar.js      # Prueba integral del ciclo CRUD
└── test/                     # Pruebas unitarias de validación
```

## Requisitos

- Docker Desktop instalado y en ejecución.
- Git y una cuenta de GitHub.
- Puerto `3000` disponible.

No es necesario instalar Node.js ni MySQL en el computador para ejecutar la solución con Docker.

## 1. Crear y compartir el repositorio

1. En GitHub, seleccione **New repository**.
2. Use el nombre `gestion-tareas-grupo5`.
3. Agregue una descripción y seleccione la visibilidad que defina el grupo. Para facilitar la revisión docente, puede ser público.
4. Clone el repositorio y copie dentro todos los archivos de este proyecto.
5. En **Settings → Collaborators**, agregue a los cinco integrantes o comparta con el docente el medio de acceso acordado.
6. Realice commits con mensajes descriptivos y conserve el historial de cambios.

Comandos sugeridos desde la carpeta del proyecto:

```bash
git add .
git commit -m "Implementa API y dos contenedores comunicados"
git push origin main
```

No suba el archivo `.env`: ya está excluido mediante `.gitignore`. El archivo versionado es `.env.example`.

## 2. Ejecutar los dos contenedores

Primero abra Docker Desktop y espere a que el motor esté en ejecución. Después, ubique la terminal dentro de la carpeta del proyecto.

En **Windows CMD (Símbolo del sistema)**:

```bat
copy .env.example .env
docker compose up --build -d
docker compose ps
```

En **Windows PowerShell**:

```powershell
Copy-Item .env.example .env
docker compose up --build -d
docker compose ps
```

En **Linux o macOS**:

```bash
cp .env.example .env
docker compose up --build -d
docker compose ps
```

Deben aparecer únicamente estos dos contenedores del proyecto:

- `grupo5_mysql`: base de datos.
- `grupo5_api`: aplicación Node.js.

El contenedor `api` inicia después de que MySQL supere su verificación de salud. Los datos permanecen en el volumen `grupo5_mysql_data` aunque los contenedores se detengan.

## 3. Evidenciar la comunicación entre contenedores

Abra `http://localhost:3000/health`. La respuesta debe contener `"status":"ok"`, `"host":"db"` y `"connection_test":1`. Esta consulta demuestra que la API ejecutó `SELECT 1` en MySQL a través de la red interna.

Desde CMD o PowerShell también puede usar:

```powershell
curl.exe http://localhost:3000/health
docker compose exec api getent hosts db
```

El segundo comando muestra la resolución del nombre del servicio `db` dentro de la red Docker.

## 4. Ejecutar la prueba integral automática

```bash
docker compose exec api node scripts/verificar.js
```

El script ejecuta y muestra el resultado de:

1. Verificación de salud de API y base de datos.
2. Consulta de tareas.
3. Creación de una tarea temporal.
4. Consulta por identificador.
5. Actualización de estado.
6. Eliminación de la tarea temporal.

El resultado final esperado es: `RESULTADO: verificación integral exitosa`.

## 5. Probar los endpoints manualmente

| Método | Ruta | Propósito |
|---|---|---|
| GET | `/health` | Verificar API y conexión con MySQL |
| GET | `/api/tasks` | Listar tareas |
| GET | `/api/tasks/:id` | Consultar una tarea |
| POST | `/api/tasks` | Crear una tarea |
| PATCH | `/api/tasks/:id` | Actualizar campos de una tarea |
| DELETE | `/api/tasks/:id` | Eliminar una tarea |

Ejemplo de creación en CMD, escrito en una sola línea:

```bat
curl.exe -X POST http://localhost:3000/api/tasks -H "Content-Type: application/json" -d "{\"title\":\"Validar evidencias\",\"description\":\"Revisar capturas de GitHub y Docker\",\"status\":\"pendiente\",\"priority\":\"alta\"}"
```

Ejemplo de creación en PowerShell:

```powershell
curl.exe -X POST http://localhost:3000/api/tasks `
  -H "Content-Type: application/json" `
  -d "{\"title\":\"Validar evidencias\",\"description\":\"Revisar capturas de GitHub y Docker\",\"status\":\"pendiente\",\"priority\":\"alta\"}"
```

Ejemplo en Linux o macOS:

```bash
curl -X POST http://localhost:3000/api/tasks \
  -H "Content-Type: application/json" \
  -d '{"title":"Validar evidencias","description":"Revisar capturas de GitHub y Docker","status":"pendiente","priority":"alta"}'
```

Estados permitidos: `pendiente`, `en_progreso`, `completada`.  
Prioridades permitidas: `baja`, `media`, `alta`.

## 6. Consultas y administración

```bash
# Estado de los servicios
docker compose ps

# Logs de ambos contenedores
docker compose logs

# Consultar registros directamente en MySQL
docker compose exec db mysql -uusuario_tareas -pclave_tareas_local -e "SELECT * FROM tareas_db.tasks;"

# Detener los contenedores sin borrar los datos
docker compose down

# Detener y borrar también el volumen de datos (acción irreversible)
docker compose down -v
```

Si cambia las credenciales en `.env`, ejecute `docker compose down -v` antes de reiniciar únicamente cuando acepte eliminar los datos locales anteriores. Las variables de inicialización de MySQL solo se aplican cuando el volumen está vacío.

### Si una construcción anterior falló

Cuando sustituya una versión anterior del proyecto, fuerce una construcción limpia de la API y vuelva a iniciar los servicios:

```bat
docker compose build --no-cache api
docker compose up -d
docker compose ps
```

No es necesario eliminar el volumen de MySQL ni usar `down -v` para actualizar la imagen de la API.

## 7. Pruebas unitarias sin Docker

Con Node.js 20 o superior instalado:

```bash
npm ci
npm test
```

## Evidencias recomendadas para el informe

1. Creación del repositorio y configuración de visibilidad.
2. Colaboradores o medio de acceso para el docente.
3. Archivos del proyecto y README en GitHub.
4. Historial de commits.
5. Docker Desktop en ejecución y `docker --version`.
6. Resultado de `docker compose up --build -d`.
7. `docker compose ps` con los dos contenedores activos y saludables.
8. Respuesta de `/health` y resolución del nombre `db`.
9. Ejecución exitosa de `scripts/verificar.js`.
10. Evidencia de una operación CRUD y consulta de los datos en MySQL.

Cada captura debe tener numeración, título y una explicación propia del grupo. No incluya tokens personales ni contraseñas reales en las imágenes.

## Referencias técnicas

- Docker. (s. f.). *What is a container?* https://docs.docker.com/get-started/docker-concepts/the-basics/what-is-a-container/
- Docker. (s. f.). *Networking in Compose*. https://docs.docker.com/compose/how-tos/networking/
- Docker. (s. f.). *Control startup and shutdown order in Compose*. https://docs.docker.com/compose/how-tos/startup-order/
- GitHub. (s. f.). *Quickstart for repositories*. https://docs.github.com/en/repositories/creating-and-managing-repositories/quickstart-for-repositories
- Oracle. (s. f.). *MySQL official Docker image*. https://hub.docker.com/_/mysql

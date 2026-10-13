# TP5 - Manejador de Tareas (React + Vite + Express + PostgreSQL + Docker)

Aplicación para gestionar tareas de proyectos de software. Permite crear, editar,
eliminar y finalizar tareas, que se guardan en una base de datos PostgreSQL.

## Estructura

| Carpeta / archivo     | Contenido                                              |
|-----------------------|--------------------------------------------------------|
| `trabajo_5/`          | Frontend en React + Vite (formulario y Listado de Tareas) |
| `backend/`            | API REST en Node.js + Express conectada a PostgreSQL   |
| `db/init.sql`         | Script que crea la tabla `tasks`                       |
| `docker-compose.yml`  | Levanta los tres contenedores (base de datos, backend y frontend) |

## Cómo ejecutarlo

Requisito: tener Docker Desktop instalado y en ejecución.

```bash
docker compose up --build
```

- Frontend: http://localhost:5173
- API: http://localhost:3000/api/tasks
- PostgreSQL: puerto 5433 de la máquina (usuario `postgres`, contraseña `postgres`, base `taskdb`)

Para detener todo: `docker compose down`.
Para borrar también los datos de la base: `docker compose down -v`.

## Campos de cada tarea

Nombre del Proyecto, Tipo de Actividad, Estado, Resumen, Descripción, Prioridad,
Informador, Persona asignada, Precondición, Fecha de Creación, Fecha de Cierre y Sprint.

- La **Fecha de Creación** viene cargada con la fecha de hoy y se puede modificar.
- La **Fecha de Cierre** es opcional; se completa sola con la fecha de hoy al presionar
  "Finalizar" o al cambiar el estado a "Finalizada".

## Endpoints de la API

| Método | Ruta                      | Acción                    |
|--------|---------------------------|---------------------------|
| GET    | `/api/tasks`              | Listar tareas             |
| POST   | `/api/tasks`              | Crear tarea               |
| PUT    | `/api/tasks/:id`          | Editar tarea              |
| PUT    | `/api/tasks/:id/finish`   | Finalizar tarea           |
| DELETE | `/api/tasks/:id`          | Eliminar tarea            |

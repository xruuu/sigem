# SIGEM — Sistema de Gestión de Naves Marcianas

Proyecto **Next.js (App Router) + React + TypeScript** con **Prisma ORM** y **SQLite**.  
Validación con **Zod** y UI con **Tailwind**.

## Requisitos
- Node.js 18+
- npm

## Puesta en marcha
```bash
npm install
npm run prisma:generate
npm run prisma:push
npm run dev
```
Aplicación en **http://localhost:3000**.

> Base de datos local: `prisma/dev.db` (SQLite), configurada en `.env`.

## Entidades
- **Nodriza** { id, nombre }
- **Aeronave** { id, nombre, maximoMarcianos, origenId, destinoId }
- **Pasajero** { id, nombre }
- **Revisión** { id, nombreRevisor, aeronaveId, fecha }
- **A bordo**: `PasajeroAeronave` con `fechaSubida` y `fechaBajada` (`null` ⇒ a bordo).

## Restricciones
- Capacidad: ocupación actual `< maximoMarcianos`.
- Un pasajero **no puede** estar en más de una aeronave simultáneamente.
- **Una revisión por aeronave y día** (índice único).
- Para crear una aeronave debe existir **≥ 1 nodriza**.

## Rutas UI
- `/` — Inicio
- `/naves-nodrizas` — Listado y creación
- `/aeronaves` — Listado (con ocupación) y creación
- `/pasajeros` — Alta, Asignar, Bajar
- `/revisiones` — Histórico y creación (snapshot de IDs a bordo)

## Endpoints API
- `GET/POST /api/naves-nodrizas`
- `GET/POST /api/aeronaves`
- `GET/POST /api/pasajeros`
- `POST /api/pasajeros/asignar` — body: `{ pasajeroId, aeronaveId }`
- `POST /api/pasajeros/bajar` — body: `{ pasajeroId, aeronaveId }`
- `GET/POST /api/revisiones` — body: `{ id, nombreRevisor, aeronaveId, fecha(YYYY-MM-DD) }`

## Notas
- Validaciones en `src/lib/validations.ts` (Zod).
- Prisma Client: `src/lib/db.ts` (singleton).
- Ocupación: conteo de asignaciones con `fechaBajada = null`.

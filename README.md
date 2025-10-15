# Users CRUD Admin Panel (Express + EJS + TypeScript)

A simple, secure admin panel to manage registered users. It provides authentication, admin-only access, and full CRUD for non-admin users with pagination, sorting, and validation.

## Overview

- Admin-only access after authentication.
- Users list with pagination, sorting by `username`, `name`, and `birthdate`, plus search.
- View user details.
- Create, edit, and delete users (admin users cannot be modified or deleted).
- Client-side and server-side validation.
- CSRF protection, session security, and basic rate limiting for login.
- Uses Sequelize ORM to avoid SQL injection; EJS templates with `ejs-mate` layouts.

## Technology Stack

- Runtime: Node.js (tested on `>=20`; designed to work on LTS)
- Server: Express 5
- Templating: EJS + `ejs-mate`
- ORM/DB: Sequelize (PostgreSQL or SQLite)
- Auth: `express-session`, `bcrypt`
- Security: `helmet`, CSRF (`csurf`), login rate-limiter, method-override
- Tooling: TypeScript, Biome (lint/format)

## Prerequisites

- Node.js `>=16` (recommended `>=20`)
- npm `>=10`
- One database:
  - SQLite (simple local setup), or
  - PostgreSQL (production-like setup)
- Optional: Docker/Docker Compose for easy production-like run

## Quick Start (Local, SQLite)

1. Copy environment file:
   - `cp .env.example .env`
   - For SQLite, either omit `DB_DIALECT` or set `DB_DIALECT=sqlite` and ensure `DB_PATH=db.sqlite`.
2. Install dependencies:
   - `npm install`
3. Build the project:
   - `npm run build`
4. Prepare the database (migrations + seeds):
   - `npm run db:prepare`
5. Start the server:
   - `npm run start`
6. Open the app:
   - `http://localhost:3000`
7. Login as admin:
   - Username: value of `ADMIN_USERNAME` (`admin` by default)
   - Password: value of `ADMIN_PASSWORD` (`admin123` by default)

## Development Mode

- Run with auto-reload for TypeScript and EJS:
  - `npm run watch`

## PostgreSQL Setup (Local)

Set the following variables in `.env`:

- `DB_DIALECT=postgres`
- `DB_HOST`, `DB_PORT`, `DB_NAME`, `DB_USER`, `DB_PASSWORD`

Then run:

- `npm run build`
- `npm run db:prepare` (applies migrations and seeds)
- `npm run start`

Alternatively, set `DATABASE_URL` (it overrides individual PG variables).

## Docker Compose (Recommended)

A ready-to-use `docker-compose.yml` is provided.

- Build and start:
  - `docker-compose up --build`
- The app runs on `http://localhost:3000` (or `http://localhost:${APP_PORT}` if overridden).
- Environment is injected in `docker-compose.yml`; adjust as needed.
- The container entrypoint waits for PostgreSQL readiness, runs migrations and seeds, then starts the app.

Note: The compose healthcheck targets `GET /healthz`. If you change or remove this endpoint, update the healthcheck accordingly.

## Environment Variables

Core:

- `NODE_ENV` (`development` | `production` | `test`)
- `PORT` (default `3000`)
- `SESSION_SECRET` (change in production)
- `HTTPS_ENABLED` (`true` to set secure cookies)

Database:

- `DB_DIALECT` (`postgres` or `sqlite`)
- `DATABASE_URL` (optional; overrides individual PG vars)
- `DB_HOST`, `DB_PORT`, `DB_NAME`, `DB_USER`, `DB_PASSWORD` (PostgreSQL)
- `DB_PATH` (SQLite file path; default `db.sqlite`)

Seeding/Admin:

- `ADMIN_USERNAME` (default `admin`)
- `ADMIN_PASSWORD` (default `admin123`)
- `ADMIN_FIRST_NAME` (default `Admin`)
- `ADMIN_LAST_NAME` (default `User`)
- `ADMIN_GENDER` (`male` or `female`, default `male`)
- `ADMIN_BIRTHDATE` (ISO `YYYY-MM-DD`, default `1990-01-01`)
- `SEED_USERS_COUNT` (number of regular users; default `200`)
- `RUN_MIGRATIONS` (`true`/`false`, used by docker entrypoint)
- `RUN_SEEDS` (`true`/`false`, used by docker entrypoint)

## Database Schema

The `users` table (via Sequelize migrations) includes:

- `id` (PK, auto-increment)
- `username` (unique, required)
- `password_hash` (required)
- `first_name` (required)
- `last_name` (required)
- `gender` (`male` | `female`, required)
- `birthdate` (`DATEONLY`, required)
- `is_admin` (`BOOLEAN`, default `false`)
- `created_at`, `updated_at` (`DATE`)

Indexes:

- Unique on `username`
- Index on `birthdate`
- Index on `(first_name, last_name)` for ordering

## Routes

Auth:

- `GET /login` – render login page
- `POST /login` – authenticate (rate-limited)
- `POST /logout` – end session

Admin (protected):

- `GET /admin/users` – list (pagination, sorting, search)
- `GET /admin/users/new` – create form
- `POST /admin/users` – create user
- `GET /admin/users/:id` – view details
- `GET /admin/users/:id/edit` – edit form
- `PUT /admin/users/:id` – update user
- `DELETE /admin/users/:id` – delete user

Admin accounts cannot be updated or deleted through users CRUD.

## Security

- CSRF protection via `csurf` with tokens in every form.
- Secure session cookies (`httpOnly`, `sameSite`, `secure` when HTTPS enabled).
- `helmet` headers for safer defaults.
- Input validation using `express-validator` and service-level checks.
- ORM-based DB access to prevent SQL injection.
- Login rate limiting (`express-rate-limit`).

## Project Structure

- `src/app.ts` – Express app setup, middleware, routes
- `src/modules/auth` – auth controllers/services/middlewares
- `src/modules/users` – users controllers/services/repositories/validators
- `src/db/models` – Sequelize models
- `src/db/migrations` – migrations
- `src/db/seeders` – seeds (admin + regular users)
- `views/` – EJS templates (layouts, partials, pages)
- `public/` – static assets (CSS/JS)

## NPM Scripts

- `npm run watch` – dev mode with nodemon
- `npm run start` – start built server (`dist/server.js`)
- `npm run clean` – remove `dist`
- `npm run build` – compile TypeScript
- `npm run migrate` – run Sequelize migrations
- `npm run migrate:undo` – undo all migrations
- `npm run seed` – apply seeders
- `npm run seed:undo` – undo seeders
- `npm run db:prepare` – build, migrate, seed
- `npm run db:reset` – undo migrations, migrate, seed
- `npm run typecheck` – TypeScript typecheck
- `npm run lint` / `npm run format` / `npm run fix` – Biome

## Database Dump

- SQLite:
  - `sqlite3 db.sqlite ".dump" > dump.sql`
- PostgreSQL:
  - `pg_dump -h $DB_HOST -p $DB_PORT -U $DB_USER -d $DB_NAME -F p > dump.sql`

Adjust credentials according to your environment.

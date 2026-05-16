# Agent Rules

## Project Goal

This project is a quick full-stack demo for a medical QCM platform.

The application must be deployable on Vercel and must use a real database.

The application is not production-grade.

The goal is to create a simple, clean, functional demo with real CRUD.

## Tech Stack

Use:

- Next.js App Router
- TypeScript
- shadcn/ui
- Tailwind CSS
- Prisma ORM
- Neon Postgres
- Server Actions
- Simple custom authentication
- pnpm

## Database Rule

A real database is mandatory.

Use Neon Postgres.

Do not use:

- localStorage for application data
- SQLite
- Supabase
- Firebase
- MongoDB
- hardcoded persistence
- in-memory persistence

The app must use Prisma connected to Neon Postgres through `DATABASE_URL`.

## Authentication Rule

Use simple custom authentication.

Do not use:

- NextAuth
- Clerk
- Auth0
- Firebase Auth
- Supabase Auth

Authentication should support:

- signup
- login
- logout
- current user
- simple session cookie
- role-based redirects

Roles:

- ADMIN
- PROFESSOR
- STUDENT

This is a demo, so do not implement advanced production security.

Do not implement:

- email verification
- password reset
- OAuth
- 2FA
- advanced permissions
- rate limiting

## Coding Philosophy

Write simple, straightforward code.

Avoid over-engineering.

Avoid unnecessary defensive programming.

Avoid excessive validation.

Avoid catch-all error handling.

Avoid unnecessary abstractions.

Avoid complex generic utilities.

Prefer readable code over clever code.

## Architecture Principles

Strictly follow:

- Separation of Concerns
- DRY
- Single Responsibility Principle

Every file should have one clear responsibility.

Avoid mixing:

- UI logic
- database logic
- authentication logic
- business logic

## Architecture Style

Use a combination of:

- feature-based architecture
- domain-driven architecture
- module-based architecture

Preferred structure:

```txt
src/
  app/
  components/
  features/
  lib/
prisma/
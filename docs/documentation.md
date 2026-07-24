# WarnetArcade Documentation

## Overview

WarnetArcade is a self-hosted web platform for showcasing and playing browser-compatible games from a single interface.

The project is designed with a simple architecture that separates the frontend, backend, database, and game assets. The primary goal is to keep the codebase lightweight, maintainable, and easy to extend without introducing unnecessary complexity.

Current technology stack:

* Frontend: React, TypeScript, Vite, Tailwind CSS
* Backend: Node.js, Fastify
* Database: SQLite with Prisma ORM
* API Style: REST

---

# Project Structure

```
WarnetArcade/
├── backend/
├── frontend/
├── games/
├── docs/
└── ...
```

## backend/

Contains the REST API responsible for serving game metadata and static game files.

Responsibilities include:

* API endpoints
* Database access
* Static file serving
* Request validation
* Error handling

The backend does not contain any business logic beyond game management and asset delivery.

---

## frontend/

Contains the React application that acts as the user interface.

Responsibilities include:

* User interface
* Routing
* API communication
* Game browsing
* Game launching

The frontend communicates exclusively through the backend API.

---

## games/

Stores playable game files.

Each game has its own directory containing all assets required to run the game.

Example:

```
games/
├── game-a/
│   ├── index.html
│   ├── assets/
│   └── ...
│
├── game-b/
│   └── ...
```

The backend serves these files as static content.

---

## docs/

Contains project documentation.

This directory is intended for technical documentation only.

---

# Backend Architecture

The backend follows a lightweight structure.

```
backend/
├── prisma/
├── src/
│   ├── routes/
│   ├── db.ts
│   └── server.ts
└── ...
```

## server.ts

Application entry point.

Responsible for:

* creating the Fastify instance
* registering plugins
* registering routes
* configuring global error handling
* starting the HTTP server

---

## routes/

Contains API route definitions.

Each file is responsible for a specific API resource.

Current resources include:

* Games

---

## db.ts

Exports the shared Prisma Client instance.

The application uses a single Prisma Client across the backend.

---

## prisma/

Contains the database schema and migration history.

Prisma is used as the only database access layer.

---

# Frontend Architecture

The frontend follows a standard React + Vite structure.

Responsibilities are divided into reusable components, pages, routing, and API communication.

Business logic should remain minimal, with the backend acting as the source of truth for game data.

---

# API

The backend exposes a REST API.

Current endpoints:

```
GET /games
GET /games/:slug
```

The API is intentionally minimal to keep the frontend independent from the database implementation.

---

# Database

SQLite is used as the primary database.

Prisma ORM provides:

* schema definition
* migrations
* type-safe queries

The current database stores game metadata only.

Game assets themselves are stored in the `games/` directory.

---

# Static Assets

Playable games are served as static files.

The backend is responsible for exposing the game directory while the frontend is responsible for launching games through their configured entry file.

---

# Design Principles

WarnetArcade follows several architectural principles throughout the project.

## Simplicity First

Avoid unnecessary abstractions, layers, or design patterns unless they provide a clear benefit.

## Separation of Concerns

Frontend, backend, database, and game assets each have clearly defined responsibilities.

## Incremental Development

Features are implemented in small, reviewable tasks to minimize regressions and maintain project stability.

## Maintainability

The codebase should remain approachable for solo development while being easy to understand for future contributors.

---

# Current Status

Backend Foundation: Complete

Frontend: In Development

Project Status: Active

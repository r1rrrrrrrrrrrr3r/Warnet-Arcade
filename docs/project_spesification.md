# WarnetArcade Project Specification

Version: 1.0

---

# Project Overview

WarnetArcade adalah platform web untuk memainkan game HTML5/WebAssembly yang dibuat sebagai proyek utama portfolio software engineering.

Tujuan utama proyek ini adalah menunjukkan kemampuan full-stack development, bukan membangun platform sosial seperti Steam atau itch.io.

Prioritas utama proyek:

- Clean Architecture
- Fast Loading
- Maintainable Code
- Simple Structure
- Portfolio Quality

---

# Core Philosophy

Project ini mengikuti prinsip:

> Simplicity First

Jangan membuat folder, file, abstraksi, atau sistem yang belum benar-benar dibutuhkan.

Project ini sengaja dibuat kecil namun mudah dikembangkan.

---

# Tech Stack

Frontend

- React
- TypeScript
- Vite
- Tailwind CSS v3
- React Router DOM

Backend

- Node.js
- Fastify
- Prisma ORM
- SQLite

Deployment

- Nginx
- Static File Serving

---

# Folder Structure

Frontend

frontend/

src/

components/

pages/

App.tsx

main.tsx

index.css

Backend

backend/

prisma/

src/

routes/

server.ts

Games

games/

unity/

scratch/

cpp/

wasm/

Documentation

docs/

Scripts

scripts/

---

# Development Rules

- Jangan membuat folder baru kecuali memang sudah dibutuhkan.
- Jangan membuat service layer sebelum logic mulai kompleks.
- Jangan membuat controller jika route masih sederhana.
- Jangan membuat repository pattern.
- Hindari overengineering.
- Kode harus mudah dibaca.
- Jangan menambahkan dependency tanpa alasan jelas.

---

# Coding Style

- TypeScript Strict Mode
- Functional Components
- Tidak menggunakan React.FC
- Tidak menggunakan komentar di dalam kode.
- Gunakan nama variabel yang jelas.
- Hindari nested logic yang tidak perlu.

---

# Routing

Frontend Routes

/

Home

/games/:slug

Game Detail

/play/:slug

Game Player

---

# User Flow

Home

↓

Klik Game

↓

Game Detail

↓

Play

↓

Iframe Player

---

# Backend Responsibility

Backend hanya bertugas:

- menyediakan metadata game
- mengelola database
- mengirim data JSON
- melayani file game

Backend tidak memiliki:

- Authentication
- Login
- Register
- Leaderboard
- Multiplayer
- Social Features

---

# Frontend Responsibility

Frontend bertugas:

- mengambil metadata dari backend
- menampilkan game
- menampilkan halaman detail
- membuka iframe player

Frontend tidak mengetahui lokasi file game secara langsung.

---

# Database

Table

Game

Fields

id
title
slug
description
coverImage
engine
entryFile
featured
published
createdAt
updatedAt

description berisi teks panjang yang menjelaskan project.

Tidak perlu membuat tabel tambahan.

---

# API Contract

GET /games

Return

[
{
"id":1,
"title":"",
"slug":"",
"coverImage":"",
"engine":""
}
]

GET /games/:slug

Return

{
"id":1,
"title":"",
"description":"",
"coverImage":"",
"engine":"",
"entryFile":"",
"featured":true
}

---

# Supported Game Engines

Unity WebGL

Scratch

WebAssembly

C++

Native HTML5

---

# Current Scope

Version 1 hanya memiliki fitur:

- Home
- Game Detail
- Play Game

Tidak ada fitur lain.

---

# AI Development Rules

Semua AI yang bekerja pada project ini wajib:

- mengikuti struktur folder
- mengikuti API Contract
- tidak mengubah arsitektur tanpa alasan
- tidak membuat fitur di luar scope
- tidak menambahkan library tanpa persetujuan

---

# Long Term Goal

WarnetArcade akan menjadi portfolio utama developer.

Setiap game diperlakukan sebagai sebuah project portfolio yang dapat dimainkan langsung melalui browser.
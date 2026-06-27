# TrailGuard — National-Level Trekking Safety & Exploration Platform

TrailGuard is a full-stack trekking web application built for national-level hackathons. It delivers a polished UX/UI with route discovery, weather intelligence, safety monitoring, group coordination, and Firebase-powered authentication.

## Project Overview

This repository contains a modern React/Vite frontend, an Express-based backend API server, and Firebase integration for authentication and Firestore user synchronization. The solution is designed for hackathon judges who value real-world safety, team collaboration, and polished UI.

## Key Features

- Trek exploration with searchable routes, filters, and interactive cards
- Firebase authentication with email/password and Google sign-in
- Safety dashboard with SOS reporting and alert tracking
- Group management and collaborator coordination
- Weather intelligence by region and route
- Responsive premium interface with animated section cards and glassmorphism
- Local demo fallback support for offline or incomplete Firebase config

## Tech Stack & Tools

- React 19 + Vite 6
- Tailwind CSS v4 utilities plus custom global CSS
- Firebase SDK for Authentication, Firestore, and Google sign-in
- Firebase Admin SDK and serverless Cloud Functions support in `/functions`
- Express.js backend API server in `/server`
- SQLite with `better-sqlite3` for local application data
- JWT and `bcryptjs` for secure authentication
- Leaflet + React Leaflet for mapping and location preview
- Lucide React icons for UI visuals
- Axios for HTTP API calls
- React Router DOM for routes and navigation
- React Toastify for notifications
- Oxlint for linting and code quality checks
- `concurrently` for running frontend and backend together

## API Surface

The app includes the following REST API endpoints:

- `/api/auth` — registration, login, profile sync, and user profile updates
- `/api/treks` — trek search, list, and detail data
- `/api/bookings` — booking creation and cancellation
- `/api/weather` — weather data per region
- `/api/sos` — emergency SOS submission and history
- `/api/dashboard` — stats and admin dashboard metrics
- `/api/health` — server health check

## Folder Structure

- `/src` — React frontend source
  - `components/` — reusable UI components
  - `pages/` — page screens like Home, Explore, Dashboard, Groups, Safety, Weather, Auth
  - `context/` — authentication context and user state
  - `utils/` — API and Firebase helpers
- `/server` — Express backend routes and SQLite database
  - `routes/` — auth, treks, bookings, weather, sos, dashboard
  - `middleware/` — auth validation middleware
  - `db.js` — SQLite init and seeding logic
- `/functions` — Firebase Functions boilerplate and serverless support
- `/public` — static assets and public files
- `vite.config.js` — Vite build configuration
- `package.json` — dependencies and scripts

## Setup & Development

Install dependencies:

```bash
npm install
```

Run frontend and backend together:

```bash
npm run dev:all
```

Run frontend only:

```bash
npm run dev
```

Run backend only:

```bash
npm run server
```

Build production assets:

```bash
npm run build
```

## Firebase & Environment

Create a `.env` file with Firebase values:

- `VITE_FIREBASE_API_KEY`
- `VITE_FIREBASE_AUTH_DOMAIN`
- `VITE_FIREBASE_PROJECT_ID`
- `VITE_FIREBASE_STORAGE_BUCKET`
- `VITE_FIREBASE_MESSAGING_SENDER_ID`
- `VITE_FIREBASE_APP_ID`
- `VITE_FIREBASE_MEASUREMENT_ID`
- `VITE_FIREBASE_ADMIN_EMAILS` (optional for admin role mapping)

## National Hackathon Positioning

This project is built for a national-level hackathon with a focus on:

- real-time safety operations and SOS handling
- premium UI/UX and polished page design
- complete full-stack architecture with frontend, backend, and Firebase
- responsive support for both desktop and mobile users
- judge-ready demonstration of impact, performance, and product polish

## Gamma AI Presentation Prompt

Use this prompt with Gamma AI to create a presentation for this project:

> Create a presentation titled **"TrailGuard — National-Level Trekking Safety & Exploration Platform"**. Highlight the problem statement, hackathon solution, technical architecture, core features, and real-world impact. Include slides for:
> - Project overview and target audience
> - Trekking safety challenges and why they matter
> - The solution: exploration, weather intelligence, group coordination, and SOS alerts
> - Frontend architecture: React 19, Vite 6, Tailwind CSS v4, reusable UI components
> - Backend architecture: Express.js API, SQLite fallback, JWT security, Firebase Auth, Firestore sync
> - Demo-ready feature walkthrough and user journey
> - National hackathon strengths: polish, speed, innovation, and real-world viability
> - Next-phase roadmap and potential enhancements

## Notes

- The app is designed for fast hackathon delivery while keeping production-quality structure.
- The UI uses reusable page shells, section cards, and premium button components.
- Firebase is used where available, with safe local fallback if env config is missing.

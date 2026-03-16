# Roadmap Planner

A lightweight roadmap planning app with a single AI-powered feature that flags potential delivery risks without modifying user data.

## Why This Exists

Most AI demos try to replace user judgement. This project explores the opposite:

**Where can AI quietly support better decisions without disrupting UX?**

## Screenshots

### Home page

<img width="1170" height="671" alt="Screenshot 2026-03-16 at 11 36 17 AM" src="https://github.com/user-attachments/assets/dfd8cfda-610f-4e30-87ff-0006d8b3201a" />

### Adding a new project

<img width="1143" height="783" alt="Screenshot 2026-03-16 at 11 37 15 AM" src="https://github.com/user-attachments/assets/e88b5196-fcbd-49c8-a43e-08a69cbe5f80" />

### Timeline view

<img width="1171" height="423" alt="Screenshot 2026-03-16 at 11 36 39 AM" src="https://github.com/user-attachments/assets/b09e7420-dd07-44b9-89dc-bd7f2101eade" />


## Features

- **CRUD projects** — Create, edit, and delete projects
- **Project fields** — Name, owner (optional), start date, end date
- **Dependencies** — Projects can depend on other projects
- **List view** — Table of all projects
- **Timeline view** — Gantt-style timeline grouped by week
- **Flag Risk Areas** — AI analysis of potential risks (unowned dependencies, week convergence, tight overlapping chains)

## Usage

Open `index.html` in a browser. No build step or server required.

Data is stored in `localStorage` and persists across sessions.

### Flag Risk Areas

Requires an OpenAI API key. Click the gear icon to configure, then click "Flag Risk Areas" to run analysis. Output is structured JSON: risk type, affected projects, and explanation. Read-only decision support—no data modifications.

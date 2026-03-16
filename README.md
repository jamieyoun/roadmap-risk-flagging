# Roadmap Planner

A lightweight roadmap planning app with a single AI-powered feature that flags potential delivery risks without modifying user data.

## Why This Exists

Most AI demos try to replace user judgement. This project explores the opposite:

**Where can AI quietly support better decisions without disrupting UX?**

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

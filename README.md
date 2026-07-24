# Flow — Angular Todo App (GitHub CI/CD demo)

An enhanced, beautifully-styled todo application built with **Angular 20** (standalone
components + signals) and **Tailwind CSS**. Its real purpose is to demonstrate a complete
**GitHub Actions CI/CD pipeline**: continuous integration on every push/PR, automatic
deployment to **GitHub Pages**, and tag-triggered releases.

## Features

- ✅ Add / edit / complete / delete tasks
- 🏷️ Categories via **tags**
- 🔴 **Priority** levels (low / medium / high)
- 📅 **Due dates** with overdue highlighting
- 🔍 **Search & filter** by text, status, priority and tag
- 🌗 **Dark / light** theme toggle (persisted, respects OS preference)
- 📊 **Dashboard** with progress bar and stats
- 💾 Persists to the browser's **localStorage**

## Tech stack

| Area       | Choice                                   |
| ---------- | ---------------------------------------- |
| Framework  | Angular 20 (standalone, signals)         |
| Styling    | Tailwind CSS v4 (`@tailwindcss/postcss`) |
| Storage    | Browser `localStorage`                   |
| Tests      | Karma + Jasmine (ChromeHeadless in CI)   |
| Lint       | angular-eslint                           |

## Getting started

```bash
npm install
npm start          # dev server at http://localhost:4200
```

### Useful scripts

```bash
npm run build      # production build -> dist/todo-app/browser
npm run lint       # ESLint
npm test           # unit tests (watch mode)
npm run test:ci    # unit tests once, headless Chrome
```

## CI/CD pipeline

Three workflows under `.github/workflows/`:

### 1. `ci.yml` — Continuous Integration

Runs on every **push to non-main branches** and every **pull request** to `main`.
Steps: `npm ci` → **lint** → **test (headless)** → **build**. Keeps `main` green.

### 2. `deploy.yml` — Deploy to GitHub Pages

Runs on **push to `main`** (or manual dispatch). Builds the app with the correct
`--base-href` (the repository name), adds an SPA `404.html` fallback and `.nojekyll`,
then publishes to **GitHub Pages** using the official `upload-pages-artifact` /
`deploy-pages` actions.

### 3. `release.yml` — Releases

Runs when you push a **semantic version tag** (`vX.Y.Z`). It builds, zips the output and
creates a **GitHub Release** with auto-generated notes.

```bash
git tag v1.0.0
git push origin v1.0.0
```

## One-time GitHub setup

1. Push this repository to GitHub.
2. In **Settings → Pages**, set **Source = GitHub Actions**.
3. Push to `main` to trigger the deploy workflow.
4. Your app will be live at `https://<your-username>.github.io/<repository-name>/`.

> The deploy/release workflows derive the base-href from the repository name
> automatically, so no manual editing is required.

## Project structure

```
src/app/
  models/            # Todo domain types
  services/          # TodoStore (signals + localStorage), ThemeService
  components/
    dashboard/       # stats + progress bar
    todo-form/       # add task
    filter-bar/      # search / status / priority / tag filters
    todo-item/       # single task (read + inline edit)
    todo-list/       # task list + empty state
```

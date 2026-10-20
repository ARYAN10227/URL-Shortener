<div align="center">

# 🔗 Shortly — URL Shortener (Frontend)

**Shorten links, manage them in a dashboard, and track every click.**

![React](https://img.shields.io/badge/React-19-61DAFB?logo=react&logoColor=black)
![Vite](https://img.shields.io/badge/Vite-8-646CFF?logo=vite&logoColor=white)
![React Router](https://img.shields.io/badge/React_Router-7-CA4245?logo=reactrouter&logoColor=white)
![Vercel](https://img.shields.io/badge/Deployed_on-Vercel-000000?logo=vercel&logoColor=white)

### 🌐 [Open the live app → url-shortener-frontend-t-aryan.vercel.app](https://url-shortener-frontend-t-aryan.vercel.app)

**No sign-up, no login:** open the Dashboard and you're signed in to a demo account automatically.
Real accounts still work — demo credentials: `demo@urlshortener.dev` / `demo1234`

*The free backend sleeps when idle, so the very first load can take up to a minute.*

</div>

---

## ✨ What you can do

- **Shorten links** with a random code or your own custom alias
- **Dashboard** with search, sorting, filtering by clicks and pagination
- **Edit and delete** links (with confirmation)
- **Analytics** per link: total clicks and click history with date filters
- **Accounts** with JWT authentication — and a **demo account** visitors are signed in to automatically
- **Cold-start aware**: the free backend sleeps when idle, so the app shows a “waking up” notice
  instead of failing, and never logs you out just because the server is slow

## 🧩 How it fits together

```
Browser (this app, Vercel)  ──HTTPS/JSON──▶  REST API (Node.js + Express, Render)  ──▶  MongoDB Atlas
                                              ▲
Anyone opening a short link ──GET /:code──────┘  302 redirect + click recorded
```

| Part | Repo | Hosting |
|---|---|---|
| Frontend (this repo) | `url-shortener-frontend` | Vercel |
| Backend REST API | [`url-shortener-api`](https://github.com/ARYAN10227/url-shortener-api) | Render |
| Click analytics pipeline (Kafka → ClickHouse) | [`clickstream-pipeline`](https://github.com/ARYAN10227/clickstream-pipeline) | — |

## 🛠️ Tech stack

React 19 · Vite · React Router 7 · Axios (JWT interceptor, central 401 handling) · lucide-react icons ·
hand-written CSS design system · ESLint

## 🚀 Run locally

```sh
npm install
cp .env.example .env      # VITE_API_URL=http://localhost:3000 for a local API
npm run dev               # http://localhost:5173
```

| Script | What it does |
|---|---|
| `npm run dev` | Dev server with hot reload |
| `npm run build` | Production build into `dist/` |
| `npm run preview` | Serve the production build locally |
| `npm run lint` | ESLint |

## 📁 Structure

```
src/
  pages/        Landing, Login, Register, Dashboard, Analytics
  components/   Navbar, Footer, modals, DemoLoginButton, ServerWakeNotice, ProtectedRoute
  context/      Auth and toast providers
  services/     api.js — Axios client, auth token handling, all API calls
```

## 🌐 Deployment (Vercel)

- `vercel.json` rewrites every path to `index.html` so client-side routes work on refresh.
- Set `VITE_API_URL` in the Vercel project to the backend URL.
- **Deployment Protection must be off** for the production site, or visitors are sent to a
  Vercel login page: *Project → Settings → Deployment Protection → Vercel Authentication → Disabled*.

---

<div align="center">

Built by **Aryan Raj** ·
[GitHub](https://github.com/ARYAN10227) ·
[LinkedIn](https://linkedin.com/in/aryan-raj-2b3868340)

</div>

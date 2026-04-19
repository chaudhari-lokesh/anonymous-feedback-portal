# Anonymous feedback portal

React + Vite + Tailwind frontend in `feedback portal/`, Express + MongoDB API in `server/`.

## Run locally

**API** (from `server/`):

```bash
cd server
npm install
# copy .env.example to .env and set MONGODB_URI, JWT_SECRET
npm start
```

**Client** (from `feedback portal/`):

```bash
npm install
npm run dev
```

Set `VITE_API_URL` if the API is not at `http://localhost:3001`.

## Deploy on Render

Use `render.yaml` (Blueprint) or create two services manually:

1. **Web service** — root `server/`, build `npm install`, start `npm start`. Set `MONGODB_URI` (Atlas) and `JWT_SECRET` (long random string). Render sets `PORT` automatically.
2. **Static site** — root `feedback portal/`, build `npm install && npm run build`, publish `dist`. Set `VITE_API_URL` to your API’s public URL (e.g. `https://feedback-api-xxxx.onrender.com`), no trailing slash.

In **Atlas → Network Access**, allow `0.0.0.0/0` (or Render’s egress IPs) so the API can connect. After the API is live, run `seed:teacher` locally with `MONGODB_URI` pointing at Atlas so your admin user exists.

## Admin user

Staff roles (`teacher`, `hod`, `principal`) are not created by public signup. Use `npm run seed:teacher` in `server/` with `TEACHER_EMAIL` and `TEACHER_PASSWORD`, or add a user in MongoDB with a bcrypt password hash and `role: "teacher"`.

# Anonymous Feedback Portal

This repo contains:

- `feedback portal/` — React + Vite + Tailwind frontend
- `server/` — Express API with MongoDB Atlas backend

## Run locally

### Backend

```bash
cd server
npm install
# copy .env.example to .env and set MONGODB_URI and JWT_SECRET
npm start
```

### Frontend

```bash
cd "feedback portal"
npm install
npm run dev
```

The frontend uses `VITE_API_URL` to call the backend. If the backend is not running at `http://localhost:3001`, set `VITE_API_URL` to the correct API base URL.

## Deploy on Render

This project is configured for Render deployment using `render.yaml`.

### Backend service

Create a Render **Web Service** for the backend with:

- **Root Directory**: `server`
- **Environment**: Node
- **Build Command**: `npm install`
- **Start Command**: `npm start`
- **Environment Variables**:
  - `MONGODB_URI` = Atlas connection string
  - `JWT_SECRET` = a strong secret string
  - `NODE_ENV` = `production`

Render will assign `PORT` automatically.

### Frontend service

Create a Render **Static Site** for the frontend with:

- **Root Directory**: `feedback portal`
- **Build Command**: `npm install && npm run build`
- **Publish Directory**: `dist`
- **Environment Variables**:
  - `VITE_API_URL` = backend service URL (example: `https://feedback-api.onrender.com`)

### Recommended deploy order

1. Deploy the backend service first.
2. Copy the backend URL.
3. Set `VITE_API_URL` for the frontend service.
4. Deploy the frontend service.

### MongoDB Atlas notes

- Use Atlas for the database.
- Make sure Atlas Network Access allows Render’s outbound IPs or `0.0.0.0/0` for testing.
- Set the database name and credentials in `MONGODB_URI`.

## Admin user

The app does not create staff/admin users through public signup.

To create a teacher/admin account, run the seed script from `server/`:

```bash
cd server
npm run seed:teacher
```

You can also provide environment overrides:

```bash
TEACHER_EMAIL=admin@school.edu TEACHER_PASSWORD=Admin123 TEACHER_ROLE=teacher npm run seed:teacher
```

Valid staff roles are `teacher`, `hod`, and `principal`.

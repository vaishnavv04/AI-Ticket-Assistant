## AI Ticketing System

An AI‑powered, production‑ready ticketing system. Users submit support tickets; an AI agent analyzes the description, predicts priority, suggests helpful notes, extracts relevant skills, and the system auto‑assigns to the best moderator. Includes RBAC, admin tools, and email notifications.

### Highlights
- AI ticket triage: priority, helpful notes, related skills
- Auto‑assignment to moderators by skills 
- JWT auth with RBAC: `user`, `moderator`, `admin`
- Admin: manage users, roles, and skills
- Background workers with Inngest 3, or inline processing fallback
- Email notifications via Mailtrap + Nodemailer
- React 19 + Vite, Tailwind v4 + DaisyUI, modern UI/UX

## Monorepo
```
AI-ticket-system-main/
  ai-ticket-assistant/    # Express API, Inngest, MongoDB
  ai-ticket-frontend/     # React + Vite frontend
```

## Tech Stack
- Backend: Express 5, Mongoose 8, Inngest 3, @inngest/agent-kit 0.8, JWT, Nodemailer 7
- Frontend: React 19, React Router 7, Tailwind 4, DaisyUI 5, Vite 6, react‑markdown 9
- Database: MongoDB

## Prerequisites
- Node.js v18+
- MongoDB connection string
- Mailtrap account (SMTP) for emails
- Optional: Gemini API key for live AI; otherwise the app falls back to a heuristic analyzer

## Setup
Clone and install both apps.

```bash
git clone https://github.com/vaishnavv04/AI-Ticket-Assistant
cd AI-ticket-system-main

# Backend
cd ai-ticket-assistant
npm i

# Frontend
cd ../ai-ticket-frontend
npm i
```

### Backend environment (.env)
```
PORT=3000
MONGO_URI=your_mongodb_uri
JWT_SECRET=super_secret

# Mailtrap SMTP
MAILTRAP_SMTP_HOST=your_host
MAILTRAP_SMTP_PORT=2525
MAILTRAP_SMTP_USER=your_user
MAILTRAP_SMTP_PASS=your_pass

# AI (optional)
GEMINI_API_KEY=your_gemini_api_key

# Inline AI processing (if you don’t run Inngest dev server)
ENABLE_DIRECT_TICKET_PROCESSING=true
```

### Frontend environment (.env.local)
```
VITE_SERVER_URL=http://localhost:3000
```

## Run locally
Backend (API):
```bash
cd ai-ticket-assistant
npm run dev
```

Background workers (recommended):
```bash
npm run inngest-dev
```
If you can’t run Inngest locally, keep `ENABLE_DIRECT_TICKET_PROCESSING=true` and the API will run AI processing inline on ticket creation.

Frontend (React):
```bash
cd ai-ticket-frontend
npm run dev
```

## Build
```bash
# Frontend build
cd ai-ticket-frontend
npm run build

# Backend is Node; deploy as a service with the above env vars
```

## API
Auth
- POST `/api/auth/signup`
- POST `/api/auth/login`

Tickets
- POST `/api/tickets` – Create ticket
- GET `/api/tickets` – List tickets (own for users; all for moderators/admins)
- GET `/api/tickets/:id` – Ticket details
- PATCH `/api/tickets/:id` – Update ticket (moderator/admin)

Admin
- GET `/api/auth/users` – List users (admin)
- POST `/api/auth/update-user` – Update role/skills (admin)

## Roles
- user: create and view own tickets
- moderator: see all tickets, update status/priority/notes
- admin: everything + manage users and skills

## Notes & Troubleshooting
- If AI enrichment doesn’t appear, set `ENABLE_DIRECT_TICKET_PROCESSING=true` and restart the API. For live LLM, add `GEMINI_API_KEY`.
- Ensure MongoDB is reachable and JWT secret is set.
- Mail delivery uses Mailtrap credentials; check their logs for message status.

## License
MIT

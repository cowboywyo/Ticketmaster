# Ticketmaster - Bug Filing & Issue Tracking System

A full-featured bug filing and issue tracking system built with React, Node.js, and Alibaba Cloud integration. Supports multi-user projects with role-based access, kanban boards, file attachments, and activity tracking.

## Features

- **User Authentication** - Register/login with JWT (access + refresh tokens)
- **Projects** - Create projects, invite members by email, role-based access (Admin/Member)
- **Tickets** - Full lifecycle management with types (Bug, Feature, Task, Improvement), priorities (Critical/High/Medium/Low), and status workflow (Open → In Progress → In Review → Resolved → Closed)
- **Kanban Board** - Drag-and-drop board view with real-time status updates
- **List View** - Filterable, sortable, paginated table view
- **Comments** - Markdown-supported comments on tickets
- **File Attachments** - Upload files via Alibaba Cloud OSS (with local filesystem fallback)
- **Activity Feed** - Automatic tracking of all ticket changes
- **Labels** - Project-scoped color-coded labels

## Tech Stack

| Layer | Technology |
|-------|-----------|
| Frontend | React 19, Vite, Tailwind CSS 4, TanStack Query, React Router, @dnd-kit |
| Backend | Node.js, Express 5, TypeScript |
| Database | SQLite (dev) via Knex.js — swappable to MySQL/ApsaraDB RDS |
| File Storage | Alibaba Cloud OSS (local fallback when credentials not set) |
| Auth | JWT with httpOnly refresh token cookies |

## Getting Started

### Prerequisites

- Node.js 18+
- npm 9+

### Setup

```bash
# Install dependencies
npm install

# Run database migrations
cd server && npm run migrate

# Start the development servers (two terminals):

# Terminal 1 - Backend (port 3001)
cd server && npm run dev

# Terminal 2 - Frontend (port 5173)
cd client && npm run dev
```

Open http://localhost:5173 in your browser.

### Environment Variables

Copy `server/.env` and configure:

```env
# Database (SQLite for local dev)
DB_CLIENT=better-sqlite3
DB_FILENAME=./data/ticketmaster.sqlite

# Switch to MySQL for production:
# DB_CLIENT=mysql2
# DB_HOST=rm-xxxxx.mysql.rds.aliyuncs.com
# DB_PORT=3306
# DB_USER=ticketmaster
# DB_PASSWORD=your-password
# DB_DATABASE=ticketmaster

# JWT
JWT_SECRET=change-me-in-production

# Alibaba Cloud OSS (optional - falls back to local storage)
OSS_REGION=oss-cn-hangzhou
OSS_ACCESS_KEY_ID=
OSS_ACCESS_KEY_SECRET=
OSS_BUCKET=ticketmaster-attachments
```

## Project Structure

```
├── server/                 # Express API (TypeScript)
│   ├── src/
│   │   ├── modules/        # Feature modules (auth, projects, tickets, etc.)
│   │   ├── middleware/      # Auth, validation, project access
│   │   ├── db/             # Database connection and migrations
│   │   └── services/       # Alibaba Cloud OSS integration
│   └── data/               # SQLite database (gitignored)
│
├── client/                 # React SPA (TypeScript)
│   └── src/
│       ├── pages/          # Route-level pages
│       ├── components/     # UI components (kanban, tickets, comments, etc.)
│       ├── api/            # API client layer
│       └── context/        # Auth context provider
```

## API Overview

All routes under `/api/v1`:

| Endpoint | Description |
|----------|-------------|
| `POST /auth/register` | Create account |
| `POST /auth/login` | Sign in |
| `GET /projects` | List user's projects |
| `POST /projects` | Create project |
| `POST /projects/:id/members` | Invite member |
| `GET /projects/:id/tickets` | List tickets (filterable) |
| `POST /projects/:id/tickets` | Create ticket |
| `PATCH /projects/:id/tickets/:tid` | Update ticket |
| `GET /tickets/:id/comments` | List comments |
| `POST /tickets/:id/attachments` | Upload file |
| `GET /tickets/:id/activity` | Activity feed |

## Switching to Alibaba Cloud RDS

1. Set `DB_CLIENT=mysql2` and MySQL connection variables in `.env`
2. Install the MySQL driver: `cd server && npm install mysql2`
3. Run migrations: `npm run migrate`

The Knex.js query builder generates compatible SQL for both SQLite and MySQL.

## License

MIT

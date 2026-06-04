# TestPilot - AI Website QA Platform

TestPilot is a full-stack SaaS application for automated website testing.

## Tech Stack
- **Frontend**: Next.js 15 (App Router), TypeScript, Tailwind CSS, shadcn/ui.
- **Backend**: FastAPI, SQLAlchemy (Async), Alembic, PostgreSQL.
- **Auth**: JWT-based authentication.
- **Infrastructure**: Docker & Docker Compose.

## Getting Started

### Prerequisites
- Docker & Docker Compose installed.

### Installation & Startup

1. **Clone the repository** (if not already in the project directory).
2. **Environment Variables**: The `.env` file in the root is already configured for local development.
3. **Run with Docker**:
   ```bash
   docker-compose up --build
   ```

### Accessing the App
- **Frontend**: [http://localhost:3000](http://localhost:3000)
- **Backend API**: [http://localhost:8000](http://localhost:8000)
- **API Documentation**: [http://localhost:8000/docs](http://localhost:8000/docs)

## Features Implemented
- **Authentication**: Register and Login functionality with JWT.
- **Dashboard**: High-level overview of testing stats and recent runs.
- **Websites**: CRUD operations for managing target websites.
- **Database**: Async PostgreSQL connection with SQLAlchemy.
- **Migrations**: Alembic set up for schema management.

## Project Structure
```text
/
├── frontend/             # Next.js 15 application
│   ├── app/              # App Router pages and layouts
│   ├── components/       # UI Components
│   ├── context/          # Auth context and state
│   └── lib/              # API client and utilities
├── backend/              # FastAPI application
│   ├── app/
│   │   ├── api/          # Routers and endpoints
│   │   ├── core/         # Config, Security, Database
│   │   ├── models/       # SQLAlchemy models
│   │   └── schemas/      # Pydantic validation schemas
│   └── alembic/          # Database migrations
├── docker-compose.yml    # Orchestration
└── .env                  # Environment secrets
```

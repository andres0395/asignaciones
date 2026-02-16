# Authentication System

A complete authentication system for Next.js implementing JWT authentication (access & refresh tokens), role-based access control, and atomic design architecture.

## Features

- **Secure Authentication**: 
  - Login with Access Token (15 min) and Refresh Token (7 days, HttpOnly Cookie).
  - Password hashing with Bcrypt.
  - Automatic token renewal.
  - Middleware protection for API and Pages.
- **Frontend Architecture**:
  - Atomic Design (Atoms, Molecules, Organisms, Templates).
  - Tailwind CSS styling with dark mode support.
  - Responsive layout.
- **Backend API**:
  - RESTful endpoints for Auth (Register, Login, Refresh, Logout, Me).
  - User management (Admin only).
  - Prisma ORM with PostgreSQL.

## Prerequisites

- Node.js (v18+)
- PostgreSQL Database

## Installation

1. **Clone the repository**:
   ```bash
   git clone <repo-url>
   cd asignaciones
   ```

2. **Install dependencies**:
   ```bash
   npm install
   ```
   > Note: We use Prisma 6 for stability.

3. **Configure Environment Variables**:
   Create a `.env` file in the root directory:
   ```env
   DATABASE_URL="postgresql://user:password@localhost:5432/asignaciones?schema=public"
   JWT_SECRET="your-super-secret-access-key"
   REFRESH_TOKEN_SECRET="your-super-secret-refresh-key"
   ```

4. **Setup Database**:
   ```bash
   npx prisma generate
   npx prisma migrate dev --name init
   ```

## Running the App

```bash
npm run dev
```

Open [http://localhost:3000](http://localhost:3000) to view the application.

## API Documentation

### Auth

- `POST /api/auth/register`: Register a new user.
  - Body: `{ fullName, email, password, phone, role? }`
- `POST /api/auth/login`: login.
  - Body: `{ email, password }`
- `POST /api/auth/refresh`: Refresh access token (requires `refreshToken` cookie).
- `POST /api/auth/logout`: Logout.
- `GET /api/auth/me`: Get current user profile.

### Users

- `GET /api/users`: List users (Admin only).
  - Query: `page`, `limit`

## Testing

Run unit tests:
```bash
npm test
```

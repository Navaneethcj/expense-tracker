# Expense Tracker

This project now includes a full-stack expense tracker with:

- Expo Router frontend
- Express + TypeScript backend
- Prisma ORM with Neon PostgreSQL
- JWT authentication with bcrypt
- Secure token storage using expo-secure-store

## Folder structure

- frontend/ - Expo application
- backend/ - Node.js/Express API
- backend/prisma/ - Prisma schema and migrations

## Backend setup

1. Change into the backend folder:
   cd backend
2. Install dependencies:
   npm install
3. Copy environment variables:
   cp .env.example .env
4. Update the Neon PostgreSQL connection string in .env
5. Generate Prisma client:
   npm run prisma:generate
6. Run database migrations:
   npm run prisma:migrate
7. Start the backend:
   npm run dev

## Frontend setup

1. Change into the frontend folder:
   cd frontend
2. Install dependencies:
   npm install
3. Create a .env file with:
   EXPO_PUBLIC_API_URL=http://localhost:5000
4. Start the Expo app:
   npm start

## Environment variables

Backend:
- PORT
- NODE_ENV
- DATABASE_URL
- JWT_SECRET
- JWT_EXPIRES_IN
- FRONTEND_URL

Frontend:
- EXPO_PUBLIC_API_URL

## Deployment

The backend is prepared for deployment to Render or Railway. Configure the environment variables above, then set the start command to:

npm run build && npm run start

## API endpoints

- POST /api/auth/register
- POST /api/auth/login
- GET /api/auth/profile
- GET /api/expenses
- POST /api/expenses
- PUT /api/expenses/:id
- DELETE /api/expenses/:id
- GET /api/income
- POST /api/income
- PUT /api/income/:id
- DELETE /api/income/:id
- GET /api/settings
- PUT /api/settings
- GET /api/history

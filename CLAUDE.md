# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Project Overview

SIGTU-API: Sistema de Gestão para Transporte Universitário (University Transportation Management System API)

Backend API built with Express.js, TypeScript, and Firebase for managing university transportation services.

## Tech Stack

- **Runtime**: Node.js
- **Framework**: Express.js
- **Language**: TypeScript
- **Authentication**: Firebase Admin SDK
- **Database**: Firebase Firestore
- **Validation**: express-validator
- **Security**: Helmet, CORS

## Development Commands

```bash
# Install dependencies
npm install

# Development mode (with hot reload)
npm run dev

# Build for production
npm run build

# Run production build
npm start

# Linting
npm run lint
npm run lint:fix

# Format code
npm run format
```

## Environment Setup

1. Copy `.env.example` to `.env`
2. Configure Firebase credentials:
   - `FIREBASE_PROJECT_ID`: Your Firebase project ID
   - `FIREBASE_CLIENT_EMAIL`: Service account email
   - `FIREBASE_PRIVATE_KEY`: Service account private key

**Note**: You can either use environment variables or place the `serviceAccountKey.json` file in the root directory (not recommended for production).

## Project Architecture

### Directory Structure

```
src/
├── config/          # Configuration files (Firebase, environment)
├── controllers/     # Request handlers (auth, student, university)
├── middlewares/     # Express middlewares (auth, error handling, validation, roles)
├── routes/          # API route definitions
├── services/        # Business logic layer (auth, student, university)
├── types/           # TypeScript type definitions (index, student, university)
└── utils/           # Utility functions (validators)
```

### Architecture Pattern

The project follows a **layered architecture**:

1. **Routes Layer** (`src/routes/`): Defines API endpoints and applies validation
2. **Controller Layer** (`src/controllers/`): Handles HTTP requests/responses
3. **Service Layer** (`src/services/`): Contains business logic
4. **Firebase Layer**: Data persistence via Firestore

### Key Architectural Decisions

- **Async Error Handling**: All async route handlers are wrapped with `asyncHandler` middleware to automatically catch errors
- **Centralized Error Handling**: Custom `AppError` class and `errorHandler` middleware provide consistent error responses
- **Validation Middleware**: Uses `express-validator` with a custom `validate` wrapper for request validation
- **Authentication**: JWT tokens verified via Firebase Admin SDK in `authenticate` middleware
- **Role-Based Access Control**: `requireRole` middleware controls access based on user roles (student/employee)
- **Profile Completion Check**: `requireProfileCompleted` middleware ensures students have completed their profile

## API Endpoints

### Authentication Routes (`/api/auth`)

- `POST /api/auth/register` - Register new user (email, password, role, optional name) - generates email verification link
- `POST /api/auth/login` - Login user (email, password) - requires verified email, returns role and profileCompleted
- `POST /api/auth/resend-verification` - Resend email verification link
- `GET /api/auth/me` - Get current user info (requires authentication)
- `GET /api/auth/verify-status` - Check email verification status (requires authentication)
- `DELETE /api/auth/delete` - Delete current user account (requires authentication)

### Student Profile Routes (`/api/student`)

- `PUT /api/student/profile` - Create or update complete student profile (requires student role)
- `GET /api/student/profile` - Get student profile (requires student role)

### University Routes (`/api/universities`)

- `GET /api/universities` - List all active universities (public)
- `GET /api/universities/:id` - Get university by ID (public)
- `POST /api/universities/seed` - Create seed universities (development only)

### Health Check

- `GET /api/health` - API health status

## Firebase Integration

### Authentication Flow

1. **Registration**: Creates user in Firebase Auth, generates email verification link, and stores metadata in Firestore (`users` collection)
2. **Email Verification**: User must verify email via link before login (Firebase provides this for free)
3. **Login**: Verifies user exists and email is verified, then generates custom token (403 error if email not verified)
4. **Protected Routes**: Validate Firebase ID token via `authenticate` middleware

### Email Verification

- Email verification is **mandatory** for login
- Verification links are generated using Firebase Admin SDK (`generateEmailVerificationLink`)
- In development, the link is returned in the API response
- In production, integrate an email service (SendGrid, AWS SES, etc.) to send the link
- Users can request a new verification link via `/api/auth/resend-verification`
- Optional `requireEmailVerification` middleware available for extra protection on specific routes

### Firestore Collections

- `users`: User profiles with uid, email, name, role, emailVerified, profileCompleted (students only), createdAt, updatedAt
- `student_profiles`: Complete student profiles with personal data, address, family info, academic data, scholarship, documents
- `universities`: University data with name, acronym, city, state, active status

## Middleware Stack

Middlewares are applied in this order:

1. `helmet()` - Security headers
2. `cors()` - CORS configuration
3. `morgan()` - HTTP request logging
4. `express.json()` - JSON body parser
5. Routes
6. `errorHandler` - Error handling (must be last)

## Authentication & Authorization

Protected routes require a Bearer token in the Authorization header:

```
Authorization: Bearer <firebase-id-token>
```

The `authenticate` middleware verifies the token and attaches user info to `req.user`.

### Role-Based Access Control

The system supports two user roles:
- `student`: Students who use the transportation system
- `employee`: Staff who manage the system

Use `requireRole(['student'])` middleware after `authenticate` to restrict routes by role.

### Student Profile Flow

1. Student registers with role='student'
2. Verifies email
3. Logs in (profileCompleted=false)
4. Completes profile via PUT /api/student/profile (all data at once)
5. System sets profileCompleted=true
6. Student can now access full system functionality

The profile includes 6 steps of data collected in the frontend but sent as a single request:
1. Personal data (name, RG, birthDate, phone)
2. Address (street, number, neighborhood, state, zipCode)
3. Family data (parents, marital status, residence type)
4. Academic data (university, semester, schedule, frequency)
5. Scholarship info
6. Documents and terms acceptance

## Error Handling

- All errors should use `AppError` class for consistency
- Async functions should be wrapped with `asyncHandler`
- Validation errors return 400 with detailed error array
- Authentication errors return 401
- Not found errors return 404
- Server errors return 500

## Domain Context

University transportation management system with future features:
- Routes and schedules
- Vehicles and drivers
- Students/users and transportation assignments
- Route optimization
- Real-time tracking
- Booking/reservation system

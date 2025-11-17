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
├── controllers/     # Request handlers
├── middlewares/     # Express middlewares (auth, error handling, validation)
├── routes/          # API route definitions
├── services/        # Business logic layer
├── types/           # TypeScript type definitions
└── utils/           # Utility functions
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

## API Endpoints

### Authentication Routes (`/api/auth`)

- `POST /api/auth/register` - Register new user (email, password, optional name)
- `POST /api/auth/login` - Login user (email, password)
- `GET /api/auth/me` - Get current user info (requires authentication)
- `DELETE /api/auth/delete` - Delete current user account (requires authentication)

### Health Check

- `GET /api/health` - API health status

## Firebase Integration

### Authentication Flow

1. **Registration**: Creates user in Firebase Auth and stores metadata in Firestore (`users` collection)
2. **Login**: Verifies user exists and generates custom token
3. **Protected Routes**: Validate Firebase ID token via `authenticate` middleware

### Firestore Collections

- `users`: User profiles with uid, email, name, createdAt, updatedAt

## Middleware Stack

Middlewares are applied in this order:

1. `helmet()` - Security headers
2. `cors()` - CORS configuration
3. `morgan()` - HTTP request logging
4. `express.json()` - JSON body parser
5. Routes
6. `errorHandler` - Error handling (must be last)

## Authentication

Protected routes require a Bearer token in the Authorization header:

```
Authorization: Bearer <firebase-id-token>
```

The `authenticate` middleware verifies the token and attaches user info to `req.user`.

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

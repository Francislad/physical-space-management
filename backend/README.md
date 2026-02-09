# Physical Space Management System - Backend

A [Moleculer](https://moleculer.services/)-based microservices backend for managing physical spaces with JWT authentication, role-based authorization, and PostgreSQL persistence.

## Architecture

Frontend (React) → Traefik (Gateway) → Moleculer Microservices (NATS Transporter/Message Broker) → PostgreSQL

**Services:**
- `api-gateway` - HTTP endpoints, CORS, routing
- `auth` - Authentication & JWT
- `users` - User CRUD (admin)
- `rooms` - Room management & occupancy
- `checkins` - Check-in/out operations

## Features

### For Regular Users
- Authenticate with register number and password
- View all available rooms with real-time occupancy
- Check in to available rooms
- Check out from current room
- View current check-in status

### For Admin Users
- All regular user features
- Create new users with hashed passwords
- List all users in the system
- Update user information
- Delete non-admin users
- Access protected admin endpoints

## Tech Stack

- **Moleculer 0.14.26** - Microservices framework
- **PostgreSQL** - Relational database
- **Sequelize 6.37.7** - ORM and migrations
- **JWT (jsonwebtoken)** - Token-based authentication
- **bcryptjs** - Password hashing
- **Moleculer Web 0.10.4** - API Gateway
- **Moleculer DB** - Database integration mixin
- **Docker & Docker Compose** - Containerization

## Data Models

### Users
```javascript
{
  registerNumber: INTEGER (Primary Key),
  name: STRING,
  password: STRING (hashed),
  role: STRING ('user' | 'admin'),
  createdAt: DATE,
  updatedAt: DATE
}
```

### Rooms
```javascript
{
  name: STRING (Primary Key),
  capacity: INTEGER,
  createdAt: DATE,
  updatedAt: DATE
}
```

### Checkins
```javascript
{
  id: INTEGER (Primary Key, Auto-increment),
  user: INTEGER (Foreign Key -> users.registerNumber),
  room: STRING (Foreign Key -> rooms.name),
  checkedInAt: DATE,
  checkedOutAt: DATE (nullable),
  createdAt: DATE,
  updatedAt: DATE
}
```

## Project Structure

```
backend/
├── services/
│   ├── api.service.js          # API Gateway with CORS & routes
│   ├── auth.service.js         # Authentication & login
│   ├── users.service.js        # User CRUD operations (admin)
│   ├── rooms.service.js        # Room management & occupancy
│   └── checkin.service.js      # Check-in/out operations
├── mixins/
│   └── auth.mixin.js           # JWT auth & role-based authorization
├── migrations/
│   ├── 20260208012407-create-user.js
│   ├── 20260208073357-create-room.js
│   └── 20260208073747-create-checkin.js
├── seeders/
│   ├── 20260208005751-users.js
│   └── 20260208073928-rooms.js
├── models/                     # Sequelize model definitions
├── moleculer.config.js         # Moleculer broker configuration
├── migration-config.js         # Sequelize migrations config
├── docker-compose.yml          # Docker services setup
└── Dockerfile                  # Container build instructions
```

## Getting Started

### Prerequisites

- Node.js (v16 or higher)
- npm or yarn
- PostgreSQL (v12 or higher)
- NATS server
- Docker & Docker Compose (optional)

### Installation

1. Install dependencies:
```bash
npm install
```

2. Configure environment variables:
```bash
# Create .env file in backend directory
cp .env.dev .env
```

Edit `.env` with your configuration:
```env
# Database
DB_HOST=localhost
DB_PORT=5432
DB_DATABASE=physical_space_db
DB_USER=postgres
DB_PASSWORD=your_password

# JWT
JWT_SECRET=your_super_secret_jwt_key_change_in_production
JWT_EXPIRES_IN=24h

# Server
PORT=3000
```

3. Setup database:
```bash
# Run migrations to create tables
npm run migrate:up

# Seed database with initial data (optional)
npm run seed:up
```

### Development

Start the development server with hot-reload:
```bash
npm run dev
```

**The API documentation** will be available at http://localhost:3000/api

Access the Moleculer REPL for debugging:
- Type `nodes` to list all nodes
- Type `actions` to list all available actions
- Type `call users.list` to test service calls

### Building for Production

```bash
# Start in production mode
npm run start
```

## Environment Variables

| Variable | Description | Default | Required |
|----------|-------------|---------|----------|
| `DB_HOST` | PostgreSQL host | `localhost` | Yes |
| `DB_PORT` | PostgreSQL port | `5432` | Yes |
| `DB_DATABASE` | Database name | - | Yes |
| `DB_USER` | Database user | - | Yes |
| `DB_PASSWORD` | Database password | - | Yes |
| `JWT_SECRET` | Secret key for JWT signing | - | Yes |
| `JWT_EXPIRES_IN` | Token expiration time | `24h` | No |
| `PORT` | API Gateway port | `3000` | No |

## API Endpoints

### Authentication
- **POST** `/api/auth/login` - User login (no auth required)
  ```json
  Request:
  {
    "registerNumber": 12345,
    "password": "password123"
  }
  
  Response:
  {
    "token": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...",
    "user": {
      "registerNumber": 12345,
      "name": "John Doe",
      "role": "user"
    }
  }
  ```

### Rooms
- **GET** `/api/rooms/` - List all rooms (requires auth)
  ```json
  Response:
  [
    {
      "name": "Lab 101",
      "capacity": 30,
      "currentOccupancy": 25,
      "createdAt": "2026-02-08T00:00:00.000Z",
      "updatedAt": "2026-02-08T00:00:00.000Z"
    }
  ]
  ```

- **GET** `/api/rooms/:name` - Get room details (requires auth)
  ```json
  Response:
  {
    "name": "Lab 101",
    "capacity": 30,
    "currentOccupancy": 25,
    "createdAt": "2026-02-08T00:00:00.000Z",
    "updatedAt": "2026-02-08T00:00:00.000Z"
  }
  ```

### Check-ins
- **POST** `/api/checkins/checkin` - Check in to a room (requires auth, user role)
  ```json
  Request:
  {
    "room": "Lab 101"
  }
  
  Response:
  {
    "id": 1,
    "user": 12345,
    "room": "Lab 101",
    "checkedInAt": "2026-02-09T10:30:00.000Z",
    "checkedOutAt": null
  }
  ```

- **POST** `/api/checkins/checkout` - Check out from current room (requires auth, user role)
  ```json
  Request:
  {
    "room": "Lab 101"
  }
  
  Response:
  {
    "id": 1,
    "user": 12345,
    "room": "Lab 101",
    "checkedInAt": "2026-02-09T10:30:00.000Z",
    "checkedOutAt": "2026-02-09T12:00:00.000Z"
  }
  ```

- **GET** `/api/checkins/current` - Get current user's check-in (requires auth, user role)
  ```json
  Response:
  [
    {
      "id": 1,
      "user": 12345,
      "room": "Lab 101",
      "checkedInAt": "2026-02-09T10:30:00.000Z",
      "checkedOutAt": null
    }
  ]
  ```

- **GET** `/api/checkins/` - List all check-ins (requires auth)

### Users (Admin Only)
- **GET** `/api/users/` - List all users (requires auth, admin role)
  ```json
  Response:
  [
    {
      "registerNumber": 12345,
      "name": "John Doe",
      "role": "user",
      "createdAt": "2026-02-08T00:00:00.000Z",
      "updatedAt": "2026-02-08T00:00:00.000Z"
    }
  ]
  ```

- **POST** `/api/users/` - Create new user (requires auth, admin role)
  ```json
  Request:
  {
    "registerNumber": 54321,
    "name": "Jane Doe",
    "password": "password123"
  }
  
  Response:
  {
    "registerNumber": 54321,
    "name": "Jane Doe",
    "role": "user",
    "createdAt": "2026-02-09T10:00:00.000Z",
    "updatedAt": "2026-02-09T10:00:00.000Z"
  }
  ```

- **PUT** `/api/users/` - Update user (requires auth, admin role)
  ```json
  Request:
  {
    "registerNumber": 54321,
    "name": "Jane Smith",
    "password": "newpassword123"  // optional
  }
  
  Response:
  {
    "registerNumber": 54321,
    "name": "Jane Smith",
    "role": "user",
    "updatedAt": "2026-02-09T11:00:00.000Z"
  }
  ```

- **DELETE** `/api/users/` - Delete user (requires auth, admin role)
  ```json
  Request:
  {
    "registerNumber": 54321
  }
  
  Response:
  {
    "success": true
  }
  ```

## Services Architecture

### Moleculer Microservices

This project uses **Moleculer** for building scalable microservices. Each service is independent and communicates via the service broker and NATS transporter.

#### api.service.js
- **Role**: API Gateway
- **Responsibilities**: HTTP server, CORS configuration, request routing
- **Port**: 3000 (configurable)
- **Features**: 
  - Auto-aliasing for REST endpoints
  - Global CORS with wildcard origin
  - Request authentication header forwarding
  - Static file serving from `public/` folder

#### auth.service.js
- **Role**: Authentication Service
- **Responsibilities**: User login, JWT token generation
- **Dependencies**: users.service (for user lookup)
- **Features**:
  - Password verification with bcrypt
  - JWT token generation with configurable expiration
  - User credential validation

#### users.service.js
- **Role**: User Management Service
- **Responsibilities**: CRUD operations for users
- **Database**: PostgreSQL via Sequelize adapter
- **Authorization**: Admin role required for all operations except internal calls
- **Features**:
  - Password hashing on creation
  - Admin user deletion prevention
  - Password exclusion from responses

#### rooms.service.js
- **Role**: Room Management Service
- **Responsibilities**: Room listing and details with real-time occupancy
- **Database**: PostgreSQL via Sequelize adapter
- **Dependencies**: checkins.service (for occupancy calculation)
- **Features**:
  - Real-time occupancy tracking
  - Capacity management

#### checkins.service.js
- **Role**: Check-in/out Management Service
- **Responsibilities**: Tracking user presence in rooms
- **Database**: PostgreSQL via Sequelize adapter
- **Features**:
  - Single active check-in per user enforcement
  - Room-specific check-out validation
  - Current check-in status lookup

### Authentication & Authorization

The `auth.mixin.js` provides:
- **JWT Token Validation**: Verifies tokens from Authorization header
- **Role-Based Access Control**: Enforces role requirements on actions
- **Token Generation**: Creates signed JWT tokens with user payload
- **User Context**: Injects authenticated user into `ctx.meta.user`

Usage in services:
```javascript
actions: {
  myAction: {
    rest: { method: "GET", path: "/" },
    auth: true,              // Requires authentication
    roles: ["admin"],        // Requires admin role
    handler(ctx) {
      // Access user: ctx.meta.user
    }
  }
}
```

## Database Management

### Migrations

```bash
# Generate a new migration
npm run migrate:generate -- --name create-table-name

# Run all pending migrations
npm run migrate:up

# Rollback last migration
npm run migrate:down

# Check migration status
npm run migrate:status
```

### Seeders

```bash
# Generate a new seeder
npm run seed:generate -- --name seed-name

# Run all seeders
npm run seed:up

# Rollback last seeder
npm run seed:down

# Rollback all seeders
npm run seed:down:all
```

### Database Schema

The migrations create the following schema:

1. **users** table (registerNumber as PK)
2. **rooms** table (name as PK)
3. **checkins** table (id as PK, foreign keys to users and rooms)

## Docker Support

### Using Docker Compose

Start all services (PostgreSQL + Backend):
```bash
npm run dc:up
```

View logs:
```bash
npm run dc:logs
```

Stop all services:
```bash
npm run dc:down
```

### Docker Configuration

The `docker-compose.yml` includes:
- PostgreSQL service with persistent volume
- Backend service with hot-reload
- Network configuration for service communication
- Environment variable injection from `docker-compose.env`

## Usage Examples

### Login as User

```bash
curl -X POST http://localhost:3000/api/auth/login \
  -H "Content-Type: application/json" \
  -d '{
    "registerNumber": 12345,
    "password": "password123"
  }'
```

### List Rooms (Authenticated)

```bash
curl -X GET http://localhost:3000/api/rooms/ \
  -H "Authorization: Bearer YOUR_JWT_TOKEN"
```

### Check In to Room

```bash
curl -X POST http://localhost:3000/api/checkins/checkin \
  -H "Authorization: Bearer YOUR_JWT_TOKEN" \
  -H "Content-Type: application/json" \
  -d '{
    "room": "Lab 101"
  }'
```

### Create User (Admin)

```bash
curl -X POST http://localhost:3000/api/users/ \
  -H "Authorization: Bearer ADMIN_JWT_TOKEN" \
  -H "Content-Type: application/json" \
  -d '{
    "registerNumber": 54321,
    "name": "Jane Doe",
    "password": "password123"
  }'
```

## Key Features

### JWT Authentication
- Token-based stateless authentication
- Configurable expiration time
- Secure password hashing with bcrypt (10 rounds)
- Authorization header Bearer token format

### Role-Based Authorization
- Two roles: `user` and `admin`
- Action-level role enforcement via `auth.mixin.js`
- Admin-only operations for user management
- Role validation on every authenticated request

### Database Integration
- Sequelize ORM with PostgreSQL adapter
- Connection pooling (max 5 connections)
- Migration-based schema versioning
- Seeder support for initial data
- No auto-sync (migrations only)

### Microservices Architecture
- Independent, scalable services
- Service-to-service communication via broker
- Hot-reload in development
- REPL for debugging and testing
- Ready for distributed deployment with NATS transporter
- Load balanced with Traefik

## NPM Scripts

- `npm run dev` - Start development mode with hot-reload & REPL
- `npm run start` - Start production mode
- `npm run lint` - Run ESLint code linting
- `npm run test` - Run tests with coverage report
- `npm run ci` - Run continuous test mode with watching
- `npm run migrate:generate` - Generate new migration file
- `npm run migrate:up` - Run all pending migrations
- `npm run migrate:down` - Rollback last migration
- `npm run migrate:status` - Check migration status
- `npm run seed:generate` - Generate new seeder file
- `npm run seed:up` - Run all seeders
- `npm run seed:down` - Rollback last seeder
- `npm run seed:down:all` - Rollback all seeders
- `npm run dc:up` - Start Docker Compose stack
- `npm run dc:logs` - View Docker Compose logs
- `npm run dc:down` - Stop Docker Compose stack

## Troubleshooting

### Database Connection Errors

**Problem**: Cannot connect to PostgreSQL
```
Error: connect ECONNREFUSED 127.0.0.1:5432
```

**Solutions**:
- Verify PostgreSQL is running: `pg_isready`
- Check `.env` database credentials
- Ensure database exists: `createdb physical_space_db`
- Verify firewall allows connections on port 5432

### JWT Token Errors

**Problem**: "Invalid token" or "Token expired"

**Solutions**:
- Ensure `JWT_SECRET` matches between environments
- Check token expiration time in `.env`
- Verify Authorization header format: `Bearer <token>`
- Generate new token by logging in again

### Migration Errors

**Problem**: Migration already executed or schema mismatch

**Solutions**:
- Check migration status: `npm run migrate:status`
- Rollback if needed: `npm run migrate:down`
- Reset database: Drop and recreate, then `npm run migrate:up`
- Verify `migration-config.js` database settings

### Authentication Not Working

**Problem**: 401 Unauthorized on protected endpoints

**Solutions**:
- Verify token is included in Authorization header
- Check token hasn't expired
- Ensure user role matches required roles for endpoint
- Verify `auth.mixin.js` is loaded in service
- Check `ctx.meta.authHeader` is being set in api.service.js

### Port Already in Use

**Problem**: `EADDRINUSE: address already in use :::3000`

**Solutions**:
- Stop other process using port 3000
- Change `PORT` in `.env` file
- Kill process: `lsof -ti:3000 | xargs kill` (Mac/Linux) or `netstat -ano | findstr :3000` (Windows)

## Useful Links

- [Moleculer Documentation](https://moleculer.services/docs/0.14/)
- [Moleculer Web (API Gateway)](https://moleculer.services/docs/0.14/moleculer-web.html)
- [Moleculer DB](https://moleculer.services/docs/0.14/moleculer-db.html)
- [Sequelize Documentation](https://sequelize.org/docs/v6/)
- [JWT Best Practices](https://tools.ietf.org/html/rfc8725)

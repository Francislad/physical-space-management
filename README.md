# Physical Space Management System

This is a simple system for managing physical spaces with user authentication, room check-in/check-out functionality, and admin user management.
This README covers a quick start and some detailed information on this monorepo. For a deeper dive, go to [Backend README](./backend/README.md) or [Frontend README](./frontend/README.md)

This was a challenge described in [CHALLENGE.md](CHALLENGE.md) and **was completed in approximately 13 hours.**

## Quick Start
This steps show how to run this project with the help of Docker Compose.

### Prerequisites

- Node.js (v16 or higher)
- npm or yarn
- PostgreSQL (v12 or higher)
- NATS server
- Docker & Docker Compose

### Infrastructure
At the root of the monorepo, start infra containers
```bash
npm run dc:up
```

### Backend
At the backend folder, create a `.env` file and populate it. You can find more about it in the backend's README or use the .env.example. Then, run the migrations
```bash
npm run migrate:up
```

Run seeder
```bash
npm run seed:up
```

Start microservices containers
```bash
npm run dc:up
```

### Frontend
Install packages
```bash
npm install
```

Start the server with the development script
```bash
npm run run dev
```

### Quick Reset
If you need to reset the workspace, run the following command at the backend folder and at the root of the monorepo
```bash
npm run dc:down:rmi
```
It will remove the containers and volumes associated to the infrastructure and the backend. After it, go back to the begining of the Quick Start.
There is no need to reset the frontend.

### Without Docker
To run this project without using Docker, you'll need a PostgreSQL and NATS server as infrastructure for the backend.

#### Backend
Create a `.env` file and populate it. You can find more about it in the backend's README or use the .env.example.

Install packages
```bash
npm install
```

Run migrations
```bash
npm run migrate:up
```

Run seeder
```bash
npm run seed:up
```

Start the server with the development script
```bash
npm run dev
```

#### Frontend
Install packages
```bash
npm install
```

Start the server with the development script
```bash
npm run dev
```

## Usage

For API documentation, go to http://localhost:3000/api which is a swagger style documentation.
For Traefik dashboard, go to http://localhost:3001

The following are steps to use the platform.

### Login

The DB is preseeded with:
- 1 Admin (registerNumber: 0, password: admin123)
- 4 User (registerNumber: 1 to 4, password: student123)

**Regular User Login:**
- Navigate to http://localhost:5173/login
- Enter your register number and password
- You'll be redirected to the rooms list

**Admin Login:**
- Navigate to http://localhost:5173/login
- Enter admin credentials
- You'll be redirected to the admin panel

### Checking In/Out

1. From the rooms list, click on any room
2. If you're not checked in, click "Check In"
3. Your check-in status will appear in the navbar
4. To check out, click "Check Out" in the room detail page or in the navbar
5. You can only be checked into one room at a time

### Admin Panel

1. Login as admin
2. Click "Admin Panel" button on rooms list
3. View all users in the system
4. Click "+ Add User" to create a new user
5. Click "Edit" to modify a user's details
6. Click "Delete" to remove a user (cannot delete admin users)

## Architecture

Frontend (React) → Traefik (Gateway) → Moleculer Microservices (NATS Transporter/Message Broker) → PostgreSQL

**Services:**
- `api-gateway` - HTTP endpoints, CORS, routing
- `auth` - Authentication & JWT
- `users` - User CRUD (admin)
- `rooms` - Room management & occupancy
- `checkins` - Check-in/out operations

[Detailed service documentation in backend/README.md](./backend/README.md)

## Features

### For Regular Users
- View all available rooms
- Check room details (capacity, current occupancy)
- Check in to rooms
- Check out from rooms
- View current check-in status in navbar

### For Admin Users
- All regular user features
- Access admin panel
- Create new users
- Edit existing users
- Delete users (except admin users)

## Tech Stack

### Frontend
- **React 19** - UI library
- **Vite** - Build tool and dev server
- **React Router 6** - Client-side routing
- **Axios** - HTTP client
- **Tailwind CSS** - Styling
- **Context API** - State management

### Backend
- **Moleculer 0.14.26** - Microservices framework
- **PostgreSQL** - Relational database
- **Sequelize 6.37.7** - ORM and migrations
- **JWT (jsonwebtoken)** - Token-based authentication
- **bcryptjs** - Password hashing
- **Moleculer Web 0.10.4** - API Gateway
- **Moleculer DB** - Database integration mixin
- **Docker & Docker Compose** - Containerization

## Projects Structure

### Frontend
```
src/
├── api/
│   └── client.js           # Axios instance with interceptors
├── components/
│   ├── Navbar.jsx          # Navigation bar with check-in status
│   ├── ProtectedRoute.jsx  # Route authentication wrapper
│   ├── RoomCard.jsx        # Room display card
│   └── UserForm.jsx        # User create/edit form
├── context/
│   └── AuthContext.jsx     # Global auth and check-in state
├── pages/
│   ├── AdminPanel.jsx      # Admin user management
│   ├── Login.jsx           # User/admin login
│   ├── RoomDetail.jsx      # Room details and check-in
│   └── RoomsList.jsx       # All rooms listing
├── utils/
│   └── constants.js        # App constants
├── App.jsx                 # Main app with routing
├── main.jsx                # Entry point
└── index.css               # Global styles
```

### Backend
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

## Key Features

### Authentication & Authorization
- Token-based stateless authentication
- Configurable expiration time
- Secure password hashing with bcrypt (10 rounds)
- Authorization header Bearer token format
- Automatic token attachment to API requests
- 401 response handling (auto-redirect to login)
- Role-based access control (user vs admin)

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

### User Experience
- Loading states for all async operations
- Error messages for failed operations
- Confirmation dialogs for destructive actions
- Responsive design (mobile-friendly)
- Persistent check-in status in navbar

## Troubleshooting
For troubleshooting, check the troubleshooting sections in the README of the backend or frontend.

## Challenge Constraints & Trade-offs

**Time:** ~13 hours total

**What's included:**
- Full authentication & authorization
- Microservices architecture with message broker
- Admin panel & user management
- Real-time occupancy tracking

**What would be added with more time:**
- Unit & integration tests (test framework is set up)
- WebSocket for real-time updates
- Service health checks & monitoring
- Rate limiting & advanced security
- CI/CD pipeline
- Better documentation

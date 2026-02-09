# Physical Space Management System - Frontend

A React-based frontend for managing physical spaces with user authentication, room check-in/check-out functionality, and admin user management.

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

- **React 19** - UI library
- **Vite** - Build tool and dev server
- **React Router 6** - Client-side routing
- **Axios** - HTTP client
- **Tailwind CSS** - Styling
- **Context API** - State management

## Project Structure

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

## Getting Started

### Prerequisites

- Node.js (v16 or higher)
- npm or yarn
- Backend API running (default: http://localhost:3000/api)

### Installation

1. Install dependencies:
```bash
npm install
```

2. Configure environment variables:
```bash
# Edit .env with your backend API URL if different from default
VITE_API_URL=http://localhost:3000/api
```

### Development

Start the development server:
```bash
npm run dev
```

The app will be available at http://localhost:5173

### Building for Production

```bash
npm run build
```

The built files will be in the `dist/` directory.

## Usage

### Login

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

## API Integration

The app expects the following backend endpoints:

### Authentication
- `POST /api/auth/login` - User login

### Rooms
- `GET /api/rooms/` - List all rooms
- `GET /api/rooms/:roomName` - Get room details

### Check-ins
- `GET /api/checkins/current` - Get current user's check-in
- `POST /api/checkins/checkin` - Check in to a room
- `POST /api/checkins/checkout` - Check out from current room

### Users (Admin only)
- `GET /api/users/` - List all users
- `POST /api/users/` - Create new user
- `PUT /api/users/` - Update user
- `DELETE /api/users/` - Delete user

## Key Features

### Authentication & Authorization
- JWT token-based authentication
- Token stored in localStorage
- Automatic token attachment to API requests
- 401 response handling (auto-redirect to login)
- Role-based access control (user vs admin)

### State Management
- Global auth state via Context API
- Check-in state persists across page refreshes
- Automatic check-in status refresh on login

### User Experience
- Loading states for all async operations
- Error messages for failed operations
- Confirmation dialogs for destructive actions
- Responsive design (mobile-friendly)
- Persistent check-in status in navbar

## Troubleshooting

**Login not working:**
- Check that backend is running
- Verify VITE_API_URL in .env
- Check browser console for errors

**Check-in status not updating:**
- Refresh the page
- Check backend API response format
- Verify AuthContext is properly configured

**Admin panel not accessible:**
- Ensure you're logged in with admin role
- Check user role in localStorage

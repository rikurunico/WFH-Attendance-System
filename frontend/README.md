# WFH Attendance System - Frontend

Modern React-based frontend application for WFH (Work From Home) Employee Attendance & Task Tracking System.

## ?? Technology Stack

- **Framework**: React 18+ with Vite
- **Styling**: TailwindCSS
- **Routing**: React Router v6
- **HTTP Client**: Axios
- **Form Management**: React Hook Form
- **Date Handling**: date-fns
- **Icons**: Lucide React
- **Notifications**: React Hot Toast

## ?? Project Structure

```
frontend/
??? src/
?   ??? api/                    # API service layer
?   ?   ??? axios.js           # Axios configuration
?   ?   ??? auth.api.js        # Authentication APIs
?   ?   ??? attendance.api.js  # Attendance APIs
?   ?   ??? task.api.js        # Task APIs
?   ?   ??? report.api.js      # Report APIs
?   ?   ??? leave.api.js       # Leave APIs
?   ?   ??? holiday.api.js     # Holiday APIs
?   ?   ??? manager.api.js     # Manager APIs
?   ??? components/
?   ?   ??? common/            # Reusable components
?   ?   ??? layout/            # Layout components
?   ?   ??? attendance/        # Attendance components
?   ?   ??? task/              # Task components
?   ?   ??? report/            # Report components
?   ?   ??? admin/             # Admin components
?   ??? contexts/
?   ?   ??? AuthContext.jsx   # Authentication context
?   ??? hooks/
?   ?   ??? useAuth.js         # Auth custom hook
?   ??? pages/
?   ?   ??? auth/              # Authentication pages
?   ?   ??? employee/          # Employee pages
?   ?   ??? manager/           # Manager pages
?   ??? utils/
?   ?   ??? constants.js       # App constants
?   ?   ??? dateHelpers.js     # Date utility functions
?   ??? App.jsx                # Main app component
?   ??? main.jsx               # Entry point
?   ??? index.css              # Global styles
??? .env                        # Environment variables
??? package.json
??? tailwind.config.js
??? vite.config.js
```

## ??? Installation & Setup

### Prerequisites

- Node.js 18+ and npm
- Backend API running on `http://localhost:8000`

### Installation Steps

1. **Navigate to frontend directory:**
   ```bash
   cd frontend
   ```

2. **Install dependencies:**
   ```bash
   npm install
   ```

3. **Configure environment variables:**
   
   Create/edit `.env` file:
   ```env
   VITE_API_URL=http://localhost:8000/api/v1
   VITE_APP_NAME=WFH Attendance System
   ```

4. **Start development server:**
   ```bash
   npm run dev
   ```

5. **Open browser:**
   ```
   http://localhost:5173
   ```

## ?? Demo Credentials

### Employee Account
- **Email**: `employee@example.com`
- **Password**: `password123`

### Manager Account
- **Email**: `manager@example.com`
- **Password**: `password123`

## ?? Features

### Employee Features
- ? **Dashboard**: Check-in/Check-out with task management
- ? **Today's Status**: Real-time work hours tracking
- ? **Work Reports**: Daily, weekly, and monthly reports
- ? **Leave Requests**: Submit and track leave requests
- ? **Task Management**: Add tasks during active sessions

### Manager Features
- ? **Dashboard**: Overview of all employees' attendance
- ? **User Management**: Create, update, delete users
- ? **Attendance Management**: Edit/delete attendance records
- ? **Leave Approval**: Approve/reject leave requests
- ? **Holiday Management**: Manage company holidays
- ? **Activity Logs**: Monitor all system activities

## ?? UI Components

### Common Components
- `Button` - Reusable button with variants
- `Input` - Form input with validation
- `Card` - Content container
- `Modal` - Dialog/popup component
- `Loading` - Loading spinner
- `PrivateRoute` - Route protection

### Layout Components
- `MainLayout` - Main application layout
- `Navbar` - Top navigation bar
- `Sidebar` - Side navigation menu

## ?? State Management

- **Global State**: React Context API (AuthContext)
- **Local State**: React useState hooks
- **Form State**: React Hook Form (where applicable)

## ?? API Integration

All API calls are centralized in the `src/api/` directory. Each API module exports functions that:
- Handle HTTP requests
- Include authentication tokens
- Return standardized responses
- Handle errors gracefully

Example:
```javascript
import { checkIn } from '../api/attendance.api';

const handleCheckIn = async (tasks) => {
  try {
    const response = await checkIn(tasks);
    if (response.success) {
      // Handle success
    }
  } catch (error) {
    // Handle error
  }
};
```

## ?? Routing

The application uses React Router v6 with role-based access control:

- `/login` - Login page (public)
- `/employee/*` - Employee routes (protected)
- `/manager/*` - Manager routes (protected)

## ?? Build for Production

```bash
npm run build
```

Build output will be in the `dist/` directory.

## ?? Testing

### Manual Testing
See `UI_TESTING_GUIDE.md` for comprehensive testing instructions.

### Running Tests
```bash
npm run test
```

## ?? Deployment

### Option 1: Static Hosting (Netlify/Vercel)

1. Build the project:
   ```bash
   npm run build
   ```

2. Deploy the `dist/` folder to your hosting provider

3. Configure environment variables on the hosting platform

### Option 2: Docker

```dockerfile
FROM node:18-alpine
WORKDIR /app
COPY package*.json ./
RUN npm install
COPY . .
RUN npm run build
EXPOSE 5173
CMD ["npm", "run", "preview"]
```

## ?? Configuration

### Vite Configuration
See `vite.config.js` for build and dev server configuration.

### TailwindCSS Configuration
See `tailwind.config.js` for theme customization.

## ?? Code Style

- Use functional components with hooks
- Follow component naming conventions (PascalCase)
- Use meaningful variable names
- Add comments for complex logic
- Keep components small and focused

## ?? Troubleshooting

### Common Issues

1. **API Connection Error**
   - Ensure backend is running on `http://localhost:8000`
   - Check `.env` file configuration
   - Verify CORS settings in backend

2. **Authentication Issues**
   - Clear localStorage
   - Check token expiration
   - Verify credentials

3. **Build Errors**
   - Delete `node_modules` and reinstall
   - Clear Vite cache: `rm -rf node_modules/.vite`

## ?? Support

For issues and questions, please refer to the main project documentation or contact the development team.

## ?? License

This project is part of the WFH Attendance System and follows the same license as the main project.

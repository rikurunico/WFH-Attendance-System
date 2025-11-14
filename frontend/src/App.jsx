import { lazy, Suspense } from 'react';
import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import { Toaster } from 'react-hot-toast';
import { AuthProvider } from './contexts/AuthContext';
import { PrivateRoute } from './components/common/PrivateRoute';
import { ProtectedRegisterRoute } from './components/common/ProtectedRegisterRoute';
import { Loading } from './components/common/Loading';
import { useAuth } from './hooks/useAuth';

// Landing page loaded immediately (not lazy) for SEO
import { LandingPage } from './pages/LandingPage';

// Lazy load all other pages for better performance
// Auth Pages
const Login = lazy(() => import('./pages/auth/Login').then(m => ({ default: m.Login })));
const Register = lazy(() => import('./pages/auth/Register').then(m => ({ default: m.Register })));

// Employee Pages
const EmployeeDashboard = lazy(() => import('./pages/employee/Dashboard').then(m => ({ default: m.EmployeeDashboard })));
const MyReport = lazy(() => import('./pages/employee/MyReport').then(m => ({ default: m.MyReport })));
const MyLeave = lazy(() => import('./pages/employee/MyLeave').then(m => ({ default: m.MyLeave })));
const ChangePassword = lazy(() => import('./pages/employee/ChangePassword').then(m => ({ default: m.ChangePassword })));

// Manager Pages
const ManagerDashboard = lazy(() => import('./pages/manager/Dashboard').then(m => ({ default: m.ManagerDashboard })));
const UserManagement = lazy(() => import('./pages/manager/UserManagement').then(m => ({ default: m.UserManagement })));
const AttendanceManagement = lazy(() => import('./pages/manager/AttendanceManagement').then(m => ({ default: m.AttendanceManagement })));
const DailyAttendanceReport = lazy(() => import('./pages/manager/DailyAttendanceReport').then(m => ({ default: m.DailyAttendanceReport })));
const MonthlyAttendanceReport = lazy(() => import('./pages/manager/MonthlyAttendanceReport').then(m => ({ default: m.MonthlyAttendanceReport })));
const HolidayManagement = lazy(() => import('./pages/manager/HolidayManagement').then(m => ({ default: m.HolidayManagement })));
const LeaveApproval = lazy(() => import('./pages/manager/LeaveApproval').then(m => ({ default: m.LeaveApproval })));
const ActivityLogs = lazy(() => import('./pages/manager/ActivityLogs').then(m => ({ default: m.ActivityLogs })));
const TeamSettings = lazy(() => import('./pages/manager/TeamSettings').then(m => ({ default: m.TeamSettings })));

// Super Admin Pages
const TeamManagement = lazy(() => import('./pages/super-admin/TeamManagement').then(m => ({ default: m.TeamManagement })));
const SuperAdminUserManagement = lazy(() => import('./pages/super-admin/UserManagement').then(m => ({ default: m.SuperAdminUserManagement })));

const RootRedirect = () => {
  const { user, loading } = useAuth();

  if (loading) {
    return <div>Loading...</div>;
  }

  if (!user) {
    return <LandingPage />;
  }

  // Redirect based on role
  if (user.role === 'super_admin') {
    return <Navigate to="/super-admin/teams" replace />;
  }

  if (user.role === 'manager') {
    return <Navigate to="/manager/dashboard" replace />;
  }

  return <Navigate to="/employee/dashboard" replace />;
};

function App() {
  return (
    <BrowserRouter>
      <AuthProvider>
        <Toaster
          position="top-right"
          toastOptions={{
            duration: 3000,
            style: {
              background: '#363636',
              color: '#fff',
            },
            success: {
              duration: 3000,
              iconTheme: {
                primary: '#10b981',
                secondary: '#fff',
              },
            },
            error: {
              duration: 4000,
              iconTheme: {
                primary: '#ef4444',
                secondary: '#fff',
              },
            },
          }}
        />

        <Suspense fallback={<Loading fullScreen />}>
          <Routes>
            {/* Root */}
            <Route path="/" element={<RootRedirect />} />

            {/* Auth Routes */}
            <Route path="/login" element={<Login />} />
            <Route
              path="/register"
              element={
                <ProtectedRegisterRoute>
                  <Register />
                </ProtectedRegisterRoute>
              }
            />

          {/* Employee Routes */}
          <Route
            path="/employee/dashboard"
            element={
              <PrivateRoute requiredRole="employee">
                <EmployeeDashboard />
              </PrivateRoute>
            }
          />
          <Route
            path="/employee/report"
            element={
              <PrivateRoute requiredRole="employee">
                <MyReport />
              </PrivateRoute>
            }
          />
          <Route
            path="/employee/leave"
            element={
              <PrivateRoute requiredRole="employee">
                <MyLeave />
              </PrivateRoute>
            }
          />
          <Route
            path="/employee/change-password"
            element={
              <PrivateRoute requiredRole="employee">
                <ChangePassword />
              </PrivateRoute>
            }
          />

          {/* Manager Routes */}
          <Route
            path="/manager/dashboard"
            element={
              <PrivateRoute requiredRole="manager">
                <ManagerDashboard />
              </PrivateRoute>
            }
          />
          <Route
            path="/manager/users"
            element={
              <PrivateRoute requiredRole="manager">
                <UserManagement />
              </PrivateRoute>
            }
          />
          <Route
            path="/manager/attendances"
            element={
              <PrivateRoute requiredRole="manager">
                <AttendanceManagement />
              </PrivateRoute>
            }
          />
          <Route
            path="/manager/daily-attendance-report"
            element={
              <PrivateRoute requiredRole="manager">
                <DailyAttendanceReport />
              </PrivateRoute>
            }
          />
          <Route
            path="/manager/monthly-attendance-report"
            element={
              <PrivateRoute requiredRole="manager">
                <MonthlyAttendanceReport />
              </PrivateRoute>
            }
          />
          <Route
            path="/manager/holidays"
            element={
              <PrivateRoute requiredRole="manager">
                <HolidayManagement />
              </PrivateRoute>
            }
          />
          <Route
            path="/manager/leaves"
            element={
              <PrivateRoute requiredRole="manager">
                <LeaveApproval />
              </PrivateRoute>
            }
          />
          <Route
            path="/manager/activity-logs"
            element={
              <PrivateRoute requiredRole="manager">
                <ActivityLogs />
              </PrivateRoute>
            }
          />
          <Route
            path="/manager/team-settings"
            element={
              <PrivateRoute requiredRole="manager">
                <TeamSettings />
              </PrivateRoute>
            }
          />

          {/* Super Admin Routes */}
          <Route
            path="/super-admin/teams"
            element={
              <PrivateRoute>
                <TeamManagement />
              </PrivateRoute>
            }
          />
          <Route
            path="/super-admin/users"
            element={
              <PrivateRoute>
                <SuperAdminUserManagement />
              </PrivateRoute>
            }
          />

          {/* 404 */}
          <Route path="*" element={<Navigate to="/" replace />} />
        </Routes>
        </Suspense>
      </AuthProvider>
    </BrowserRouter>
  );
}

export default App;

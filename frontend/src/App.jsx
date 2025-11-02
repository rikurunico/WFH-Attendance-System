import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import { Toaster } from 'react-hot-toast';
import { AuthProvider } from './contexts/AuthContext';
import { PrivateRoute } from './components/common/PrivateRoute';
import { useAuth } from './hooks/useAuth';

// Auth Pages
import { Login } from './pages/auth/Login';

// Employee Pages
import { EmployeeDashboard } from './pages/employee/Dashboard';
import { MyReport } from './pages/employee/MyReport';
import { MyLeave } from './pages/employee/MyLeave';

// Manager Pages
import { ManagerDashboard } from './pages/manager/Dashboard';
import { UserManagement } from './pages/manager/UserManagement';
import { HolidayManagement } from './pages/manager/HolidayManagement';
import { LeaveApproval } from './pages/manager/LeaveApproval';
import { ActivityLogs } from './pages/manager/ActivityLogs';

const RootRedirect = () => {
  const { user, loading } = useAuth();

  if (loading) {
    return <div>Loading...</div>;
  }

  if (!user) {
    return <Navigate to="/login" replace />;
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

        <Routes>
          {/* Root */}
          <Route path="/" element={<RootRedirect />} />

          {/* Auth Routes */}
          <Route path="/login" element={<Login />} />

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

          {/* 404 */}
          <Route path="*" element={<Navigate to="/" replace />} />
        </Routes>
      </AuthProvider>
    </BrowserRouter>
  );
}

export default App;

import { NavLink } from 'react-router-dom';
import { 
  Home, 
  Clock, 
  FileText, 
  Calendar, 
  Users, 
  Settings,
  ClipboardList,
  Activity,
  X
} from 'lucide-react';
import { useAuth } from '../../hooks/useAuth';

export const Sidebar = ({ isOpen, onClose }) => {
  const { isEmployee, isManager } = useAuth();

  const employeeLinks = [
    { to: '/employee/dashboard', icon: Home, label: 'Dashboard' },
    { to: '/employee/report', icon: FileText, label: 'My Report' },
    { to: '/employee/leave', icon: Calendar, label: 'Leave Requests' },
  ];

  const managerLinks = [
    { to: '/manager/dashboard', icon: Home, label: 'Dashboard' },
    { to: '/manager/users', icon: Users, label: 'User Management' },
    { to: '/manager/attendances', icon: Clock, label: 'Attendances' },
    { to: '/manager/leaves', icon: ClipboardList, label: 'Leave Approval' },
    { to: '/manager/holidays', icon: Calendar, label: 'Holidays' },
    { to: '/manager/activity-logs', icon: Activity, label: 'Activity Logs' },
  ];

  const links = isManager ? managerLinks : employeeLinks;

  return (
    <>
      {/* Mobile backdrop */}
      {isOpen && (
        <div
          className="fixed inset-0 bg-black bg-opacity-50 z-20 lg:hidden"
          onClick={onClose}
        ></div>
      )}

      {/* Sidebar */}
      <aside
        className={`fixed lg:static inset-y-0 left-0 z-30 w-64 bg-white shadow-lg transform transition-transform duration-300 ease-in-out ${
          isOpen ? 'translate-x-0' : '-translate-x-full lg:translate-x-0'
        }`}
      >
        <div className="h-full flex flex-col">
          {/* Close button for mobile */}
          <div className="lg:hidden flex justify-end p-4">
            <button onClick={onClose} className="text-gray-600 hover:text-gray-900">
              <X size={24} />
            </button>
          </div>

          {/* Navigation */}
          <nav className="flex-1 px-4 py-6 space-y-2">
            {links.map((link) => (
              <NavLink
                key={link.to}
                to={link.to}
                onClick={onClose}
                className={({ isActive }) =>
                  `flex items-center space-x-3 px-4 py-3 rounded-lg transition-colors ${
                    isActive
                      ? 'bg-primary-100 text-primary-700 font-medium'
                      : 'text-gray-700 hover:bg-gray-100'
                  }`
                }
              >
                <link.icon size={20} />
                <span>{link.label}</span>
              </NavLink>
            ))}
          </nav>
        </div>
      </aside>
    </>
  );
};

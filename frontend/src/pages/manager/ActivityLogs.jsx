import { useState, useEffect } from 'react';
import { MainLayout } from '../../components/layout/MainLayout';
import { Card } from '../../components/common/Card';
import { Button } from '../../components/common/Button';
import { Loading } from '../../components/common/Loading';
import { getActivityLogs } from '../../api/manager.api';
import { getAllUsers } from '../../api/manager.api';
import { formatDateTime } from '../../utils/dateHelpers';
import { Activity, Filter } from 'lucide-react';
import toast from 'react-hot-toast';

export const ActivityLogs = () => {
  const [loading, setLoading] = useState(true);
  const [logs, setLogs] = useState([]);
  const [users, setUsers] = useState([]);
  const [filters, setFilters] = useState({
    user_id: '',
    action: '',
    start_date: '',
    end_date: '',
  });

  useEffect(() => {
    fetchUsers();
    fetchLogs();
  }, []);

  const fetchUsers = async () => {
    try {
      const response = await getAllUsers();
      if (response.success) {
        setUsers(response.data);
      }
    } catch (error) {
      console.error('Error fetching users:', error);
    }
  };

  const fetchLogs = async () => {
    try {
      setLoading(true);
      const response = await getActivityLogs(filters);
      
      if (response.success) {
        setLogs(response.data.logs || []);
      }
    } catch (error) {
      console.error('Error fetching activity logs:', error);
      toast.error('Failed to fetch activity logs');
    } finally {
      setLoading(false);
    }
  };

  const handleFilter = () => {
    fetchLogs();
  };

  const handleClearFilters = () => {
    setFilters({
      user_id: '',
      action: '',
      start_date: '',
      end_date: '',
    });
    setTimeout(() => fetchLogs(), 100);
  };

  const getActionBadge = (action) => {
    const badges = {
      login: 'badge-info',
      logout: 'badge-info',
      check_in: 'badge-success',
      check_out: 'badge-success',
      task_created: 'badge-info',
      task_updated: 'badge-info',
      attendance_edited: 'badge-warning',
      attendance_deleted: 'badge-danger',
      user_created: 'badge-success',
      user_updated: 'badge-warning',
      user_deleted: 'badge-danger',
      leave_requested: 'badge-info',
      leave_approved: 'badge-success',
      leave_rejected: 'badge-danger',
      holiday_created: 'badge-success',
      holiday_updated: 'badge-warning',
      holiday_deleted: 'badge-danger',
      auto_checkout: 'badge-warning',
    };
    return badges[action] || 'badge-info';
  };

  const actionTypes = [
    'check_in',
    'check_out',
    'task_created',
    'task_updated',
    'attendance_edited',
    'attendance_deleted',
    'user_created',
    'user_updated',
    'user_deleted',
    'leave_requested',
    'leave_approved',
    'leave_rejected',
    'holiday_created',
    'holiday_updated',
    'holiday_deleted',
    'auto_checkout',
    'login',
    'logout',
  ];

  if (loading) {
    return (
      <MainLayout>
        <Loading />
      </MainLayout>
    );
  }

  return (
    <MainLayout>
      <div className="space-y-6">
        {/* Header */}
        <div>
          <h1 className="text-3xl font-bold text-gray-900">Activity Logs</h1>
          <p className="text-gray-600 mt-1">Monitor all system activities and user actions</p>
        </div>

        {/* Filters */}
        <Card title="Filters">
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                User
              </label>
              <select
                value={filters.user_id}
                onChange={(e) => setFilters({ ...filters, user_id: e.target.value })}
                className="input-field"
              >
                <option value="">All Users</option>
                {users.map((user) => (
                  <option key={user.id} value={user.id}>
                    {user.name}
                  </option>
                ))}
              </select>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Action Type
              </label>
              <select
                value={filters.action}
                onChange={(e) => setFilters({ ...filters, action: e.target.value })}
                className="input-field"
              >
                <option value="">All Actions</option>
                {actionTypes.map((action) => (
                  <option key={action} value={action}>
                    {action.replace(/_/g, ' ')}
                  </option>
                ))}
              </select>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Start Date
              </label>
              <input
                type="date"
                value={filters.start_date}
                onChange={(e) => setFilters({ ...filters, start_date: e.target.value })}
                className="input-field"
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                End Date
              </label>
              <input
                type="date"
                value={filters.end_date}
                onChange={(e) => setFilters({ ...filters, end_date: e.target.value })}
                className="input-field"
              />
            </div>
          </div>

          <div className="flex items-center space-x-3 mt-4">
            <Button onClick={handleFilter} className="flex items-center space-x-2">
              <Filter size={18} />
              <span>Apply Filters</span>
            </Button>
            <Button onClick={handleClearFilters} variant="secondary">
              Clear Filters
            </Button>
          </div>
        </Card>

        {/* Activity Logs */}
        <Card>
          {logs.length === 0 ? (
            <div className="text-center py-12">
              <Activity size={48} className="mx-auto text-gray-400 mb-4" />
              <p className="text-gray-600">No activity logs found</p>
            </div>
          ) : (
            <div className="space-y-3">
              {logs.map((log) => (
                <div
                  key={log.id}
                  className="border border-gray-200 rounded-lg p-4 hover:bg-gray-50 transition-colors"
                >
                  <div className="flex items-start justify-between">
                    <div className="flex-1">
                      <div className="flex items-center space-x-3 mb-2">
                        <span className={`badge ${getActionBadge(log.action)}`}>
                          {log.action.replace(/_/g, ' ')}
                        </span>
                        <p className="text-sm font-medium text-gray-900">
                          {log.user.name}
                        </p>
                        <p className="text-xs text-gray-500">
                          {log.user.email}
                        </p>
                      </div>
                      
                      <p className="text-sm text-gray-700 mb-2">
                        {log.description}
                      </p>
                      
                      <div className="flex items-center space-x-4 text-xs text-gray-500">
                        <span>{formatDateTime(log.created_at)}</span>
                        <span>IP: {log.ip_address}</span>
                      </div>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          )}
        </Card>
      </div>
    </MainLayout>
  );
};

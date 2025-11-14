import { useState, useEffect } from 'react';
import { MainLayout } from '../../components/layout/MainLayout';
import { Card } from '../../components/common/Card';
import { ManagerDashboardSkeleton } from '../../components/common/DashboardSkeleton';
import { getManagerDashboard } from '../../api/manager.api';
import { formatTime, formatHours, getTodayDate } from '../../utils/dateHelpers';
import { usePageTitle } from '../../hooks/usePageTitle';
import { Users, UserCheck, Calendar, TrendingUp, Clock } from 'lucide-react';
import toast from 'react-hot-toast';

export const ManagerDashboard = () => {
  usePageTitle('Dashboard');
  
  const [loading, setLoading] = useState(true);
  const [dashboard, setDashboard] = useState(null);
  const [selectedDate, setSelectedDate] = useState(getTodayDate());

  useEffect(() => {
    fetchDashboard();
  }, [selectedDate]);

  const fetchDashboard = async () => {
    try {
      setLoading(true);
      const response = await getManagerDashboard(selectedDate);
      
      if (response.success) {
        setDashboard(response.data);
      }
    } catch (error) {
      console.error('Error fetching dashboard:', error);
      toast.error('Gagal mengambil data dashboard');
    } finally {
      setLoading(false);
    }
  };

  if (loading) {
    return (
      <MainLayout>
        <ManagerDashboardSkeleton />
      </MainLayout>
    );
  }

  const summary = dashboard?.summary || {};
  const employees = dashboard?.employees || [];

  const getStatusColor = (status) => {
    switch (status) {
      case 'checked_in':
        return 'text-green-600 bg-green-100';
      case 'checked_out':
        return 'text-gray-600 bg-gray-100';
      case 'on_leave':
        return 'text-blue-600 bg-blue-100';
      default:
        return 'text-gray-600 bg-gray-100';
    }
  };

  return (
    <MainLayout>
      <div className="space-y-6">
        {/* Header */}
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-3xl font-bold text-gray-900">Dashboard Manager</h1>
            <p className="text-gray-600 mt-1">Ringkasan absensi tim</p>
          </div>
          <div>
            <input
              type="date"
              value={selectedDate}
              onChange={(e) => setSelectedDate(e.target.value)}
              className="input-field"
            />
          </div>
        </div>

        {/* Summary Cards */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
          <Card>
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-gray-600 mb-1">Total Karyawan</p>
                <p className="text-2xl font-bold text-gray-900">{summary.total_employees || 0}</p>
              </div>
              <div className="p-3 rounded-full bg-primary-100">
                <Users size={24} className="text-primary-600" />
              </div>
            </div>
          </Card>

          <Card>
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-gray-600 mb-1">Sedang Check In</p>
                <p className="text-2xl font-bold text-green-600">{summary.checked_in_now || 0}</p>
              </div>
              <div className="p-3 rounded-full bg-green-100">
                <UserCheck size={24} className="text-green-600" />
              </div>
            </div>
          </Card>

          <Card>
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-gray-600 mb-1">Sedang Cuti</p>
                <p className="text-2xl font-bold text-blue-600">{summary.on_leave || 0}</p>
              </div>
              <div className="p-3 rounded-full bg-blue-100">
                <Calendar size={24} className="text-blue-600" />
              </div>
            </div>
          </Card>

          <Card>
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-gray-600 mb-1">Rata-rata Jam Harian</p>
                <p className="text-2xl font-bold text-purple-600">
                  {(summary.average_daily_hours || 0).toFixed(1)}j
                </p>
              </div>
              <div className="p-3 rounded-full bg-purple-100">
                <TrendingUp size={24} className="text-purple-600" />
              </div>
            </div>
          </Card>
        </div>

        {/* Employees List */}
        <Card title="Status Karyawan">
          {employees.length === 0 ? (
            <div className="text-center py-8 text-gray-500">
              Tidak ada data karyawan tersedia
            </div>
          ) : (
            <div className="overflow-x-auto">
              <table className="min-w-full divide-y divide-gray-200">
                <thead className="bg-gray-50">
                  <tr>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Karyawan
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Status
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Hari Ini
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Minggu Ini
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Bulan Ini
                    </th>
                  </tr>
                </thead>
                <tbody className="bg-white divide-y divide-gray-200">
                  {employees.map((employee) => (
                    <tr key={employee.id} className="hover:bg-gray-50">
                      <td className="px-6 py-4 whitespace-nowrap">
                        <div>
                          <p className="font-medium text-gray-900">{employee.name}</p>
                          <p className="text-sm text-gray-500">{employee.email}</p>
                        </div>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <span className={`badge ${getStatusColor(employee.status)}`}>
                          {employee.status === 'checked_in' ? 'Check In' : employee.status === 'checked_out' ? 'Check Out' : 'Sedang Cuti'}
                        </span>
                        {employee.status === 'checked_in' && employee.current_session && (
                          <p className="text-xs text-gray-500 mt-1">
                            Sejak {formatTime(employee.current_session.check_in)}
                          </p>
                        )}
                        {employee.status === 'on_leave' && employee.leave && (
                          <p className="text-xs text-gray-500 mt-1">
                            {employee.leave.reason}
                          </p>
                        )}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <div className="flex items-center space-x-1">
                          <Clock size={14} className="text-gray-400" />
                          <span className="text-sm text-gray-900">
                            {formatHours(employee.today_total_hours || 0)}
                          </span>
                        </div>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <span className="text-sm text-gray-900">
                          {formatHours(employee.week_total_hours || 0)}
                        </span>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <span className="text-sm text-gray-900">
                          {formatHours(employee.month_total_hours || 0)}
                        </span>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </Card>
      </div>
    </MainLayout>
  );
};

import { useState, useEffect } from 'react';
import { MainLayout } from '../../components/layout/MainLayout';
import { Card } from '../../components/common/Card';
import { Button } from '../../components/common/Button';
import { ReportSkeleton } from '../../components/common/DashboardSkeleton';
import { getDailyAttendanceReport } from '../../api/manager.api';
import { formatDate, formatTime, formatHours, getTodayDate } from '../../utils/dateHelpers';
import { usePageTitle } from '../../hooks/usePageTitle';
import { Calendar, Clock, CheckCircle, XCircle, ChevronDown, ChevronUp, User, TrendingUp } from 'lucide-react';
import toast from 'react-hot-toast';

export const DailyAttendanceReport = () => {
  usePageTitle('Laporan Harian');
  const [loading, setLoading] = useState(true);
  const [report, setReport] = useState(null);
  const [selectedDate, setSelectedDate] = useState(getTodayDate());
  const [expandedSessions, setExpandedSessions] = useState({});
  const [expandedTasks, setExpandedTasks] = useState({});

  useEffect(() => {
    fetchReport();
  }, []);

  const fetchReport = async () => {
    try {
      setLoading(true);
      const response = await getDailyAttendanceReport(selectedDate);
      
      if (response.success) {
        setReport(response.data);
      }
    } catch (error) {
      console.error('Error fetching daily attendance report:', error);
      toast.error('Gagal mengambil laporan absensi harian');
    } finally {
      setLoading(false);
    }
  };

  const handleDateChange = () => {
    fetchReport();
  };

  const toggleSessionExpand = (employeeIndex, sessionIndex) => {
    const key = `${employeeIndex}-${sessionIndex}`;
    setExpandedSessions(prev => ({
      ...prev,
      [key]: !prev[key]
    }));
  };

  const toggleTaskExpand = (employeeIndex, sessionIndex) => {
    const key = `${employeeIndex}-${sessionIndex}`;
    setExpandedTasks(prev => ({
      ...prev,
      [key]: !prev[key]
    }));
  };

  const isSessionExpanded = (employeeIndex, sessionIndex) => {
    const key = `${employeeIndex}-${sessionIndex}`;
    return expandedSessions[key] || false;
  };

  const isTaskExpanded = (employeeIndex, sessionIndex) => {
    const key = `${employeeIndex}-${sessionIndex}`;
    return expandedTasks[key] || false;
  };

  if (loading) {
    return (
      <MainLayout>
        <ReportSkeleton />
      </MainLayout>
    );
  }

  const employees = report?.employees || [];
  const requiredHours = report?.required_hours || 7;

  return (
    <MainLayout>
      <div className="space-y-6">
        {/* Header */}
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-3xl font-bold text-gray-900">Laporan Absensi Harian</h1>
            <p className="text-gray-600 mt-1">Lihat absensi semua karyawan untuk tanggal tertentu</p>
          </div>
        </div>

        {/* Date Filter */}
        <Card>
          <div className="flex flex-col gap-4 sm:flex-row sm:items-end sm:gap-4">
            <div className="w-full sm:flex-1">
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Pilih Tanggal
              </label>
              <input
                type="date"
                value={selectedDate}
                onChange={(e) => setSelectedDate(e.target.value)}
                className="input-field w-full"
              />
            </div>
            <div className="w-full sm:w-auto">
              <Button
                className="w-full sm:w-auto"
                onClick={handleDateChange}
              >
                Lihat Laporan
              </Button>
            </div>
          </div>
        </Card>

        {/* Summary Cards */}
        {report && (
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            <Card>
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-gray-600 mb-1">Tanggal Laporan</p>
                  <p className="text-2xl font-bold text-gray-900">{formatDate(report.date)}</p>
                </div>
                <div className="p-3 rounded-full bg-primary-100">
                  <Calendar size={24} className="text-primary-600" />
                </div>
              </div>
            </Card>

            <Card>
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-gray-600 mb-1">Total Karyawan</p>
                  <p className="text-2xl font-bold text-primary-600">{employees.length}</p>
                </div>
                <div className="p-3 rounded-full bg-blue-100">
                  <User size={24} className="text-blue-600" />
                </div>
              </div>
            </Card>

            <Card>
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-gray-600 mb-1">Jam Wajib</p>
                  <p className="text-2xl font-bold text-green-600">{requiredHours} jam</p>
                </div>
                <div className="p-3 rounded-full bg-green-100">
                  <Clock size={24} className="text-green-600" />
                </div>
              </div>
            </Card>
          </div>
        )}

        {/* Employees List */}
        <Card title="Detail Absensi Karyawan">
          {employees.length === 0 ? (
            <div className="text-center py-8 text-gray-500">
              Tidak ada catatan absensi ditemukan untuk {formatDate(report?.date)}
            </div>
          ) : (
            <div className="space-y-4">
              {employees.map((employeeData, employeeIndex) => {
                const { employee, daily_total_hours, overtime_hours, status, sessions } = employeeData;
                
                return (
                  <div key={employee.id} className="border border-gray-200 rounded-lg p-4">
                    {/* Employee Header */}
                    <div className="flex items-center justify-between mb-3">
                      <div className="flex items-center space-x-3">
                        <div className="p-2 rounded-full bg-primary-100">
                          <User className="text-primary-600" size={20} />
                        </div>
                        <div>
                          <p className="font-semibold text-gray-900">{employee.name}</p>
                          <p className="text-sm text-gray-600">{employee.email}</p>
                        </div>
                      </div>
                      <div className="flex items-center space-x-4">
                        <div className="text-right">
                          <p className="text-sm text-gray-600">Total Jam</p>
                          <p className="text-lg font-bold text-gray-900">{formatHours(daily_total_hours)}</p>
                        </div>
                        {overtime_hours > 0 && (
                          <div className="text-right">
                            <p className="text-sm text-orange-600">Lembur</p>
                            <p className="text-lg font-bold text-orange-600">{formatHours(overtime_hours)}</p>
                          </div>
                        )}
                        <span className={`badge ${
                          status === 'complete' 
                            ? 'badge-success' 
                            : status === 'incomplete'
                            ? 'badge-warning'
                            : status === 'overtime'
                            ? 'badge-info'
                            : 'badge-secondary'
                        }`}>
                          {status === 'on_leave' ? 'Sedang Cuti' : status === 'complete' ? 'Lengkap' : status === 'incomplete' ? 'Tidak Lengkap' : status === 'overtime' ? 'Lembur' : status}
                        </span>
                      </div>
                    </div>

                    {/* Sessions */}
                    {sessions && sessions.length > 0 ? (
                      <div className="space-y-2 mt-3">
                        <p className="text-sm font-medium text-gray-700 mb-2">Sesi:</p>
                        {sessions.map((session, sessionIndex) => {
                          const isSessionExp = isSessionExpanded(employeeIndex, sessionIndex);
                          const isTaskExp = isTaskExpanded(employeeIndex, sessionIndex);
                          const hasCompletedTasks = session.tasks_completed > 0;
                          const hasIncompleteTasks = session.tasks_incomplete > 0;

                          return (
                            <div key={sessionIndex} className="bg-gray-50 rounded p-3">
                              <div className="flex items-center justify-between mb-2">
                                <div className="flex items-center space-x-3">
                                  <p className="text-sm font-medium text-gray-700">
                                    Sesi {session.session_number}
                                  </p>
                                  <p className="text-sm text-gray-600">
                                    {formatTime(session.check_in)} - {session.check_out ? formatTime(session.check_out) : 'Aktif'}
                                  </p>
                                </div>
                                <p className="text-sm text-gray-600">
                                  {formatHours(session.total_hours)}
                                </p>
                              </div>

                              {/* Task Summary - Clickable */}
                              <div className="flex items-center space-x-4 text-xs">
                                {hasCompletedTasks && (
                                  <button
                                    onClick={() => toggleTaskExpand(employeeIndex, sessionIndex)}
                                    className="flex items-center space-x-1 text-green-600 hover:text-green-700 hover:bg-green-50 px-2 py-1 rounded transition-colors"
                                  >
                                    <CheckCircle size={14} />
                                    <span>{session.tasks_completed} selesai</span>
                                    {isTaskExp ? <ChevronUp size={14} /> : <ChevronDown size={14} />}
                                  </button>
                                )}
                                {hasIncompleteTasks && (
                                  <button
                                    onClick={() => toggleTaskExpand(employeeIndex, sessionIndex)}
                                    className="flex items-center space-x-1 text-red-600 hover:text-red-700 hover:bg-red-50 px-2 py-1 rounded transition-colors"
                                  >
                                    <XCircle size={14} />
                                    <span>{session.tasks_incomplete} belum selesai</span>
                                    {isTaskExp ? <ChevronUp size={14} /> : <ChevronDown size={14} />}
                                  </button>
                                )}
                              </div>

                              {/* Expanded Task Details */}
                              {isTaskExp && session.tasks && session.tasks.length > 0 && (
                                <div className="mt-3 pt-3 border-t border-gray-200">
                                  <p className="text-xs font-medium text-gray-700 mb-2">Detail Tugas:</p>
                                  <div className="space-y-2">
                                    {session.tasks.map((task, taskIndex) => (
                                      <div
                                        key={taskIndex}
                                        className={`p-2 rounded text-xs ${
                                          task.is_completed
                                            ? 'bg-green-50 border border-green-200'
                                            : 'bg-red-50 border border-red-200'
                                        }`}
                                      >
                                        <div className="flex items-start space-x-2">
                                          {task.is_completed ? (
                                            <CheckCircle size={14} className="text-green-600 mt-0.5 flex-shrink-0" />
                                          ) : (
                                            <XCircle size={14} className="text-red-600 mt-0.5 flex-shrink-0" />
                                          )}
                                          <div className="flex-1">
                                            <p className={`font-medium ${
                                              task.is_completed ? 'text-green-800' : 'text-red-800'
                                            }`}>
                                              {task.title}
                                            </p>
                                            {!task.is_completed && task.blocker_reason && (
                                              <p className="text-red-700 mt-1 text-xs">
                                                <span className="font-medium">Blocker:</span> {task.blocker_reason}
                                              </p>
                                            )}
                                          </div>
                                        </div>
                                      </div>
                                    ))}
                                  </div>
                                </div>
                              )}
                            </div>
                          );
                        })}
                      </div>
                    ) : (
                      <p className="text-sm text-gray-500 mt-2">Tidak ada sesi tercatat</p>
                    )}
                  </div>
                );
              })}
            </div>
          )}
        </Card>
      </div>
    </MainLayout>
  );
};

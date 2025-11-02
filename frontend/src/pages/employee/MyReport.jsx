import { useState, useEffect } from 'react';
import { MainLayout } from '../../components/layout/MainLayout';
import { Card } from '../../components/common/Card';
import { Button } from '../../components/common/Button';
import { Loading } from '../../components/common/Loading';
import { getMyReport } from '../../api/report.api';
import { formatDate, formatTime, formatHours, getMonthStart, getMonthEnd } from '../../utils/dateHelpers';
import { Calendar, TrendingUp, Clock, CheckCircle, XCircle } from 'lucide-react';
import toast from 'react-hot-toast';

export const MyReport = () => {
  const [loading, setLoading] = useState(true);
  const [report, setReport] = useState(null);
  const [startDate, setStartDate] = useState(getMonthStart());
  const [endDate, setEndDate] = useState(getMonthEnd());

  useEffect(() => {
    fetchReport();
  }, []);

  const fetchReport = async () => {
    try {
      setLoading(true);
      const response = await getMyReport(startDate, endDate);
      
      if (response.success) {
        setReport(response.data);
      }
    } catch (error) {
      console.error('Error fetching report:', error);
      toast.error('Failed to fetch report');
    } finally {
      setLoading(false);
    }
  };

  const handleFilter = () => {
    fetchReport();
  };

  if (loading) {
    return (
      <MainLayout>
        <Loading />
      </MainLayout>
    );
  }

  const summary = report?.summary || {};
  const attendances = report?.attendances || [];

  return (
    <MainLayout>
      <div className="space-y-6">
        {/* Header */}
        <div>
          <h1 className="text-3xl font-bold text-gray-900">My Work Report</h1>
          <p className="text-gray-600 mt-1">Track your work hours and productivity</p>
        </div>

        {/* Date Filter */}
        <Card>
          <div className="flex flex-col gap-4 sm:flex-row sm:items-end sm:gap-4">
            <div className="w-full sm:flex-1">
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Start Date
              </label>
              <input
                type="date"
                value={startDate}
                onChange={(e) => setStartDate(e.target.value)}
                className="input-field w-full"
              />
            </div>
            <div className="w-full sm:flex-1">
              <label className="block text-sm font-medium text-gray-700 mb-2">
                End Date
              </label>
              <input
                type="date"
                value={endDate}
                onChange={(e) => setEndDate(e.target.value)}
                className="input-field w-full"
              />
            </div>
            <div className="w-full sm:w-auto">
              <Button
                className="w-full sm:w-auto"
                onClick={handleFilter}
              >
                Apply Filter
              </Button>
            </div>
          </div>
        </Card>

        {/* Summary Cards */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
          <Card>
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-gray-600 mb-1">Total Days Worked</p>
                <p className="text-2xl font-bold text-gray-900">{summary.total_days_worked || 0}</p>
              </div>
              <div className="p-3 rounded-full bg-primary-100">
                <Calendar size={24} className="text-primary-600" />
              </div>
            </div>
          </Card>

          <Card>
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-gray-600 mb-1">Total Hours</p>
                <p className="text-2xl font-bold text-primary-600">
                  {formatHours(summary.total_hours || 0)}
                </p>
              </div>
              <div className="p-3 rounded-full bg-blue-100">
                <Clock size={24} className="text-blue-600" />
              </div>
            </div>
          </Card>

          <Card>
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-gray-600 mb-1">Avg Hours/Day</p>
                <p className="text-2xl font-bold text-green-600">
                  {(summary.average_hours_per_day || 0).toFixed(1)}h
                </p>
              </div>
              <div className="p-3 rounded-full bg-green-100">
                <TrendingUp size={24} className="text-green-600" />
              </div>
            </div>
          </Card>

          <Card>
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-gray-600 mb-1">Task Completion</p>
                <p className="text-2xl font-bold text-purple-600">
                  {(summary.task_completion_rate || 0).toFixed(1)}%
                </p>
              </div>
              <div className="p-3 rounded-full bg-purple-100">
                <CheckCircle size={24} className="text-purple-600" />
              </div>
            </div>
          </Card>
        </div>

        {/* Additional Stats */}
        {summary.overtime_hours > 0 && (
          <Card>
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-gray-600">Overtime Hours</p>
                <p className="text-lg font-semibold text-orange-600">
                  {formatHours(summary.overtime_hours)}
                </p>
              </div>
              {summary.incomplete_days > 0 && (
                <div>
                  <p className="text-sm text-gray-600">Incomplete Days</p>
                  <p className="text-lg font-semibold text-red-600">
                    {summary.incomplete_days} days
                  </p>
                </div>
              )}
            </div>
          </Card>
        )}

        {/* Attendance Details */}
        <Card title="Attendance Details">
          {attendances.length === 0 ? (
            <div className="text-center py-8 text-gray-500">
              No attendance records found for the selected period
            </div>
          ) : (
            <div className="space-y-4">
              {attendances.map((attendance, index) => (
                <div key={index} className="border border-gray-200 rounded-lg p-4">
                  <div className="flex items-center justify-between mb-3">
                    <div>
                      <p className="font-semibold text-gray-900">{formatDate(attendance.date)}</p>
                      <p className="text-sm text-gray-600">
                        Total: {formatHours(attendance.daily_total_hours)}
                      </p>
                    </div>
                    <span className={`badge ${
                      attendance.status === 'complete' 
                        ? 'badge-success' 
                        : attendance.status === 'incomplete'
                        ? 'badge-warning'
                        : 'badge-info'
                    }`}>
                      {attendance.status}
                    </span>
                  </div>

                  {/* Sessions */}
                  <div className="space-y-2">
                    {attendance.sessions.map((session, sessionIndex) => (
                      <div key={sessionIndex} className="bg-gray-50 rounded p-3">
                        <div className="flex items-center justify-between mb-2">
                          <p className="text-sm font-medium text-gray-700">
                            Session {sessionIndex + 1}
                          </p>
                          <p className="text-sm text-gray-600">
                            {formatHours(session.total_hours)}
                          </p>
                        </div>
                        <p className="text-sm text-gray-600">
                          {formatTime(session.check_in)} - {formatTime(session.check_out)}
                        </p>
                        <div className="flex items-center space-x-4 mt-2 text-xs text-gray-600">
                          <span className="flex items-center space-x-1">
                            <CheckCircle size={14} className="text-green-600" />
                            <span>{session.tasks_completed} completed</span>
                          </span>
                          {session.tasks_incomplete > 0 && (
                            <span className="flex items-center space-x-1">
                              <XCircle size={14} className="text-red-600" />
                              <span>{session.tasks_incomplete} incomplete</span>
                            </span>
                          )}
                        </div>
                      </div>
                    ))}
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

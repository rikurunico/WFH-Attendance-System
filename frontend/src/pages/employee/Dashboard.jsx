import { useState, useEffect } from 'react';
import { MainLayout } from '../../components/layout/MainLayout';
import { Card } from '../../components/common/Card';
import { Button } from '../../components/common/Button';
import { Loading } from '../../components/common/Loading';
import { CheckInModal } from '../../components/attendance/CheckInModal';
import { CheckOutModal } from '../../components/attendance/CheckOutModal';
import { getTodayStatus, checkIn, checkOut } from '../../api/attendance.api';
import { formatTime, formatHours } from '../../utils/dateHelpers';
import { REQUIRED_WORK_HOURS } from '../../utils/constants';
import { Clock, CheckCircle, AlertCircle, PlayCircle, StopCircle } from 'lucide-react';
import toast from 'react-hot-toast';

export const EmployeeDashboard = () => {
  const [loading, setLoading] = useState(true);
  const [todayStatus, setTodayStatus] = useState(null);
  const [showCheckInModal, setShowCheckInModal] = useState(false);
  const [showCheckOutModal, setShowCheckOutModal] = useState(false);
  const [actionLoading, setActionLoading] = useState(false);

  useEffect(() => {
    fetchTodayStatus();
  }, []);

  const fetchTodayStatus = async () => {
    try {
      setLoading(true);
      const response = await getTodayStatus();
      if (response.success) {
        console.log('Today Status Response:', response.data);
        console.log('Current Session:', response.data?.current_session);
        console.log('Tasks:', response.data?.current_session?.tasks);
        setTodayStatus(response.data);
      }
    } catch (error) {
      console.error('Error fetching today status:', error);
      toast.error('Failed to fetch today status');
    } finally {
      setLoading(false);
    }
  };

  const handleCheckIn = async (tasks) => {
    try {
      setActionLoading(true);
      const response = await checkIn(tasks);
      
      if (response.success) {
        toast.success(response.message);
        setShowCheckInModal(false);
        fetchTodayStatus();
      }
    } catch (error) {
      const message = error.response?.data?.message || 'Failed to check in';
      toast.error(message);
    } finally {
      setActionLoading(false);
    }
  };

  const handleCheckOut = async (attendanceId, tasks) => {
    try {
      setActionLoading(true);
      const response = await checkOut(attendanceId, tasks);
      
      if (response.success) {
        toast.success(response.message);
        setShowCheckOutModal(false);
        fetchTodayStatus();
      }
    } catch (error) {
      const message = error.response?.data?.message || 'Failed to check out';
      toast.error(message);
    } finally {
      setActionLoading(false);
    }
  };

  if (loading) {
    return (
      <MainLayout>
        <Loading />
      </MainLayout>
    );
  }

  const isCheckedIn = todayStatus?.is_checked_in;
  const currentSession = todayStatus?.current_session;
  const todayTotalHours = todayStatus?.today_total_hours || 0;
  const remainingHours = Math.max(0, REQUIRED_WORK_HOURS - todayTotalHours);
  const progressPercentage = Math.min(100, (todayTotalHours / REQUIRED_WORK_HOURS) * 100);

  return (
    <MainLayout>
      <div className="space-y-6">
        {/* Header */}
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-3xl font-bold text-gray-900">Dashboard</h1>
            <p className="text-gray-600 mt-1">
              {new Date().toLocaleDateString('en-US', { 
                weekday: 'long', 
                year: 'numeric', 
                month: 'long', 
                day: 'numeric' 
              })}
            </p>
          </div>

          {isCheckedIn ? (
            <Button
              onClick={() => setShowCheckOutModal(true)}
              variant="danger"
              className="flex items-center space-x-2"
            >
              <StopCircle size={20} />
              <span>Check Out</span>
            </Button>
          ) : (
            <Button
              onClick={() => setShowCheckInModal(true)}
              className="flex items-center space-x-2"
            >
              <PlayCircle size={20} />
              <span>Check In</span>
            </Button>
          )}
        </div>

        {/* Status Cards */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          {/* Current Status */}
          <Card>
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-gray-600 mb-1">Current Status</p>
                <p className={`text-2xl font-bold ${isCheckedIn ? 'text-green-600' : 'text-gray-400'}`}>
                  {isCheckedIn ? 'Checked In' : 'Checked Out'}
                </p>
              </div>
              <div className={`p-3 rounded-full ${isCheckedIn ? 'bg-green-100' : 'bg-gray-100'}`}>
                <Clock size={24} className={isCheckedIn ? 'text-green-600' : 'text-gray-400'} />
              </div>
            </div>
          </Card>

          {/* Today's Hours */}
          <Card>
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-gray-600 mb-1">Today's Hours</p>
                <p className="text-2xl font-bold text-primary-600">
                  {formatHours(todayTotalHours)}
                </p>
              </div>
              <div className="p-3 rounded-full bg-primary-100">
                <CheckCircle size={24} className="text-primary-600" />
              </div>
            </div>
          </Card>

          {/* Remaining Hours */}
          <Card>
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-gray-600 mb-1">Remaining Hours</p>
                <p className={`text-2xl font-bold ${remainingHours > 0 ? 'text-orange-600' : 'text-green-600'}`}>
                  {formatHours(remainingHours)}
                </p>
              </div>
              <div className={`p-3 rounded-full ${remainingHours > 0 ? 'bg-orange-100' : 'bg-green-100'}`}>
                <AlertCircle size={24} className={remainingHours > 0 ? 'text-orange-600' : 'text-green-600'} />
              </div>
            </div>
          </Card>
        </div>

        {/* Progress Bar */}
        <Card title="Today's Progress">
          <div className="space-y-2">
            <div className="flex justify-between text-sm text-gray-600">
              <span>{formatHours(todayTotalHours)} worked</span>
              <span>{REQUIRED_WORK_HOURS} hours required</span>
            </div>
            <div className="w-full bg-gray-200 rounded-full h-4">
              <div
                className={`h-4 rounded-full transition-all duration-500 ${
                  progressPercentage >= 100 ? 'bg-green-500' : 'bg-primary-500'
                }`}
                style={{ width: `${progressPercentage}%` }}
              ></div>
            </div>
            <p className="text-sm text-gray-600 text-center">
              {progressPercentage >= 100 
                ? '✓ Daily requirement completed!' 
                : `${progressPercentage.toFixed(0)}% completed`}
            </p>
          </div>
        </Card>

        {/* Current Session */}
        {isCheckedIn && currentSession && (
          <Card title="Current Session">
            <div className="space-y-4">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-gray-600">Check-in Time</p>
                  <p className="text-lg font-semibold">{formatTime(currentSession.check_in)}</p>
                </div>
                <div>
                  <p className="text-sm text-gray-600">Elapsed Time</p>
                  <p className="text-lg font-semibold text-primary-600">
                    {formatHours(currentSession.elapsed_hours)}
                  </p>
                </div>
              </div>

              {currentSession.tasks && currentSession.tasks.length > 0 && (
                <div>
                  <p className="text-sm font-medium text-gray-700 mb-2">Today's Tasks:</p>
                  <ul className="space-y-2">
                    {currentSession.tasks.map((task, index) => (
                      <li key={index} className="flex items-start space-x-2">
                        <span className="text-primary-600 mt-1">•</span>
                        <span className="text-gray-700">{task.title}</span>
                      </li>
                    ))}
                  </ul>
                </div>
              )}
            </div>
          </Card>
        )}

        {/* Previous Sessions Today */}
        {todayStatus?.previous_sessions && todayStatus.previous_sessions.length > 0 && (
          <Card title="Previous Sessions Today">
            <div className="space-y-3">
              {todayStatus.previous_sessions.map((session, index) => (
                <div key={index} className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
                  <div>
                    <p className="text-sm text-gray-600">
                      {formatTime(session.check_in)} - {formatTime(session.check_out)}
                    </p>
                  </div>
                  <div>
                    <span className="badge badge-info">{formatHours(session.total_hours)}</span>
                  </div>
                </div>
              ))}
            </div>
          </Card>
        )}
      </div>

      {/* Modals */}
      <CheckInModal
        isOpen={showCheckInModal}
        onClose={() => setShowCheckInModal(false)}
        onSubmit={handleCheckIn}
        loading={actionLoading}
      />

      <CheckOutModal
        isOpen={showCheckOutModal}
        onClose={() => setShowCheckOutModal(false)}
        onSubmit={handleCheckOut}
        loading={actionLoading}
        tasks={currentSession?.tasks || []}
        attendanceId={currentSession?.id || null}
      />
    </MainLayout>
  );
};

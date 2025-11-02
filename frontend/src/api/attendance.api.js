import apiClient from './axios';

export const checkIn = async (tasks) => {
  const response = await apiClient.post('/attendance/check-in', { tasks });
  return response.data;
};

export const checkOut = async (attendanceId, tasks) => {
  const response = await apiClient.post('/attendance/check-out', {
    attendance_id: attendanceId,
    tasks,
  });
  return response.data;
};

export const getTodayStatus = async () => {
  const response = await apiClient.get('/attendance/today');
  return response.data;
};

export const getMyAttendanceHistory = async (startDate, endDate) => {
  const response = await apiClient.get('/attendances/my-history', {
    params: { start_date: startDate, end_date: endDate },
  });
  return response.data;
};

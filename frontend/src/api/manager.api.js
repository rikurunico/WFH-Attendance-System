import apiClient from './axios';

// Dashboard
export const getManagerDashboard = async (date) => {
  const response = await apiClient.get('/manager/dashboard', {
    params: { date },
  });
  return response.data;
};

export const getEmployeeReport = async (userId, startDate, endDate) => {
  const response = await apiClient.get(`/manager/reports/employee/${userId}`, {
    params: { start_date: startDate, end_date: endDate },
  });
  return response.data;
};

// Attendance Management
export const getAllAttendances = async (startDate, endDate) => {
  const response = await apiClient.get('/manager/attendances', {
    params: { start_date: startDate, end_date: endDate },
  });
  return response.data;
};

export const editAttendance = async (id, checkIn, checkOut, reason) => {
  const response = await apiClient.put(`/manager/attendances/${id}`, {
    check_in: checkIn,
    check_out: checkOut,
    reason,
  });
  return response.data;
};

export const deleteAttendance = async (id, reason) => {
  const response = await apiClient.delete(`/manager/attendances/${id}`, {
    data: { reason },
  });
  return response.data;
};

// User Management
export const getAllUsers = async () => {
  const response = await apiClient.get('/manager/users');
  return response.data;
};

export const createUser = async (userData) => {
  const response = await apiClient.post('/manager/users', userData);
  return response.data;
};

export const updateUser = async (id, userData) => {
  const response = await apiClient.put(`/manager/users/${id}`, userData);
  return response.data;
};

export const deleteUser = async (id) => {
  const response = await apiClient.delete(`/manager/users/${id}`);
  return response.data;
};

// Holiday Management
export const createHoliday = async (holidayData) => {
  const response = await apiClient.post('/manager/holidays', holidayData);
  return response.data;
};

export const updateHoliday = async (id, holidayData) => {
  const response = await apiClient.put(`/manager/holidays/${id}`, holidayData);
  return response.data;
};

export const deleteHoliday = async (id) => {
  const response = await apiClient.delete(`/manager/holidays/${id}`);
  return response.data;
};

// Leave Management
export const getAllLeaveRequests = async (status) => {
  const response = await apiClient.get('/manager/leaves', {
    params: { status },
  });
  return response.data;
};

export const approveLeave = async (id, notes) => {
  const response = await apiClient.put(`/manager/leaves/${id}/approve`, {
    notes,
  });
  return response.data;
};

export const rejectLeave = async (id, notes) => {
  const response = await apiClient.put(`/manager/leaves/${id}/reject`, {
    notes,
  });
  return response.data;
};

// Activity Logs
export const getActivityLogs = async (filters) => {
  const response = await apiClient.get('/manager/activity-logs', {
    params: filters,
  });
  return response.data;
};

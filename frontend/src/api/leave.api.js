import apiClient from './axios';

export const requestLeave = async (startDate, endDate, reason) => {
  const response = await apiClient.post('/leaves', {
    start_date: startDate,
    end_date: endDate,
    reason,
  });
  return response.data;
};

export const getMyLeaveRequests = async () => {
  const response = await apiClient.get('/leaves/my-requests');
  return response.data;
};

export const getLeaveSummary = async (year = null) => {
  const params = year ? { year } : {};
  const response = await apiClient.get('/leaves/summary', { params });
  return response.data;
};

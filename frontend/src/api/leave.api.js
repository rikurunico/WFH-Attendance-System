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

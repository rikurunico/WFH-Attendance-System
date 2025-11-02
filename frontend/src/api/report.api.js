import apiClient from './axios';

export const getMyReport = async (startDate, endDate) => {
  const response = await apiClient.get('/reports/my-report', {
    params: { start_date: startDate, end_date: endDate },
  });
  return response.data;
};

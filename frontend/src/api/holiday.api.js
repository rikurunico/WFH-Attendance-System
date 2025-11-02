import apiClient from './axios';

export const getHolidays = async (year) => {
  const response = await apiClient.get('/holidays', {
    params: { year },
  });
  return response.data;
};

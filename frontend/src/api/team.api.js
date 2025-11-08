import apiClient from './axios';

export const getTeamSettings = async () => {
  const response = await apiClient.get('/team/settings');
  return response.data;
};

export const updateTeamSettings = async (data) => {
  const response = await apiClient.put('/team/settings', data);
  return response.data;
};

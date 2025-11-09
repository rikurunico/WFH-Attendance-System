import apiClient from './axios';

export const getTeamSettings = async () => {
  const response = await apiClient.get('/team/settings');
  return response.data;
};

export const updateTeamSettings = async (data) => {
  const response = await apiClient.put('/team/settings', data);
  return response.data;
};

// Super Admin - Get all teams
export const getAllTeams = async (perPage = 10) => {
  const response = await apiClient.get(`/super-admin/teams?per_page=${perPage}`);
  return response.data;
};

// Super Admin - Get team by ID
export const getTeamById = async (id) => {
  const response = await apiClient.get(`/super-admin/teams/${id}`);
  return response.data;
};

// Super Admin - Create team
export const createTeam = async (data) => {
  const response = await apiClient.post('/super-admin/teams', data);
  return response.data;
};

// Super Admin - Update team
export const updateTeam = async (id, data) => {
  const response = await apiClient.put(`/super-admin/teams/${id}`, data);
  return response.data;
};

// Super Admin - Delete team
export const deleteTeam = async (id) => {
  const response = await apiClient.delete(`/super-admin/teams/${id}`);
  return response.data;
};

// Super Admin - Impersonate user
export const impersonateUser = async (userId) => {
  const response = await apiClient.post(`/super-admin/impersonate/${userId}`);
  return response.data;
};

// Super Admin - Stop impersonating
export const stopImpersonate = async (originalUserId) => {
  const response = await apiClient.post('/super-admin/stop-impersonate', {
    original_user_id: originalUserId,
  });
  return response.data;
};
